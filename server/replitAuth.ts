import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

// Store registered domains for strategy lookup
const registeredDomains = new Set<string>();

/**
 * Canonicalize a domain by extracting the base REPL name
 * Strips known Replit suffixes like .replit.dev, .repl.co, etc.
 */
function canonicalizeDomain(domain: string): string {
  const replitSuffixes = ['.replit.dev', '.repl.co', '.replit.app', '.repl.run'];
  
  for (const suffix of replitSuffixes) {
    if (domain.endsWith(suffix)) {
      return domain.slice(0, -suffix.length);
    }
  }
  
  // If no known suffix, return the part before the first dot
  return domain.split('.')[0];
}

/**
 * Find the correct registered domain for a given hostname
 * Uses robust canonicalization to handle .replit.dev vs .repl.co variations
 */
function findRegisteredDomain(hostname: string): string | null {
  // First try exact match
  if (registeredDomains.has(hostname)) {
    return hostname;
  }

  // Canonicalize the incoming hostname
  const hostBase = canonicalizeDomain(hostname);
  
  // Look for a registered domain with the same canonical base
  for (const domain of Array.from(registeredDomains)) {
    const domainBase = canonicalizeDomain(domain);
    if (hostBase === domainBase) {
      return domain;
    }
  }

  // If no match found, return the first registered domain as fallback
  console.warn(`[Auth] No matching domain found for ${hostname}, using fallback`);
  return Array.from(registeredDomains)[0] || null;
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    // Ensure consistent trimming for Set, strategy name, and callbackURL
    const trimmedDomain = domain.trim();
    registeredDomains.add(trimmedDomain);
    
    const strategy = new Strategy(
      {
        name: `replitauth:${trimmedDomain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${trimmedDomain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`[Auth] Registered strategy: replitauth:${trimmedDomain}`);
  }
  
  console.log(`[Auth] Total registered domains: ${Array.from(registeredDomains).join(', ')}`);

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const registeredDomain = findRegisteredDomain(req.hostname);
    if (!registeredDomain) {
      return res.status(500).json({ error: "No registered authentication strategy found for this domain" });
    }
    
    passport.authenticate(`replitauth:${registeredDomain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const registeredDomain = findRegisteredDomain(req.hostname);
    if (!registeredDomain) {
      return res.status(500).json({ error: "No registered authentication strategy found for this domain" });
    }
    
    passport.authenticate(`replitauth:${registeredDomain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const registeredDomain = findRegisteredDomain(req.hostname);
    
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${registeredDomain || req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

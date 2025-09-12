# Production Deployment Environment Variables

## Required Environment Variables

The following environment variables **must** be configured in your deployment settings for the application to start successfully:

### Database Connection
- **`DATABASE_URL`** - PostgreSQL connection string (format: `postgresql://username:password@host:port/database`)
  - Must be a valid PostgreSQL connection string starting with `postgres://` or `postgresql://`

### Authentication & Security  
- **`REPLIT_DOMAINS`** - Required for Replit authentication
- **`SESSION_SECRET`** - Secret key for securing user sessions (should be a random, secure string)
- **`REPL_ID`** - Replit application identifier for OIDC authentication

### Optional Variables
- **`OPENROUTER_API_KEY`** - Required only if using AI features (will show warning if missing but won't prevent startup)
- **`PORT`** - Server port (defaults to 5000 if not specified)
- **`NODE_ENV`** - Should be set to `production` for deployment

## How to Configure

When setting up your deployment, add these environment variables in your deployment configuration panel. The exact location depends on your hosting platform:

- **Replit Deployments**: Go to the "Environment" tab in your deployment settings
- **Heroku**: Use `heroku config:set VARIABLE_NAME=value`
- **Vercel**: Add to your project's environment variables section
- **Railway**: Configure in the Variables tab

## Error Messages

If any required variables are missing, the server will:
1. Display clear error messages listing which variables are missing
2. Exit immediately with error code 1
3. Not start the application

Example error output:
```
❌ Missing required environment variables:
   - DATABASE_URL
   - SESSION_SECRET
Please add these environment variables to your deployment configuration.
```

## Production Features

The server includes:
- ✅ Environment variable validation on startup
- ✅ Production error handling and graceful shutdown
- ✅ Proper port binding (0.0.0.0 with PORT env var support)  
- ✅ Database connection validation
- ✅ Secure session management
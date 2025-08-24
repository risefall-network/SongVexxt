import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertSectionSchema } from "@shared/schema";
import { getRhymes, getSynonyms } from "./services/rhymeService";
import { generateAISuggestions, generateNextLine } from "./services/openai";
import { generateImage } from "./services/imageService";
import { analyzeGenre } from "./services/aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getActiveProject(userId);
      res.json(project || null);
    } catch (error) {
      console.error("Error fetching active project:", error);
      res.status(500).json({ message: "Failed to fetch active project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, updates);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.put('/api/projects/:id/activate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.setActiveProject(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating project:", error);
      res.status(400).json({ message: "Failed to activate project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProject(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(400).json({ message: "Failed to delete project" });
    }
  });

  // Section routes
  app.get('/api/projects/:id/sections', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const sections = await storage.getProjectSections(id);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.post('/api/sections', isAuthenticated, async (req: any, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(sectionData);
      res.json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(400).json({ message: "Failed to create section" });
    }
  });

  app.put('/api/sections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertSectionSchema.partial().parse(req.body);
      const section = await storage.updateSection(id, updates);
      res.json(section);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(400).json({ message: "Failed to update section" });
    }
  });

  // Rhyming and dictionary routes
  app.get('/api/rhymes/:word', async (req, res) => {
    try {
      const { word } = req.params;
      const rhymes = await getRhymes(word);
      res.json(rhymes);
    } catch (error) {
      console.error("Error fetching rhymes:", error);
      res.status(500).json({ message: "Failed to fetch rhymes" });
    }
  });

  app.get('/api/synonyms/:word', async (req, res) => {
    try {
      const { word } = req.params;
      const synonyms = await getSynonyms(word);
      res.json(synonyms);
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      res.status(500).json({ message: "Failed to fetch synonyms" });
    }
  });

  // AI assistance routes
  app.post('/api/ai/suggestions', isAuthenticated, async (req, res) => {
    try {
      const { lyrics, context } = req.body;
      const suggestions = await generateAISuggestions(lyrics, context);
      res.json(suggestions);
    } catch (error: any) {
      console.error("Error generating AI suggestions:", error);
      const message = error.message || "Failed to generate AI suggestions";
      res.status(500).json({ message });
    }
  });

  app.post('/api/ai/next-line', isAuthenticated, async (req, res) => {
    try {
      const { lyrics, section } = req.body;
      const nextLine = await generateNextLine(lyrics, section);
      res.json({ suggestion: nextLine });
    } catch (error: any) {
      console.error("Error generating next line:", error);
      const message = error.message || "Failed to generate next line";
      res.status(500).json({ message });
    }
  });

  app.post('/api/ai/analyze-genre', isAuthenticated, async (req, res) => {
    try {
      const { lyrics } = req.body;
      if (!lyrics || lyrics.trim().length < 10) {
        return res.status(400).json({ message: "Lyrics are required and must be at least 10 characters" });
      }
      const result = await analyzeGenre(lyrics);
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing genre:", error);
      const message = error.message || "Failed to analyze genre";
      res.status(500).json({ message });
    }
  });

  // Lyric card generation route
  app.post('/api/generate-lyric-card', isAuthenticated, async (req, res) => {
    try {
      const { prompt, lyrics, songTitle, currentSection, template } = req.body;
      
      if (!lyrics || !songTitle) {
        return res.status(400).json({ message: "Lyrics and song title are required" });
      }

      const imageUrl = await generateImage({
        prompt,
        lyrics,
        songTitle,
        currentSection,
        template
      });
      
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating lyric card:", error);
      res.status(500).json({ message: "Failed to generate lyric card" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

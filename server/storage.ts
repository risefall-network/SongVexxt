import {
  users,
  projects,
  sections,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Section,
  type InsertSection,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  setActiveProject(userId: string, projectId: string): Promise<void>;
  getActiveProject(userId: string): Promise<Project | undefined>;
  
  // Section operations
  getProjectSections(projectId: string): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: string, updates: Partial<InsertSection>): Promise<Section>;
  deleteSection(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Set all other projects to inactive
    await db
      .update(projects)
      .set({ isActive: false })
      .where(eq(projects.userId, project.userId));

    const [newProject] = await db
      .insert(projects)
      .values({ ...project, isActive: true })
      .returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async setActiveProject(userId: string, projectId: string): Promise<void> {
    // Set all projects to inactive
    await db
      .update(projects)
      .set({ isActive: false })
      .where(eq(projects.userId, userId));

    // Set the specific project to active
    await db
      .update(projects)
      .set({ isActive: true })
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
  }

  async getActiveProject(userId: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.isActive, true)));
    return project;
  }

  // Section operations
  async getProjectSections(projectId: string): Promise<Section[]> {
    return await db
      .select()
      .from(sections)
      .where(eq(sections.projectId, projectId))
      .orderBy(sections.order);
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [newSection] = await db
      .insert(sections)
      .values(section)
      .returning();
    return newSection;
  }

  async updateSection(id: string, updates: Partial<InsertSection>): Promise<Section> {
    const [section] = await db
      .update(sections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return section;
  }

  async deleteSection(id: string): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  }
}

export const storage = new DatabaseStorage();

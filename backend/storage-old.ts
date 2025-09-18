import {
  users,
  categories,
  questions,
  userProgress,
  examAttempts,
  badges,
  userBadges,
  studySessions,
  flashcards,
  bookmarks,
  subtopics,
  categorySubtopics,
  infographics,
  battleRooms,
  battleParticipants,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Question,
  type InsertQuestion,
  type UserProgress,
  type ExamAttempt,
  type InsertExamAttempt,
  type Badge,
  type StudySession,
  type InsertStudySession,
  type Flashcard,
  type Subtopic,
  type InsertSubtopic,
  type CategorySubtopic,
  type InsertCategorySubtopic,
  type Infographic,
  type BattleRoom,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User management
  updateUserRole(id: string, role: "basic" | "premium" | "admin"): Promise<void>;
  updateUserStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void>;
  getPendingUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Subtopics (independent)
  getAllSubtopics(): Promise<Subtopic[]>;
  getSubtopic(id: number): Promise<Subtopic | undefined>;
  createSubtopic(subtopic: InsertSubtopic): Promise<Subtopic>;
  updateSubtopic(id: number, subtopic: InsertSubtopic): Promise<Subtopic>;
  deleteSubtopic(id: number): Promise<void>;
  bulkCreateSubtopics(subtopics: string[]): Promise<{ created: number; skipped: number; }>;
  
  // Category-Subtopic relationships
  getSubtopicsByCategory(categoryId: number): Promise<Subtopic[]>;
  getCategoriesBySubtopic(subtopicId: number): Promise<Category[]>;
  linkSubtopicToCategory(categoryId: number, subtopicId: number): Promise<void>;
  unlinkSubtopicFromCategory(categoryId: number, subtopicId: number): Promise<void>;
  bulkLinkSubtopicsToCategory(categoryId: number, subtopicIds: number[]): Promise<void>;
  
  // Questions
  getQuestionsByCategory(categoryId: number, limit?: number): Promise<Question[]>;
  getQuestionsBySubtopic(subtopicId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: InsertQuestion): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
  getAllQuestions(): Promise<Question[]>;
  getRandomQuestions(categoryId: number, count: number): Promise<Question[]>;
  bulkCreateQuestions(subtopicId: number, questions: InsertQuestion[]): Promise<{ created: number; failed: number; }>;
  
  // User progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressByCategory(userId: string, categoryId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, categoryId: number, data: Partial<UserProgress>): Promise<void>;
  
  // Mock exams
  createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt>;
  getUserExamAttempts(userId: string): Promise<ExamAttempt[]>;
  getUserExamAttemptsByCategory(userId: string, categoryId: number): Promise<ExamAttempt[]>;
  
  // Badges
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<Badge[]>;
  awardBadge(userId: string, badgeId: number): Promise<void>;
  
  // Study sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getUserStudySessions(userId: string): Promise<StudySession[]>;
  getCurrentStreak(userId: string): Promise<number>;
  
  // Flashcards
  getFlashcardsByCategory(categoryId: number): Promise<Flashcard[]>;
  getFlashcardsBySubtopic(subtopicId: number): Promise<Flashcard[]>;
  
  // Bookmarks
  getBookmarkedQuestions(userId: string): Promise<Question[]>;
  toggleQuestionBookmark(userId: string, questionId: number): Promise<void>;
  
  // Infographics
  getInfographicsByCategory(categoryId: number): Promise<Infographic[]>;
  getInfographicsBySubtopic(subtopicId: number): Promise<Infographic[]>;
  
  // Battle mode
  createBattleRoom(room: Omit<BattleRoom, "id" | "createdAt">): Promise<BattleRoom>;
  getBattleRoom(roomCode: string): Promise<BattleRoom | undefined>;
  joinBattleRoom(roomId: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // User management
  async updateUserRole(id: string, role: "basic" | "premium" | "admin"): Promise<void> {
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async updateUserStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void> {
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, "pending"));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Categories and subtopics
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, categoryData: InsertCategory): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    // Delete related data first to avoid foreign key constraints
    await db.delete(flashcards).where(eq(flashcards.categoryId, id));
    await db.delete(infographics).where(eq(infographics.categoryId, id));
    await db.delete(categorySubtopics).where(eq(categorySubtopics.categoryId, id));
    await db.delete(battleRooms).where(eq(battleRooms.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getAllSubtopics(): Promise<Subtopic[]> {
    return await db.select().from(subtopics);
  }

  async getSubtopic(id: number): Promise<Subtopic | undefined> {
    const result = await db.select().from(subtopics).where(eq(subtopics.id, id));
    return result[0];
  }

  async createSubtopic(subtopicData: InsertSubtopic): Promise<Subtopic> {
    // Generate slug from name if not provided
    const slug = subtopicData.slug || subtopicData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const [newSubtopic] = await db.insert(subtopics).values({
      ...subtopicData,
      slug
    }).returning();
    return newSubtopic;
  }

  async updateSubtopic(id: number, subtopicData: InsertSubtopic): Promise<Subtopic> {
    // Generate slug from name if name is being updated and slug is not provided
    const updateData = { ...subtopicData };
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const [updatedSubtopic] = await db
      .update(subtopics)
      .set(updateData)
      .where(eq(subtopics.id, id))
      .returning();
    return updatedSubtopic;
  }

  async deleteSubtopic(id: number): Promise<void> {
    // Delete related data first to avoid foreign key constraints
    await db.delete(flashcards).where(eq(flashcards.subtopicId, id));
    await db.delete(infographics).where(eq(infographics.subtopicId, id));
    await db.delete(questions).where(eq(questions.subtopicId, id));
    await db.delete(categorySubtopics).where(eq(categorySubtopics.subtopicId, id));
    await db.delete(subtopics).where(eq(subtopics.id, id));
  }

  async bulkCreateSubtopics(subtopicNames: string[]): Promise<{ created: number; skipped: number; }> {
    let created = 0;
    let skipped = 0;

    // Get existing subtopic names
    const existing = await db
      .select({ name: subtopics.name })
      .from(subtopics);
    
    const existingNames = new Set(existing.map(s => s.name.toLowerCase()));

    for (const name of subtopicNames) {
      const trimmedName = name.trim();
      if (!trimmedName) continue;

      // Check if subtopic already exists (case-insensitive)
      if (existingNames.has(trimmedName.toLowerCase())) {
        skipped++;
        continue;
      }

      try {
        const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await db.insert(subtopics).values({
          name: trimmedName,
          slug,
          description: `${trimmedName} subtopic`
        });
        existingNames.add(trimmedName.toLowerCase());
        created++;
      } catch (error) {
        // If there's a duplicate key error or other error, count as skipped
        skipped++;
      }
    }

    return { created, skipped };
  }

  // Category-Subtopic relationship methods
  async getSubtopicsByCategory(categoryId: number): Promise<Subtopic[]> {
    const result = await db
      .select({
        id: subtopics.id,
        name: subtopics.name,
        slug: subtopics.slug,
        description: subtopics.description,
        createdAt: subtopics.createdAt,
      })
      .from(subtopics)
      .innerJoin(categorySubtopics, eq(subtopics.id, categorySubtopics.subtopicId))
      .where(eq(categorySubtopics.categoryId, categoryId));
    
    return result;
  }

  async getCategoriesBySubtopic(subtopicId: number): Promise<Category[]> {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        questionCount: categories.questionCount,
        timeLimit: categories.timeLimit,
        passThreshold: categories.passThreshold,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .innerJoin(categorySubtopics, eq(categories.id, categorySubtopics.categoryId))
      .where(eq(categorySubtopics.subtopicId, subtopicId));
    
    return result;
  }

  async linkSubtopicToCategory(categoryId: number, subtopicId: number): Promise<void> {
    try {
      await db.insert(categorySubtopics).values({
        categoryId,
        subtopicId
      });
    } catch (error) {
      // Ignore duplicate key errors (already linked)
    }
  }

  async unlinkSubtopicFromCategory(categoryId: number, subtopicId: number): Promise<void> {
    await db.delete(categorySubtopics)
      .where(and(
        eq(categorySubtopics.categoryId, categoryId),
        eq(categorySubtopics.subtopicId, subtopicId)
      ));
  }

  async bulkLinkSubtopicsToCategory(categoryId: number, subtopicIds: number[]): Promise<void> {
    const links = subtopicIds.map(subtopicId => ({
      categoryId,
      subtopicId
    }));

    for (const link of links) {
      try {
        await db.insert(categorySubtopics).values(link);
      } catch (error) {
        // Ignore duplicate key errors (already linked)
      }
    }
  }

  // Questions
  async getQuestionsByCategory(categoryId: number, limit?: number): Promise<Question[]> {
    const query = db.select().from(questions).where(and(eq(questions.categoryId, categoryId), eq(questions.isActive, true)));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getQuestionsBySubtopic(subtopicId: number): Promise<Question[]> {
    return await db.select().from(questions).where(and(eq(questions.subtopicId, subtopicId), eq(questions.isActive, true)));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestion(id: number, questionData: any): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(questionData)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions).limit(100);
  }

  async getRandomQuestions(categoryId: number, count: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(and(eq(questions.categoryId, categoryId), eq(questions.isActive, true)))
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async bulkCreateQuestions(categoryId: number, subtopicId: number | undefined, questionData: any[]): Promise<{ created: number; failed: number; }> {
    let created = 0;
    let failed = 0;

    for (const questionItem of questionData) {
      try {
        // Validate required fields
        if (!questionItem.question || !questionItem.options || !questionItem.correctAnswer) {
          failed++;
          continue;
        }

        // Convert options array to string format expected by the database
        const optionA = questionItem.options[0] || '';
        const optionB = questionItem.options[1] || '';
        const optionC = questionItem.options[2] || '';
        const optionD = questionItem.options[3] || '';

        await db.insert(questions).values({
          categoryId,
          subtopicId: subtopicId || null,
          questionText: questionItem.question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: questionItem.correctAnswer,
          explanation: questionItem.explanation || '',
          imageUrl: questionItem.imageUrl || null,
          isActive: true
        });
        created++;
      } catch (error) {
        console.error('Error creating question:', error);
        failed++;
      }
    }

    return { created, failed };
  }

  // User progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserProgressByCategory(userId: string, categoryId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.categoryId, categoryId)));
    return progress;
  }

  async updateUserProgress(userId: string, categoryId: number, data: Partial<UserProgress>): Promise<void> {
    await db
      .insert(userProgress)
      .values({
        userId,
        categoryId,
        ...data,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.categoryId],
        set: data,
      });
  }

  // Mock exams
  async createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt> {
    const [newAttempt] = await db.insert(examAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserExamAttempts(userId: string): Promise<ExamAttempt[]> {
    return await db.select().from(examAttempts).where(eq(examAttempts.userId, userId)).orderBy(desc(examAttempts.createdAt));
  }

  async getUserExamAttemptsByCategory(userId: string, categoryId: number): Promise<ExamAttempt[]> {
    return await db
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.categoryId, categoryId)))
      .orderBy(desc(examAttempts.createdAt));
  }

  // Badges
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.isActive, true));
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    return await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        icon: badges.icon,
        condition: badges.condition,
        isActive: badges.isActive,
        createdAt: badges.createdAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: number): Promise<void> {
    await db.insert(userBadges).values({ userId, badgeId }).onConflictDoNothing();
  }

  // Study sessions
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values(session).returning();
    return newSession;
  }

  async getUserStudySessions(userId: string): Promise<StudySession[]> {
    return await db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.createdAt));
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const sessions = await db
      .select({ date: sql<string>`DATE(${studySessions.createdAt})` })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .groupBy(sql`DATE(${studySessions.createdAt})`)
      .orderBy(desc(sql`DATE(${studySessions.createdAt})`));

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = sessions[i].date;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (sessionDate === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Flashcards
  async getFlashcardsByCategory(categoryId: number): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(and(eq(flashcards.categoryId, categoryId), eq(flashcards.isActive, true)));
  }

  async getFlashcardsBySubtopic(subtopicId: number): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(and(eq(flashcards.subtopicId, subtopicId), eq(flashcards.isActive, true)));
  }

  // Bookmarks
  async getBookmarkedQuestions(userId: string): Promise<Question[]> {
    return await db
      .select({
        id: questions.id,
        categoryId: questions.categoryId,
        subtopicId: questions.subtopicId,
        questionText: questions.questionText,
        optionA: questions.optionA,
        optionB: questions.optionB,
        optionC: questions.optionC,
        optionD: questions.optionD,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        isActive: questions.isActive,
        createdAt: questions.createdAt,
      })
      .from(bookmarks)
      .innerJoin(questions, eq(bookmarks.questionId, questions.id))
      .where(eq(bookmarks.userId, userId));
  }

  async toggleQuestionBookmark(userId: string, questionId: number): Promise<void> {
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));

    if (existing) {
      await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
    } else {
      await db.insert(bookmarks).values({ userId, questionId });
    }
  }

  // Infographics
  async getInfographicsByCategory(categoryId: number): Promise<Infographic[]> {
    return await db.select().from(infographics).where(and(eq(infographics.categoryId, categoryId), eq(infographics.isActive, true)));
  }

  async getInfographicsBySubtopic(subtopicId: number): Promise<Infographic[]> {
    return await db.select().from(infographics).where(and(eq(infographics.subtopicId, subtopicId), eq(infographics.isActive, true)));
  }

  // Battle mode
  async createBattleRoom(roomData: Omit<BattleRoom, "id" | "createdAt">): Promise<BattleRoom> {
    const [room] = await db.insert(battleRooms).values(roomData).returning();
    return room;
  }

  async getBattleRoom(roomCode: string): Promise<BattleRoom | undefined> {
    const [room] = await db.select().from(battleRooms).where(eq(battleRooms.roomCode, roomCode));
    return room;
  }

  async joinBattleRoom(roomId: number, userId: string): Promise<void> {
    await db.insert(battleParticipants).values({ roomId, userId });
  }
}

export const storage = new DatabaseStorage();

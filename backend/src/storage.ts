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
  battleQuestions,
  battleAnswers,
  battleEvents,
  userSubtopicProgress,
  userAnalytics,
  userCategoryStats,
  dailyProgress,
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
  type UserSubtopicProgress,
  type UserAnalytics,
  type UserCategoryStats,
  type DailyProgress,
  type InsertDailyProgress,
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
  
  // Profile management
  updateUserProfile(id: string, data: { profileImageUrl?: string; nickname?: string }): Promise<void>;
  changeUserPassword(id: string, password: string): Promise<void>;
  
  // Study streak operations
  updateStudyStreak(userId: string): Promise<void>;
  getUserStreak(userId: string): Promise<{ studyStreak: number; lastActiveDate: Date | null }>;
  
  // Daily progress operations
  getDailyProgress(userId: number, date: string): Promise<DailyProgress | undefined>;
  updateQuizProgress(userId: number, date: string): Promise<void>;
  updateReviewProgress(userId: number, date: string): Promise<void>;
  updatePracticeProgress(userId: number, date: string): Promise<void>;
  checkAndUpdateStreak(userId: number): Promise<{ studyStreak: number; longestStreak: number }>;
  
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
  awardBadge(userId: string, badgeId: string): Promise<void>;
  
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
  
  // Enhanced Battle mode for multiplayer (2-10 players)
  createBattleRoom(room: {
    roomCode: string;
    hostUserId: number;
    gameMode?: string;
    categoryId?: number;
    questionCount?: number;
    maxPlayers?: number;
  }): Promise<any>;
  getBattleRoom(roomCode: string): Promise<any>;
  getBattleRoomById(id: number): Promise<any>;
  joinBattleRoom(roomId: number, userId: number, userName: string, profileImageUrl?: string): Promise<void>;
  leaveBattleRoom(roomId: number, userId: number): Promise<void>;
  updateBattleRoomStatus(roomId: number, status: string): Promise<void>;
  getBattleParticipants(roomId: number): Promise<any[]>;
  updateParticipantReady(roomId: number, userId: number, isReady: boolean): Promise<void>;
  startBattleGame(roomId: number): Promise<void>;
  getBattleQuestions(roomId: number): Promise<any[]>;
  setBattleQuestions(roomId: number, questionIds: number[]): Promise<void>;
  submitBattleAnswer(roomId: number, userId: number, questionId: number, answer: {
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    pointsEarned: number;
    questionOrder: number;
    powerUpUsed?: string;
    streak?: number;
  }): Promise<void>;
  updateParticipantScore(roomId: number, userId: number, score: number, correctAnswers: number): Promise<void>;
  getBattleLeaderboard(roomId: number): Promise<any[]>;
  recordBattleEvent(roomId: number, userId: number, eventType: string, eventData: any): Promise<void>;
  getActiveBattleRooms(): Promise<any[]>;
  concedeBattle(roomId: number, userId: number): Promise<void>;
  
  // Battle statistics
  getBattleStats(userId: number): Promise<{
    battlesWon: number;
    totalBattles: number;
    winRate: number;
    powerUpsUsed: number;
  }>;
  getUserBattleHistory(userId: number, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserRole(id: string, role: "basic" | "premium" | "admin"): Promise<void> {
    await db.update(users)
      .set({ role })
      .where(eq(users.id, parseInt(id)));
  }

  async updateUserProfile(id: string, data: { profileImageUrl?: string; nickname?: string }): Promise<void> {
    await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, parseInt(id)));
  }

  async changeUserPassword(id: string, password: string): Promise<void> {
    const { hashPassword } = await import("./auth");
    const hashedPassword = await hashPassword(password);
    await db.update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, parseInt(id)));
  }

  async updateUserStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void> {
    await db.update(users)
      .set({ status })
      .where(eq(users.id, parseInt(id)));
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, "pending"));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, parseInt(id)));
  }

  // Study streak operations
  async updateStudyStreak(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    let wasStreakBroken = false;
    
    if (user.lastActiveDate && !isNaN(new Date(user.lastActiveDate).getTime())) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      
      // If user was active today already, don't change streak
      if (lastActive.getTime() === today.getTime()) {
        return; // Already updated today
      }
      // If user was active yesterday, increment streak
      else if (lastActive.getTime() === yesterday.getTime()) {
        newStreak = (user.studyStreak || 0) + 1;
      }
      // If gap > 1 day, reset to 1
      else {
        // Calculate days between last active and today
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
          newStreak = 1; // Reset streak
          wasStreakBroken = true;
        } else {
          newStreak = (user.studyStreak || 0) + 1; // Continue streak
        }
      }
    } else {
      // Invalid or missing last active date - reset to realistic starting point
      newStreak = 1;
      wasStreakBroken = true;
    }

    await db.update(users)
      .set({ 
        studyStreak: newStreak, 
        lastActiveDate: today
      })
      .where(eq(users.id, parseInt(userId)));

    console.log(`User ${userId} streak updated: ${newStreak} days ${wasStreakBroken ? '(streak reset)' : '(streak continued)'}`);

    // Award badge progression based on realistic milestones
    const currentBadges = user.badgesEarned || [];
    
    // Consistent Cadet - 7 days
    if (newStreak >= 7 && !currentBadges.includes("consistent-cadet")) {
      await this.awardBadge(userId, "consistent-cadet");
    }
    
    // Streak Master - 30 days 
    if (newStreak >= 30 && !currentBadges.includes("Streak Master")) {
      await this.awardBadge(userId, "Streak Master");
    }
    
    // Study Champion - 100 days
    if (newStreak >= 100 && !currentBadges.includes("Study Champion")) {
      await this.awardBadge(userId, "Study Champion");
    }
  }

  // Validate and clean up streaks based on real-time date checks
  async validateUserStreak(userId: string): Promise<{ studyStreak: number; needsReset: boolean }> {
    const user = await this.getUser(userId);
    if (!user) return { studyStreak: 0, needsReset: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If no last active date or invalid date, reset streak
    if (!user.lastActiveDate || isNaN(new Date(user.lastActiveDate).getTime())) {
      console.log(`User ${userId} has invalid lastActiveDate, resetting streak`);
      await db.update(users)
        .set({ studyStreak: 0, lastActiveDate: null })
        .where(eq(users.id, parseInt(userId)));
      return { studyStreak: 0, needsReset: true };
    }

    const lastActive = new Date(user.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    // If more than 1 day has passed, streak should reset
    if (daysDiff > 1) {
      console.log(`User ${userId} streak expired after ${daysDiff} days gap, resetting`);
      await db.update(users)
        .set({ studyStreak: 0 })
        .where(eq(users.id, parseInt(userId)));
      return { studyStreak: 0, needsReset: true };
    }

    return { studyStreak: user.studyStreak || 0, needsReset: false };
  }

  async getUserStreak(userId: string): Promise<{ studyStreak: number; lastActiveDate: Date | null }> {
    // First validate the streak is still valid based on current date
    const validation = await this.validateUserStreak(userId);
    
    const user = await this.getUser(userId);
    return {
      studyStreak: validation.studyStreak,
      lastActiveDate: user?.lastActiveDate ? new Date(user.lastActiveDate) : null
    };
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const currentBadges = user.badgesEarned || [];
    if (!currentBadges.includes(badgeId)) {
      const updatedBadges = [...currentBadges, badgeId];
      await db.update(users)
        .set({ badgesEarned: updatedBadges })
        .where(eq(users.id, parseInt(userId)));
    }
  }

  // Daily progress tracking for study streak
  async getDailyProgress(userId: number, date: string): Promise<DailyProgress | undefined> {
    const [progress] = await db
      .select()
      .from(dailyProgress)
      .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)));
    return progress;
  }

  async updateQuizProgress(userId: number, date: string): Promise<void> {
    const now = new Date();
    
    // Check if progress exists for today
    let progress = await this.getDailyProgress(userId, date);
    
    if (!progress) {
      // Create new daily progress record
      await db.insert(dailyProgress).values({
        userId,
        date,
        quizCompleted: true,
        quizCompletedAt: now,
        updatedAt: now,
      });
    } else if (!progress.quizCompleted) {
      // Update existing record
      await db
        .update(dailyProgress)
        .set({
          quizCompleted: true,
          quizCompletedAt: now,
          updatedAt: now,
        })
        .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)));
    }

    // Check if all requirements are now met
    await this.checkAndMarkDayComplete(userId, date);
  }

  async updateReviewProgress(userId: number, date: string): Promise<void> {
    const now = new Date();
    
    // Check if progress exists for today
    let progress = await this.getDailyProgress(userId, date);
    
    if (!progress) {
      // Create new daily progress record
      await db.insert(dailyProgress).values({
        userId,
        date,
        reviewTimeCompleted: true,
        reviewCompletedAt: now,
        updatedAt: now,
      });
    } else if (!progress.reviewTimeCompleted) {
      // Update existing record
      await db
        .update(dailyProgress)
        .set({
          reviewTimeCompleted: true,
          reviewCompletedAt: now,
          updatedAt: now,
        })
        .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)));
    }

    // Check if all requirements are now met
    await this.checkAndMarkDayComplete(userId, date);
  }

  async updatePracticeProgress(userId: number, date: string): Promise<void> {
    const now = new Date();
    
    // Check if progress exists for today
    let progress = await this.getDailyProgress(userId, date);
    
    if (!progress) {
      // Create new daily progress record
      await db.insert(dailyProgress).values({
        userId,
        date,
        practiceCompleted: true,
        practiceCompletedAt: now,
        updatedAt: now,
      });
    } else if (!progress.practiceCompleted) {
      // Update existing record
      await db
        .update(dailyProgress)
        .set({
          practiceCompleted: true,
          practiceCompletedAt: now,
          updatedAt: now,
        })
        .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)));
    }

    // Check if all requirements are now met
    await this.checkAndMarkDayComplete(userId, date);
  }

  private async checkAndMarkDayComplete(userId: number, date: string): Promise<void> {
    const progress = await this.getDailyProgress(userId, date);
    
    if (progress && 
        progress.quizCompleted && 
        progress.reviewTimeCompleted && 
        progress.practiceCompleted && 
        !progress.isCompleted) {
      
      const now = new Date();
      
      // Mark day as completed
      await db
        .update(dailyProgress)
        .set({
          isCompleted: true,
          completedAt: now,
          updatedAt: now,
        })
        .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)));

      // Update user streak
      await this.checkAndUpdateStreak(userId);
    }
  }

  async checkAndUpdateStreak(userId: number): Promise<{ studyStreak: number; longestStreak: number }> {
    const user = await this.getUser(userId.toString());
    if (!user) return { studyStreak: 0, longestStreak: 0 };

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if today's progress is completed
    const todayProgress = await this.getDailyProgress(userId, todayStr);
    if (!todayProgress?.isCompleted) {
      // Today is not completed, return current streak without changes
      return { studyStreak: user.studyStreak || 0, longestStreak: user.longestStreak || 0 };
    }

    let newStreak = 1;
    
    // Check if user has maintained a streak
    if (user.lastActiveDate) {
      const lastActiveDate = new Date(user.lastActiveDate);
      const lastActiveDateStr = lastActiveDate.toISOString().split('T')[0];
      
      // If last active was yesterday, continue the streak
      if (lastActiveDateStr === yesterdayStr) {
        newStreak = (user.studyStreak || 0) + 1;
      }
      // If last active was today, don't update streak (already updated)
      else if (lastActiveDateStr === todayStr) {
        return { studyStreak: user.studyStreak || 0, longestStreak: user.longestStreak || 0 };
      }
      // Otherwise, this is a new streak starting from 1
    }

    // Update longest streak if current streak is longer
    const currentLongest = user.longestStreak || 0;
    const newLongest = Math.max(currentLongest, newStreak);

    // Update user's streak and last active date
    await db
      .update(users)
      .set({
        studyStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`User ${userId} streak updated: ${newStreak} days (longest: ${newLongest})`);

    // Check for Streak Master badge when user reaches 7-day streak
    if (newStreak >= 7) {
      await this.checkAndAwardStreakBadges(userId, newStreak);
    }

    return { studyStreak: newStreak, longestStreak: newLongest };
  }

  private async checkAndAwardStreakBadges(userId: number, currentStreak: number): Promise<void> {
    try {
      const user = await this.getUser(userId.toString());
      if (!user) return;

      const currentBadges = user.badgesEarned || [];
      const newBadges = [];
      
      // Check for Streak Master badge (7 consecutive days)
      if (currentStreak >= 7 && !currentBadges.includes("Streak Master")) {
        await this.awardBadgeByName(userId.toString(), "Streak Master");
        newBadges.push("Streak Master");
        console.log(`User ${userId} earned Streak Master badge with ${currentStreak}-day streak!`);
      }

      // Update user badges array if new badges were earned
      if (newBadges.length > 0) {
        const updatedBadges = [...currentBadges, ...newBadges];
        await this.updateUserBadges(userId.toString(), updatedBadges);
      }
      
    } catch (error) {
      console.error(`Error checking streak badges for user ${userId}:`, error);
    }
  }

  // Comprehensive badge checking system
  async checkAndAwardAllBadges(userId: number, activityType?: string, activityData?: any): Promise<string[]> {
    try {
      const user = await this.getUser(userId.toString());
      const analytics = await this.getUserAnalytics(userId);
      const battleStats = await this.getBattleStats(userId);
      
      if (!user || !analytics) return [];

      const currentBadges = user.badgesEarned || [];
      const newBadges = [];

      // 1. First Steps Badge - triggered when completing first quiz or practice
      if (analytics.questionsAnswered && analytics.questionsAnswered > 0 && !currentBadges.includes("First Steps")) {
        await this.awardBadgeByName(userId.toString(), "First Steps");
        newBadges.push("First Steps");
        console.log(`User ${userId} earned First Steps badge!`);
      }

      // 2. Quick Learner Badge - 10 correct answers in quiz mode
      if (analytics.correctAnswers && analytics.correctAnswers >= 10 && !currentBadges.includes("Quick Learner")) {
        await this.awardBadgeByName(userId.toString(), "Quick Learner");
        newBadges.push("Quick Learner");
        console.log(`User ${userId} earned Quick Learner badge with ${analytics.correctAnswers} correct answers!`);
      }

      // 3. Battle Champion Badge - 5 battle wins
      if (battleStats.battlesWon >= 5 && !currentBadges.includes("Battle Champion")) {
        await this.awardBadgeByName(userId.toString(), "Battle Champion");
        newBadges.push("Battle Champion");
        console.log(`User ${userId} earned Battle Champion badge with ${battleStats.battlesWon} wins!`);
      }

      // 4. Exam Ace Badge - first passed mock exam
      if (analytics.totalExams && analytics.passedExams && analytics.passedExams >= 1 && !currentBadges.includes("Exam Ace")) {
        await this.awardBadgeByName(userId.toString(), "Exam Ace");
        newBadges.push("Exam Ace");
        console.log(`User ${userId} earned Exam Ace badge!`);
      }

      // 5. Perfect Score Badge - 100% on any mock exam
      const perfectScoreExam = await this.checkPerfectScoreExam(userId);
      if (perfectScoreExam && !currentBadges.includes("Perfect Score")) {
        await this.awardBadgeByName(userId.toString(), "Perfect Score");
        newBadges.push("Perfect Score");
        console.log(`User ${userId} earned Perfect Score badge!`);
      }

      // 6. Category Expert Badge - completed all questions in a category
      const categoryExpertBadge = await this.checkCategoryExpertBadge(userId);
      if (categoryExpertBadge && !currentBadges.includes("Category Expert")) {
        await this.awardBadgeByName(userId.toString(), "Category Expert");
        newBadges.push("Category Expert");
        console.log(`User ${userId} earned Category Expert badge!`);
      }

      // 7. Knowledge Seeker Badge - 30 days of app usage (not streak)
      const totalActiveDays = await this.getTotalActiveDays(userId);
      if (totalActiveDays >= 30 && !currentBadges.includes("Knowledge Seeker")) {
        await this.awardBadgeByName(userId.toString(), "Knowledge Seeker");
        newBadges.push("Knowledge Seeker");
        console.log(`User ${userId} earned Knowledge Seeker badge with ${totalActiveDays} active days!`);
      }

      // Update user badges array if new badges were earned
      if (newBadges.length > 0) {
        const updatedBadges = [...currentBadges, ...newBadges];
        await this.updateUserBadges(userId.toString(), updatedBadges);
      }

      return newBadges;
      
    } catch (error) {
      console.error(`Error checking badges for user ${userId}:`, error);
      return [];
    }
  }

  // Helper method to check for perfect score exam
  private async checkPerfectScoreExam(userId: number): Promise<boolean> {
    try {
      const perfectExams = await db
        .select()
        .from(examAttempts)
        .where(and(
          eq(examAttempts.userId, userId.toString()),
          sql`CAST(${examAttempts.score} AS DECIMAL) = 100`
        ));
      return perfectExams.length > 0;
    } catch (error) {
      console.error('Error checking perfect score exam:', error);
      return false;
    }
  }

  // Helper method to check for category expert badge
  private async checkCategoryExpertBadge(userId: number): Promise<boolean> {
    try {
      // Get all categories with their question counts
      const allCategories = await db
        .select({
          id: categories.id,
          name: categories.name,
        })
        .from(categories);

      // Check if user has answered all questions correctly in any category using userProgress
      for (const category of allCategories) {
        const categoryProgress = await db
          .select()
          .from(userProgress)
          .where(and(
            eq(userProgress.userId, userId.toString()),
            eq(userProgress.categoryId, category.id)
          ));

        if (categoryProgress.length > 0) {
          const progress = categoryProgress[0];
          // If completion percentage is 100% and they have correct answers
          if (progress.completionPercentage === "100.00" && progress.correctAnswers && progress.correctAnswers > 0) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking category expert badge:', error);
      return false;
    }
  }

  // Helper method to get total active days
  private async getTotalActiveDays(userId: number): Promise<number> {
    try {
      const activeDays = await db
        .select({ count: sql<number>`COUNT(DISTINCT date)` })
        .from(dailyProgress)
        .where(and(
          eq(dailyProgress.userId, userId),
          eq(dailyProgress.isCompleted, true)
        ));
      return activeDays[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total active days:', error);
      return 0;
    }
  }

  // Question completion tracking for overall progress
  async trackQuestionCompletion(userId: number, questionId: number, isCorrect: boolean, studyMode: 'practice' | 'quiz' | 'exam'): Promise<number> {
    try {
      // Only track if answer is correct and this is the first time answering correctly
      if (!isCorrect) return 0;

      // Check if already completed this question
      const existing = await db
        .select()
        .from(userQuestionCompletion)
        .where(and(
          eq(userQuestionCompletion.userId, userId),
          eq(userQuestionCompletion.questionId, questionId)
        ));

      if (existing.length > 0) {
        // Already completed, no progress added
        return 0;
      }

      // Get total question count to calculate percentage
      const totalQuestions = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(questions)
        .where(eq(questions.isActive, true));

      if (totalQuestions[0].count === 0) return 0;

      const progressPercentage = (1 / totalQuestions[0].count) * 100;

      // Insert new completion record
      await db.insert(userQuestionCompletion).values({
        userId,
        questionId,
        progressPercentage: progressPercentage.toFixed(6),
        studyMode,
      });

      console.log(`User ${userId} completed question ${questionId} for ${progressPercentage.toFixed(4)}% progress in ${studyMode} mode`);
      return progressPercentage;

    } catch (error) {
      console.error('Error tracking question completion:', error);
      return 0;
    }
  }

  // Get user's overall completion percentage
  async getUserOverallProgress(userId: number): Promise<number> {
    try {
      const completions = await db
        .select({ 
          totalProgress: sql<number>`SUM(CAST(${userQuestionCompletion.progressPercentage} AS DECIMAL))` 
        })
        .from(userQuestionCompletion)
        .where(eq(userQuestionCompletion.userId, userId));

      const progress = completions[0]?.totalProgress || 0;
      return Math.min(progress, 100); // Cap at 100%
    } catch (error) {
      console.error('Error getting user overall progress:', error);
      return 0;
    }
  }

  // Get detailed completion statistics
  async getUserCompletionStats(userId: number): Promise<{
    totalQuestions: number;
    completedQuestions: number;
    overallProgress: number;
    practiceCompleted: number;
    quizCompleted: number;
    examCompleted: number;
  }> {
    try {
      // Get total active questions
      const totalResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(questions)
        .where(eq(questions.isActive, true));

      const totalQuestions = totalResult[0]?.count || 0;

      // Get user completions by mode
      const completions = await db
        .select({
          studyMode: userQuestionCompletion.studyMode,
          count: sql<number>`COUNT(*)`
        })
        .from(userQuestionCompletion)
        .where(eq(userQuestionCompletion.userId, userId))
        .groupBy(userQuestionCompletion.studyMode);

      const completedQuestions = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${userQuestionCompletion.questionId})` })
        .from(userQuestionCompletion)
        .where(eq(userQuestionCompletion.userId, userId));

      const overallProgress = await this.getUserOverallProgress(userId);

      let practiceCompleted = 0, quizCompleted = 0, examCompleted = 0;
      completions.forEach(comp => {
        switch (comp.studyMode) {
          case 'practice': practiceCompleted = comp.count; break;
          case 'quiz': quizCompleted = comp.count; break;
          case 'exam': examCompleted = comp.count; break;
        }
      });

      return {
        totalQuestions,
        completedQuestions: completedQuestions[0]?.count || 0,
        overallProgress,
        practiceCompleted,
        quizCompleted,
        examCompleted,
      };
    } catch (error) {
      console.error('Error getting completion stats:', error);
      return {
        totalQuestions: 0,
        completedQuestions: 0,
        overallProgress: 0,
        practiceCompleted: 0,
        quizCompleted: 0,
        examCompleted: 0,
      };
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
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

  // Subtopics with category relationships - returns unique subtopics with primary category
  async getAllSubtopics(): Promise<any[]> {
    try {
      // First get all subtopics
      const allSubtopics = await db.select().from(subtopics).orderBy(subtopics.name);
      
      // Then get category relationships
      const categoryRelations = await db
        .select({
          subtopicId: categorySubtopics.subtopicId,
          categoryId: categorySubtopics.categoryId,
          categoryName: categories.name,
          categoryIcon: categories.icon,
        })
        .from(categorySubtopics)
        .leftJoin(categories, eq(categorySubtopics.categoryId, categories.id));

      // Combine data and remove duplicates
      const result = allSubtopics.map(subtopic => {
        const relation = categoryRelations.find(rel => rel.subtopicId === subtopic.id);
        return {
          ...subtopic,
          categoryId: relation?.categoryId || null,
          categoryName: relation?.categoryName || null,
          categoryIcon: relation?.categoryIcon || null,
        };
      });

      return result;
    } catch (error) {
      console.error('Error in getAllSubtopics:', error);
      // Fallback to basic subtopics if join fails
      return await db.select().from(subtopics).orderBy(subtopics.name);
    }
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
      .where(eq(categorySubtopics.categoryId, categoryId))
      .orderBy(subtopics.name);
    
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
      .where(eq(categorySubtopics.subtopicId, subtopicId))
      .orderBy(categories.name);
    
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

  // Questions (now only linked through subtopics)
  async getQuestionsByCategory(categoryId: number, limit?: number): Promise<Question[]> {
    let query = db
      .select({
        id: questions.id,
        subtopicId: questions.subtopicId,
        questionText: questions.questionText,
        optionA: questions.optionA,
        optionB: questions.optionB,
        optionC: questions.optionC,
        optionD: questions.optionD,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        imageUrl: questions.imageUrl,
        difficulty: questions.difficulty,
        isActive: questions.isActive,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .innerJoin(subtopics, eq(questions.subtopicId, subtopics.id))
      .innerJoin(categorySubtopics, eq(subtopics.id, categorySubtopics.subtopicId))
      .where(eq(categorySubtopics.categoryId, categoryId));

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async getQuestionsBySubtopic(subtopicId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.subtopicId, subtopicId));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestion(id: number, questionData: InsertQuestion): Promise<Question> {
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
    return await db.select().from(questions);
  }

  async getRandomQuestions(categoryId: number, count: number): Promise<Question[]> {
    return await db
      .select({
        id: questions.id,
        subtopicId: questions.subtopicId,
        questionText: questions.questionText,
        optionA: questions.optionA,
        optionB: questions.optionB,
        optionC: questions.optionC,
        optionD: questions.optionD,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        imageUrl: questions.imageUrl,
        difficulty: questions.difficulty,
        isActive: questions.isActive,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .innerJoin(subtopics, eq(questions.subtopicId, subtopics.id))
      .innerJoin(categorySubtopics, eq(subtopics.id, categorySubtopics.subtopicId))
      .where(eq(categorySubtopics.categoryId, categoryId))
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async bulkCreateQuestions(subtopicId: number, questionsData: any[]): Promise<{ created: number; failed: number; }> {
    let created = 0;
    let failed = 0;

    for (const questionData of questionsData) {
      try {
        // Transform frontend format to database format
        const dbQuestionData = {
          subtopicId,
          questionText: questionData.question || questionData.questionText || questionData.Question,
          optionA: questionData.options?.[0] || questionData.optionA || questionData['Answer A'],
          optionB: questionData.options?.[1] || questionData.optionB || questionData['Answer B'],
          optionC: questionData.options?.[2] || questionData.optionC || questionData['Answer C'],
          optionD: questionData.options?.[3] || questionData.optionD || questionData['Answer D'],
          correctAnswer: questionData.correctAnswer || questionData['Correct Answer'],
          explanation: questionData.explanation || questionData['Explanation (General)'] || null,
          difficulty: questionData.difficulty || 'medium',
          isActive: questionData.isActive !== false, // default to true
        };

        console.log('Attempting to insert question:', dbQuestionData);
        await db.insert(questions).values(dbQuestionData);
        created++;
      } catch (error) {
        console.error('Failed to create question:', error);
        console.error('Question data:', questionData);
        failed++;
      }
    }

    return { created, failed };
  }

  async bulkCreateReviewMaterials(categoryId: number, subtopicId: number | undefined, reviewMaterialsData: any[]): Promise<{ created: number; failed: number; }> {
    let created = 0;
    let failed = 0;

    for (const materialData of reviewMaterialsData) {
      try {
        // Transform frontend format to database format
        const dbMaterialData = {
          categoryId,
          subtopicId: subtopicId || null,
          title: materialData.title || 'Untitled Review Material',
          description: materialData.description || null,
          imageUrl: materialData.imageUrl || null,
          content: typeof materialData.content === 'string' ? materialData.content : (materialData.content ? JSON.stringify(materialData.content) : null),
          isActive: materialData.isActive !== false, // default to true
        };

        console.log('Attempting to insert review material:', dbMaterialData);
        await db.insert(infographics).values(dbMaterialData);
        created++;
      } catch (error) {
        console.error('Failed to create review material:', error);
        console.error('Review material data:', materialData);
        failed++;
      }
    }

    return { created, failed };
  }

  // Rest of the methods remain the same...
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserProgressByCategory(userId: string, categoryId: number): Promise<UserProgress | undefined> {
    const result = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.categoryId, categoryId)));
    return result[0];
  }

  async updateUserProgress(userId: string, categoryId: number, data: Partial<UserProgress>): Promise<void> {
    const existing = await this.getUserProgressByCategory(userId, categoryId);
    
    if (existing) {
      await db
        .update(userProgress)
        .set(data)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.categoryId, categoryId)));
    } else {
      await db.insert(userProgress).values({
        userId,
        categoryId,
        ...data,
      } as any);
    }
  }

  async createExamAttempt(attempt: InsertExamAttempt): Promise<ExamAttempt> {
    const [newAttempt] = await db.insert(examAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserExamAttempts(userId: string): Promise<ExamAttempt[]> {
    return await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.userId, userId))
      .orderBy(desc(examAttempts.createdAt));
  }

  async getUserExamAttemptsByCategory(userId: string, categoryId: number): Promise<ExamAttempt[]> {
    return await db
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.categoryId, categoryId)))
      .orderBy(desc(examAttempts.createdAt));
  }

  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }





  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values(session).returning();
    return newSession;
  }

  async getUserStudySessions(userId: string): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.createdAt));
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const sessions = await db
      .select({
        date: sql<string>`DATE(${studySessions.createdAt})`,
        count: sql<number>`COUNT(*)`
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .groupBy(sql`DATE(${studySessions.createdAt})`)
      .orderBy(desc(sql`DATE(${studySessions.createdAt})`));

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].date);
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (diffDays === streak + 1) {
        // Allow for one day gap (yesterday)
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  async getFlashcardsByCategory(categoryId: number): Promise<Flashcard[]> {
    return await db
      .select({
        id: flashcards.id,
        categoryId: flashcards.categoryId,
        subtopicId: flashcards.subtopicId,
        front: flashcards.front,
        back: flashcards.back,
        isActive: flashcards.isActive,
        createdAt: flashcards.createdAt,
      })
      .from(flashcards)
      .innerJoin(subtopics, eq(flashcards.subtopicId, subtopics.id))
      .innerJoin(categorySubtopics, eq(subtopics.id, categorySubtopics.subtopicId))
      .where(eq(categorySubtopics.categoryId, categoryId));
  }

  async getFlashcardsBySubtopic(subtopicId: number): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(eq(flashcards.subtopicId, subtopicId));
  }

  async getBookmarkedQuestions(userId: string): Promise<Question[]> {
    const result = await db
      .select({
        id: questions.id,
        subtopicId: questions.subtopicId,
        questionText: questions.questionText,
        optionA: questions.optionA,
        optionB: questions.optionB,
        optionC: questions.optionC,
        optionD: questions.optionD,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        imageUrl: questions.imageUrl,
        difficulty: questions.difficulty,
        isActive: questions.isActive,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .innerJoin(bookmarks, eq(questions.id, bookmarks.questionId))
      .where(eq(bookmarks.userId, userId));

    return result;
  }

  async toggleQuestionBookmark(userId: string, questionId: number): Promise<void> {
    const existing = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));

    if (existing.length > 0) {
      await db
        .delete(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
    } else {
      await db.insert(bookmarks).values({
        userId: userId,
        questionId
      });
    }
  }

  async getInfographicsByCategory(categoryId: number): Promise<Infographic[]> {
    return await db
      .select({
        id: infographics.id,
        categoryId: infographics.categoryId,
        subtopicId: infographics.subtopicId,
        title: infographics.title,
        description: infographics.description,
        imageUrl: infographics.imageUrl,
        content: infographics.content,
        isActive: infographics.isActive,
        createdAt: infographics.createdAt,
      })
      .from(infographics)
      .innerJoin(subtopics, eq(infographics.subtopicId, subtopics.id))
      .innerJoin(categorySubtopics, eq(subtopics.id, categorySubtopics.subtopicId))
      .where(eq(categorySubtopics.categoryId, categoryId));
  }

  async getInfographicsBySubtopic(subtopicId: number): Promise<Infographic[]> {
    return await db.select().from(infographics).where(eq(infographics.subtopicId, subtopicId));
  }

  // Enhanced Battle mode implementation for multiplayer (2-10 players)
  async createBattleRoom(room: {
    roomCode: string;
    hostUserId: number;
    gameMode?: string;
    categoryId?: number;
    questionCount?: number;
    maxPlayers?: number;
  }): Promise<any> {
    const [battleRoom] = await db.insert(battleRooms).values({
      roomCode: room.roomCode,
      hostUserId: room.hostUserId,
      gameMode: (room.gameMode || "classic") as "classic" | "sudden_death" | "team",
      categoryId: room.categoryId,
      questionCount: room.questionCount || 20,
      maxPlayers: room.maxPlayers || 4,
      currentPlayers: 1,
      status: "lobby" as "lobby" | "waiting" | "active" | "finished" | "abandoned"
    }).returning();
    
    // Add host as first participant
    await db.insert(battleParticipants).values({
      roomId: battleRoom.id,
      userId: room.hostUserId,
      isHost: true,
      isReady: false
    });
    
    return battleRoom;
  }

  async getBattleRoom(roomCode: string): Promise<any> {
    const [room] = await db
      .select()
      .from(battleRooms)
      .where(eq(battleRooms.roomCode, roomCode))
      .limit(1);
    return room;
  }

  async getBattleRoomById(id: number): Promise<any> {
    const [room] = await db
      .select()
      .from(battleRooms)
      .where(eq(battleRooms.id, id))
      .limit(1);
    return room;
  }

  async joinBattleRoom(roomId: number, userId: number, userName: string, profileImageUrl?: string): Promise<void> {
    // Check if user is already in the room
    const existing = await db
      .select()
      .from(battleParticipants)
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.userId, userId)))
      .limit(1);
      
    if (existing.length === 0) {
      await db.insert(battleParticipants).values({
        roomId,
        userId,
        userName,
        profileImageUrl,
        isHost: false,
        isReady: false,
        isActive: true
      });
      
      // Update current player count
      await db
        .update(battleRooms)
        .set({ 
          currentPlayers: sql`${battleRooms.currentPlayers} + 1`,
          updatedAt: new Date()
        })
        .where(eq(battleRooms.id, roomId));
    }
  }

  async leaveBattleRoom(roomId: number, userId: number): Promise<void> {
    await db
      .update(battleParticipants)
      .set({ 
        isActive: false,
        leftAt: new Date()
      })
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.userId, userId)));
    
    // Update current player count
    await db
      .update(battleRooms)
      .set({ 
        currentPlayers: sql`${battleRooms.currentPlayers} - 1`,
        updatedAt: new Date()
      })
      .where(eq(battleRooms.id, roomId));
  }

  async updateBattleRoomStatus(roomId: number, status: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === "active") {
      updateData.gameStartedAt = new Date();
    } else if (status === "finished") {
      updateData.gameFinishedAt = new Date();
    }
    
    await db
      .update(battleRooms)
      .set(updateData)
      .where(eq(battleRooms.id, roomId));
  }

  async getBattleParticipants(roomId: number): Promise<any[]> {
    return await db
      .select()
      .from(battleParticipants)
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.isActive, true)))
      .orderBy(desc(battleParticipants.score), battleParticipants.joinedAt);
  }

  async updateParticipantReady(roomId: number, userId: number, isReady: boolean): Promise<void> {
    await db
      .update(battleParticipants)
      .set({ isReady })
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.userId, userId)));
  }

  async startBattleGame(roomId: number): Promise<void> {
    await this.updateBattleRoomStatus(roomId, "active");
  }

  async getBattleQuestions(roomId: number): Promise<any[]> {
    return await db
      .select({
        id: battleQuestions.id,
        questionId: battleQuestions.questionId,
        questionOrder: battleQuestions.questionOrder,
        question: questions
      })
      .from(battleQuestions)
      .innerJoin(questions, eq(battleQuestions.questionId, questions.id))
      .where(eq(battleQuestions.roomId, roomId))
      .orderBy(battleQuestions.questionOrder);
  }

  async setBattleQuestions(roomId: number, questionIds: number[]): Promise<void> {
    const questionData = questionIds.map((questionId, index) => ({
      roomId,
      questionId,
      questionOrder: index + 1
    }));
    
    await db.insert(battleQuestions).values(questionData);
  }

  async submitBattleAnswer(roomId: number, userId: number, questionId: number, answer: {
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    pointsEarned: number;
    questionOrder: number;
    powerUpUsed?: string;
    streak?: number;
  }): Promise<void> {
    await db.insert(battleAnswers).values({
      roomId,
      userId,
      questionId,
      questionOrder: answer.questionOrder,
      selectedAnswer: answer.selectedAnswer,
      isCorrect: answer.isCorrect,
      timeSpent: answer.timeSpent,
      pointsEarned: answer.pointsEarned,
      powerUpUsed: answer.powerUpUsed,
      streak: answer.streak || 0
    });
  }

  async updateParticipantScore(roomId: number, userId: number, score: number, correctAnswers: number): Promise<void> {
    await db
      .update(battleParticipants)
      .set({ 
        score,
        correctAnswers,
        totalAnswered: sql`${battleParticipants.totalAnswered} + 1`
      })
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.userId, userId)));
  }

  async getBattleLeaderboard(roomId: number): Promise<any[]> {
    return await db
      .select({
        userId: battleParticipants.userId,
        userName: battleParticipants.userName,
        profileImageUrl: battleParticipants.profileImageUrl,
        score: battleParticipants.score,
        rank: battleParticipants.rank,
        correctAnswers: battleParticipants.correctAnswers,
        totalAnswered: battleParticipants.totalAnswered,
        isHost: battleParticipants.isHost,
        isActive: battleParticipants.isActive
      })
      .from(battleParticipants)
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.isActive, true)))
      .orderBy(desc(battleParticipants.score), battleParticipants.correctAnswers);
  }

  async recordBattleEvent(roomId: number, userId: number, eventType: string, eventData: any): Promise<void> {
    await db.insert(battleEvents).values({
      roomId,
      userId,
      eventType,
      eventData
    });
  }

  async getActiveBattleRooms(): Promise<any[]> {
    return await db
      .select()
      .from(battleRooms)
      .where(inArray(battleRooms.status, ["lobby", "waiting", "active"]))
      .orderBy(desc(battleRooms.createdAt));
  }

  async concedeBattle(roomId: number, userId: number): Promise<void> {
    await db
      .update(battleParticipants)
      .set({ 
        isActive: false,
        leftAt: new Date()
      })
      .where(and(eq(battleParticipants.roomId, roomId), eq(battleParticipants.userId, userId)));
    
    // Record concede event
    await this.recordBattleEvent(roomId, userId, "concede", { reason: "player_conceded" });
  }

  async getBattleStats(userId: number): Promise<{
    battlesWon: number;
    totalBattles: number;
    winRate: number;
    powerUpsUsed: number;
  }> {
    // Get total battles played by user
    const totalBattlesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(battleParticipants)
      .innerJoin(battleRooms, eq(battleParticipants.roomId, battleRooms.id))
      .where(and(
        eq(battleParticipants.userId, userId),
        eq(battleRooms.status, "finished")
      ));
    
    const totalBattles = totalBattlesResult[0]?.count || 0;

    // Get battles won (rank = 1)
    const battlesWonResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(battleParticipants)
      .innerJoin(battleRooms, eq(battleParticipants.roomId, battleRooms.id))
      .where(and(
        eq(battleParticipants.userId, userId),
        eq(battleParticipants.rank, 1),
        eq(battleRooms.status, "finished")
      ));

    const battlesWon = battlesWonResult[0]?.count || 0;

    // Get total power-ups used across all battles
    const powerUpsUsedResult = await db
      .select({ total: sql<number>`sum(${battleParticipants.powerUpsUsed})` })
      .from(battleParticipants)
      .innerJoin(battleRooms, eq(battleParticipants.roomId, battleRooms.id))
      .where(and(
        eq(battleParticipants.userId, userId),
        eq(battleRooms.status, "finished")
      ));

    const powerUpsUsed = powerUpsUsedResult[0]?.total || 0;

    // Calculate win rate
    const winRate = totalBattles > 0 ? Math.round((battlesWon / totalBattles) * 100) : 0;

    return {
      battlesWon,
      totalBattles,
      winRate,
      powerUpsUsed
    };
  }

  async getUserBattleHistory(userId: number, limit: number = 10): Promise<any[]> {
    // Get user's recent battle history with room details and final ranking
    const history = await db
      .select({
        id: battleRooms.id,
        roomCode: battleRooms.roomCode,
        gameMode: battleRooms.gameMode,
        categoryId: battleRooms.categoryId,
        questionCount: battleRooms.questionCount,
        status: battleRooms.status,
        gameStartedAt: battleRooms.gameStartedAt,
        gameFinishedAt: battleRooms.gameFinishedAt,
        createdAt: battleRooms.createdAt,
        // Participant data
        userScore: battleParticipants.score,
        userRank: battleParticipants.rank,
        correctAnswers: battleParticipants.correctAnswers,
        totalAnswered: battleParticipants.totalAnswered,
        powerUpsUsed: battleParticipants.powerUpsUsed,
        isHost: battleParticipants.isHost,
        leftAt: battleParticipants.leftAt
      })
      .from(battleParticipants)
      .innerJoin(battleRooms, eq(battleParticipants.roomId, battleRooms.id))
      .where(eq(battleParticipants.userId, userId))
      .orderBy(desc(battleRooms.createdAt))
      .limit(limit);

    // For each battle, get the total number of participants to show full context
    const enrichedHistory = await Promise.all(history.map(async (battle) => {
      const totalParticipants = await db
        .select({ count: sql<number>`count(*)` })
        .from(battleParticipants)
        .where(eq(battleParticipants.roomId, battle.id));

      // Get category name if categoryId exists
      let categoryName = null;
      if (battle.categoryId) {
        const category = await db
          .select({ name: categories.name })
          .from(categories)
          .where(eq(categories.id, battle.categoryId))
          .limit(1);
        categoryName = category[0]?.name || null;
      }

      return {
        ...battle,
        totalParticipants: totalParticipants[0]?.count || 0,
        categoryName,
        isWinner: battle.userRank === 1,
        duration: battle.gameFinishedAt && battle.gameStartedAt 
          ? Math.floor((new Date(battle.gameFinishedAt).getTime() - new Date(battle.gameStartedAt).getTime()) / 1000)
          : null
      };
    }));

    return enrichedHistory;
  }

  // Analytics and Progress Tracking
  async getUserAnalytics(userId: number): Promise<UserAnalytics | undefined> {
    const [analytics] = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId));
    return analytics;
  }

  async updateUserAnalytics(userId: number, data: Partial<UserAnalytics>): Promise<UserAnalytics> {
    const [analytics] = await db
      .insert(userAnalytics)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: userAnalytics.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return analytics;
  }

  async getUserSubtopicProgress(userId: number, subtopicId: number): Promise<UserSubtopicProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userSubtopicProgress)
      .where(and(
        eq(userSubtopicProgress.userId, userId),
        eq(userSubtopicProgress.subtopicId, subtopicId)
      ));
    return progress;
  }

  async updateSubtopicProgress(
    userId: number, 
    subtopicId: number, 
    data: Partial<UserSubtopicProgress>
  ): Promise<UserSubtopicProgress> {
    const [progress] = await db
      .insert(userSubtopicProgress)
      .values({ userId, subtopicId, ...data })
      .onConflictDoUpdate({
        target: [userSubtopicProgress.userId, userSubtopicProgress.subtopicId],
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return progress;
  }

  async getUserCategoryStats(userId: number, categoryId: number): Promise<UserCategoryStats | undefined> {
    const [stats] = await db
      .select()
      .from(userCategoryStats)
      .where(and(
        eq(userCategoryStats.userId, userId),
        eq(userCategoryStats.categoryId, categoryId)
      ));
    return stats;
  }

  async updateCategoryStats(
    userId: number, 
    categoryId: number, 
    data: Partial<UserCategoryStats>
  ): Promise<UserCategoryStats> {
    const [stats] = await db
      .insert(userCategoryStats)
      .values({ userId, categoryId, ...data })
      .onConflictDoUpdate({
        target: [userCategoryStats.userId, userCategoryStats.categoryId],
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return stats;
  }

  async calculateOverallProgress(userId: number): Promise<number> {
    // Get all subtopics
    const allSubtopics = await db.select({ id: subtopics.id }).from(subtopics);
    
    if (allSubtopics.length === 0) return 0;

    // Get user progress for all subtopics
    const userProgress = await db
      .select()
      .from(userSubtopicProgress)
      .where(eq(userSubtopicProgress.userId, userId));

    let totalProgress = 0;
    
    for (const subtopic of allSubtopics) {
      const progress = userProgress.find(p => p.subtopicId === subtopic.id);
      if (progress) {
        totalProgress += Number(progress.progressPercentage);
      }
    }

    return Math.round((totalProgress / allSubtopics.length) * 100) / 100;
  }

  async updateAnalyticsOnActivity(
    userId: number,
    activityType: 'review' | 'practice' | 'quiz' | 'mock_exam' | 'battle',
    data: {
      subtopicIds?: number[];
      categoryId?: number;
      score?: number;
      questionsAnswered?: number;
      correctAnswers?: number;
      timeSpent?: number;
      isPassed?: boolean;
      isWin?: boolean;
      rank?: number;
    }
  ): Promise<void> {
    const now = new Date();
    
    // Update study streak for all qualifying activities
    console.log(`Updating streak for user ${userId} activity: ${activityType}`);
    await this.updateStudyStreak(String(userId));

    // Update subtopic progress
    if (data.subtopicIds) {
      for (const subtopicId of data.subtopicIds) {
        const currentProgress = await this.getUserSubtopicProgress(userId, subtopicId);
        
        const updateData: Partial<UserSubtopicProgress> = {
          lastActivityAt: now,
          totalAttempts: (currentProgress?.totalAttempts || 0) + 1,
        };

        // Update specific activity flags
        switch (activityType) {
          case 'review':
            updateData.hasViewedReview = true;
            break;
          case 'practice':
            updateData.practiceQuestionsCompleted = (currentProgress?.practiceQuestionsCompleted || 0) + (data.questionsAnswered || 0);
            break;
          case 'quiz':
            updateData.quizCompleted = true;
            if (data.score && data.score > Number(currentProgress?.bestScore || 0)) {
              updateData.bestScore = data.score.toString();
            }
            break;
          case 'mock_exam':
            updateData.includedInMockExamCompletion = true;
            if (data.score && data.score > Number(currentProgress?.bestScore || 0)) {
              updateData.bestScore = data.score.toString();
            }
            break;
        }

        // Calculate progress percentage (25% per activity type)
        const weights = {
          review: currentProgress?.hasViewedReview || updateData.hasViewedReview ? 25 : 0,
          practice: (currentProgress?.practiceQuestionsCompleted || 0) + (updateData.practiceQuestionsCompleted || 0) > 0 ? 25 : 0,
          quiz: currentProgress?.quizCompleted || updateData.quizCompleted ? 25 : 0,
          mockExam: currentProgress?.includedInMockExamCompletion || updateData.includedInMockExamCompletion ? 25 : 0,
        };
        
        updateData.progressPercentage = (weights.review + weights.practice + weights.quiz + weights.mockExam).toString();

        await this.updateSubtopicProgress(userId, subtopicId, updateData);
      }
    }

    // Update category stats - be more conservative to prevent inflation
    if (data.categoryId && activityType === 'mock_exam') {
      // Only update category stats for mock exams to prevent inflation from study activities
      const currentStats = await this.getUserCategoryStats(userId, data.categoryId);
      
      const updateData: Partial<UserCategoryStats> = {
        attempts: (currentStats?.attempts || 0) + 1,
        lastAttemptAt: now,
        timeSpent: (currentStats?.timeSpent || 0) + Math.min(data.timeSpent || 30, 60), // Cap time to prevent inflation
        questionsAnswered: (currentStats?.questionsAnswered || 0) + (data.questionsAnswered || 0),
        correctAnswers: (currentStats?.correctAnswers || 0) + (data.correctAnswers || 0),
      };

      if (data.score) {
        if (data.score > Number(currentStats?.bestScore || 0)) {
          updateData.bestScore = data.score.toString();
        }
        
        // Recalculate average score
        const totalScore = Number(currentStats?.averageScore || 0) * (currentStats?.attempts || 0) + data.score;
        updateData.averageScore = (totalScore / updateData.attempts!).toString();
      }

      await this.updateCategoryStats(userId, data.categoryId, updateData);
    }

    // Update overall analytics
    const currentAnalytics = await this.getUserAnalytics(userId);
    
    const updateData: Partial<UserAnalytics> = {
      totalStudyTime: (currentAnalytics?.totalStudyTime || 0) + (data.timeSpent || 0),
      questionsAnswered: (currentAnalytics?.questionsAnswered || 0) + (data.questionsAnswered || 0),
      correctAnswers: (currentAnalytics?.correctAnswers || 0) + (data.correctAnswers || 0),
      lastCalculatedAt: now,
    };

    if (activityType === 'mock_exam') {
      updateData.totalExams = (currentAnalytics?.totalExams || 0) + 1;
      if (data.isPassed) {
        updateData.passedExams = (currentAnalytics?.passedExams || 0) + 1;
      }
      
      // Recalculate average score for exams
      if (data.score) {
        const totalScore = Number(currentAnalytics?.averageScore || 0) * (currentAnalytics?.totalExams || 0) + data.score;
        updateData.averageScore = (totalScore / updateData.totalExams!).toString();
      }
    }

    // Handle battle mode analytics
    if (activityType === 'battle') {
      if (data.isWin) {
        updateData.battleWins = (currentAnalytics?.battleWins || 0) + 1;
      } else {
        updateData.battleLosses = (currentAnalytics?.battleLosses || 0) + 1;
      }
    }

    // Calculate overall progress
    updateData.overallProgress = (await this.calculateOverallProgress(userId)).toString();

    await this.updateUserAnalytics(userId, updateData);
  }

  async getAllUserCategoryStats(userId: number): Promise<UserCategoryStats[]> {
    return await db
      .select()
      .from(userCategoryStats)
      .where(eq(userCategoryStats.userId, userId));
  }

  async getDetailedAnalytics(userId: number) {
    const [analytics, subtopicProgress] = await Promise.all([
      this.getUserAnalytics(userId),
      db.select().from(userSubtopicProgress).where(eq(userSubtopicProgress.userId, userId))
    ]);

    // Get category stats with category names
    const categoryStatsWithNames = await db
      .select({
        categoryId: userCategoryStats.categoryId,
        categoryName: categories.name,
        attempts: userCategoryStats.attempts,
        bestScore: userCategoryStats.bestScore,
        averageScore: userCategoryStats.averageScore,
        timeSpent: userCategoryStats.timeSpent,
        questionsAnswered: userCategoryStats.questionsAnswered,
        correctAnswers: userCategoryStats.correctAnswers,
        lastAttemptAt: userCategoryStats.lastAttemptAt,
      })
      .from(userCategoryStats)
      .innerJoin(categories, eq(userCategoryStats.categoryId, categories.id))
      .where(eq(userCategoryStats.userId, userId));

    return {
      overview: analytics || {
        totalExams: 0,
        passedExams: 0,
        averageScore: 0,
        overallProgress: 0,
        totalStudyTime: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        battleWins: 0,
        battleLosses: 0,
      },
      categoryStats: categoryStatsWithNames || [],
      subtopicProgress: subtopicProgress || [],
    };
  }

  // Badge system methods
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.isActive, true));
  }

  async getUserBadges(userId: string): Promise<any[]> {
    try {
      const userBadgeData = await db
        .select({
          badgeId: userBadges.badgeId,
          badgeName: badges.name,
          badgeDescription: badges.description,
          badgeIcon: badges.icon,
          earnedAt: userBadges.earnedAt,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId));

      return userBadgeData.map((ub: any) => ({
        id: ub.badgeId.toString(),
        name: ub.badgeName,
        description: ub.badgeDescription,
        earnedAt: ub.earnedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error in getUserBadges:', error);
      return [];
    }
  }

  async awardBadgeByName(userId: string, badgeName: string): Promise<void> {
    const badge = await db.select().from(badges).where(eq(badges.name, badgeName)).limit(1);
    if (badge.length > 0) {
      await db
        .insert(userBadges)
        .values({
          userId,
          badgeId: badge[0].id,
          earnedAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }

  async updateUserBadges(userId: string, badgeNames: string[]): Promise<void> {
    await db
      .update(users)
      .set({ badgesEarned: badgeNames })
      .where(eq(users.id, parseInt(userId)));
  }



}

export const storage = new DatabaseStorage();
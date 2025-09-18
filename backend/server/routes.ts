import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { insertCategorySchema, insertQuestionSchema, insertExamAttemptSchema, insertStudySessionSchema, infographics, categorySubtopics, battleParticipants, questions, subtopics, categories, premiumAccessRequests, insertPremiumAccessRequestSchema, practicalStations, practicalContent, insertPracticalStationSchema, insertPracticalContentSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, count } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'question-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Admin middleware
  function isAdmin(req: any, res: any, next: any) {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: "Admin access required" });
  }

  // Serve uploaded images statically
  app.use('/uploads', (req, res, next) => {
    // Add CORS headers for images
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile management endpoints
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { profileImageUrl, nickname } = req.body;
      
      const updateData: any = {};
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
      if (nickname !== undefined) updateData.nickname = nickname;
      
      await storage.updateUserProfile(userId, updateData);
      
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.post('/api/user/upload-profile-image', isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  app.post('/api/user/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;
      
      if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      await storage.changeUserPassword(userId, password);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Categories routes
  app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.get('/api/categories/:id/subtopics', isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const subtopics = await storage.getSubtopicsByCategory(categoryId);
      res.json(subtopics);
    } catch (error) {
      console.error("Error fetching subtopics:", error);
      res.status(500).json({ message: "Failed to fetch subtopics" });
    }
  });

  // Admin route for all subtopics (must come before /:id route)
  app.get('/api/subtopics/all', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const subtopics = await storage.getAllSubtopics();
      res.json(subtopics);
    } catch (error) {
      console.error("Error fetching all subtopics:", error);
      res.status(500).json({ message: "Failed to fetch subtopics" });
    }
  });

  app.get('/api/subtopics/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subtopic = await storage.getSubtopic(id);
      if (!subtopic) {
        return res.status(404).json({ message: "Subtopic not found" });
      }
      res.json(subtopic);
    } catch (error) {
      console.error("Error fetching subtopic:", error);
      res.status(500).json({ message: "Failed to fetch subtopic" });
    }
  });

  // Questions routes
  // Admin route for all questions (must come before other parameterized routes)
  app.get('/api/questions/all', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching all questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/category/:categoryId', isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const questions = await storage.getQuestionsByCategory(categoryId, limit);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/subtopic/:subtopicId', isAuthenticated, async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.subtopicId);
      const questions = await storage.getQuestionsBySubtopic(subtopicId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/random/:categoryId/:count', isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const count = parseInt(req.params.count);
      const questions = await storage.getRandomQuestions(categoryId, count);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching random questions:", error);
      res.status(500).json({ message: "Failed to fetch random questions" });
    }
  });

  // User progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.get('/api/progress/category/:categoryId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(req.params.categoryId);
      const progress = await storage.getUserProgressByCategory(userId, categoryId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching category progress:", error);
      res.status(500).json({ message: "Failed to fetch category progress" });
    }
  });

  // Mock exam routes
  app.post('/api/exams', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Exam submission request received");
      console.log("User from session:", req.user);
      console.log("Request body:", req.body);
      
      const userId = String(req.user.id);
      const examData = insertExamAttemptSchema.parse({ ...req.body, userId });
      console.log("Parsed exam data:", examData);
      
      const attempt = await storage.createExamAttempt(examData);
      console.log("Exam attempt created:", attempt);
      
      // Update analytics to track mock exam activity
      if (examData.categoryId && examData.totalQuestions && examData.correctAnswers !== undefined) {
        try {
          // Update analytics to reflect this mock exam activity
          await storage.updateAnalyticsOnActivity(parseInt(userId), 'mock_exam', {
            categoryId: examData.categoryId,
            score: parseFloat(examData.score),
            questionsAnswered: examData.totalQuestions,
            correctAnswers: examData.correctAnswers,
            timeSpent: examData.timeTaken || 1, // default 1 minute if not provided
            isPassed: examData.passed ?? false
          });
          
          console.log(`Updated analytics for category ${examData.categoryId} mock exam: ${examData.score}%`);
          
          // Also update legacy progress tracking for backward compatibility
          const currentProgress = await storage.getUserProgressByCategory(userId, examData.categoryId);
          const newTotalAttempts = (currentProgress?.totalAttempts || 0) + examData.totalQuestions;
          const newCorrectAnswers = (currentProgress?.correctAnswers || 0) + examData.correctAnswers;
          
          await storage.updateUserProgress(userId, examData.categoryId, {
            totalAttempts: newTotalAttempts,
            correctAnswers: newCorrectAnswers,
            lastStudied: new Date(),
          });
          
          console.log(`Updated category ${examData.categoryId} progress: ${newCorrectAnswers}/${newTotalAttempts}`);
        } catch (progressError) {
          console.error("Error updating category progress and analytics:", progressError);
          // Don't fail the exam submission if progress update fails
        }
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Detailed exam submission error:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      console.error("Error creating exam attempt:", error);
      res.status(500).json({ message: "Failed to create exam attempt" });
    }
  });

  app.get('/api/exams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const attempts = await storage.getUserExamAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching exam attempts:", error);
      res.status(500).json({ message: "Failed to fetch exam attempts" });
    }
  });

  app.get('/api/exams/category/:categoryId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(req.params.categoryId);
      const attempts = await storage.getUserExamAttemptsByCategory(userId, categoryId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching category exam attempts:", error);
      res.status(500).json({ message: "Failed to fetch category exam attempts" });
    }
  });

  // Badges routes
  app.get('/api/badges', isAuthenticated, async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get('/api/badges/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Study sessions routes
  app.post('/api/study-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionData = insertStudySessionSchema.parse({ ...req.body, userId });
      const session = await storage.createStudySession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      console.error("Error creating study session:", error);
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  app.get('/api/study-sessions/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = String(req.user.id);
      const streakData = await storage.getUserStreak(userId);
      res.json(streakData);
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // Daily streak validation endpoint (can be called by frontend)
  app.post('/api/study-sessions/validate-streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = String(req.user.id);
      const validation = await storage.validateUserStreak(userId);
      res.json(validation);
    } catch (error) {
      console.error("Error validating streak:", error);
      res.status(500).json({ message: "Failed to validate streak" });
    }
  });

  // Study activity tracking routes
  app.post('/api/study-activity/review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = String(req.user.id);
      const { duration, scrolledToEnd } = req.body;
      
      // Track review activity (≥2min or scrolled to end)
      if (duration >= 120 || scrolledToEnd) {
        await storage.updateStudyStreak(userId);
        console.log(`Review activity tracked for user ${userId}: streak updated`);
        res.json({ message: "Review activity tracked", streakUpdated: true });
      } else {
        console.log(`Review activity tracked for user ${userId}: insufficient time, streak not updated`);
        res.json({ message: "Review activity tracked", streakUpdated: false });
      }
    } catch (error) {
      console.error("Error tracking review activity:", error);
      res.status(500).json({ message: "Failed to track review activity" });
    }
  });

  app.post('/api/study-activity/practice', isAuthenticated, async (req: any, res) => {
    try {
      const userId = String(req.user.id);
      const { questionsAnswered } = req.body;
      
      // Track practice activity (≥5 questions for more realistic streak qualification)
      if (questionsAnswered >= 5) {
        await storage.updateStudyStreak(userId);
        console.log(`Practice activity tracked for user ${userId}: ${questionsAnswered} questions, streak updated`);
        res.json({ message: "Practice activity tracked", streakUpdated: true });
      } else {
        console.log(`Practice activity tracked for user ${userId}: only ${questionsAnswered} questions, streak not updated`);
        res.json({ message: "Practice activity tracked", streakUpdated: false });
      }
    } catch (error) {
      console.error("Error tracking practice activity:", error);
      res.status(500).json({ message: "Failed to track practice activity" });
    }
  });

  app.post('/api/study-activity/quiz', isAuthenticated, async (req: any, res) => {
    try {
      const userId = String(req.user.id);
      const { completed } = req.body;
      
      // Track quiz activity (completed quiz)
      if (completed) {
        await storage.updateStudyStreak(userId);
        console.log(`Quiz activity tracked for user ${userId}: quiz completed, streak updated`);
        res.json({ message: "Quiz activity tracked", streakUpdated: true });
      } else {
        console.log(`Quiz activity tracked for user ${userId}: quiz not completed, streak not updated`);
        res.json({ message: "Quiz activity tracked", streakUpdated: false });
      }
    } catch (error) {
      console.error("Error tracking quiz activity:", error);
      res.status(500).json({ message: "Failed to track quiz activity" });
    }
  });

  // Flashcards routes
  app.get('/api/flashcards/category/:categoryId', isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const flashcards = await storage.getFlashcardsByCategory(categoryId);
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  // Get random questions for Continue Studying panel
  app.get('/api/questions/random-study', isAuthenticated, async (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 5;
      
      // Get random questions from all active questions
      const randomQuestions = await db.select({
        id: questions.id,
        questionText: questions.questionText,
        correctAnswer: questions.correctAnswer,
        optionA: questions.optionA,
        optionB: questions.optionB,
        optionC: questions.optionC,
        optionD: questions.optionD,
        explanation: questions.explanation,
        subtopicName: subtopics.name,
        categoryName: categories.name,
      })
      .from(questions)
      .innerJoin(subtopics, eq(questions.subtopicId, subtopics.id))
      .innerJoin(categorySubtopics, eq(subtopics.id, categorySubtopics.subtopicId))
      .innerJoin(categories, eq(categorySubtopics.categoryId, categories.id))
      .where(eq(questions.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(count);

      res.json(randomQuestions);
    } catch (error) {
      console.error("Error fetching random study questions:", error);
      res.status(500).json({ message: "Failed to fetch study questions" });
    }
  });

  app.get('/api/flashcards/subtopic/:subtopicId', isAuthenticated, async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.subtopicId);
      const flashcards = await storage.getFlashcardsBySubtopic(subtopicId);
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  // Bookmarks routes
  app.get('/api/bookmarks/questions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookmarkedQuestions = await storage.getBookmarkedQuestions(userId);
      res.json(bookmarkedQuestions);
    } catch (error) {
      console.error("Error fetching bookmarked questions:", error);
      res.status(500).json({ message: "Failed to fetch bookmarked questions" });
    }
  });

  app.post('/api/bookmarks/questions/:questionId/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const questionId = parseInt(req.params.questionId);
      await storage.toggleQuestionBookmark(userId, questionId);
      res.json({ message: "Bookmark toggled successfully" });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  // Infographics routes
  app.get('/api/infographics/category/:categoryId', isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const infographics = await storage.getInfographicsByCategory(categoryId);
      res.json(infographics);
    } catch (error) {
      console.error("Error fetching infographics:", error);
      res.status(500).json({ message: "Failed to fetch infographics" });
    }
  });

  app.get('/api/infographics/subtopic/:subtopicId', isAuthenticated, async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.subtopicId);
      const infographics = await storage.getInfographicsBySubtopic(subtopicId);
      res.json(infographics);
    } catch (error) {
      console.error("Error fetching infographics:", error);
      res.status(500).json({ message: "Failed to fetch infographics" });
    }
  });

  // Admin routes
  app.get('/api/admin/users/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post('/api/admin/users/:userId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const userId = req.params.userId;
      const { role } = req.body;
      await storage.updateUserStatus(userId, 'approved');
      if (role) {
        await storage.updateUserRole(userId, role);
      }
      res.json({ message: "User approved successfully" });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/admin/users/:userId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const userId = req.params.userId;
      await storage.updateUserStatus(userId, 'rejected');
      res.json({ message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // Premium access request routes
  app.post('/api/premium-requests', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, requestMessage } = req.body;
      
      // Check if user already has a pending request
      const existingRequest = await db.select()
        .from(premiumAccessRequests)
        .where(and(
          eq(premiumAccessRequests.userId, userId),
          eq(premiumAccessRequests.status, "pending")
        ))
        .limit(1);

      if (existingRequest.length > 0) {
        return res.status(400).json({ message: "You already have a pending premium access request" });
      }

      // Create new premium access request
      const [newRequest] = await db.insert(premiumAccessRequests)
        .values({
          userId,
          requestMessage,
          status: "pending"
        })
        .returning();

      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating premium access request:", error);
      res.status(500).json({ message: "Failed to create premium access request" });
    }
  });

  app.get('/api/premium-requests/my-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const request = await db.select()
        .from(premiumAccessRequests)
        .where(eq(premiumAccessRequests.userId, userId))
        .orderBy(desc(premiumAccessRequests.createdAt))
        .limit(1);

      res.json(request[0] || null);
    } catch (error) {
      console.error("Error fetching user's premium request:", error);
      res.status(500).json({ message: "Failed to fetch premium request" });
    }
  });

  app.get('/api/admin/premium-requests', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const requests = await db.select({
        id: premiumAccessRequests.id,
        userId: premiumAccessRequests.userId,
        requestMessage: premiumAccessRequests.requestMessage,
        status: premiumAccessRequests.status,
        processedBy: premiumAccessRequests.processedBy,
        processedAt: premiumAccessRequests.processedAt,
        createdAt: premiumAccessRequests.createdAt,
        userEmail: sql`u.email`.as('userEmail'),
        userFirstName: sql`u.first_name`.as('userFirstName'),
        userLastName: sql`u.last_name`.as('userLastName'),
      })
      .from(premiumAccessRequests)
      .leftJoin(sql`users u`, eq(premiumAccessRequests.userId, sql`u.id`))
      .orderBy(desc(premiumAccessRequests.createdAt));

      res.json(requests);
    } catch (error) {
      console.error("Error fetching premium requests:", error);
      res.status(500).json({ message: "Failed to fetch premium requests" });
    }
  });

  app.post('/api/admin/premium-requests/:requestId/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const adminId = req.user.id;

      // Get the request
      const [request] = await db.select()
        .from(premiumAccessRequests)
        .where(eq(premiumAccessRequests.id, requestId))
        .limit(1);

      if (!request) {
        return res.status(404).json({ message: "Premium access request not found" });
      }

      // Update user role to premium
      await storage.updateUserRole(request.userId.toString(), 'premium');

      // Update request status
      await db.update(premiumAccessRequests)
        .set({
          status: 'approved',
          processedBy: adminId,
          processedAt: new Date()
        })
        .where(eq(premiumAccessRequests.id, requestId));

      res.json({ message: "Premium access request approved successfully" });
    } catch (error) {
      console.error("Error approving premium request:", error);
      res.status(500).json({ message: "Failed to approve premium request" });
    }
  });

  app.post('/api/admin/premium-requests/:requestId/reject', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const adminId = req.user.id;

      // Update request status
      await db.update(premiumAccessRequests)
        .set({
          status: 'rejected',
          processedBy: adminId,
          processedAt: new Date()
        })
        .where(eq(premiumAccessRequests.id, requestId));

      res.json({ message: "Premium access request rejected" });
    } catch (error) {
      console.error("Error rejecting premium request:", error);
      res.status(500).json({ message: "Failed to reject premium request" });
    }
  });

  app.post('/api/admin/users/create', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { email, password, firstName, lastName, role = 'basic', status = 'approved' } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        status,
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Real-time user activity analytics
  app.get('/api/admin/analytics/activity', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const activity = await storage.getRealtimeUserActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Recent exam attempts with user details
  app.get('/api/admin/analytics/exams', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const exams = await storage.getRecentExamAttempts(limit);
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exam attempts:", error);
      res.status(500).json({ message: "Failed to fetch exam attempts" });
    }
  });

  // Recent quiz/study sessions with user details  
  app.get('/api/admin/analytics/sessions', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const sessions = await storage.getRecentStudySessions(limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  // Comprehensive user history (all exams and quiz sessions)
  app.get('/api/admin/analytics/user-history', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userHistory = await storage.getComprehensiveUserHistory();
      res.json(userHistory);
    } catch (error) {
      console.error("Error fetching user history:", error);
      res.status(500).json({ message: "Failed to fetch user history" });
    }
  });

  // Individual user's complete history
  app.get('/api/admin/analytics/user-history/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const [examHistory, studyHistory] = await Promise.all([
        storage.getUserExamAttempts(userId),
        storage.getUserStudySessions(userId)
      ]);
      res.json({ examHistory, studyHistory });
    } catch (error) {
      console.error("Error fetching individual user history:", error);
      res.status(500).json({ message: "Failed to fetch user history" });
    }
  });

  // User activity overview statistics
  app.get('/api/admin/analytics/overview', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const overview = await storage.getActivityOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching activity overview:", error);
      res.status(500).json({ message: "Failed to fetch activity overview" });
    }
  });

  // Infographics routes
  app.get('/api/infographics', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      if (categoryId) {
        const infographics = await storage.getInfographicsByCategory(categoryId);
        res.json(infographics);
      } else {
        // Get all infographics
        const allInfographics = await db.select().from(infographics);
        res.json(allInfographics || []);
      }
    } catch (error) {
      console.error('Error fetching infographics:', error);
      res.status(500).json({ message: 'Failed to fetch infographics' });
    }
  });

  app.post('/api/admin/infographics', isAuthenticated, upload.single('imageFile'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const infographicData = req.body;
      
      // Handle file upload for images
      let imageUrl = req.body.imageUrl || null;
      
      // If a file was uploaded, use that instead of URL
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // If categoryId is not provided but subtopicId is, find the category
      if (!infographicData.categoryId && infographicData.subtopicId) {
        const categorySubtopic = await db.select()
          .from(categorySubtopics)
          .where(eq(categorySubtopics.subtopicId, parseInt(infographicData.subtopicId)))
          .limit(1);
        
        if (categorySubtopic.length > 0) {
          infographicData.categoryId = categorySubtopic[0].categoryId;
        }
      }
      
      // Convert string IDs to integers
      if (infographicData.categoryId) {
        infographicData.categoryId = parseInt(infographicData.categoryId);
      }
      if (infographicData.subtopicId) {
        infographicData.subtopicId = parseInt(infographicData.subtopicId);
      }
      
      // Add image URL to infographic data
      infographicData.imageUrl = imageUrl;
      
      const newInfographic = await db.insert(infographics).values(infographicData).returning();
      res.json(newInfographic[0]);
    } catch (error) {
      console.error('Error creating infographic:', error);
      res.status(500).json({ message: 'Failed to create infographic' });
    }
  });

  app.put('/api/admin/infographics/:id', isAuthenticated, upload.single('imageFile'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const infographicData = req.body;
      
      // Handle file upload for images
      let imageUrl = req.body.imageUrl || null;
      
      // If a file was uploaded, use that instead of URL
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // If categoryId is not provided but subtopicId is, find the category
      if (!infographicData.categoryId && infographicData.subtopicId) {
        const categorySubtopic = await db.select()
          .from(categorySubtopics)
          .where(eq(categorySubtopics.subtopicId, parseInt(infographicData.subtopicId)))
          .limit(1);
        
        if (categorySubtopic.length > 0) {
          infographicData.categoryId = categorySubtopic[0].categoryId;
        }
      }
      
      // Convert string IDs to integers
      if (infographicData.categoryId) {
        infographicData.categoryId = parseInt(infographicData.categoryId);
      }
      if (infographicData.subtopicId) {
        infographicData.subtopicId = parseInt(infographicData.subtopicId);
      }
      
      // Add image URL to infographic data
      if (imageUrl) {
        infographicData.imageUrl = imageUrl;
      }
      
      const updatedInfographic = await db
        .update(infographics)
        .set(infographicData)
        .where(eq(infographics.id, id))
        .returning();
      res.json(updatedInfographic[0]);
    } catch (error) {
      console.error('Error updating infographic:', error);
      res.status(500).json({ message: 'Failed to update infographic' });
    }
  });

  app.delete('/api/admin/infographics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await db.delete(infographics).where(eq(infographics.id, id));
      res.json({ message: 'Infographic deleted successfully' });
    } catch (error) {
      console.error('Error deleting infographic:', error);
      res.status(500).json({ message: 'Failed to delete infographic' });
    }
  });

  // Practical Study Guide Content API routes
  // Get all practical stations
  app.get('/api/practical-stations', isAuthenticated, async (req: any, res) => {
    try {
      const stations = await storage.getPracticalStations();
      res.json(stations);
    } catch (error) {
      console.error('Error fetching practical stations:', error);
      res.status(500).json({ message: 'Failed to fetch practical stations' });
    }
  });

  // Get single practical station
  app.get('/api/practical-stations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await storage.getPracticalStation(id);
      if (!station) {
        return res.status(404).json({ message: 'Practical station not found' });
      }
      res.json(station);
    } catch (error) {
      console.error('Error fetching practical station:', error);
      res.status(500).json({ message: 'Failed to fetch practical station' });
    }
  });

  // Create practical station (admin only)
  app.post('/api/admin/practical-stations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertPracticalStationSchema.parse(req.body);
      const newStation = await storage.createPracticalStation(validatedData);
      res.json(newStation);
    } catch (error) {
      console.error('Error creating practical station:', error);
      res.status(500).json({ message: 'Failed to create practical station' });
    }
  });

  // Update practical station (admin only)
  app.put('/api/admin/practical-stations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedStation = await storage.updatePracticalStation(id, updates);
      res.json(updatedStation);
    } catch (error) {
      console.error('Error updating practical station:', error);
      res.status(500).json({ message: 'Failed to update practical station' });
    }
  });

  // Delete practical station (admin only)
  app.delete('/api/admin/practical-stations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deletePracticalStation(id);
      res.json({ message: 'Practical station deleted successfully' });
    } catch (error) {
      console.error('Error deleting practical station:', error);
      res.status(500).json({ message: 'Failed to delete practical station' });
    }
  });

  // Get content for a practical station
  app.get('/api/practical-stations/:stationId/content', isAuthenticated, async (req, res) => {
    try {
      const stationId = parseInt(req.params.stationId);
      const content = await storage.getPracticalContentByStation(stationId);
      res.json(content);
    } catch (error) {
      console.error('Error fetching practical content:', error);
      res.status(500).json({ message: 'Failed to fetch practical content' });
    }
  });

  // Create practical content (admin only)
  app.post('/api/admin/practical-content', isAuthenticated, upload.single('imageFile'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const contentData = req.body;
      
      // Handle content as JSONB if it's a string
      if (typeof contentData.content === 'string') {
        try {
          contentData.content = JSON.parse(contentData.content);
        } catch (e) {
          // If it's not valid JSON, keep as string
        }
      }

      // Handle file upload for images
      if (req.file && contentData.contentType === 'image') {
        const imageUrl = `/uploads/${req.file.filename}`;
        if (!contentData.content) {
          contentData.content = {};
        }
        contentData.content.imageUrl = imageUrl;
      }

      const validatedData = insertPracticalContentSchema.parse(contentData);
      const newContent = await storage.createPracticalContent(validatedData);
      res.json(newContent);
    } catch (error) {
      console.error('Error creating practical content:', error);
      res.status(500).json({ message: 'Failed to create practical content' });
    }
  });

  // Bulk create practical content (admin only)
  app.post('/api/admin/practical-stations/:stationId/bulk-content', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stationId = parseInt(req.params.stationId);
      const { contents } = req.body;

      if (!Array.isArray(contents)) {
        return res.status(400).json({ message: 'Contents must be an array' });
      }

      const newContents = await storage.bulkCreatePracticalContent(stationId, contents);
      res.json(newContents);
    } catch (error) {
      console.error('Error bulk creating practical content:', error);
      res.status(500).json({ message: 'Failed to bulk create practical content' });
    }
  });

  // Update practical content (admin only)
  app.put('/api/admin/practical-content/:id', isAuthenticated, upload.single('imageFile'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      let updates = req.body;

      // Handle content as JSONB if it's a string
      if (typeof updates.content === 'string') {
        try {
          updates.content = JSON.parse(updates.content);
        } catch (e) {
          // If it's not valid JSON, keep as string
        }
      }

      // Handle file upload for images
      if (req.file && updates.contentType === 'image') {
        const imageUrl = `/uploads/${req.file.filename}`;
        if (!updates.content) {
          updates.content = {};
        }
        updates.content.imageUrl = imageUrl;
      }

      // CRITICAL FIX: Only include defined fields to prevent overwriting existing data
      const definedUpdates: any = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && value !== null && value !== '') {
          definedUpdates[key] = value;
        }
      }

      // SECURITY: Never allow stationId to be changed via edit
      delete definedUpdates.stationId;
      delete definedUpdates.id;

      const updatedContent = await storage.updatePracticalContent(id, definedUpdates);
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating practical content:', error);
      res.status(500).json({ message: 'Failed to update practical content' });
    }
  });

  // Delete practical content (admin only)
  app.delete('/api/admin/practical-content/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deletePracticalContent(id);
      res.json({ message: 'Practical content deleted successfully' });
    } catch (error) {
      console.error('Error deleting practical content:', error);
      res.status(500).json({ message: 'Failed to delete practical content' });
    }
  });

  // Reorder practical content (admin only)
  app.put('/api/admin/practical-stations/:stationId/reorder-content', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stationId = parseInt(req.params.stationId);
      const { contentIds } = req.body;

      if (!Array.isArray(contentIds)) {
        return res.status(400).json({ message: 'contentIds must be an array' });
      }

      await storage.reorderPracticalContent(stationId, contentIds);
      res.json({ message: 'Content reordered successfully' });
    } catch (error) {
      console.error('Error reordering practical content:', error);
      res.status(500).json({ message: 'Failed to reorder practical content' });
    }
  });

  // Analytics and Progress API routes
  app.get('/api/analytics/overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analytics = await storage.getDetailedAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/analytics/track-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { activityType, subtopicIds, categoryId, score, questionsAnswered, correctAnswers, timeSpent, isPassed, isWin, rank, questionResults } = req.body;
      
      await storage.updateAnalyticsOnActivity(userId, activityType, {
        subtopicIds,
        categoryId,
        score,
        questionsAnswered,
        correctAnswers,
        timeSpent,
        isPassed,
        isWin,
        rank
      });

      // Track individual question completions for overall progress
      if (questionResults && Array.isArray(questionResults)) {
        for (const result of questionResults) {
          if (result.questionId && typeof result.isCorrect === 'boolean') {
            await storage.trackQuestionCompletion(
              userId, 
              result.questionId, 
              result.isCorrect, 
              activityType === 'mock_exam' ? 'exam' : (activityType === 'practice' ? 'practice' : 'quiz')
            );
          }
        }
      }
      
      // Check for new badges after activity completion using comprehensive badge system
      const newBadges = await storage.checkAndAwardAllBadges(userId, activityType, {
        subtopicIds,
        categoryId,
        score,
        questionsAnswered,
        correctAnswers,
        timeSpent,
        isPassed,
        isWin,
        rank
      });
      
      if (newBadges.length > 0) {
        console.log(`User ${userId} earned new badges: ${newBadges.join(', ')}`);
      }
      
      res.json({ message: "Activity tracked successfully" });
    } catch (error) {
      console.error("Error tracking activity:", error);
      res.status(500).json({ message: "Failed to track activity" });
    }
  });

  app.get('/api/analytics/progress/:subtopicId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subtopicId = parseInt(req.params.subtopicId);
      const progress = await storage.getUserSubtopicProgress(userId, subtopicId);
      res.json(progress || {
        userId,
        subtopicId,
        hasViewedReview: false,
        practiceQuestionsCompleted: 0,
        quizCompleted: false,
        includedInMockExamCompletion: false,
        bestScore: "0.00",
        totalAttempts: 0,
        progressPercentage: "0.00"
      });
    } catch (error) {
      console.error("Error fetching subtopic progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get('/api/analytics/category-stats/:categoryId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(req.params.categoryId);
      const stats = await storage.getUserCategoryStats(userId, categoryId);
      res.json(stats || {
        userId,
        categoryId,
        attempts: 0,
        bestScore: "0.00",
        averageScore: "0.00",
        categoryProgress: "0.00",
        timeSpent: 0,
        questionsAnswered: 0,
        correctAnswers: 0
      });
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ message: "Failed to fetch category stats" });
    }
  });

  // Badge routes
  app.get('/api/badges/available', async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching available badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get('/api/badges/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userBadges = await storage.getUserBadges(userId.toString());
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Badge achievement system API
  app.post('/api/analytics/check-badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Use comprehensive badge checking system
      const newBadges = await storage.checkAndAwardAllBadges(userId);
      const user = await storage.getUser(userId.toString());
      const totalBadges = user?.badgesEarned || [];

      res.json({ newBadges, totalBadges });
    } catch (error) {
      console.error("Error checking badges:", error);
      res.status(500).json({ message: "Failed to check badges" });
    }
  });

  // Get overall study completion progress
  app.get('/api/analytics/overall-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const overallProgress = await storage.getUserOverallProgress(userId);
      const completionStats = await storage.getUserCompletionStats(userId);
      
      // Ensure the response matches OverallProgressData interface
      res.json({ 
        overallProgress,
        totalQuestions: completionStats.totalQuestions,
        completedQuestions: completionStats.completedQuestions,
        practiceCompleted: completionStats.practiceCompleted,
        quizCompleted: completionStats.quizCompleted,
        examCompleted: completionStats.examCompleted,
      });
    } catch (error) {
      console.error("Error fetching overall progress:", error);
      res.status(500).json({ message: "Failed to fetch overall progress" });
    }
  });

  // Daily progress tracking routes for study streak
  app.get('/api/daily-progress/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const progress = await storage.getDailyProgress(userId, today);
      
      res.json(progress || {
        userId,
        date: today,
        quizCompleted: false,
        reviewTimeCompleted: false,
        practiceCompleted: false,
        isCompleted: false,
        quizCompletedAt: null,
        reviewCompletedAt: null,
        practiceCompletedAt: null,
        completedAt: null,
      });
    } catch (error) {
      console.error("Error fetching daily progress:", error);
      res.status(500).json({ message: "Failed to fetch daily progress" });
    }
  });

  app.post('/api/daily-progress/quiz', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];
      
      await storage.updateQuizProgress(userId, today);
      
      const updatedProgress = await storage.getDailyProgress(userId, today);
      res.json({ message: "Quiz progress updated", progress: updatedProgress });
    } catch (error) {
      console.error("Error updating quiz progress:", error);
      res.status(500).json({ message: "Failed to update quiz progress" });
    }
  });

  app.post('/api/daily-progress/review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];
      
      await storage.updateReviewProgress(userId, today);
      
      const updatedProgress = await storage.getDailyProgress(userId, today);
      res.json({ message: "Review progress updated", progress: updatedProgress });
    } catch (error) {
      console.error("Error updating review progress:", error);
      res.status(500).json({ message: "Failed to update review progress" });
    }
  });

  app.post('/api/daily-progress/practice', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];
      
      await storage.updatePracticeProgress(userId, today);
      
      const updatedProgress = await storage.getDailyProgress(userId, today);
      res.json({ message: "Practice progress updated", progress: updatedProgress });
    } catch (error) {
      console.error("Error updating practice progress:", error);
      res.status(500).json({ message: "Failed to update practice progress" });
    }
  });

  app.get('/api/daily-progress/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const streakData = await storage.checkAndUpdateStreak(userId);
      const user = await storage.getUser(userId.toString());
      
      res.json({
        currentStreak: streakData.studyStreak,
        longestStreak: streakData.longestStreak,
        lastActiveDate: user?.lastActiveDate
      });
    } catch (error) {
      console.error("Error fetching streak data:", error);
      res.status(500).json({ message: "Failed to fetch streak data" });
    }
  });

  // Admin content management routes (subtopics/all and questions/all moved above to avoid route conflicts)

  app.post('/api/admin/categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/admin/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/admin/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.post('/api/admin/subtopics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const subtopicData = {
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: req.body.description
      };
      const subtopic = await storage.createSubtopic(subtopicData);
      
      // If a categoryId is provided, link the subtopic to the category
      if (req.body.categoryId) {
        await storage.linkSubtopicToCategory(parseInt(req.body.categoryId), subtopic.id);
      }
      
      res.json(subtopic);
    } catch (error) {
      console.error("Error creating subtopic:", error);
      res.status(500).json({ message: "Failed to create subtopic" });
    }
  });

  app.put('/api/admin/subtopics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const subtopicData = {
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: req.body.description
      };
      const subtopic = await storage.updateSubtopic(id, subtopicData);
      res.json(subtopic);
    } catch (error) {
      console.error("Error updating subtopic:", error);
      res.status(500).json({ message: "Failed to update subtopic" });
    }
  });

  app.delete('/api/admin/subtopics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteSubtopic(id);
      res.json({ message: "Subtopic deleted successfully" });
    } catch (error) {
      console.error("Error deleting subtopic:", error);
      res.status(500).json({ message: "Failed to delete subtopic" });
    }
  });

  // Enhanced Category-Subtopic relationship routes
  app.get('/api/category-subtopics/all', isAuthenticated, async (req, res) => {
    try {
      const relationships = await db.select().from(categorySubtopics);
      res.json(relationships);
    } catch (error) {
      console.error("Error fetching category-subtopic relationships:", error);
      res.status(500).json({ message: "Failed to fetch relationships" });
    }
  });


  app.get('/api/subtopics/:subtopicId/categories', isAuthenticated, async (req, res) => {
    try {
      const subtopicId = parseInt(req.params.subtopicId);
      const categories = await storage.getCategoriesBySubtopic(subtopicId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories for subtopic:", error);
      res.status(500).json({ message: "Failed to fetch categories for subtopic" });
    }
  });

  app.post('/api/admin/categories/:categoryId/subtopics/:subtopicId/link', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const categoryId = parseInt(req.params.categoryId);
      const subtopicId = parseInt(req.params.subtopicId);
      await storage.linkSubtopicToCategory(categoryId, subtopicId);
      res.json({ message: "Subtopic linked to category successfully" });
    } catch (error) {
      console.error("Error linking subtopic to category:", error);
      res.status(500).json({ message: "Failed to link subtopic to category" });
    }
  });

  app.delete('/api/admin/categories/:categoryId/subtopics/:subtopicId/unlink', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const categoryId = parseInt(req.params.categoryId);
      const subtopicId = parseInt(req.params.subtopicId);
      await storage.unlinkSubtopicFromCategory(categoryId, subtopicId);
      res.json({ message: "Subtopic unlinked from category successfully" });
    } catch (error) {
      console.error("Error unlinking subtopic from category:", error);
      res.status(500).json({ message: "Failed to unlink subtopic from category" });
    }
  });

  app.post('/api/admin/categories/:categoryId/subtopics/bulk-link', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const categoryId = parseInt(req.params.categoryId);
      const { subtopicIds } = req.body;
      if (!Array.isArray(subtopicIds)) {
        return res.status(400).json({ message: "subtopicIds must be an array" });
      }
      await storage.bulkLinkSubtopicsToCategory(categoryId, subtopicIds);
      res.json({ message: "Subtopics linked to category successfully" });
    } catch (error) {
      console.error("Error bulk linking subtopics to category:", error);
      res.status(500).json({ message: "Failed to bulk link subtopics to category" });
    }
  });

  app.post('/api/admin/questions', isAuthenticated, upload.single('imageFile'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      let imageUrl = req.body.imageUrl || null;
      
      // If a file was uploaded, use the uploaded file path
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const questionData = {
        subtopicId: parseInt(req.body.subtopicId),
        questionText: req.body.questionText,
        optionA: req.body.optionA,
        optionB: req.body.optionB,
        optionC: req.body.optionC,
        optionD: req.body.optionD,
        correctAnswer: req.body.correctAnswer,
        explanation: req.body.explanation,
        imageUrl: imageUrl
      };
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.put('/api/admin/questions/:id', isAuthenticated, upload.single('imageFile'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      
      console.log('Updating question with data:', req.body);
      
      let imageUrl = req.body.imageUrl || null;
      
      // If a file was uploaded, use the uploaded file path
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const questionData = {
        subtopicId: req.body.subtopicId ? parseInt(req.body.subtopicId) : 1, // Default to 1 if null
        questionText: req.body.questionText,
        optionA: req.body.optionA,
        optionB: req.body.optionB,
        optionC: req.body.optionC,
        optionD: req.body.optionD,
        correctAnswer: req.body.correctAnswer,
        explanation: req.body.explanation,
        imageUrl: imageUrl
      };
      
      console.log('Processed question data:', questionData);
      
      const question = await storage.updateQuestion(id, questionData);
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete('/api/admin/questions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteQuestion(id);
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const userId = req.params.id;
      const { role } = req.body;
      await storage.updateUserRole(userId, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/admin/users/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const userId = req.params.id;
      const { status } = req.body;
      await storage.updateUserStatus(userId, status);
      res.json({ message: "User status updated successfully" });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post('/api/admin/questions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Bulk import routes
  app.post('/api/admin/subtopics/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { categoryId, subtopics } = req.body;
      
      if (!categoryId || !Array.isArray(subtopics)) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const result = await storage.bulkCreateSubtopics(subtopics);
      res.json(result);
    } catch (error) {
      console.error("Error bulk creating subtopics:", error);
      res.status(500).json({ message: "Failed to bulk create subtopics" });
    }
  });

  app.post('/api/admin/questions/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { subtopicId, questions } = req.body;
      
      if (!subtopicId || !Array.isArray(questions)) {
        return res.status(400).json({ message: "subtopicId and questions array are required" });
      }
      
      const result = await storage.bulkCreateQuestions(
        parseInt(subtopicId), 
        questions
      );
      res.json(result);
    } catch (error) {
      console.error("Error bulk creating questions:", error);
      res.status(500).json({ message: "Failed to bulk create questions" });
    }
  });

  app.post('/api/admin/review-materials/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { subtopicId, reviewMaterials } = req.body;
      
      if (!subtopicId || !Array.isArray(reviewMaterials)) {
        return res.status(400).json({ message: "subtopicId and reviewMaterials array are required" });
      }
      
      // Find all categories that contain this subtopic
      const categorySubtopicRelations = await db.select()
        .from(categorySubtopics)
        .where(eq(categorySubtopics.subtopicId, parseInt(subtopicId)));
      
      if (categorySubtopicRelations.length === 0) {
        return res.status(400).json({ message: "No categories found for this subtopic" });
      }
      
      const createdMaterials = [];
      
      // Create review materials for each category that contains this subtopic
      for (const relation of categorySubtopicRelations) {
        for (const material of reviewMaterials) {
          const materialData = {
            ...material,
            categoryId: relation.categoryId,
            subtopicId: parseInt(subtopicId)
          };
          
          const [newMaterial] = await db.insert(infographics)
            .values(materialData)
            .returning();
          
          createdMaterials.push(newMaterial);
        }
      }
      
      res.json({ 
        message: `Created ${createdMaterials.length} review materials across ${categorySubtopicRelations.length} categories`,
        materials: createdMaterials,
        categoriesCount: categorySubtopicRelations.length,
        materialsPerCategory: reviewMaterials.length
      });
    } catch (error) {
      console.error("Error bulk creating review materials:", error);
      res.status(500).json({ message: "Failed to bulk create review materials" });
    }
  });

  // Battle mode routes
  // Enhanced Battle Room Routes for Multiplayer (2-10 players)
  app.post('/api/battle/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const hostUserId = req.user.id;
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { gameMode, categoryId, questionCount, maxPlayers } = req.body;
      
      const roomData = {
        roomCode,
        hostUserId,
        gameMode: gameMode || 'classic',
        categoryId: categoryId || 26,
        questionCount: questionCount || 20,
        maxPlayers: Math.min(Math.max(maxPlayers || 4, 2), 10) // Ensure 2-10 range
      };
      
      const room = await storage.createBattleRoom(roomData);
      res.json(room);
    } catch (error) {
      console.error("Error creating battle room:", error);
      res.status(500).json({ message: "Failed to create battle room" });
    }
  });

  app.get('/api/battle/rooms/:roomCode', isAuthenticated, async (req, res) => {
    try {
      const roomCode = req.params.roomCode.toUpperCase();
      const room = await storage.getBattleRoom(roomCode);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching battle room:", error);
      res.status(500).json({ message: "Failed to fetch battle room" });
    }
  });

  app.post('/api/battle/rooms/:roomCode/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { userName } = req.body;
      const roomCode = req.params.roomCode.toUpperCase();
      const room = await storage.getBattleRoom(roomCode);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      if (room.isLocked || room.status === "active") {
        return res.status(400).json({ message: "Room is locked or already started" });
      }
      
      // Check actual participant count instead of currentPlayers field
      const participants = await storage.getBattleParticipants(room.id);
      const activeParticipants = participants; // getBattleParticipants already filters for active participants
      
      // Check if user is already in the room
      const existingParticipant = participants.find(p => p.userId === userId);
      if (!existingParticipant && activeParticipants.length >= room.maxPlayers) {
        console.log(`REST API Join Rejected - Room full: ${activeParticipants.length}/${room.maxPlayers} for user ${userId}`);
        return res.status(400).json({ message: "Room is full" });
      }
      
      // Get user info to pass user name and profile image
      const user = await storage.getUser(userId.toString());
      await storage.joinBattleRoom(
        room.id, 
        userId, 
        userName || user?.firstName || `Player ${userId}`,
        user?.profileImageUrl || undefined
      );
      
      // Get updated room info
      const updatedRoom = await storage.getBattleRoom(roomCode);
      
      res.json({ 
        message: "Joined room successfully",
        room: {
          roomCode,
          id: room.id,
          gameMode: room.gameMode,
          categoryId: room.categoryId,
          questionCount: room.questionCount,
          maxPlayers: room.maxPlayers,
          currentPlayers: updatedRoom.currentPlayers
        }
      });
    } catch (error) {
      console.error("Error joining battle room:", error);
      res.status(500).json({ message: "Failed to join battle room" });
    }
  });

  // Get battle room participants
  app.get('/api/battle/rooms/:roomCode/participants', isAuthenticated, async (req, res) => {
    try {
      const roomCode = req.params.roomCode.toUpperCase();
      const room = await storage.getBattleRoom(roomCode);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      const participants = await storage.getBattleParticipants(room.id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Leave battle room
  app.post('/api/battle/rooms/:roomCode/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomCode = req.params.roomCode.toUpperCase();
      const room = await storage.getBattleRoom(roomCode);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      await storage.leaveBattleRoom(room.id, userId);
      res.json({ message: "Left room successfully" });
    } catch (error) {
      console.error("Error leaving battle room:", error);
      res.status(500).json({ message: "Failed to leave battle room" });
    }
  });

  // Get active battle rooms for quick match
  app.get('/api/battle/rooms/active', isAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getActiveBattleRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching active rooms:", error);
      res.status(500).json({ message: "Failed to fetch active rooms" });
    }
  });

  // Get user battle statistics
  app.get('/api/battle/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getBattleStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching battle stats:", error);
      res.status(500).json({ message: "Failed to fetch battle stats" });
    }
  });

  // Get user's battle history with recent matches
  app.get('/api/battle/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await storage.getUserBattleHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching battle history:", error);
      res.status(500).json({ message: "Failed to fetch battle history" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for Battle Mode
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Battle game state management
  const battleSessions = new Map<string, BattleSession>();
  
  interface BattleSession {
    roomCode: string;
    roomId: number;
    players: Map<string, BattlePlayer>;
    questions: any[];
    currentQuestionIndex: number;
    status: 'lobby' | 'waiting' | 'active' | 'finished' | 'starting';
    startTime: Date | null;
    gameMode: string;
    categoryId: number;
    questionCount: number;
    maxPlayers: number;
    powerUpsEnabled: boolean;
    questionTimer: NodeJS.Timeout | null;
  }
  
  interface BattlePlayer {
    userId: number;
    userName: string;
    profileImageUrl?: string;
    ws: WebSocket;
    score: number;
    correctAnswers: number;
    totalAnswered: number;
    currentAnswer: string | null;
    powerUps: string[];
    effects: string[];
    rank: number;
    isReady: boolean;
    isHost: boolean;
    isActive: boolean;
    correctStreak: number;
    consecutiveFasterAnswers: number;
    lastAnswerTime: number;
    answerTimes: number[];
    powerUpsUsedCount: number;
  }
  
  wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleBattleMessage(ws, message);
      } catch (error) {
        console.error('Error handling battle message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      // Remove player from all battle sessions
      battleSessions.forEach((session, roomCode) => {
        session.players.forEach((player, userId) => {
          if (player.ws === ws) {
            session.players.delete(userId);
            broadcastToRoom(roomCode, {
              type: 'player_left',
              userId,
              playerCount: session.players.size
            });
            
            // Clean up empty sessions
            if (session.players.size === 0) {
              battleSessions.delete(roomCode);
            }
          }
        });
      });
    });
  });
  
  async function handleBattleMessage(ws: WebSocket, message: any) {
    const { type, data } = message;
    
    switch (type) {
      case 'ping':
        // Handle keepalive ping - respond with pong
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'join_battle':
        await handleJoinBattle(ws, data);
        break;
      case 'start_game':
        await handleStartGame(data.roomCode);
        break;
      case 'submit_answer':
        await handleSubmitAnswer(ws, data);
        break;
      case 'use_powerup':
        await handleUsePowerUp(ws, data);
        break;
      case 'power_up_used':
        await handleUsePowerUp(ws, { 
          userId: data.userId, 
          powerUpType: data.powerUpId, 
          roomCode: data.roomCode 
        });
        break;
      case 'player_ready':
        await handlePlayerReady(ws, data);
        break;
      case 'select_powerup_reward':
        await handleSelectPowerUpReward(ws, data);
        break;
      case 'leave_battle':
        await handleLeaveBattle(ws, data);
        break;
      case 'concede_match':
        await handleConcedeMatch(ws, data);
        break;
      default:
        console.log('Unknown message type received:', type, data);
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }
  
  async function handleJoinBattle(ws: WebSocket, data: any) {
    const { roomCode, userId, userName, profileImageUrl } = data;
    
    try {
      const room = await storage.getBattleRoom(roomCode);
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }
      
      // Check room capacity and status by counting actual participants
      const participants = await storage.getBattleParticipants(room.id);
      const activeParticipants = participants; // getBattleParticipants already filters for active participants
      const existingParticipant = participants.find(p => p.userId === userId);
      
      console.log(`WebSocket Join Debug - Room: ${roomCode}, User: ${userId}, MaxPlayers: ${room.maxPlayers}, ActiveParticipants: ${activeParticipants.length}, ExistingParticipant: ${!!existingParticipant}`);
      console.log(`Participants:`, participants.map(p => ({ userId: p.userId, isActive: p.isActive })));
      
      // Only check capacity if user is NOT already a participant
      if (!existingParticipant) {
        if (activeParticipants.length >= room.maxPlayers) {
          console.log(`WebSocket Join Rejected - Room full: ${activeParticipants.length}/${room.maxPlayers} (new user)`);
          ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
          return;
        }
      } else {
        console.log(`WebSocket Join Allowed - User ${userId} is existing participant reconnecting`);
      }
      
      if (room.isLocked || room.status === 'active') {
        ws.send(JSON.stringify({ type: 'error', message: 'Room is locked or already started' }));
        return;
      }
      
      if (!battleSessions.has(roomCode)) {
        // Load questions for this room
        const questions = await storage.getRandomQuestions(room.categoryId || 1, room.questionCount || 20);
        
        // Set questions in database for persistence
        const questionIds = questions.map(q => q.id);
        await storage.setBattleQuestions(room.id, questionIds);
        
        battleSessions.set(roomCode, {
          roomCode,
          roomId: room.id,
          players: new Map(),
          questions,
          currentQuestionIndex: 0,
          status: 'lobby',
          startTime: null,
          gameMode: room.gameMode,
          categoryId: room.categoryId || 1,
          questionCount: room.questionCount || 20,
          maxPlayers: room.maxPlayers || 4,
          powerUpsEnabled: room.gameMode !== 'classic',
          questionTimer: null
        });
      }
      
      const session = battleSessions.get(roomCode)!;
      
      // Use the participant data we already fetched above
      const isHost = existingParticipant?.isHost || userId === room.hostUserId;
      
      // Add player to session
      session.players.set(userId.toString(), {
        userId,
        userName: userName || existingParticipant?.userName || `Player ${userId}`,
        profileImageUrl: profileImageUrl || existingParticipant?.profileImageUrl,
        ws,
        score: existingParticipant?.score || 0,
        correctAnswers: existingParticipant?.correctAnswers || 0,
        totalAnswered: existingParticipant?.totalAnswered || 0,
        currentAnswer: null,
        powerUps: [], // Start with no power-ups - they must be earned through performance
        effects: [],
        rank: existingParticipant?.rank || 0,
        isReady: existingParticipant?.isReady || false,
        isHost,
        isActive: true,
        correctStreak: 0,
        consecutiveFasterAnswers: 0,
        lastAnswerTime: 0,
        answerTimes: [],
        powerUpsUsedCount: 0
      });
      
      // Update session status to waiting when players join
      if (session.status === 'lobby' && session.players.size > 0) {
        session.status = 'waiting';
      }
      
      // Send room state to new player
      ws.send(JSON.stringify({
        type: 'joined_battle',
        roomCode,
        roomId: session.roomId,
        players: Array.from(session.players.values()).map(p => ({
          userId: p.userId,
          userName: p.userName,
          profileImageUrl: p.profileImageUrl,
          score: p.score,
          rank: p.rank,
          isReady: p.isReady,
          isHost: p.isHost,
          correctAnswers: p.correctAnswers,
          totalAnswered: p.totalAnswered
        })),
        gameMode: session.gameMode,
        questionCount: session.questionCount,
        maxPlayers: session.maxPlayers,
        currentPlayers: session.players.size,
        powerUpsEnabled: session.powerUpsEnabled,
        status: session.status,
        isHost
      }));
      
      // Record join event
      await storage.recordBattleEvent(room.id, userId, 'join', {
        userName,
        timestamp: new Date().toISOString()
      });
      
      // Notify other players
      broadcastToRoom(roomCode, {
        type: 'player_joined',
        player: {
          userId,
          userName,
          profileImageUrl,
          isHost,
          correctAnswers: 0,
          totalAnswered: 0,
          score: 0,
          rank: 0,
          isReady: false
        },
        playerCount: session.players.size
      }, userId);
      
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to join battle' }));
    }
  }
  
  async function handlePlayerReady(ws: WebSocket, data: any) {
    const { roomCode, userId } = data;
    const session = battleSessions.get(roomCode);
    
    console.log(`Player Ready Request - Room: ${roomCode}, User: ${userId}, Session exists: ${!!session}`);
    
    if (!session || !session.players.has(userId)) {
      console.log(`Player Ready Error - Room: ${roomCode}, User: ${userId} not found in session`);
      ws.send(JSON.stringify({ type: 'error', message: 'Player not in room' }));
      return;
    }
    
    const player = session.players.get(userId)!;
    player.isReady = true;
    
    console.log(`Player ${userId} marked as ready in room ${roomCode}`);
    
    const readyPlayers = Array.from(session.players.values()).filter(p => p.isReady);
    const totalPlayers = session.players.size;
    
    console.log(`Player Ready Debug - Room: ${roomCode}, Ready: ${readyPlayers.length}/${totalPlayers}, Status: ${session.status}`);
    
    // Broadcast updated ready status to all players
    broadcastToRoom(roomCode, {
      type: 'player_ready',
      userId,
      readyCount: readyPlayers.length,
      totalPlayers: totalPlayers
    });
    
    // Auto-start when all players are ready (minimum 2 players)
    if (readyPlayers.length >= 2 && readyPlayers.length === totalPlayers && (session.status === 'waiting' || session.status === 'lobby')) {
      console.log(`All players ready! Starting game in 3 seconds - Room: ${roomCode}`);
      session.status = 'starting'; // Prevent duplicate starts
      
      setTimeout(() => {
        console.log(`HandleStartGame called - Room: ${roomCode}`);
        handleStartGame(roomCode);
      }, 3000);
    }
  }
  
  async function handleStartGame(roomCode: string) {
    const session = battleSessions.get(roomCode);
    console.log(`HandleStartGame called - Room: ${roomCode}, Status: ${session?.status}, HasSession: ${!!session}`);
    if (!session) {
      console.log(`HandleStartGame aborted - No session found`);
      return;
    }
    
    // Allow game to start if status is 'starting' (from player ready) or normal waiting states
    if (session.status !== 'waiting' && session.status !== 'lobby' && session.status !== 'starting') {
      console.log(`HandleStartGame aborted - Invalid status: ${session.status}`);
      return;
    }
    
    session.status = 'active';
    session.startTime = new Date();
    session.currentQuestionIndex = 0;
    
    console.log(`Broadcasting game_started for room: ${roomCode}`);
    broadcastToRoom(roomCode, {
      type: 'game_started',
      question: session.questions[0],
      questionNumber: 1,
      totalQuestions: session.questionCount || session.questions.length,
      timeLimit: 30000 // 30 seconds per question
    });
    
    // Clear any existing timer first
    if (session.questionTimer) {
      clearTimeout(session.questionTimer);
    }
    
    // Start question timer
    session.questionTimer = setTimeout(() => handleQuestionTimeout(roomCode), 30000);
  }
  
  async function handleSubmitAnswer(ws: WebSocket, data: any) {
    const { roomCode, userId, answer, timeSpent } = data;
    const session = battleSessions.get(roomCode);
    
    if (!session || !session.players.has(userId) || session.status !== 'active') {
      return;
    }
    
    const player = session.players.get(userId)!;
    if (player.currentAnswer) return; // Already answered
    
    player.currentAnswer = answer;
    player.lastAnswerTime = timeSpent;
    const question = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === question.correctAnswer;
    
    // Performance tracking for power-up rewards
    if (isCorrect) {
      let points = 100;
      
      // Speed bonus
      if (timeSpent < 10000) points += 50; // Under 10 seconds
      else if (timeSpent < 20000) points += 25; // Under 20 seconds
      
      // Apply speed boost power-up effect
      if (player.effects.includes('speed_boost') && timeSpent < 3000) {
        points *= 2;
      }
      
      player.score += points;
      
      // Track performance for power-up rewards
      player.correctStreak += 1;
      
      // Check for streak-based power-up reward (3 correct answers)
      if (player.correctStreak >= 3) {
        offerPowerUpReward(ws, player, 'streak');
        player.correctStreak = 0; // Reset after reward
      }
      
      // Check for speed-based power-up reward (faster than other players)
      checkSpeedBasedReward(session, player, timeSpent);
      
    } else {
      // Reset streaks on incorrect answer
      player.correctStreak = 0;
      player.consecutiveFasterAnswers = 0;
    }
    
    // Send confirmation to player
    ws.send(JSON.stringify({
      type: 'answer_submitted',
      isCorrect,
      points: isCorrect ? player.score : 0,
      correctAnswer: question.correctAnswer
    }));
    
    // Send real-time rankings to all players immediately after each answer
    broadcastToRoom(roomCode, {
      type: 'live_rankings',
      scores: Array.from(session.players.values()).map(p => ({
        userId: p.userId,
        userName: p.userName,
        score: p.score,
        hasAnswered: p.currentAnswer !== null
      }))
    });
    
    // Check if all players have answered
    const allAnswered = Array.from(session.players.values()).every(p => p.currentAnswer !== null);
    if (allAnswered) {
      // Clear existing timer since all players answered
      if (session.questionTimer) {
        clearTimeout(session.questionTimer);
        session.questionTimer = null;
      }
      
      // Send question results to all players to trigger rankings page
      broadcastToRoom(roomCode, {
        type: 'question_results',
        scores: Array.from(session.players.values()).map(p => ({
          userId: p.userId,
          userName: p.userName,
          score: p.score
        }))
      });
      
      // Then advance to next question after delay for rankings display
      setTimeout(() => handleNextQuestion(roomCode), 5000); // 5 second delay for rankings display
    }
  }

  function checkSpeedBasedReward(session: BattleSession, player: BattlePlayer, timeSpent: number) {
    // Get other players' answer times for this question
    const otherPlayers = Array.from(session.players.values()).filter(p => 
      p.userId !== player.userId && p.currentAnswer !== null
    );
    
    if (otherPlayers.length === 0) return;
    
    // Check if player was faster than at least one other player
    const wasFaster = otherPlayers.some(p => timeSpent < p.lastAnswerTime);
    
    if (wasFaster) {
      player.consecutiveFasterAnswers += 1;
      
      // Award power-up for 2-3 consecutive faster answers
      if (player.consecutiveFasterAnswers >= 2 && player.consecutiveFasterAnswers <= 3) {
        offerPowerUpReward(player.ws, player, 'speed');
        player.consecutiveFasterAnswers = 0; // Reset after reward
      }
    } else {
      player.consecutiveFasterAnswers = 0; // Reset if not faster
    }
  }

  function offerPowerUpReward(ws: WebSocket, player: BattlePlayer, reason: 'streak' | 'speed') {
    // Expanded power-up list with all 10 available options
    const allPowerUps = ['fifty_fifty', 'time_freeze', 'speed_boost', 'shield', 'extra_time', 'score_multiplier', 'hint', 'streak_protector', 'second_chance', 'sabotage'];
    const availableRewards = allPowerUps.filter(
      powerUp => !player.powerUps.includes(powerUp)
    );
    
    if (availableRewards.length === 0) return;
    
    // Offer 5 random power-ups to choose from (increased from 3)
    const shuffled = availableRewards.sort(() => Math.random() - 0.5);
    const rewardOptions = shuffled.slice(0, Math.min(5, shuffled.length));
    
    ws.send(JSON.stringify({
      type: 'powerup_reward_offered',
      reason,
      options: rewardOptions,
      message: reason === 'streak' 
        ? "🔥 3 correct answers in a row! Choose a power-up!"
        : "⚡ Faster than your opponent! Choose a power-up!"
    }));
  }
  
  async function handleQuestionTimeout(roomCode: string) {
    const session = battleSessions.get(roomCode);
    if (!session || session.status !== 'active') return;
    
    // Clear the timer since we're handling timeout
    session.questionTimer = null;
    
    // Send question results to all players to trigger rankings page (timeout case)
    broadcastToRoom(roomCode, {
      type: 'question_results',
      scores: Array.from(session.players.values()).map(p => ({
        userId: p.userId,
        userName: p.userName,
        score: p.score
      }))
    });
    
    // Then advance to next question after delay for rankings display
    setTimeout(() => handleNextQuestion(roomCode), 5000); // Same 5 second delay as all-answered case
  }
  
  async function handleNextQuestion(roomCode: string) {
    const session = battleSessions.get(roomCode);
    if (!session) return;
    
    // Clear any existing timer first to prevent race conditions
    if (session.questionTimer) {
      clearTimeout(session.questionTimer);
      session.questionTimer = null;
    }
    
    // Clear current answers and effects
    session.players.forEach((player) => {
      player.currentAnswer = null;
      player.effects = player.effects.filter((effect: string) => effect !== 'speed_boost');
    });
    
    session.currentQuestionIndex++;
    
    if (session.currentQuestionIndex >= session.questions.length) {
      // Game finished
      await handleGameFinished(roomCode);
      return;
    }
    
    // Send next question (without scores - they were sent in question_results)
    broadcastToRoom(roomCode, {
      type: 'next_question',
      question: session.questions[session.currentQuestionIndex],
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      timeLimit: 30000
    });
    
    // Start next question timer
    session.questionTimer = setTimeout(() => handleQuestionTimeout(roomCode), 30000);
  }
  
  async function handleGameFinished(roomCode: string) {
    const session = battleSessions.get(roomCode);
    if (!session) return;
    
    session.status = 'finished';
    
    // Calculate rankings
    const players = Array.from(session.players.values())
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));

    try {
      // Update battle room status to finished in database
      await storage.updateBattleRoomStatus(session.roomId, 'finished');
      
      // Update all participant scores, ranks, and power-ups used in database
      for (const player of players) {
        await storage.updateParticipantScore(session.roomId, player.userId, player.score, player.correctAnswers);
        
        // Update participant rank and power-ups used
        await db.update(battleParticipants)
          .set({ 
            rank: player.rank,
            powerUpsUsed: player.powerUpsUsedCount || 0,
            totalAnswered: player.totalAnswered
          })
          .where(and(eq(battleParticipants.roomId, session.roomId), eq(battleParticipants.userId, player.userId)));

        // Update analytics for battle completion
        await storage.updateAnalyticsOnActivity(player.userId, 'battle', {
          questionsAnswered: player.totalAnswered,
          correctAnswers: player.correctAnswers,
          score: player.score,
          timeSpent: 30 * session.questions.length, // Approximate time spent (30s per question)
          isWin: player.rank === 1,
          rank: player.rank
        });
      }
      
      console.log(`Battle room ${roomCode} finished - results saved to database`);
    } catch (error) {
      console.error('Error saving battle results:', error);
    }
    
    broadcastToRoom(roomCode, {
      type: 'game_finished',
      results: players.map(p => ({
        userId: p.userId,
        userName: p.userName,
        score: p.score,
        rank: p.rank
      }))
    });
    
    // Clean up session after 5 minutes
    setTimeout(() => {
      battleSessions.delete(roomCode);
    }, 300000);
  }
  
  async function handleUsePowerUp(ws: WebSocket, data: any) {
    const { roomCode, userId, powerUpType, targetUserId } = data;
    const session = battleSessions.get(roomCode);
    
    if (!session || !session.players.has(userId)) return;
    
    const player = session.players.get(userId)!;
    if (!player.powerUps.includes(powerUpType)) return;
    
    // Remove power-up from player and increment usage counter
    player.powerUps = player.powerUps.filter(p => p !== powerUpType);
    player.powerUpsUsedCount = (player.powerUpsUsedCount || 0) + 1;
    
    switch (powerUpType) {
      case 'fifty_fifty':
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'fifty_fifty_hint',
          question: session.questions[session.currentQuestionIndex]
        }));
        break;
        
      case 'time_freeze':
        player.effects.push('time_freeze');
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'time_freeze',
          duration: 5000
        }));
        break;
        
      case 'speed_boost':
        player.effects.push('speed_boost');
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'speed_boost',
          duration: 30000
        }));
        break;
        
      case 'sabotage':
        if (targetUserId && session.players.has(targetUserId)) {
          const target = session.players.get(targetUserId)!;
          if (!target.effects.includes('shield')) {
            target.ws.send(JSON.stringify({
              type: 'powerup_received',
              powerUpType: 'sabotage',
              effect: 'screen_shake',
              duration: 3000
            }));
          }
        }
        break;
        
      case 'shield':
        player.effects.push('shield');
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'shield',
          duration: 10000
        }));
        break;
        
      case 'extra_time':
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'extra_time',
          timeAdded: 10000
        }));
        break;
        
      case 'score_multiplier':
        player.effects.push('score_multiplier');
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'score_multiplier',
          duration: 15000
        }));
        break;
        
      case 'hint':
        const currentQuestion = session.questions[session.currentQuestionIndex];
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'hint',
          hint: `The correct answer starts with: ${currentQuestion.correctAnswer === 'A' ? currentQuestion.optionA[0] : currentQuestion.correctAnswer === 'B' ? currentQuestion.optionB[0] : currentQuestion.correctAnswer === 'C' ? currentQuestion.optionC[0] : currentQuestion.optionD[0]}`
        }));
        break;
        
      case 'streak_protector':
        player.effects.push('streak_protector');
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'streak_protector',
          duration: 30000
        }));
        break;
        
      case 'second_chance':
        player.effects.push('second_chance');
        ws.send(JSON.stringify({
          type: 'powerup_activated',
          powerUpType,
          effect: 'second_chance',
          duration: 30000
        }));
        break;
    }
    
    // Notify room about power-up usage with activator information
    broadcastToRoom(roomCode, {
      type: 'powerup_used',
      userId,
      powerUpType,
      activatorId: userId,
      activatorName: player.userName
    });
  }

  async function handleSelectPowerUpReward(ws: WebSocket, data: any) {
    const { roomCode, userId, selectedPowerUp } = data;
    const session = battleSessions.get(roomCode);
    
    if (!session || !session.players.has(userId)) return;
    
    const player = session.players.get(userId)!;
    
    // Add selected power-up to player's arsenal
    if (!player.powerUps.includes(selectedPowerUp)) {
      player.powerUps.push(selectedPowerUp);
      
      ws.send(JSON.stringify({
        type: 'powerup_reward_selected',
        powerUp: selectedPowerUp,
        message: "Power-up added to your arsenal!"
      }));
    }
  }

  async function handleLeaveBattle(ws: WebSocket, data: any) {
    const { userId, roomCode } = data;
    const session = battleSessions.get(roomCode);
    
    if (!session || !session.players.has(userId)) {
      return;
    }
    
    const player = session.players.get(userId)!;
    const playerName = player.userName;
    
    // Remove player from session
    session.players.delete(userId);
    
    const remainingPlayers = session.players.size;
    
    if (session.status === 'active') {
      if (remainingPlayers === 1) {
        // Two-player game: Award victory to remaining player
        const winner = Array.from(session.players.values())[0];
        broadcastToRoom(roomCode, {
          type: 'opponent_conceded',
          winnerUserId: winner.userId,
          winnerName: winner.userName,
          winnerScore: winner.score,
          concedePlayerName: playerName,
          message: `${playerName} conceded the match. You win!`
        });
        
        // End game after showing victory
        setTimeout(() => {
          broadcastToRoom(roomCode, {
            type: 'game_finished',
            reason: 'opponent_conceded',
            results: [{
              userId: winner.userId,
              userName: winner.userName,
              score: winner.score,
              rank: 1
            }]
          });
          battleSessions.delete(roomCode);
        }, 3000);
      } else if (remainingPlayers > 1) {
        // Multi-player game: Continue with notification
        broadcastToRoom(roomCode, {
          type: 'player_left_notification',
          playerName,
          remainingPlayers,
          message: `${playerName} left the battle. Game continues with ${remainingPlayers} players.`
        });
      } else {
        // No players left
        battleSessions.delete(roomCode);
      }
    } else {
      // Game not active, just notify
      broadcastToRoom(roomCode, {
        type: 'player_left',
        userId,
        playerName,
        remainingPlayers,
        playerCount: remainingPlayers
      });
      
      if (remainingPlayers === 0) {
        battleSessions.delete(roomCode);
      }
    }
  }

  async function handleConcedeMatch(ws: WebSocket, data: any) {
    const { userId, roomCode } = data;
    const session = battleSessions.get(roomCode);
    
    if (!session || !session.players.has(userId)) {
      return;
    }
    
    const player = session.players.get(userId)!;
    const playerName = player.userName;
    
    // Remove player from session
    session.players.delete(userId);
    
    const remainingPlayers = session.players.size;
    
    if (session.status === 'active') {
      if (remainingPlayers === 1) {
        // Two-player game: Award victory to remaining player
        const winner = Array.from(session.players.values())[0];
        broadcastToRoom(roomCode, {
          type: 'opponent_conceded',
          winnerUserId: winner.userId,
          winnerName: winner.userName,
          winnerScore: winner.score,
          concedePlayerName: playerName,
          message: `${playerName} conceded the match. You win!`
        });
        
        // End game after showing victory
        setTimeout(() => {
          broadcastToRoom(roomCode, {
            type: 'game_finished',
            reason: 'opponent_conceded',
            results: [{
              userId: winner.userId,
              userName: winner.userName,
              score: winner.score,
              rank: 1
            }]
          });
          battleSessions.delete(roomCode);
        }, 3000);
      } else if (remainingPlayers > 1) {
        // Multi-player game: Continue with notification
        broadcastToRoom(roomCode, {
          type: 'player_left_notification',
          playerName,
          remainingPlayers,
          message: `${playerName} left the battle. Game continues with ${remainingPlayers} players.`
        });
      } else {
        // No players left
        battleSessions.delete(roomCode);
      }
    } else {
      // Game not active, just clean up
      battleSessions.delete(roomCode);
    }
  }
  
  function broadcastToRoom(roomCode: string, message: any, excludeUserId?: string) {
    const session = battleSessions.get(roomCode);
    if (!session) return;
    
    const messageStr = JSON.stringify(message);
    session.players.forEach((player, userId) => {
      if (userId !== excludeUserId && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(messageStr);
      }
    });
  }

  // Session tracking API routes for analytics
  app.post('/api/sessions/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { sessionId, activityType, deviceInfo } = req.body;
      
      const session = await storage.createUserSession({
        userId,
        sessionId,
        activityType: activityType || 'general',
        deviceInfo,
        isActive: true
      });
      
      res.json({ sessionId: session.sessionId, message: 'Session started' });
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({ message: "Failed to start session" });
    }
  });

  app.put('/api/sessions/:sessionId/activity', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { activityType, pageViews } = req.body;
      
      await storage.updateUserSession(sessionId, {
        activityType,
        pageViews: pageViews || 1
      });
      
      res.json({ message: 'Session updated' });
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.post('/api/sessions/:sessionId/end', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      await storage.endUserSession(sessionId);
      
      res.json({ message: 'Session ended' });
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  app.get('/api/sessions/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days as string) || 30;
      
      const dailyStats = await storage.getUserDailyScreenTime(userId, days);
      const recentSessions = await storage.getUserSessions(userId, 10);
      
      res.json({
        dailyScreenTime: dailyStats,
        recentSessions,
        totalDays: days
      });
    } catch (error) {
      console.error("Error fetching session analytics:", error);
      res.status(500).json({ message: "Failed to fetch session analytics" });
    }
  });

  app.get('/api/admin/user-analytics/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const days = parseInt(req.query.days as string) || 30;
      
      const dailyStats = await storage.getUserDailyScreenTime(userId, days);
      const recentSessions = await storage.getUserSessions(userId, 20);
      
      // Calculate totals
      const totalTime = dailyStats.reduce((sum, day) => sum + day.totalTime, 0);
      const totalSessions = dailyStats.reduce((sum, day) => sum + day.sessionCount, 0);
      const averageSessionTime = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;
      const activeDays = dailyStats.filter(day => day.totalTime > 0).length;
      
      res.json({
        dailyScreenTime: dailyStats,
        recentSessions,
        summary: {
          totalTime,
          totalSessions,
          averageSessionTime,
          activeDays,
          totalDays: days
        }
      });
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  // Object Storage API routes for multimedia content
  // Get upload URL for object entity
  app.post('/api/objects/upload', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ message: 'Failed to get upload URL' });
    }
  });

  // Serve public objects from object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve protected objects from object storage
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import('./objectStorage');
      const { ObjectPermission } = await import('./objectAcl');
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: req.user.id.toString(),
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof Error && error.name === 'ObjectNotFoundError') {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Update practical content with multimedia support
  app.put('/api/admin/practical-content-multimedia/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const contentData = req.body;

      // Handle multimedia URL normalization if needed
      if (contentData.content && typeof contentData.content === 'object') {
        const { ObjectStorageService } = await import('./objectStorage');
        const objectStorageService = new ObjectStorageService();

        if (contentData.content.imageUrl && contentData.content.imageUrl.startsWith('https://storage.googleapis.com/')) {
          const normalizedPath = objectStorageService.normalizeObjectEntityPath(contentData.content.imageUrl);
          
          // Set ACL policy for the uploaded image
          await objectStorageService.trySetObjectEntityAclPolicy(contentData.content.imageUrl, {
            owner: req.user.id.toString(),
            visibility: "public", // Make content images public for easy access
          });
          
          contentData.content.imageUrl = normalizedPath;
        }

        if (contentData.content.videoUrl && contentData.content.videoUrl.startsWith('https://storage.googleapis.com/')) {
          const normalizedPath = objectStorageService.normalizeObjectEntityPath(contentData.content.videoUrl);
          
          // Set ACL policy for the uploaded video
          await objectStorageService.trySetObjectEntityAclPolicy(contentData.content.videoUrl, {
            owner: req.user.id.toString(),
            visibility: "public", // Make content videos public for easy access
          });
          
          contentData.content.videoUrl = normalizedPath;
        }
      }

      const updatedContent = await storage.updatePracticalContent(id, contentData);
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating practical content with multimedia:', error);
      res.status(500).json({ message: 'Failed to update practical content' });
    }
  });

  return httpServer;
}

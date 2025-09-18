import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  nickname: varchar("nickname"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["basic", "premium", "admin"] }).default("basic").notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("approved").notNull(),
  subscriptionExpiry: timestamp("subscription_expiry"),
  studyStreak: integer("study_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActiveDate: timestamp("last_active_date"),
  badgesEarned: text("badges_earned").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for AMT certification
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  questionCount: integer("question_count").default(0),
  timeLimit: integer("time_limit").default(60), // in minutes
  passThreshold: decimal("pass_threshold", { precision: 5, scale: 2 }).default("70.00").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subtopics (independent of categories for reusability)
export const subtopics = pgTable("subtopics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Many-to-many relationship between categories and subtopics
export const categorySubtopics = pgTable("category_subtopics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  subtopicId: integer("subtopic_id").references(() => subtopics.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniquePair: unique("unique_category_subtopic").on(table.categoryId, table.subtopicId),
  // Performance indexes for mock exam joins
  categoryIdIdx: index("idx_category_subtopics_category_id").on(table.categoryId),
  subtopicIdIdx: index("idx_category_subtopics_subtopic_id").on(table.subtopicId),
}));

// Questions for practice and exams (linked through subtopics)
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subtopicId: integer("subtopic_id").references(() => subtopics.id).notNull(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1, enum: ["A", "B", "C", "D"] }).notNull(),
  explanation: text("explanation"),
  imageUrl: text("image_url"),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Performance indexes for mock exam queries
  subtopicIdIdx: index("idx_questions_subtopic_id").on(table.subtopicId),
  isActiveIdx: index("idx_questions_is_active").on(table.isActive),
  subtopicActiveIdx: index("idx_questions_subtopic_active").on(table.subtopicId, table.isActive),
}));

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  questionsAnswered: integer("questions_answered").default(0),
  questionsCorrect: integer("questions_correct").default(0),
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }).default("0.00"),
  lastStudied: timestamp("last_studied"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  correctAnswers: integer("correct_answers").default(0),
  totalQuestions: integer("total_questions").default(0),
  studyTimeMinutes: integer("study_time_minutes").default(0),
  totalAttempts: integer("total_attempts").default(0),
  questionsTotal: integer("questions_total").default(0),
});

// Mock exam attempts
export const examAttempts = pgTable("exam_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeTaken: integer("time_taken").notNull(),
  passed: boolean("passed").default(false),
  questionsData: jsonb("questions_data"),
  createdAt: timestamp("created_at").defaultNow(),
  timeSpent: integer("time_spent").default(0),
  questionsAnswered: integer("questions_answered").default(0),
  questionsSkipped: integer("questions_skipped").default(0),
  categoryName: varchar("category_name", { length: 255 }),
  answers: jsonb("answers").default('{}'),
});

// User badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  condition: text("condition").notNull(), // describes unlock condition
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User earned badges
export const userBadges = pgTable("user_badges", {
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.badgeId] }),
}));

// Study sessions for streak tracking
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  subtopicId: integer("subtopic_id").references(() => subtopics.id),
  sessionType: varchar("session_type", { enum: ["review", "practice", "quiz"] }).notNull(),
  duration: integer("duration"), // in seconds
  questionsAnswered: integer("questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily progress tracking for study streak
export const dailyProgress = pgTable("daily_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  quizCompleted: boolean("quiz_completed").default(false),
  reviewTimeCompleted: boolean("review_time_completed").default(false), // 3 minutes in review mode
  practiceCompleted: boolean("practice_completed").default(false), // 1 subtopic in practice mode
  isCompleted: boolean("is_completed").default(false), // all three requirements met
  quizCompletedAt: timestamp("quiz_completed_at"),
  reviewCompletedAt: timestamp("review_completed_at"),
  practiceCompletedAt: timestamp("practice_completed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.date),
}));

// Flashcards for practice mode
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  subtopicId: integer("subtopic_id").references(() => subtopics.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User bookmarked questions/flashcards
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  questionId: integer("question_id").references(() => questions.id),
  flashcardId: integer("flashcard_id").references(() => flashcards.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track user question completion for overall progress
export const userQuestionCompletion = pgTable("user_question_completion", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  firstCorrectAnswer: timestamp("first_correct_answer"),
  progressPercentage: decimal("progress_percentage", { precision: 8, scale: 6 }).notNull(),
  studyMode: varchar("study_mode", { enum: ["practice", "quiz", "exam"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userQuestionUnique: unique().on(table.userId, table.questionId),
}));

// Enhanced battle rooms for 2-10 players multiplayer
export const battleRooms = pgTable("battle_rooms", {
  id: serial("id").primaryKey(),
  roomCode: varchar("room_code", { length: 6 }).unique().notNull(),
  hostUserId: integer("host_user_id").references(() => users.id).notNull(),
  gameMode: varchar("game_mode", { enum: ["classic", "sudden_death", "team"] }).default("classic"),
  categoryId: integer("category_id").references(() => categories.id),
  questionCount: integer("question_count").default(20),
  maxPlayers: integer("max_players").default(4), // Support 2-10 players
  currentPlayers: integer("current_players").default(0),
  currentQuestion: integer("current_question").default(0),
  status: varchar("status", { enum: ["lobby", "waiting", "active", "finished", "abandoned"] }).default("lobby"),
  isLocked: boolean("is_locked").default(false),
  gameStartedAt: timestamp("game_started_at"),
  gameFinishedAt: timestamp("game_finished_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced battle participants for multiplayer tracking
export const battleParticipants = pgTable("battle_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => battleRooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id).notNull(),
  userName: varchar("user_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url"),
  score: integer("score").default(0),
  rank: integer("rank").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalAnswered: integer("total_answered").default(0),
  powerUpsUsed: integer("power_ups_used").default(0),
  fastestAnswer: integer("fastest_answer"), // in milliseconds
  averageAnswerTime: integer("average_answer_time"),
  isReady: boolean("is_ready").default(false),
  isActive: boolean("is_active").default(true), // false if player left/conceded
  isHost: boolean("is_host").default(false),
  leftAt: timestamp("left_at"), // when player left the game
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Battle questions - tracks which questions are used in each room
export const battleQuestions = pgTable("battle_questions", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => battleRooms.id, { onDelete: "cascade" }),
  questionId: integer("question_id").references(() => questions.id),
  questionOrder: integer("question_order"),
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Battle answers - enhanced tracking for multiplayer scoring
export const battleAnswers = pgTable("battle_answers", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => battleRooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  questionId: integer("question_id").references(() => questions.id),
  questionOrder: integer("question_order"),
  selectedAnswer: varchar("selected_answer", { length: 1 }),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"), // in milliseconds
  pointsEarned: integer("points_earned").default(0),
  powerUpUsed: varchar("power_up_used"), // power-up used for this question
  streak: integer("streak").default(0), // correct answer streak at time of answer
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Battle events - track game events for real-time updates and chat
export const battleEvents = pgTable("battle_events", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => battleRooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  eventType: varchar("event_type", { length: 50 }), // join, leave, answer, powerup, chat, emoji
  eventData: jsonb("event_data"), // flexible data storage
  createdAt: timestamp("created_at").defaultNow(),
});

// Infographics for review mode
export const infographics = pgTable("infographics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  subtopicId: integer("subtopic_id").references(() => subtopics.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  content: jsonb("content"), // structured content data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Practical stations for AMT certification
export const practicalStations = pgTable("practical_stations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  category: varchar("category", { enum: ["Airframe", "Powerplant", "General"] }).notNull(),
  description: text("description"),
  estimatedTime: varchar("estimated_time", { length: 50 }),
  difficulty: varchar("difficulty", { enum: ["Beginner", "Intermediate", "Advanced"] }).default("Intermediate"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rich content sections for practical stations
export const practicalContent = pgTable("practical_content", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").references(() => practicalStations.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  contentType: varchar("content_type", { enum: ["text", "image", "video", "table", "list", "code"] }).notNull(),
  content: jsonb("content"), // Rich content with formatting
  htmlContent: text("html_content"), // Raw HTML for complex formatting
  orderIndex: integer("order_index").default(0).notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  stationOrderIdx: index("idx_practical_content_station_order").on(table.stationId, table.orderIndex),
}));

// User progress tracking per subtopic
export const userSubtopicProgress = pgTable("user_subtopic_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subtopicId: integer("subtopic_id").references(() => subtopics.id).notNull(),
  hasViewedReview: boolean("has_viewed_review").default(false),
  practiceQuestionsCompleted: integer("practice_questions_completed").default(0),
  quizCompleted: boolean("quiz_completed").default(false),
  includedInMockExamCompletion: boolean("included_in_mock_exam_completion").default(false),
  bestScore: decimal("best_score", { precision: 5, scale: 2 }).default("0.00"),
  totalAttempts: integer("total_attempts").default(0),
  lastActivityAt: timestamp("last_activity_at"),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.subtopicId),
]);

// User analytics and performance overview
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalExams: integer("total_exams").default(0),
  passedExams: integer("passed_exams").default(0),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }).default("0.00"),
  overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }).default("0.00"),
  totalStudyTime: integer("total_study_time").default(0), // in minutes
  questionsAnswered: integer("questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  battleWins: integer("battle_wins").default(0),
  battleLosses: integer("battle_losses").default(0),
  lastCalculatedAt: timestamp("last_calculated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId),
]);

// Category-specific user performance
export const userCategoryStats = pgTable("user_category_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  attempts: integer("attempts").default(0),
  bestScore: decimal("best_score", { precision: 5, scale: 2 }).default("0.00"),
  averageScore: decimal("average_score", { precision: 5, scale: 2 }).default("0.00"),
  lastAttemptAt: timestamp("last_attempt_at"),
  categoryProgress: decimal("category_progress", { precision: 5, scale: 2 }).default("0.00"),
  timeSpent: integer("time_spent").default(0), // in minutes
  questionsAnswered: integer("questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.categoryId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  examAttempts: many(examAttempts),
  badges: many(userBadges),
  studySessions: many(studySessions),
  bookmarks: many(bookmarks),
  battleRooms: many(battleRooms),
  battleParticipants: many(battleParticipants),
  battleAnswers: many(battleAnswers),
  battleEvents: many(battleEvents),
}));

export const battleRoomsRelations = relations(battleRooms, ({ many, one }) => ({
  host: one(users, { fields: [battleRooms.hostUserId], references: [users.id] }),
  category: one(categories, { fields: [battleRooms.categoryId], references: [categories.id] }),
  participants: many(battleParticipants),
  questions: many(battleQuestions),
  answers: many(battleAnswers),
  events: many(battleEvents),
}));

export const battleParticipantsRelations = relations(battleParticipants, ({ one, many }) => ({
  room: one(battleRooms, { fields: [battleParticipants.roomId], references: [battleRooms.id] }),
  user: one(users, { fields: [battleParticipants.userId], references: [users.id] }),
  answers: many(battleAnswers),
  events: many(battleEvents),
}));

export const battleQuestionsRelations = relations(battleQuestions, ({ one }) => ({
  room: one(battleRooms, { fields: [battleQuestions.roomId], references: [battleRooms.id] }),
  question: one(questions, { fields: [battleQuestions.questionId], references: [questions.id] }),
}));

export const battleAnswersRelations = relations(battleAnswers, ({ one }) => ({
  room: one(battleRooms, { fields: [battleAnswers.roomId], references: [battleRooms.id] }),
  user: one(users, { fields: [battleAnswers.userId], references: [users.id] }),
  question: one(questions, { fields: [battleAnswers.questionId], references: [questions.id] }),
}));

export const battleEventsRelations = relations(battleEvents, ({ one }) => ({
  room: one(battleRooms, { fields: [battleEvents.roomId], references: [battleRooms.id] }),
  user: one(users, { fields: [battleEvents.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  progress: many(userProgress),
  examAttempts: many(examAttempts),
  flashcards: many(flashcards),
  infographics: many(infographics),
  categorySubtopics: many(categorySubtopics),
}));

export const subtopicsRelations = relations(subtopics, ({ many }) => ({
  questions: many(questions),
  flashcards: many(flashcards),
  infographics: many(infographics),
  categorySubtopics: many(categorySubtopics),
}));

export const categorySubtopicsRelations = relations(categorySubtopics, ({ one }) => ({
  category: one(categories, {
    fields: [categorySubtopics.categoryId],
    references: [categories.id],
  }),
  subtopic: one(subtopics, {
    fields: [categorySubtopics.subtopicId],
    references: [subtopics.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subtopic: one(subtopics, {
    fields: [questions.subtopicId],
    references: [subtopics.id],
  }),
  bookmarks: many(bookmarks),
}));

// Insert schemas

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSubtopicSchema = createInsertSchema(subtopics).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySubtopicSchema = createInsertSchema(categorySubtopics).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertExamAttemptSchema = createInsertSchema(examAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  createdAt: true,
});

export const insertDailyProgressSchema = createInsertSchema(dailyProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type InsertExamAttempt = z.infer<typeof insertExamAttemptSchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type BattleRoom = typeof battleRooms.$inferSelect;
export type Infographic = typeof infographics.$inferSelect;
export type Subtopic = typeof subtopics.$inferSelect;
export type InsertSubtopic = z.infer<typeof insertSubtopicSchema>;
export type CategorySubtopic = typeof categorySubtopics.$inferSelect;
export type InsertCategorySubtopic = z.infer<typeof insertCategorySubtopicSchema>;
export type UserSubtopicProgress = typeof userSubtopicProgress.$inferSelect;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type UserCategoryStats = typeof userCategoryStats.$inferSelect;
export type DailyProgress = typeof dailyProgress.$inferSelect;
export type InsertDailyProgress = z.infer<typeof insertDailyProgressSchema>;
export type UserQuestionCompletion = typeof userQuestionCompletion.$inferSelect;
export type InsertUserQuestionCompletion = typeof userQuestionCompletion.$inferInsert;

// User session tracking for analytics
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }).unique().notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").default(0), // in seconds
  activityType: varchar("activity_type", { 
    enum: ["study", "exam", "battle", "dashboard", "admin", "profile", "general"] 
  }).default("general"),
  pageViews: integer("page_views").default(1),
  isActive: boolean("is_active").default(true),
  deviceInfo: varchar("device_info"),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// Premium Access Requests table
export const premiumAccessRequests = pgTable("premium_access_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requestMessage: text("request_message"),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPremiumAccessRequestSchema = createInsertSchema(premiumAccessRequests).omit({ 
  id: true, 
  createdAt: true, 
  processedAt: true 
});
export type InsertPremiumAccessRequest = z.infer<typeof insertPremiumAccessRequestSchema>;
export type SelectPremiumAccessRequest = typeof premiumAccessRequests.$inferSelect;

// Practical study guide schemas
export const insertPracticalStationSchema = createInsertSchema(practicalStations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertPracticalContentSchema = createInsertSchema(practicalContent).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type PracticalStation = typeof practicalStations.$inferSelect;
export type InsertPracticalStation = z.infer<typeof insertPracticalStationSchema>;
export type PracticalContent = typeof practicalContent.$inferSelect;
export type InsertPracticalContent = z.infer<typeof insertPracticalContentSchema>;

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      firstName?: string;
      lastName?: string;
      nickname?: string;
      profileImageUrl?: string;
      role: string;
      status: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "avex-session-secret-2025",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: sessionStore,
    cookie: {
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
      sameSite: 'lax', // Changed from 'strict' for better cross-tab compatibility
      path: '/'
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware to automatically refresh session on API activity
  app.use('/api', async (req, res, next) => {
    // Skip session refresh for login, logout, session endpoints, and status polling to avoid conflicts
    const skipPaths = ['/login', '/logout', '/session/refresh', '/session/status', '/register'];
    
    if (skipPaths.includes(req.path)) {
      return next();
    }

    // Only refresh for authenticated users
    if (req.isAuthenticated() && req.user) {
      try {
        const userId = req.user.id;
        const sessionId = req.sessionID;
        
        // Update session activity timestamp asynchronously to avoid blocking the request
        storage.updateSessionActivity(userId, sessionId).catch(error => {
          console.error('Failed to update session activity:', error);
        });
        
        // Touch the session to reset the cookie maxAge
        req.session.touch();
      } catch (error) {
        console.error('Session refresh middleware error:', error);
      }
    }
    
    next();
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, {
            ...user,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            nickname: user.nickname || undefined,
            profileImageUrl: user.profileImageUrl || undefined,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id.toString());
      if (user) {
        done(null, {
          ...user,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          nickname: user.nickname || undefined,
          profileImageUrl: user.profileImageUrl || undefined,
        });
      } else {
        done(null, null);
      }
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "basic",
        status: "pending",
      });

      // Regenerate session ID to prevent session fixation
      req.session.regenerate(async (regenerateErr) => {
        if (regenerateErr) {
          console.error('Registration session regeneration error:', regenerateErr);
          return res.status(500).json({ message: "Registration failed" });
        }
        
        req.login({
          ...user,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          nickname: user.nickname || undefined,
          profileImageUrl: user.profileImageUrl || undefined,
        }, async (err) => {
          if (err) return next(err);
          
          try {
            // Create session tracking record for registration
            const deviceInfo = req.get('User-Agent') || 'Unknown Device';
            await storage.createAuthSession(user.id, req.sessionID, deviceInfo);
            
            res.status(201).json({
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              status: user.status,
            });
          } catch (sessionError) {
            console.error('Registration session creation error:', sessionError);
            // Treat session tracking failure as critical - logout and return error
            req.logout((logoutErr) => {
              if (logoutErr) console.error('Logout after registration session failure error:', logoutErr);
            });
            return res.status(500).json({ message: "Registration failed - session tracking error" });
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint with single-session enforcement
  app.post("/api/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // Get user first to check for existing sessions
      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user already has an active session
      const hasActive = await storage.hasActiveSession(user.id);
      if (hasActive) {
        return res.status(403).json({ 
          message: "This account is already logged in on another device/browser. Please log out from the other session first." 
        });
      }

      // Regenerate session ID to prevent session fixation
      req.session.regenerate(async (regenerateErr) => {
        if (regenerateErr) {
          console.error('Session regeneration error:', regenerateErr);
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Proceed with authentication
        req.login({
          ...user,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          nickname: user.nickname || undefined,
          profileImageUrl: user.profileImageUrl || undefined,
        }, async (err) => {
          if (err) return next(err);
          
          try {
            // Create session tracking record
            const deviceInfo = req.get('User-Agent') || 'Unknown Device';
            await storage.createAuthSession(user.id, req.sessionID, deviceInfo);
          
          res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
          });
        } catch (sessionError) {
          console.error('Session creation error:', sessionError);
          // Treat session tracking failure as critical - logout and return error
          req.logout((logoutErr) => {
            if (logoutErr) console.error('Logout after session failure error:', logoutErr);
          });
          return res.status(500).json({ message: "Login failed - session tracking error" });
        }
      });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res, next) => {
    const sessionId = req.sessionID;
    const userId = req.user?.id;
    
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      
      // Destroy the session completely
      req.session.destroy(async (destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        try {
          // End session tracking
          if (userId) {
            await storage.terminateAllUserSessions(userId);
          }
        } catch (sessionError) {
          console.error('Session tracking cleanup error:', sessionError);
        }
        
        // Clear all session cookies with proper options
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        console.log(`Session ${sessionId} destroyed successfully`);
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Also handle GET logout for browser navigation
  app.get("/api/logout", async (req, res, next) => {
    const sessionId = req.sessionID;
    const userId = req.user?.id;
    
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      
      req.session.destroy(async (destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        
        try {
          // End session tracking
          if (userId) {
            await storage.terminateAllUserSessions(userId);
          }
        } catch (sessionError) {
          console.error('Session tracking cleanup error:', sessionError);
        }
        
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        console.log(`Session ${sessionId} destroyed successfully`);
        res.redirect('/');
      });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as User;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    });
  });

  // Force logout endpoint for admin use
  app.post("/api/admin/force-logout/:userId", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = parseInt(req.params.userId);
      await storage.terminateAllUserSessions(userId);
      
      res.json({ message: "User sessions terminated successfully" });
    } catch (error) {
      console.error('Force logout error:', error);
      res.status(500).json({ message: "Failed to terminate user sessions" });
    }
  });

  // Check session status endpoint
  app.get("/api/session/status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ authenticated: false, sessionId: null });
    }
    
    res.json({ 
      authenticated: true, 
      sessionId: req.sessionID,
      userId: req.user?.id 
    });
  });

  // Temporary endpoint for creating test user with known credentials (development only)
  app.post("/api/dev/create-test-user", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ message: "Not found" });
    }
    
    try {
      const email = 'testuser@example.com';
      const password = 'testpassword123';
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // Update existing user with new password
        const hashedPassword = await hashPassword(password);
        await storage.changeUserPassword(existingUser.id.toString(), password);
        await storage.updateUserStatus(existingUser.id.toString(), 'approved');
        return res.json({ 
          message: "Test user updated",
          email: email,
          password: password
        });
      }
      
      // Create new test user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'basic',
        status: 'approved'
      });
      
      res.json({ 
        message: "Test user created successfully",
        email: email,
        password: password,
        userId: user.id
      });
    } catch (error) {
      console.error('Error creating test user:', error);
      res.status(500).json({ message: "Failed to create test user" });
    }
  });

  // Session refresh endpoint to extend session on user activity
  app.post("/api/session/refresh", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Update last activity timestamp in the user session tracking
      const userId = req.user.id;
      const sessionId = req.sessionID;
      
      await storage.updateSessionActivity(userId, sessionId);
      
      // Reset the session cookie maxAge by touching the session
      req.session.touch();
      
      res.json({ 
        message: "Session refreshed", 
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() 
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      res.status(500).json({ message: "Failed to refresh session" });
    }
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  console.log('Auth check - isAuthenticated:', req.isAuthenticated());
  // Log only non-sensitive user information for security
  if (req.user) {
    console.log('Auth check - user:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status
    });
  } else {
    console.log('Auth check - user: null');
  }
  console.log('Auth check - session:', req.session);
  
  if (!req.isAuthenticated() || !req.user) {
    console.log('Authentication failed - no user or not authenticated');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log('Authentication passed - proceeding to next middleware');
  next();
}
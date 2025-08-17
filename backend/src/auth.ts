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
    interface User extends import("@shared/schema").User {}
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
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
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
      done(null, user);
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
        status: "approved",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
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

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    const sessionId = req.sessionID;
    
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      
      // Destroy the session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        // Clear all session cookies with proper options
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: false, // Set to true in production with HTTPS
          sameSite: 'lax'
        });
        
        console.log(`Session ${sessionId} destroyed successfully`);
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Also handle GET logout for browser navigation
  app.get("/api/logout", (req, res, next) => {
    const sessionId = req.sessionID;
    
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: false,
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
}

export function isAuthenticated(req: any, res: any, next: any) {
  console.log('Auth check - isAuthenticated:', req.isAuthenticated());
  console.log('Auth check - user:', req.user);
  console.log('Auth check - session:', req.session);
  
  if (!req.isAuthenticated() || !req.user) {
    console.log('Authentication failed - no user or not authenticated');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log('Authentication passed - proceeding to next middleware');
  next();
}
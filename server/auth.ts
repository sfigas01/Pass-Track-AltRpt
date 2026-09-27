// Google OAuth (OpenID Connect) login, restricted to an email allowlist.
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const requiredEnv = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "PUBLIC_URL",
  "SESSION_SECRET",
  "ALLOWED_EMAILS",
] as const;

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} not provided`);
  }
}

const allowedEmails = new Set(
  process.env.ALLOWED_EMAILS!.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const callbackURL = new URL("/api/callback", process.env.PUBLIC_URL).href;

let oidcConfig: Promise<client.Configuration> | undefined;

function getOidcConfig() {
  oidcConfig ??= client.discovery(
    new URL("https://accounts.google.com"),
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
  ).catch((error) => {
    // Don't cache a failed discovery; retry on the next login.
    oidcConfig = undefined;
    throw error;
  });
  return oidcConfig;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
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
      // Local dev runs over plain http; production is behind Railway's HTTPS proxy.
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: 'lax', // CSRF protection
    },
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
    try {
      const claims = tokens.claims();
      const email = typeof claims?.email === "string" ? claims.email.toLowerCase() : undefined;

      if (!claims || !email || claims.email_verified !== true || !allowedEmails.has(email)) {
        return verified(null, false);
      }

      // Match on email so data created under the previous (Replit) login
      // stays attached to the same user after the switch to Google.
      const user = await storage.upsertUserByEmail({
        id: claims.sub,
        email,
        firstName: typeof claims.given_name === "string" ? claims.given_name : null,
        lastName: typeof claims.family_name === "string" ? claims.family_name : null,
        profileImageUrl: typeof claims.picture === "string" ? claims.picture : null,
      });

      // Routes read the owning user id from req.user.claims.sub.
      verified(null, { claims: { sub: user.id, email } });
    } catch (error) {
      verified(error as Error);
    }
  };

  passport.use(
    new Strategy(
      {
        name: "google",
        config,
        scope: "openid email profile",
        callbackURL,
      },
      verify,
    ),
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", passport.authenticate("google", {
    prompt: "select_account",
  }));

  app.get("/api/callback", passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/?error=unauthorized",
  }));

  app.get("/api/logout", (req, res, next) => {
    req.logout((error) => {
      if (error) return next(error);
      req.session.destroy(() => res.redirect("/"));
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

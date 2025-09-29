import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
// Additional middleware for security and performance. Helmet sets
// secure HTTP headers, and compression enables gzip responses in
// production. These are optional but recommended when deploying the
// server outside of Replit.
import helmet from "helmet";
import compression from "compression";
import { registerRoutes } from "./routes";
import { log, serveStatic } from "./utils";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use Helmet to set a few basic security headers. Helmet can be
// customized further if necessary; see the README for details. This
// middleware should be registered early in the stack.
if (process.env.NODE_ENV === "development") {
  // Relax CSP in development to allow Vite HMR and inline scripts
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
} else {
  app.use(helmet());
}

// Enable gzip compression for improved bandwidth efficiency. Only
// enable in production; compression can slightly slow down responses in
// development but is negligible. Because NODE_ENV defaults to
// "production" when running the built server, this will always
// compress responses in production builds.
app.use(compression());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for debugging
    console.error('Server error:', err);
    
    res.status(status).json({ message });
    // Don't rethrow - this would crash the container in production
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Dynamic import to avoid loading vite in production
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

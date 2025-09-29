var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
import fs2 from "fs";
import path2 from "path";
async function setupVite(app2, server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const { nanoid } = await import("nanoid");
  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    root: path2.resolve(import.meta.dirname, "..", "client"),
    build: {
      outDir: path2.resolve(import.meta.dirname, "..", "dist/public"),
      emptyOutDir: true
    },
    resolve: {
      alias: {
        "@": path2.resolve(import.meta.dirname, "..", "client", "src"),
        "@shared": path2.resolve(import.meta.dirname, "..", "shared"),
        "@assets": path2.resolve(import.meta.dirname, "..", "attached_assets")
      }
    },
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";
import helmet from "helmet";
import compression from "compression";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  guitars: () => guitars,
  insertGuitarSchema: () => insertGuitarSchema
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var guitars = pgTable("guitars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  type: text("type").notNull(),
  // electric, acoustic, classical, bass
  year: integer("year").notNull(),
  condition: text("condition").notNull(),
  // new, excellent, good, fair
  color: text("color").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  pickupLocation: text("pickup_location").notNull(),
  description: text("description"),
  status: text("status").notNull().default("available"),
  // available, reserved, sold
  imageUrl: text("image_url"),
  // primary image
  imageUrls: text("image_urls").array().default([])
  // additional images
});
var insertGuitarSchema = createInsertSchema(guitars).omit({
  id: true
}).extend({
  price: z.coerce.number().min(0, "Price must be positive"),
  year: z.coerce.number().min(1900).max((/* @__PURE__ */ new Date()).getFullYear() + 1),
  type: z.enum(["electric", "acoustic", "classical", "bass"]),
  condition: z.enum(["new", "excellent", "good", "fair"]),
  status: z.enum(["available", "reserved", "sold"]).default("available")
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";
var DatabaseStorage = class {
  async getGuitar(id) {
    const [guitar] = await db.select().from(guitars).where(eq(guitars.id, id));
    return guitar || void 0;
  }
  async getAllGuitars() {
    return await db.select().from(guitars);
  }
  async createGuitar(insertGuitar) {
    const [guitar] = await db.insert(guitars).values({
      ...insertGuitar,
      price: insertGuitar.price.toString(),
      imageUrls: insertGuitar.imageUrls || []
    }).returning();
    return guitar;
  }
  async updateGuitar(id, updates) {
    const updateData = { ...updates };
    if (updates.price !== void 0) {
      updateData.price = updates.price.toString();
    }
    const [updated] = await db.update(guitars).set(updateData).where(eq(guitars.id, id)).returning();
    return updated || void 0;
  }
  async deleteGuitar(id) {
    const result = await db.delete(guitars).where(eq(guitars.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async searchGuitars(query) {
    const searchPattern = `%${query}%`;
    return await db.select().from(guitars).where(
      or(
        ilike(guitars.brand, searchPattern),
        ilike(guitars.model, searchPattern),
        ilike(guitars.color, searchPattern),
        ilike(guitars.description, searchPattern)
      )
    );
  }
  async filterGuitars(filters) {
    const conditions = [];
    if (filters.type) {
      conditions.push(eq(guitars.type, filters.type));
    }
    if (filters.brand) {
      conditions.push(eq(guitars.brand, filters.brand));
    }
    if (filters.status) {
      conditions.push(eq(guitars.status, filters.status));
    }
    if (filters.minPrice !== void 0) {
      conditions.push(gte(guitars.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice !== void 0) {
      conditions.push(lte(guitars.price, filters.maxPrice.toString()));
    }
    if (conditions.length === 0) {
      return await db.select().from(guitars);
    }
    return await db.select().from(guitars).where(and(...conditions));
  }
};
var storage = new DatabaseStorage();

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// server/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    // Implement the case for each type of access group to instantiate.
    //
    // For example:
    // case "USER_LIST":
    //   return new UserListAccessGroup(group.id);
    // case "EMAIL_DOMAIN":
    //   return new EmailDomainAccessGroup(group.id);
    // case "GROUP_MEMBER":
    //   return new GroupMemberAccessGroup(group.id);
    // case "SUBSCRIBER":
    //   return new SubscriberAccessGroup(group.id);
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/objectStorage.ts
var objectStorageClient = new Storage();
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path3) => path3.trim()).filter((path3) => path3.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  // Search for a public object from the search paths.
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  // Downloads an object to the response.
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL() {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900
    });
  }
  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(rawPath, aclPolicy) {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }
  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission
  }) {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
};
function parseObjectPath(path3) {
  if (!path3.startsWith("/")) {
    path3 = `/${path3}`;
  }
  const pathParts = path3.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  let action;
  switch (method) {
    case "GET":
      action = "read";
      break;
    case "PUT":
      action = "write";
      break;
    case "DELETE":
      action = "delete";
      break;
    case "HEAD":
      action = "read";
      break;
    default:
      throw new Error(`Unsupported HTTP method for signing URL: ${method}`);
  }
  const [url] = await file.getSignedUrl({
    action,
    expires: Date.now() + ttlSec * 1e3
  });
  return url;
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  app2.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });
  app2.get("/api/guitars", async (req, res) => {
    try {
      const { search, type, brand, minPrice, maxPrice, status } = req.query;
      let guitars2;
      if (search) {
        guitars2 = await storage.searchGuitars(search);
      } else {
        const filters = {};
        if (type) filters.type = type;
        if (brand) filters.brand = brand;
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
        if (status) filters.status = status;
        if (Object.keys(filters).length > 0) {
          guitars2 = await storage.filterGuitars(filters);
        } else {
          guitars2 = await storage.getAllGuitars();
        }
      }
      res.json(guitars2);
    } catch (error) {
      console.error("Error fetching guitars:", error);
      res.status(500).json({ error: "Failed to fetch guitars" });
    }
  });
  app2.get("/api/guitars/:id", async (req, res) => {
    try {
      const guitar = await storage.getGuitar(req.params.id);
      if (!guitar) {
        return res.status(404).json({ error: "Guitar not found" });
      }
      res.json(guitar);
    } catch (error) {
      console.error("Error fetching guitar:", error);
      res.status(500).json({ error: "Failed to fetch guitar" });
    }
  });
  app2.post("/api/guitars", async (req, res) => {
    try {
      const validatedData = insertGuitarSchema.parse(req.body);
      const objectStorageService = new ObjectStorageService();
      if (validatedData.imageUrl) {
        validatedData.imageUrl = objectStorageService.normalizeObjectEntityPath(validatedData.imageUrl);
      }
      if (validatedData.imageUrls) {
        validatedData.imageUrls = validatedData.imageUrls.map(
          (url) => objectStorageService.normalizeObjectEntityPath(url)
        );
      }
      const guitar = await storage.createGuitar(validatedData);
      res.status(201).json(guitar);
    } catch (error) {
      console.error("Error creating guitar:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create guitar" });
      }
    }
  });
  app2.put("/api/guitars/:id", async (req, res) => {
    try {
      const validatedData = insertGuitarSchema.partial().parse(req.body);
      const objectStorageService = new ObjectStorageService();
      if (validatedData.imageUrl) {
        validatedData.imageUrl = objectStorageService.normalizeObjectEntityPath(validatedData.imageUrl);
      }
      if (validatedData.imageUrls) {
        validatedData.imageUrls = validatedData.imageUrls.map(
          (url) => objectStorageService.normalizeObjectEntityPath(url)
        );
      }
      const guitar = await storage.updateGuitar(req.params.id, validatedData);
      if (!guitar) {
        return res.status(404).json({ error: "Guitar not found" });
      }
      res.json(guitar);
    } catch (error) {
      console.error("Error updating guitar:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update guitar" });
      }
    }
  });
  app2.delete("/api/guitars/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGuitar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Guitar not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guitar:", error);
      res.status(500).json({ error: "Failed to delete guitar" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/utils.ts
import express from "express";
import fs from "fs";
import path from "path";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
if (process.env.NODE_ENV === "development") {
  app.use(helmet({
    contentSecurityPolicy: false
  }));
} else {
  app.use(helmet());
}
app.use(compression());
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server error:", err);
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

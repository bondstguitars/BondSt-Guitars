import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGuitarSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve uploaded guitar images
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
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

  // Get upload URL for guitar images
  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Get all guitars
  app.get("/api/guitars", async (req, res) => {
    try {
      const { search, type, brand, minPrice, maxPrice, status } = req.query;
      
      let guitars;
      if (search) {
        guitars = await storage.searchGuitars(search as string);
      } else {
        const filters: any = {};
        if (type) filters.type = type;
        if (brand) filters.brand = brand;
        if (minPrice) filters.minPrice = parseFloat(minPrice as string);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
        if (status) filters.status = status;
        
        if (Object.keys(filters).length > 0) {
          guitars = await storage.filterGuitars(filters);
        } else {
          guitars = await storage.getAllGuitars();
        }
      }
      
      res.json(guitars);
    } catch (error) {
      console.error("Error fetching guitars:", error);
      res.status(500).json({ error: "Failed to fetch guitars" });
    }
  });

  // Get single guitar
  app.get("/api/guitars/:id", async (req, res) => {
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

  // Create new guitar
  app.post("/api/guitars", async (req, res) => {
    try {
      const validatedData = insertGuitarSchema.parse(req.body);
      
      // Normalize image URLs if they're upload URLs
      const objectStorageService = new ObjectStorageService();
      if (validatedData.imageUrl) {
        validatedData.imageUrl = objectStorageService.normalizeObjectEntityPath(validatedData.imageUrl);
      }
      if (validatedData.imageUrls) {
        validatedData.imageUrls = validatedData.imageUrls.map(url => 
          objectStorageService.normalizeObjectEntityPath(url)
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

  // Update guitar
  app.put("/api/guitars/:id", async (req, res) => {
    try {
      const validatedData = insertGuitarSchema.partial().parse(req.body);
      
      // Normalize image URLs if they're upload URLs
      const objectStorageService = new ObjectStorageService();
      if (validatedData.imageUrl) {
        validatedData.imageUrl = objectStorageService.normalizeObjectEntityPath(validatedData.imageUrl);
      }
      if (validatedData.imageUrls) {
        validatedData.imageUrls = validatedData.imageUrls.map(url => 
          objectStorageService.normalizeObjectEntityPath(url)
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

  // Delete guitar
  app.delete("/api/guitars/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { createPaymentIntent } from "./payment";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/hotels", async (_req, res) => {
    const hotels = await storage.getHotels();
    res.json(hotels);
  });

  app.get("/api/hotels/:id", async (req, res) => {
    const hotel = await storage.getHotel(parseInt(req.params.id));
    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }
    res.json(hotel);
  });

  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const booking = await storage.createBooking({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(booking);
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const bookings = await storage.getUserBookings(req.user.id);
    res.json(bookings);
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { hotelId, nights } = req.body;
      const { clientSecret, amount } = await createPaymentIntent(hotelId, nights);
      res.json({ clientSecret, amount });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
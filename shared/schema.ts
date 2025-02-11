import { pgTable, text, serial, integer, date, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"), // Start as nullable
  isHotelOwner: boolean("is_hotel_owner").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  pricePerNight: decimal("price_per_night").notNull(),
  rating: decimal("rating").notNull(),
  amenities: text("amenities").array().notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  virtualTourUrl: text("virtual_tour_url"),
  additionalImages: text("additional_images").array(),
  subscriptionStatus: text("subscription_status").default('trial'),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  hotelId: integer("hotel_id").references(() => hotels.id),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  totalPrice: decimal("total_price").notNull(),
  status: text("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update the insert schema to include email
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isHotelOwner: true,
}).extend({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertHotelSchema = createInsertSchema(hotels);
export const insertBookingSchema = createInsertSchema(bookings);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type User = typeof users.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
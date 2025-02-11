import Stripe from "stripe";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { hotels } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(hotelId: number, nights: number) {
  const [hotel] = await db.select().from(hotels).where(eq(hotels.id, hotelId));
  
  if (!hotel) {
    throw new Error("Hotel not found");
  }

  const amount = Math.round(Number(hotel.pricePerNight) * nights * 100); // Convert to cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: {
      hotelId: hotel.id,
      hotelName: hotel.name,
      nights,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount,
  };
}

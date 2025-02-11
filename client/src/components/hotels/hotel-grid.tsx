import { Hotel } from "@shared/schema";
import HotelCard from "./hotel-card";

interface HotelGridProps {
  hotels: Hotel[];
}

export default function HotelGrid({ hotels }: HotelGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}

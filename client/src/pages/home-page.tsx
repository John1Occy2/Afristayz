import HeroSection from "@/components/layout/hero-section";
import HotelGrid from "@/components/hotels/hotel-grid";
import { useQuery } from "@tanstack/react-query";
import { Hotel } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF5E6]">
      <HeroSection />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-[#333333]">Featured Hotels</h2>
        <HotelGrid hotels={hotels || []} />
      </div>
    </main>
  );
}

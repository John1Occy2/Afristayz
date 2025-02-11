import { Hotel } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Eye, ShoppingCart, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    toast({
      title: "Added to cart",
      description: `${hotel.name} has been added to your cart.`,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative h-48">
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-bold text-[#FFA500]">
            ★ {hotel.rating}
          </div>
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-xl font-bold mb-2 text-[#333333]">{hotel.name}</h3>
          <p className="text-gray-600 mb-2">{hotel.location}</p>
          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-lg font-bold text-[#FFA500]">
              ${hotel.pricePerNight}
            </span>
            <span className="text-sm text-gray-600">per night</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="bg-[#FFF5E6] text-[#FFA500] text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            {hotel.virtualTourUrl && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(hotel.virtualTourUrl, '_blank')}
              >
                <Video className="w-4 h-4 mr-2" />
                Virtual Tour
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
          <Link href={`/hotels/${hotel.id}`} className="w-full">
            <Button className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
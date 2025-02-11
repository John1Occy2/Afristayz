import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Hotel, insertBookingSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Video, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, addDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/payments/payment-form";
import { useState } from "react";

export default function HotelPage() {
  const [, params] = useRoute("/hotels/:id");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: hotel, isLoading } = useQuery<Hotel>({
    queryKey: [`/api/hotels/${params?.id}`],
  });

  const form = useForm({
    resolver: zodResolver(insertBookingSchema.pick({
      checkIn: true,
      checkOut: true,
    })),
    defaultValues: {
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
    },
  });

  const [showPayment, setShowPayment] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    checkIn: Date;
    checkOut: Date;
    nights: number;
  } | null>(null);

  const bookingMutation = useMutation({
    mutationFn: async (data: { checkIn: Date; checkOut: Date }) => {
      if (!hotel) throw new Error("Hotel not found");
      const nights = Math.ceil((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24));

      setBookingDetails({
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights,
      });

      setShowPayment(true);
    },
  });

  const handlePaymentSuccess = async () => {
    if (!bookingDetails || !hotel) return;

    const { checkIn, checkOut, nights } = bookingDetails;
    const totalPrice = Number(hotel.pricePerNight) * nights;

    try {
      const res = await apiRequest("POST", "/api/bookings", {
        hotelId: hotel.id,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        totalPrice,
      });

      toast({
        title: (
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-green-500" />
            <span>Booking Confirmed!</span>
          </div>
        ),
        description: (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p>Your stay at {hotel?.name} is confirmed.</p>
            <p className="text-sm text-muted-foreground">
              Check-in: {format(checkIn, 'PPP')}
              <br />
              Check-out: {format(checkOut, 'PPP')}
              <br />
              Duration: {nights} {nights === 1 ? 'night' : 'nights'}
            </p>
          </motion.div>
        ),
        duration: 5000,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowPayment(false);
      setBookingDetails(null);
    } catch (error) {
      toast({
        title: "Booking failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: Error) => {
    toast({
      title: "Payment failed",
      description: error.message,
      variant: "destructive",
    });
    setShowPayment(false);
    setBookingDetails(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return <div>Hotel not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF5E6] py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
            />
            {hotel.additionalImages && hotel.additionalImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {hotel.additionalImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${hotel.name} view ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-[#333333]">{hotel.name}</h1>
              <p className="text-xl text-[#333333]">{hotel.location}</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#FFA500]">
                  ${hotel.pricePerNight}
                </span>
                <span className="text-gray-600">per night</span>
              </div>
            </div>

            {hotel.virtualTourUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Virtual Tour
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="aspect-video">
                    <iframe
                      src={hotel.virtualTourUrl}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <p className="text-[#333333]">{hotel.description}</p>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {hotel.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <span className="text-[#008000]">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {user ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => bookingMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              {...field}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              {...field}
                              disabled={(date) => {
                                const checkIn = form.getValues().checkIn;
                                const checkInDate = new Date(checkIn);
                                checkInDate.setHours(0, 0, 0, 0);
                                return date <= checkInDate;
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Book Now"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/auth">Login to Book</Link>
              </Button>
            )}
            {showPayment && bookingDetails && (
              <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="sm:max-w-[425px]">
                  <PaymentForm
                    hotelId={hotel.id}
                    nights={bookingDetails.nights}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  hotelId: number;
  nights: number;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

function PaymentFormContent({ onSuccess, onError }: Omit<PaymentFormProps, 'hotelId' | 'nights'>) {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      setIsLoading(true);
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw error;
      }

      onSuccess();
    } catch (err) {
      onError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading payment form...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <PaymentElement className="mb-6" />
        <Button 
          className="w-full" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay and Book Now'
          )}
        </Button>
      </form>
    </Card>
  );
}

export function PaymentForm({ hotelId, nights, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>();

  useEffect(() => {
    async function initializePayment() {
      try {
        const res = await apiRequest("POST", "/api/create-payment-intent", {
          hotelId,
          nights,
        });

        const { clientSecret } = await res.json();
        setClientSecret(clientSecret);
      } catch (err) {
        onError(err as Error);
      }
    }

    initializePayment();
  }, [hotelId, nights, onError]);

  if (!clientSecret) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Initializing payment...</span>
        </div>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormContent onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
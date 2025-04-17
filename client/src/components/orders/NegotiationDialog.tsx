import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface NegotiationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { offeredPrice: number; message: string }) => void;
  produceId: number;
  produceName: string;
  currentPrice: number;
  quantity: number;
  isCounterOffer?: boolean;
}

const negotiationSchema = z.object({
  offeredPrice: z.coerce.number()
    .positive({ message: "Price must be positive" })
    .min(0.5, { message: "Price must be at least ₹0.50" })
    .refine(
      (price) => !isNaN(price), 
      { message: "Please enter a valid number" }
    ),
  message: z.string()
    .min(5, { message: "Please provide a brief message" })
    .max(300, { message: "Message is too long (maximum 300 characters)" })
    .refine(
      (msg) => !/^\s+$/.test(msg), 
      { message: "Message cannot contain only whitespace" }
    ),
});

const NegotiationDialog = ({
  open,
  onClose,
  onSubmit,
  produceId,
  produceName,
  currentPrice,
  quantity,
  isCounterOffer = false,
}: NegotiationDialogProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof negotiationSchema>>({
    resolver: zodResolver(negotiationSchema),
    defaultValues: {
      offeredPrice: currentPrice * 0.95, // 5% less than current price by default
      message: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof negotiationSchema>) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const totalValue = form.watch("offeredPrice") * quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCounterOffer ? t('negotiate.makeCounterOffer') : t('negotiate.makeOffer')}
          </DialogTitle>
          <DialogDescription>
            {isCounterOffer
              ? t('negotiate.counterOfferDesc')
              : t('negotiate.offerDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold">{produceName}</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('negotiate.currentPrice')}:</span>
                <span className="font-medium">{formatPrice(currentPrice)}/kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('negotiate.quantity')}:</span>
                <span className="font-medium">{quantity}kg</span>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="offeredPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('negotiate.yourOfferPerKg')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                      <Input {...field} className="pl-8" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between py-2 px-1 bg-gray-50 rounded-md">
              <span className="font-medium">{t('negotiate.totalOrderValue')}:</span>
              <span className="font-bold text-primary">{formatPrice(totalValue)}</span>
            </div>
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('negotiate.message')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('negotiate.messagePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('actions.submitting') : t('actions.submitOffer')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NegotiationDialog;

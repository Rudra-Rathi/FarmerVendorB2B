import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  orderId: number;
  revieweeId: number;
  revieweeName: string;
  onSubmitReview: (data: { rating: number; comment: string }) => Promise<void>;
}

const reviewSchema = z.object({
  rating: z.number().min(1, {
    message: "Please select a rating",
  }).max(5),
  comment: z.string().min(5, {
    message: "Comment must be at least 5 characters",
  }),
});

const ReviewForm = ({
  orderId,
  revieweeId,
  revieweeName,
  onSubmitReview,
}: ReviewFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof reviewSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmitReview(data);
      form.reset();
      toast({
        title: t('review.success'),
        description: t('review.successMessage'),
      });
    } catch (error: any) {
      toast({
        title: t('review.error'),
        description: error.message || t('review.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rating = form.watch("rating");

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium text-lg mb-3">
        {t('review.leaveReviewFor')} {revieweeName}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('review.rating')}</FormLabel>
                <FormControl>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || field.value)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('review.comment')}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t('review.commentPlaceholder')}
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? t('actions.submitting') : t('actions.submitReview')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;

import { useEffect, useState } from "react";
import { LockKeyhole, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/Api";

function ReviewDialog({
  bookingId,
  reviewee,
  open,
  onOpenChange,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setRating(0);
      setHoverRating(0);
      setReview("");
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!rating || loading) {
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/review/create", {
        bookingId,
        rating,
        review: review.trim(),
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to submit review");
      }

      onReviewSubmitted?.(res.data.review);
      onOpenChange(false);
    } catch (error) {
      console.error("Submit Review Error:", error);
      console.error("Response:", error.response?.data);
      console.error("Booking ID:", bookingId);
      console.error("Rating:", rating);
    } finally {
      setLoading(false);
    }
  };

  const displayedRating = hoverRating || rating;

  const ratingLabels = {
    1: "Poor experience",
    2: "Could be better",
    3: "Good experience",
    4: "Great experience",
    5: "Excellent experience",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-2xl sm:max-w-[440px]"
        showCloseButton={false}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-7 pb-7 pt-7">
            <div className="my-6 h-px bg-slate-100" />

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Your rating
                </p>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} out of 5`}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(value)}
                      className="rounded-full p-1 transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Star
                        className={`h-9 w-9 transition-colors duration-150 ${
                          value <= displayedRating
                            ? "fill-blue-600 text-blue-600"
                            : "fill-transparent text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      rating ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {rating ? ratingLabels[rating] : "Tap a star to rate"}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">
                    Share your experience{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {review.length}/1000
                  </span>
                </div>

                <Textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  placeholder="What did you like about the ride?"
                  maxLength={1000}
                  className="min-h-28 resize-none rounded-xl border-slate-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>

              <Button
                type="button"
                disabled={!rating || loading}
                onClick={handleSubmit}
                className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold shadow-sm transition hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <LockKeyhole className="h-3.5 w-3.5" />
                <span>Your review will be public and help others.</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewDialog;

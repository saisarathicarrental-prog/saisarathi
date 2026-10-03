import { useState, useRef } from "react";

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  quote: string;
  img?: string;
  isNew?: boolean;
}

interface AddReviewProps {
  reviews?: Testimonial[];
  onSubmitReview?: (review: Testimonial) => void;
  onBack: () => void;
}

export const INITIAL_REVIEWS: Testimonial[] = [];

const RATING_LABELS: Record<number, string> = {
  1: "Poor – Needs major improvement",
  2: "Fair – Disappointing aspects",
  3: "Good – Met standard expectations",
  4: "Very Good – Highly enjoyable journey",
  5: "Excellent",
};

export default function AddReview({
  reviews: externalReviews,
  onSubmitReview,
  onBack,
}: AddReviewProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [quote, setQuote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reviews = externalReviews ?? INITIAL_REVIEWS;
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const activeStarCount = hoveredRating > 0 ? hoveredRating : rating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedQuote = quote.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    if (!trimmedQuote) {
      setError("Please write your review.");
      return;
    }

    if (trimmedQuote.length < 10) {
      setError("Review must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);

    const finalLocation = location.trim() || "Verified Traveler";

    const newReview: Testimonial = {
      name: trimmedName,
      location: finalLocation,
      rating,
      quote: trimmedQuote,
      isNew: true,
    };

    setTimeout(() => {
      setName("");
      setLocation("");
      setRating(5);
      setHoveredRating(0);
      setQuote("");
      setIsSubmitting(false);
      setSuccessMessage(
        `Thank you, ${trimmedName}! Your review has been added to our verified traveler stories below and on the website.`
      );

      if (onSubmitReview) {
        onSubmitReview(newReview);
      }

      setTimeout(() => {
        reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#1A1A1A] flex flex-col selection:bg-[#E8B923]/30 selection:text-[#1A1A1A]">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-30 bg-[#F8F6F1]/90 backdrop-blur-md border-b border-[#EFE9DF] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Left: Link style "← Go to Website" */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#1A1A1A] hover:text-[#E8B923] text-sm font-medium transition-colors cursor-pointer group"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            <span>Go to Website</span>
          </button>

          {/* Center: Sai Sarathi Travels logo + name */}
          <div className="flex items-center gap-3">
            <img
              src="/images/Gemini_Generated_Image_76txuq76txuq76tx__1_-removebg-preview.png"
              alt="Sai Sarathi Travels Logo"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#1A1A1A]">
              Sai Sarathi <span className="text-[#E8B923]">Travels</span>
            </span>
          </div>

          {/* Right: VERIFIED CUSTOMER FEEDBACK */}
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#5C5C5C] uppercase hidden sm:block">
            VERIFIED CUSTOMER FEEDBACK
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {/* ── Hero Section ── */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1A1A1A] tracking-tight">
            Share your <span className="italic font-normal text-[#E8B923]">experience</span>
          </h1>
          <p className="text-sm sm:text-base text-[#5C5C5C] mt-3 leading-relaxed">
            Tell fellow travelers about your journey with Sai Sarathi Travels. Every verified review helps us preserve our five-star standards across Maharashtra.
          </p>
        </div>

        {/* ── Add Review Form ── */}
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl p-6 sm:p-10 border border-[#EFE9DF] shadow-[0_4px_24px_-4px_rgba(232,185,35,0.08)]">
          {error && (
            <div className="mb-6 bg-[#FCF3F2] border border-[#F5C6CB] rounded-xl p-3.5 text-[#A94442] text-sm flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-[#D9534F]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-[#F4F9F1] border border-[#C3E6CB] rounded-xl p-4 text-[#2E6930] text-sm flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#3C763D] text-white flex items-center justify-center text-xs font-bold shrink-0">
                ✓
              </span>
              <p className="leading-snug">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Your Name * */}
            <div>
              <label
                htmlFor="reviewer-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-2"
              >
                Your Name <span className="text-[#E8B923]">*</span>
              </label>
              <input
                id="reviewer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Deshmukh"
                className="w-full bg-[#FDFBF7] border border-[#EFE9DF] rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-[#8C8C8C] text-sm focus:outline-none focus:border-[#E8B923] focus:bg-white focus:ring-2 focus:ring-[#E8B923]/20 transition-all"
              />
            </div>

            {/* Your City / Location (optional) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="reviewer-location"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]"
                >
                  Your City / Location
                </label>
                <span className="text-[11px] text-[#5C5C5C]">optional</span>
              </div>
              <input
                id="reviewer-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full bg-[#FDFBF7] border border-[#EFE9DF] rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-[#8C8C8C] text-sm focus:outline-none focus:border-[#E8B923] focus:bg-white focus:ring-2 focus:ring-[#E8B923]/20 transition-all"
              />
            </div>

            {/* Rating * (interactive 5-star rating with live label) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                  Rating <span className="text-[#E8B923]">*</span>
                </label>
                <span className="text-xs font-medium text-[#1A1A1A]">
                  {RATING_LABELS[activeStarCount]}
                </span>
              </div>

              <div className="bg-[#FDFBF7] border border-[#EFE9DF] rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeStarCount;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-115 cursor-pointer"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <svg
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled ? "fill-[#E8B923] text-[#E8B923]" : "fill-transparent text-[#D4CDBC]"
                          }`}
                          stroke="currentColor"
                          strokeWidth={1.5}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E8B923]/15 text-[#8C6D1F]">
                  {activeStarCount} / 5
                </div>
              </div>
            </div>

            {/* Your Review * (textarea with live character count) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="reviewer-quote"
                  className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]"
                >
                  Your Review <span className="text-[#E8B923]">*</span>
                </label>
                <span className="text-[11px] text-[#5C5C5C]">
                  {quote.length} characters
                </span>
              </div>
              <textarea
                id="reviewer-quote"
                rows={4}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Describe your journey with Sai Sarathi Travels — car condition, driver punctuality, route knowledge, and pilgrimage experience..."
                className="w-full bg-[#FDFBF7] border border-[#EFE9DF] rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-[#8C8C8C] text-sm focus:outline-none focus:border-[#E8B923] focus:bg-white focus:ring-2 focus:ring-[#E8B923]/20 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Action buttons: Primary Yellow "Submit Review →" + Secondary "Cancel" */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3.5 px-8 rounded-full bg-[#E8B923] hover:bg-[#D4A517] text-[#1A1A1A] font-semibold text-sm tracking-wide shadow-[0_4px_16px_-2px_rgba(232,185,35,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(232,185,35,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <span>Submit Review →</span>
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-[#E0DACE] hover:border-[#C4BBAE] text-[#5C5C5C] hover:text-[#1A1A1A] text-sm font-medium transition-colors cursor-pointer bg-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* ── Reviews Section (Immediately below the form) ── */}
        <div ref={reviewsSectionRef} className="mt-16 sm:mt-24">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1A1A1A] tracking-tight">
              What our travelers <span className="italic font-normal text-[#E8B923]">say</span>
            </h2>
            <p className="text-sm sm:text-base text-[#5C5C5C] max-w-lg mx-auto mt-2.5 leading-relaxed">
              Authentic stories from pilgrims and travelers across Maharashtra.
            </p>
          </div>

          {/* Responsive Grid: 1 col mobile → 2 col tablet → 3 col desktop */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <div
                  key={`${review.name}-${idx}`}
                  style={{
                    animationDelay: `${Math.min(idx * 60, 600)}ms`,
                  }}
                  className={`review-card-animate review-card-hover bg-white rounded-2xl p-6 sm:p-7 border flex flex-col justify-between shadow-[0_4px_20px_-2px_rgba(232,185,35,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] ${
                    review.isNew
                      ? "border-[#E8B923] ring-2 ring-[#E8B923]/30"
                      : "border-[#EFE9DF]"
                  }`}
                >
                  <div>
                    {/* Star Rating + Verified Traveler Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-[#E8B923]" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7A5E0B] bg-[#FCF8EC] border border-[#E8B923]/30 px-2.5 py-0.5 rounded-full">
                        <svg className="w-3 h-3 text-[#E8B923]" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified Traveler
                      </span>
                    </div>

                    {/* Quote */}
                    <p className="text-[#1A1A1A] text-sm sm:text-base leading-relaxed italic mb-6">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  </div>

                  {/* Name, Location & Optional Tag */}
                  <div className="pt-4 border-t border-[#F2EDE4] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#1A1A1A] tracking-tight">
                        {review.name}
                      </div>
                      <div className="text-xs text-[#5C5C5C] mt-0.5">
                        {review.location}
                      </div>
                    </div>
                    {review.isNew && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D1F] bg-[#FCF8EC] border border-[#E8B923]/40 px-2 py-0.5 rounded">
                        Just added
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#EFE9DF] text-center max-w-xl mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#E8B923]/15 text-[#E8B923] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="font-serif text-lg font-medium text-[#1A1A1A] mb-1">No reviews yet</p>
              <p className="text-xs sm:text-sm text-[#5C5C5C]">
                Submit your review above to feature the very first story on our website.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-20 border-t border-[#EFE9DF] py-8 text-center text-xs text-[#5C5C5C] bg-[#F8F6F1]">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-serif font-medium text-[#1A1A1A]">Sai Sarathi Travels</span>
          <span>·</span>
          <span>Car Rental & Pilgrimage Tours Shirdi</span>
        </div>
        <div>Five-star certified travel across Shirdi, Nashik, Trimbakeshwar & Maharashtra</div>
      </footer>
    </div>
  );
}

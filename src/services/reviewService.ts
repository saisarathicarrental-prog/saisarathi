import { supabase, isSupabaseConfigured } from "../supabase";

export interface Testimonial {
  id: string;
  userId?: string;
  userName: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  quote: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: number;
  img?: string;
  isNew?: boolean;
}

export const INITIAL_REVIEWS: Testimonial[] = [];

/**
 * Format raw Supabase database row to consistent Testimonial object
 */
export function mapSupabaseReview(row: any): Testimonial {
  const name = (row.name || row.user_name || row.userName || "Anonymous").trim();
  const quote = (row.comment || row.review_text || row.review || row.quote || "").trim();
  const location = (row.location || "Verified Traveler").trim();
  const rating = typeof row.rating === "number" ? Math.max(1, Math.min(5, row.rating)) : 5;
  const createdAt = row.created_at || row.createdAt || new Date().toISOString();
  const dateObj = new Date(createdAt);
  const date = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    id: String(row.id || `rev_${Date.now()}`),
    userId: row.user_id || "anonymous_traveler",
    userName: name,
    name,
    location,
    rating,
    review: quote,
    quote,
    createdAt,
    updatedAt: row.updated_at || row.updatedAt || createdAt,
    date,
    timestamp: !isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now(),
    isNew: Boolean(row.isNew),
  };
}

/**
 * Retrieve cached/initial reviews (Supabase is the permanent source of truth)
 */
export const getStoredReviews = (): Testimonial[] => {
  return [];
};

/**
 * Check whether the visitor's browser has unmigrated reviews from previous sessions
 */
export function checkLegacyLocalStorageReviews(): Testimonial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem("saisarathi_customer_reviews") ||
      localStorage.getItem("saisarathi_testimonials");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            (item.name || item.userName) &&
            (item.quote || item.review || item.comment)
        )
        .map(mapSupabaseReview);
    }
  } catch (err) {
    console.warn("[reviewService] Could not parse localStorage reviews:", err);
  }
  return [];
}

/**
 * Fetch all verified reviews directly from the Supabase PostgreSQL database
 */
export async function fetchReviewsFromSupabase(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) {
    console.error(
      "[Supabase Configuration Error] Reviews cannot be loaded: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY."
    );
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      if (
        error.message?.includes("relation") ||
        error.message?.includes("schema cache") ||
        error.code === "PGRST205"
      ) {
        console.warn(
          "[Supabase Database Notice] Table 'public.reviews' not found. Please execute 'supabase/setup_reviews.sql' in your Supabase SQL Editor."
        );
      } else {
        console.error("[Supabase Database Error] Error fetching reviews from PostgreSQL:", error);
      }
      return [];
    }

    if (Array.isArray(data)) {
      return data.map(mapSupabaseReview);
    }
  } catch (error) {
    console.error("[Supabase Database Error] Unexpected error querying reviews:", error);
  }

  return [];
}

/**
 * Insert a verified review into the Supabase PostgreSQL database table `reviews`
 */
export const saveReviewToCloud = async (
  review: Omit<Testimonial, "id">
): Promise<Testimonial> => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase database connection is not configured. Please check your Supabase project settings."
    );
  }

  // Client-side input validation matching database constraints
  const trimmedName = review.name?.trim();
  const trimmedQuote = (review.quote || review.review)?.trim();
  const trimmedLocation = review.location?.trim() || "Verified Traveler";
  const rating = Number(review.rating);

  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Name is required and must be at least 2 characters.");
  }
  if (trimmedName.length > 100) {
    throw new Error("Name must not exceed 100 characters.");
  }

  if (!trimmedQuote || trimmedQuote.length < 10) {
    throw new Error("Review text is required and must be at least 10 characters.");
  }
  if (trimmedQuote.length > 2000) {
    throw new Error("Review text must not exceed 2000 characters.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  // Insert into Supabase PostgreSQL table `reviews`
  // We send both standard columns (`name`, `comment`) and aliases (`user_name`, `review_text`)
  const insertPayload = {
    name: trimmedName,
    user_name: trimmedName,
    location: trimmedLocation,
    rating,
    comment: trimmedQuote,
    review_text: trimmedQuote,
  };

  const { data, error } = await supabase
    .from("reviews")
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error("[Supabase Database Error] Insert into reviews table failed:", error);
    if (
      error.message?.includes("relation") ||
      error.message?.includes("schema cache") ||
      error.code === "PGRST205"
    ) {
      throw new Error(
        "Database table 'reviews' does not exist yet. Please run the SQL script in 'supabase/setup_reviews.sql' inside your Supabase SQL Editor."
      );
    }
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error(
        "Permission denied by Row Level Security policy. Please verify the insert policy in 'supabase/setup_reviews.sql'."
      );
    }
    throw new Error(error.message || "Failed to submit review to database. Please try again.");
  }

  if (!data) {
    throw new Error("No response received from Supabase after submitting review.");
  }

  const savedReview = mapSupabaseReview(data);
  savedReview.isNew = true;
  return savedReview;
};

/**
 * Delete a review from Supabase (for moderation/admin)
 */
export const deleteReviewFromSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error(
      "[Supabase Developer Configuration Error] Cannot delete review: Missing configuration."
    );
    return false;
  }

  try {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      console.error("[Supabase Database Error] Error deleting review:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase Database Error] Unexpected error deleting review:", err);
    return false;
  }
};

/**
 * Subscribe to Supabase database reviews:
 * 1. Fetches current reviews from Supabase PostgreSQL.
 * 2. Establishes Supabase Realtime channel on table `reviews`.
 * 3. Handles INSERT, UPDATE, DELETE events without duplicate cards.
 * 4. Unsubscribes on cleanup.
 */
export const subscribeToReviews = (
  onUpdate: (reviews: Testimonial[]) => void
): (() => void) => {
  let isSubscribed = true;
  let currentReviews: Testimonial[] = [];

  // 1. Initial query from Supabase PostgreSQL
  fetchReviewsFromSupabase().then((databaseReviews) => {
    if (!isSubscribed) return;
    currentReviews = databaseReviews;
    onUpdate([...currentReviews]);
  });

  // If Supabase is not configured, exit early
  if (!isSupabaseConfigured()) {
    return () => {
      isSubscribed = false;
    };
  }

  // 2. Real-time channel listener
  const channel = supabase
    .channel("public:reviews")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "reviews",
      },
      (payload) => {
        if (!isSubscribed) return;

        if (payload.eventType === "INSERT") {
          const newReview = mapSupabaseReview(payload.new);
          // Avoid duplicate cards
          const exists = currentReviews.some((r) => r.id === newReview.id);
          if (!exists) {
            currentReviews = [newReview, ...currentReviews];
            onUpdate([...currentReviews]);
          }
        } else if (payload.eventType === "UPDATE") {
          const updatedReview = mapSupabaseReview(payload.new);
          currentReviews = currentReviews.map((r) =>
            r.id === updatedReview.id ? updatedReview : r
          );
          onUpdate([...currentReviews]);
        } else if (payload.eventType === "DELETE") {
          const deletedId = String(payload.old?.id);
          currentReviews = currentReviews.filter((r) => r.id !== deletedId);
          onUpdate([...currentReviews]);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("[Supabase Realtime] Connected and listening for reviews updates.");
      } else if (status === "CHANNEL_ERROR") {
        console.warn("[Supabase Realtime] Channel subscription status:", status, err);
      }
    });

  // 3. Cleanup function
  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
};

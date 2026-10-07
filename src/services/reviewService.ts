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
  const name = row.user_name || row.userName || row.name || "Anonymous";
  const quote = row.review_text || row.review || row.quote || "";
  const location = row.location || "Verified Traveler";
  const rating = typeof row.rating === "number" ? row.rating : 5;
  const createdAt = row.created_at || row.createdAt || new Date().toISOString();
  const dateObj = new Date(createdAt);
  const date = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    id: String(row.id),
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
 * Retrieve cached/initial reviews (empty array - Supabase is single source of truth)
 */
export const getStoredReviews = (): Testimonial[] => {
  return [];
};

/**
 * Fetch all reviews directly from the Supabase PostgreSQL database
 */
export async function fetchReviewsFromSupabase(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) {
    console.warn(
      "[Supabase] Credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Error fetching reviews from PostgreSQL:", error);
      throw error;
    }

    if (Array.isArray(data)) {
      return data.map(mapSupabaseReview);
    }
  } catch (error) {
    console.error("[Supabase] Unexpected error querying reviews:", error);
  }

  return [];
}

/**
 * Insert a review into the Supabase PostgreSQL database table `reviews`
 */
export const saveReviewToCloud = async (
  review: Omit<Testimonial, "id">
): Promise<Testimonial> => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase database connection is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
  }

  // Frontend input validation
  const trimmedName = review.name?.trim();
  const trimmedQuote = review.quote?.trim();
  const rating = Number(review.rating);

  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Name is required and must be at least 2 characters.");
  }

  if (!trimmedQuote || trimmedQuote.length < 10) {
    throw new Error("Review text is required and must be at least 10 characters.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  // Insert into Supabase table `reviews`
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        user_name: trimmedName,
        location: review.location?.trim() || "Verified Traveler",
        rating,
        review_text: trimmedQuote,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Database insert error:", error);
    throw new Error(
      error.message || "Failed to insert review into Supabase PostgreSQL database."
    );
  }

  if (!data) {
    throw new Error("No data returned from Supabase database confirmation.");
  }

  const savedReview = mapSupabaseReview(data);
  savedReview.isNew = true;
  return savedReview;
};

/**
 * Delete a review from Supabase (for moderation/admin)
 */
export const deleteReviewFromSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      console.error("[Supabase] Error deleting review:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Unexpected error deleting review:", err);
    return false;
  }
};

/**
 * Subscribe to Supabase database reviews:
 * 1. Fetches current reviews from Supabase.
 * 2. Establishes Supabase Realtime channel on table `reviews`.
 * 3. Handles INSERT, UPDATE, DELETE events without duplicate cards.
 * 4. Unsubscribes on cleanup.
 */
export const subscribeToReviews = (
  onUpdate: (reviews: Testimonial[]) => void
): (() => void) => {
  let isSubscribed = true;
  let currentReviews: Testimonial[] = [];

  // 1. Initial query from Supabase
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
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("[Supabase Realtime] Active and listening for changes on reviews table.");
      }
    });

  // 3. Cleanup function
  return () => {
    isSubscribed = false;
    supabase.removeChannel(channel);
  };
};

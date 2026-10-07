import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";

export interface Testimonial {
  id?: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  date?: string;
  timestamp?: number;
  img?: string;
  isNew?: boolean;
}

export const INITIAL_REVIEWS: Testimonial[] = [];

const STORAGE_KEY = "saisarathi_customer_reviews";

// Clear all previous sample/stored reviews
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("saisarathi_testimonials");
  } catch (e) {
    // ignore
  }
}

/**
 * Retrieve cached reviews from localStorage, falling back to INITIAL_REVIEWS (empty array).
 */
export const getStoredReviews = (): Testimonial[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any legacy mock reviews with init- id
        const userOnly = parsed.filter(
          (r) => r && typeof r === "object" && !String(r.id || "").startsWith("init-")
        );
        return userOnly;
      }
    }
  } catch (err) {
    console.error("Error reading reviews from localStorage", err);
  }
  return [];
};

/**
 * Clear all stored reviews completely.
 */
export const clearAllReviews = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("saisarathi_testimonials");
    } catch (e) {
      console.error("Error clearing reviews from localStorage", e);
    }
  }
};

/**
 * Save reviews to localStorage.
 */
export const setStoredReviews = (reviews: Testimonial[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error("Failed to save reviews to localStorage", err);
  }
};

/**
 * Submit a review globally to Firebase Firestore and update local cache.
 */
export const saveReviewToCloud = async (
  review: Omit<Testimonial, "id">
): Promise<Testimonial> => {
  const newTimestamp = Date.now();
  const dateStr = new Date().toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const baseReview: Testimonial = {
    ...review,
    id: `local-${newTimestamp}`,
    timestamp: newTimestamp,
    date: dateStr,
    isNew: true,
  };

  // If Firebase is configured and DB instance is active
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        name: review.name,
        location: review.location,
        rating: review.rating,
        quote: review.quote,
        timestamp: newTimestamp,
        createdAt: serverTimestamp(),
        dateStr: dateStr,
      });

      const cloudReview: Testimonial = {
        ...baseReview,
        id: docRef.id,
      };

      // Update local storage cache immediately
      const current = getStoredReviews();
      const updated = [cloudReview, ...current.filter((r) => r.id !== cloudReview.id)];
      setStoredReviews(updated);

      return cloudReview;
    } catch (err) {
      console.error("Failed to post review to Firebase Firestore:", err);
      // Fallback to local storage
    }
  } else {
    console.info(
      "Firebase Firestore is not configured yet. Saving review to local device storage. To enable global sync across all devices, configure Firebase in .env"
    );
  }

  // Fallback: save to local storage
  const current = getStoredReviews();
  const updated = [baseReview, ...current];
  setStoredReviews(updated);

  return baseReview;
};

/**
 * Subscribe to reviews in real time.
 * If Firebase is configured, listens for live updates across all devices globally.
 * Returns an unsubscribe cleanup function.
 */
export const subscribeToReviews = (
  onUpdate: (reviews: Testimonial[]) => void
): (() => void) => {
  // First emit whatever we have in local cache immediately (0ms delay)
  const initialData = getStoredReviews();
  onUpdate(initialData);

  // If Firebase is configured, listen to Firestore collection
  if (db && isFirebaseConfigured()) {
    try {
      const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const cloudReviews: Testimonial[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || "Anonymous",
              location: data.location || "Verified Traveler",
              rating: typeof data.rating === "number" ? data.rating : 5,
              quote: data.quote || "",
              timestamp: data.timestamp || 0,
              date:
                data.dateStr ||
                (data.timestamp
                  ? new Date(data.timestamp).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })
                  : undefined),
            };
          });

          // Merge cloud reviews with initial reviews, avoiding duplicates
          const cloudIds = new Set(cloudReviews.map((r) => r.id));
          const filteredInitial = INITIAL_REVIEWS.filter((r) => !cloudIds.has(r.id));
          const allReviews = [...cloudReviews, ...filteredInitial];

          setStoredReviews(allReviews);
          onUpdate(allReviews);
        },
        (error) => {
          console.error("Firestore onSnapshot error:", error);
          // Keep showing cached data
          onUpdate(getStoredReviews());
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to subscribe to Firestore reviews:", err);
    }
  }

  // Cross-tab synchronization listener for browser storage
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          onUpdate(parsed);
        }
      } catch (err) {
        console.error("Storage parse error:", err);
      }
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }

  return () => {};
};

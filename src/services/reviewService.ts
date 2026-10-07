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

export const INITIAL_REVIEWS: Testimonial[] = [
  {
    id: "init-1",
    name: "Rajesh Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    quote:
      "We booked an Innova Crysta for a 3-day family pilgrimage to Shirdi, Shani Shingnapur, and Trimbakeshwar. The driver was extremely polite, punctual, and knew the VIP darshan timings perfectly. Pristine car hygiene!",
    date: "Sep 2026",
    timestamp: 1726000000000,
  },
  {
    id: "init-2",
    name: "Anita Patil",
    location: "Pune, Maharashtra",
    rating: 5,
    quote:
      "Best car rental service in Shirdi! We booked a sedan for local temple sightseeing and Ellora Caves. Completely transparent billing, no hidden toll hassles, and AC cooling was excellent throughout.",
    date: "Aug 2026",
    timestamp: 1724000000000,
  },
  {
    id: "init-3",
    name: "Venkat Raman",
    location: "Bengaluru, Karnataka",
    rating: 5,
    quote:
      "Traveling with elderly parents can be stressful, but Sai Sarathi Travels made our Shirdi & Panchavati darshan effortless. The driver assisted my parents with luggage and stopped at clean family restaurants.",
    date: "Aug 2026",
    timestamp: 1723500000000,
  },
  {
    id: "init-4",
    name: "Dr. Sunil Deshmukh",
    location: "Hyderabad, Telangana",
    rating: 5,
    quote:
      "Prompt pickup from Pune Airport straight to Shirdi temple. Smooth highway driving, very safe and courteous chauffeur. Highly recommended for spiritual tours in Maharashtra!",
    date: "Jul 2026",
    timestamp: 1722000000000,
  },
  {
    id: "init-5",
    name: "Priya Kulkarni",
    location: "Nashik, Maharashtra",
    rating: 5,
    quote:
      "Booked a Tempo Traveller for our group tour to Bhimashankar and Grishneshwar Jyotirlinga. Comfortable pushback seats, smooth journey, and reasonable rates. Will definitely book again!",
    date: "Jun 2026",
    timestamp: 1719000000000,
  },
  {
    id: "init-6",
    name: "Amit Joshi",
    location: "Thane, Maharashtra",
    rating: 5,
    quote:
      "Sai Sarathi Travels made our Shirdi trip memorable. Punctual, courteous driver and fair pricing. The car was spotless and well-maintained.",
    date: "Jun 2026",
    timestamp: 1718000000000,
  },
];

const STORAGE_KEY = "saisarathi_customer_reviews";

/**
 * Retrieve cached reviews from localStorage, falling back to INITIAL_REVIEWS.
 */
export const getStoredReviews = (): Testimonial[] => {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading reviews from localStorage", err);
  }
  return INITIAL_REVIEWS;
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

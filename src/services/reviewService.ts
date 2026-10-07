import { io, type Socket } from "socket.io-client";

export interface Testimonial {
  id: string;
  userId?: string;
  userName?: string;
  name: string;
  location: string;
  rating: number;
  review?: string;
  quote: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: number;
  img?: string;
  isNew?: boolean;
}

export const INITIAL_REVIEWS: Testimonial[] = [];

// Base API URL (falls back to relative "/api" proxied by Vite or direct backend)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.port === "5000" ? "" : "");

let socketInstance: Socket | null = null;

/**
 * Helper to ensure consistent field names across frontend components
 */
export function formatReview(data: any): Testimonial {
  const name = data.userName || data.name || "Anonymous";
  const quote = data.review || data.quote || "";
  const location = data.location || "Verified Traveler";
  const rating = typeof data.rating === "number" ? data.rating : 5;
  const createdAt = data.createdAt || new Date().toISOString();
  const dateObj = new Date(createdAt);
  const date =
    data.date ||
    (!isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : "");

  return {
    id: String(data.id),
    userId: data.userId || "anonymous_traveler",
    userName: name,
    name,
    location,
    rating,
    review: quote,
    quote,
    createdAt,
    updatedAt: data.updatedAt || createdAt,
    date,
    timestamp: data.timestamp || (!isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now()),
    isNew: Boolean(data.isNew),
  };
}

/**
 * Get or initialize the Socket.IO client instance
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (!socketInstance) {
    const socketTarget =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      (window.location.port === "5000" ? window.location.origin : "");

    socketInstance = io(socketTarget, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket.IO] Connected to backend real-time server (ID: ${socketInstance?.id})`);
    });

    socketInstance.on("connect_error", (error) => {
      console.warn("[Socket.IO] Connection error (will retry automatically):", error.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket.IO] Disconnected from real-time server:", reason);
    });
  }

  return socketInstance;
}

/**
 * Fetch all reviews directly from the backend database API
 */
export async function fetchReviewsFromDatabase(): Promise<Testimonial[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(formatReview);
    }
  } catch (error) {
    console.error("[reviewService] Error fetching reviews from database API:", error);
  }
  return [];
}

/**
 * Retrieve cached/initial reviews (returns empty array if none)
 */
export const getStoredReviews = (): Testimonial[] => {
  return [];
};

/**
 * Submit a review to the backend database API and wait for confirmation.
 * The backend automatically broadcasts the real-time event to all connected users.
 */
export const saveReviewToCloud = async (
  review: Omit<Testimonial, "id">
): Promise<Testimonial> => {
  const payload = {
    userName: review.name,
    name: review.name,
    location: review.location || "Verified Traveler",
    rating: review.rating,
    review: review.quote,
    quote: review.quote,
  };

  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = "Failed to save review to the database.";
    try {
      const errJson = await response.json();
      if (errJson?.errors && Array.isArray(errJson.errors)) {
        errorDetail = errJson.errors.join(" ");
      } else if (errJson?.error) {
        errorDetail = errJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const json = await response.json();
  if (!json.success || !json.data) {
    throw new Error("Invalid response received from backend review server.");
  }

  const savedReview = formatReview(json.data);
  savedReview.isNew = true;
  return savedReview;
};

/**
 * Delete a review from the database (admin / user management)
 */
export const deleteReviewFromDatabase = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });
    const json = await response.json();
    return Boolean(json.success);
  } catch (err) {
    console.error("[reviewService] Error deleting review:", err);
    return false;
  }
};

/**
 * Subscribe to reviews:
 * 1. Fetches all existing reviews from the backend database.
 * 2. Listens for real-time WebSocket events from Socket.IO (create, update, delete).
 * 3. Returns an unsubscribe cleanup function.
 */
export const subscribeToReviews = (
  onUpdate: (reviews: Testimonial[]) => void
): (() => void) => {
  let isSubscribed = true;
  let currentReviews: Testimonial[] = [];

  // 1. Initial fetch from database
  fetchReviewsFromDatabase().then((databaseReviews) => {
    if (!isSubscribed) return;
    currentReviews = databaseReviews;
    onUpdate([...currentReviews]);
  });

  // 2. Real-time WebSocket connection
  const socket = getSocket();

  const handleReviewCreated = (incomingReview: any) => {
    if (!isSubscribed) return;
    const formatted = formatReview(incomingReview);

    // Prevent duplicate entries
    const exists = currentReviews.some((r) => r.id === formatted.id);
    if (!exists) {
      currentReviews = [formatted, ...currentReviews];
      onUpdate([...currentReviews]);
    }
  };

  const handleReviewUpdated = (incomingReview: any) => {
    if (!isSubscribed) return;
    const formatted = formatReview(incomingReview);
    currentReviews = currentReviews.map((r) =>
      r.id === formatted.id ? formatted : r
    );
    onUpdate([...currentReviews]);
  };

  const handleReviewDeleted = (payload: { id: string }) => {
    if (!isSubscribed || !payload?.id) return;
    currentReviews = currentReviews.filter((r) => r.id !== String(payload.id));
    onUpdate([...currentReviews]);
  };

  if (socket) {
    socket.on("review:created", handleReviewCreated);
    socket.on("review:updated", handleReviewUpdated);
    socket.on("review:deleted", handleReviewDeleted);
  }

  // 3. Cleanup function
  return () => {
    isSubscribed = false;
    if (socket) {
      socket.off("review:created", handleReviewCreated);
      socket.off("review:updated", handleReviewUpdated);
      socket.off("review:deleted", handleReviewDeleted);
    }
  };
};

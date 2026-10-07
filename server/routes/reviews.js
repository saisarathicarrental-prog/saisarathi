import { Router } from "express";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../db/reviewsDao.js";

const router = Router();

/**
 * Basic sanitize function to prevent stored XSS attacks
 */
function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>]/g, "") // Strip HTML tags
    .trim();
}

/**
 * GET /api/reviews
 * Retrieve all reviews from the database
 */
router.get("/", (req, res) => {
  try {
    const reviews = getAllReviews();
    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("[Reviews API] Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews from database.",
    });
  }
});

/**
 * GET /api/reviews/:id
 * Retrieve a specific review by ID
 */
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const review = getReviewById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found.",
      });
    }
    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("[Reviews API] Error fetching review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch review.",
    });
  }
});

/**
 * POST /api/reviews
 * Insert a new review into the database and broadcast real-time event
 */
router.post("/", (req, res) => {
  try {
    const body = req.body || {};

    // Support both userName/review and name/quote field names
    const rawName = body.userName || body.name;
    const rawReview = body.review || body.quote;
    const rawLocation = body.location;
    const rawRating = body.rating;
    const userId = body.userId || "anonymous_traveler";

    // Validation
    const errors = [];

    if (!rawName || typeof rawName !== "string" || rawName.trim().length < 2) {
      errors.push("Name is required and must be at least 2 characters long.");
    } else if (rawName.trim().length > 100) {
      errors.push("Name cannot exceed 100 characters.");
    }

    if (!rawReview || typeof rawReview !== "string" || rawReview.trim().length < 10) {
      errors.push("Review text is required and must be at least 10 characters long.");
    } else if (rawReview.trim().length > 2000) {
      errors.push("Review text cannot exceed 2000 characters.");
    }

    const parsedRating = Number(rawRating);
    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      errors.push("Rating must be an integer between 1 and 5.");
    }

    if (rawLocation && typeof rawLocation === "string" && rawLocation.trim().length > 100) {
      errors.push("Location cannot exceed 100 characters.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Sanitize
    const userName = sanitizeInput(rawName);
    const reviewText = sanitizeInput(rawReview);
    const location = rawLocation ? sanitizeInput(rawLocation) : "Verified Traveler";

    // Insert into database
    const createdReview = createReview({
      userId,
      userName,
      location,
      rating: parsedRating,
      review: reviewText,
    });

    console.log(`[Reviews API] New review created: ID=${createdReview.id} by ${createdReview.userName}`);

    // Broadcast real-time event via Socket.IO to all connected users
    const io = req.app.get("io");
    if (io) {
      io.emit("review:created", createdReview);
      console.log(`[Socket.IO] Broadcasted review:created event to all connected clients.`);
    }

    res.status(201).json({
      success: true,
      message: "Review successfully saved and broadcasted.",
      data: createdReview,
    });
  } catch (error) {
    console.error("[Reviews API] Error creating review:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while saving review.",
    });
  }
});

/**
 * PUT /api/reviews/:id
 * Update an existing review
 */
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const existing = getReviewById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Review not found.",
      });
    }

    const body = req.body || {};
    const updateData = {};

    if (body.userName || body.name) {
      const name = sanitizeInput(body.userName || body.name);
      if (name.length < 2) {
        return res.status(400).json({ success: false, error: "Name must be at least 2 characters." });
      }
      updateData.userName = name;
    }

    if (body.review || body.quote) {
      const reviewText = sanitizeInput(body.review || body.quote);
      if (reviewText.length < 10) {
        return res.status(400).json({ success: false, error: "Review must be at least 10 characters." });
      }
      updateData.review = reviewText;
    }

    if (body.location !== undefined) {
      updateData.location = sanitizeInput(body.location) || "Verified Traveler";
    }

    if (body.rating !== undefined) {
      const parsedRating = Number(body.rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ success: false, error: "Rating must be between 1 and 5." });
      }
      updateData.rating = parsedRating;
    }

    const updated = updateReview(id, updateData);

    // Broadcast update
    const io = req.app.get("io");
    if (io) {
      io.emit("review:updated", updated);
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[Reviews API] Error updating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update review.",
    });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review from the database
 */
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const existing = getReviewById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Review not found.",
      });
    }

    const deleted = deleteReview(id);
    if (deleted) {
      // Broadcast deletion
      const io = req.app.get("io");
      if (io) {
        io.emit("review:deleted", { id });
      }

      return res.json({
        success: true,
        message: "Review successfully deleted.",
        id,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete review.",
    });
  } catch (error) {
    console.error("[Reviews API] Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete review.",
    });
  }
});

export default router;

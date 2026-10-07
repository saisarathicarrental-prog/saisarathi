import db from "./database.js";

/**
 * Format raw database row to client-friendly review object
 */
export function formatReviewRow(row) {
  if (!row) return null;
  const createdDate = new Date(row.createdAt);
  const dateFormatted = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    name: row.userName, // Alias for backward compatibility with frontend
    location: row.location || "Verified Traveler",
    rating: row.rating,
    review: row.review,
    quote: row.review, // Alias for backward compatibility with frontend
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    date: dateFormatted,
  };
}

/**
 * Retrieve all reviews from the database ordered by createdAt DESC
 */
export function getAllReviews() {
  const stmt = db.prepare(`
    SELECT id, userId, userName, location, rating, review, createdAt, updatedAt
    FROM reviews
    ORDER BY createdAt DESC
  `);
  const rows = stmt.all();
  return rows.map(formatReviewRow);
}

/**
 * Retrieve a single review by ID
 */
export function getReviewById(id) {
  const stmt = db.prepare(`
    SELECT id, userId, userName, location, rating, review, createdAt, updatedAt
    FROM reviews
    WHERE id = ?
  `);
  const row = stmt.get(id);
  return formatReviewRow(row);
}

/**
 * Insert a new review into the database
 */
export function createReview({
  id,
  userId = "anonymous_traveler",
  userName,
  location = "Verified Traveler",
  rating,
  review,
  createdAt,
  updatedAt,
}) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO reviews (id, userId, userName, location, rating, review, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const reviewId =
    id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdTimestamp = createdAt || now;
  const updatedTimestamp = updatedAt || now;

  stmt.run(
    reviewId,
    userId,
    userName,
    location,
    rating,
    review,
    createdTimestamp,
    updatedTimestamp
  );

  return getReviewById(reviewId);
}

/**
 * Update an existing review
 */
export function updateReview(id, { userName, location, rating, review }) {
  const current = getReviewById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const updatedName = userName !== undefined ? userName : current.userName;
  const updatedLocation = location !== undefined ? location : current.location;
  const updatedRating = rating !== undefined ? rating : current.rating;
  const updatedReview = review !== undefined ? review : current.review;

  const stmt = db.prepare(`
    UPDATE reviews
    SET userName = ?, location = ?, rating = ?, review = ?, updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    updatedName,
    updatedLocation,
    updatedRating,
    updatedReview,
    now,
    id
  );

  return getReviewById(id);
}

/**
 * Delete a review by ID
 */
export function deleteReview(id) {
  const stmt = db.prepare(`
    DELETE FROM reviews
    WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Count total reviews in the database
 */
export function countReviews() {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM reviews");
  const result = stmt.get();
  return result.count;
}

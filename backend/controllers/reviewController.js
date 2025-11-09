// reviewController.js
import Review from "../models/Review.js";
import User from "../models/User.js"; // giả sử bạn có model User

export const getReviews = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const filter = restaurantId ? { restaurant_id: restaurantId } : {};
    const reviews = await Review.find(filter);

    // fetch user info cho từng review
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
      const userId = String(review.user_id).toLowerCase();
const user = await User.findOne({ id: userId });

       return {
  ...review.toObject(),
  user_name: user?.hoTen || "Anonymous",
  user_avatar: user?.hinhAnh || "https://i.pravatar.cc/35",
};

      })
    );

    res.json(reviewsWithUser);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
};

import mongoose from "mongoose";
import Review from "@/models/Review";
import Product from "@/models/product";
import Order from "@/models/Order";

/**
 * Review Business Logic Service
 * All review-related business logic extracted from Review model
 */

export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10,
  sortParam: string = "newest",
  userId?: string
) {
  const skip = (page - 1) * limit;

  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

  switch (sortParam) {
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    case "highest":
      sortQuery = { rating: -1, createdAt: -1 };
      break;
    case "lowest":
      sortQuery = { rating: 1, createdAt: -1 };
      break;
    case "helpful":
      sortQuery = { helpfulVotes: -1, createdAt: -1 };
      break;
    case "verified":
      sortQuery = { isVerifiedPurchase: -1, createdAt: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  const reviews = await Review.find({
    productId: new mongoose.Types.ObjectId(productId),
    status: "approved",
  })
    .populate("userId", "name photoURL email")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();

  if (userId && reviews.length > 0) {
    try {
      const UserVote = mongoose.model("UserVote");
      const reviewIds = reviews.map((r: any) => r._id);

      const userVotes = await UserVote.find({
        userId: new mongoose.Types.ObjectId(userId),
        reviewId: { $in: reviewIds },
      }).lean();

      const voteMap = userVotes.reduce((acc: any, vote: any) => {
        acc[vote.reviewId.toString()] = vote.voteType;
        return acc;
      }, {});

      return reviews.map((review: any) => ({
        ...review,
        userVote: voteMap[review._id.toString()] || null,
      }));
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  }

  return reviews.map((review: any) => ({
    ...review,
    userVote: null,
  }));
}

export async function getReviewStats(productId: string) {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingBreakdown: { $push: "$rating" },
          verifiedCount: { $sum: { $cond: ["$isVerifiedPurchase", 1, 0] } },
          totalHelpfulVotes: { $sum: "$helpfulVotes" },
          totalUnhelpfulVotes: { $sum: "$unhelpfulVotes" },
        },
      },
      {
        $addFields: {
          breakdown: {
            5: {
              $size: {
                $filter: {
                  input: "$ratingBreakdown",
                  cond: { $eq: ["$$this", 5] },
                },
              },
            },
            4: {
              $size: {
                $filter: {
                  input: "$ratingBreakdown",
                  cond: { $eq: ["$$this", 4] },
                },
              },
            },
            3: {
              $size: {
                $filter: {
                  input: "$ratingBreakdown",
                  cond: { $eq: ["$$this", 3] },
                },
              },
            },
            2: {
              $size: {
                $filter: {
                  input: "$ratingBreakdown",
                  cond: { $eq: ["$$this", 2] },
                },
              },
            },
            1: {
              $size: {
                $filter: {
                  input: "$ratingBreakdown",
                  cond: { $eq: ["$$this", 1] },
                },
              },
            },
          },
          verifiedPercentage: {
            $cond: {
              if: { $eq: ["$totalReviews", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$verifiedCount", "$totalReviews"] },
                  100,
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          averageRating: { $round: [{ $ifNull: ["$averageRating", 0] }, 1] },
          breakdown: 1,
          verifiedCount: 1,
          verifiedPercentage: {
            $round: [{ $ifNull: ["$verifiedPercentage", 0] }, 1],
          },
          totalHelpfulVotes: 1,
          totalUnhelpfulVotes: 1,
        },
      },
    ]);

    return (
      stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verifiedCount: 0,
        verifiedPercentage: 0,
        totalHelpfulVotes: 0,
        totalUnhelpfulVotes: 0,
      }
    );
  } catch (error) {
    console.error("Error in getReviewStats:", error);
    return {
      totalReviews: 0,
      averageRating: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedCount: 0,
      verifiedPercentage: 0,
      totalHelpfulVotes: 0,
      totalUnhelpfulVotes: 0,
    };
  }
}

export async function approveReview(review: any, moderatorNote?: string) {
  review.status = "approved";
  if (moderatorNote) review.moderatorNote = moderatorNote;
  return review.save();
}

export async function rejectReview(review: any, moderatorNote?: string) {
  review.status = "rejected";
  if (moderatorNote) review.moderatorNote = moderatorNote;
  return review.save();
}

export async function addHelpfulVote(review: any) {
  review.helpfulVotes = (review.helpfulVotes || 0) + 1;
  return review.save();
}

export async function addUnhelpfulVote(review: any) {
  review.unhelpfulVotes = (review.unhelpfulVotes || 0) + 1;
  return review.save();
}

export async function reportReview(review: any) {
  review.reportedCount = (review.reportedCount || 0) + 1;
  if (review.reportedCount >= 5) {
    review.status = "pending";
  }
  return review.save();
}

export async function verifyPurchase(
  orderId: string,
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const order = await Order.findOne({
      _id: orderId,
      userId,
      orderStatus: { $in: ["delivered", "completed"] },
    });

    if (
      order &&
      order.items.some(
        (item: any) => item.productId.toString() === productId.toString()
      )
    ) {
      return true;
    }
  } catch (error) {
    console.error("Error verifying purchase:", error);
  }
  return false;
}

export async function autoApproveReview(review: any): Promise<void> {
  if (review.isVerifiedPurchase && review.status === "pending") {
    review.status = "approved";
  } else if (review.status === "pending") {
    const commentLength = review.comment?.trim().length || 0;
    if (commentLength >= 20 && commentLength <= 500) {
      review.status = "approved";
    }
  }
}

export function validateReviewImages(images: any[]): { valid: boolean; error?: string } {
  if (images && images.length > 5) {
    return { valid: false, error: "Maximum 5 images allowed per review" };
  }
  return { valid: true };
}

export async function updateProductRatings(productId: string): Promise<void> {
  try {
    const stats = await getReviewStats(productId);

    await Product.findByIdAndUpdate(productId, {
      ratings: stats.averageRating,
      "reviews.average": stats.averageRating,
      "reviews.count": stats.totalReviews,
      "reviews.breakdown": stats.breakdown,
    });
  } catch (error) {
    console.error("Error updating product ratings:", error);
  }
}
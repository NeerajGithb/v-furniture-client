import { NextRequest, NextResponse } from "next/server";
import {
  withAuth,
  withOptionalAuth,
  AuthenticatedUser,
} from "@/lib/middleware/auth";
import Review, { IReviewModel } from "@/models/Review";
import Product from "@/models/product";
import Order from "@/models/Order";
import UserVote from "@/models/UserVote";
import { connectDB } from "@/lib/dbConnect";
import { Types } from "mongoose";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
} from "@/lib/cache";

export const GET = withOptionalAuth(
  async (request: NextRequest, user: AuthenticatedUser | null) => {
    try {
      const { searchParams } = new URL(request.url);

      const productId = searchParams.get("productId");
      const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
      const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
      const rating = searchParams.get("rating");

      // ✅ normalize sort
      const rawSort = searchParams.get("sort");
      const sortParam = rawSort?.trim().toLowerCase() || "newest";

      if (!productId || !Types.ObjectId.isValid(productId)) {
        return NextResponse.json(
          { error: "Invalid product ID" },
          { status: 400 },
        );
      }

      const cacheKey = `reviews:${productId}:p${page}_l${limit}_s${sortParam}_r${rating || "all"}`;

      const cached = await getCached<any>(cacheKey);
      if (cached && !user) {
        return NextResponse.json(cached);
      }

      await connectDB();

      const query: any = {
        productId: new Types.ObjectId(productId),
        status: "approved",
      };

      if (rating && rating !== "all") {
        const ratingNum = Number(rating);
        if (ratingNum >= 1 && ratingNum <= 5) {
          query.rating = ratingNum;
        }
      }

      // ✅ strongly typed sort
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
      }

      const skip = (page - 1) * limit;

      const reviews = await Review.find(query)
        .populate("userId", "name photoURL")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

      const totalReviews = await Review.countDocuments(query);
      const totalPages = Math.ceil(totalReviews / limit);
      const stats = await (Review as any).getReviewStats(productId);

      let userHasReviewed = false;
      let userVotes: Record<string, string> = {};

      if (user) {
        const userReview = await Review.findOne({
          userId: new Types.ObjectId(user.userId),
          productId: new Types.ObjectId(productId),
        });
        userHasReviewed = !!userReview;

        if (reviews.length) {
          const votes = await UserVote.find({
            userId: new Types.ObjectId(user.userId),
            reviewId: { $in: reviews.map((r) => r._id) },
          }).lean();

          userVotes = votes.reduce(
            (acc, v) => {
              acc[v.reviewId.toString()] = v.voteType;
              return acc;
            },
            {} as Record<string, string>,
          );
        }
      }

      const responseData = {
        reviews: reviews.map((r: any) => ({
          ...r,
          userVote: userVotes[r._id.toString()] || null,
        })),
        statistics: stats,
        userHasReviewed,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasMore: page < totalPages,
        },
      };

      if (!user) {
        await setCache(cacheKey, responseData, CACHE_TTL.REVIEWS);
      }

      return NextResponse.json(responseData);
    } catch (error) {
      console.error("Reviews GET error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 },
      );
    }
  },
);

export const POST = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();
      const { productId, orderId, rating, title, comment, images } = body;

      if (!productId || !rating || !comment) {
        return NextResponse.json(
          { error: "Product ID, rating, and comment are required" },
          { status: 400 },
        );
      }

      if (!Types.ObjectId.isValid(productId)) {
        return NextResponse.json(
          { error: "Invalid product ID format" },
          { status: 400 },
        );
      }

      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5" },
          { status: 400 },
        );
      }

      if (comment.trim().length < 10) {
        return NextResponse.json(
          { error: "Comment must be at least 10 characters long" },
          { status: 400 },
        );
      }

      await connectDB();

      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const existingReview = await Review.findOne({
        userId: new Types.ObjectId(user.userId),
        productId: new Types.ObjectId(productId),
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 },
        );
      }

      let isVerifiedPurchase = false;
      if (orderId && Types.ObjectId.isValid(orderId)) {
        const order = await Order.findOne({
          _id: new Types.ObjectId(orderId),
          userId: new Types.ObjectId(user.userId),
          orderStatus: "delivered",
        });

        if (
          order &&
          order.items.some(
            (item: any) => item.productId.toString() === productId,
          )
        ) {
          isVerifiedPurchase = true;
        }
      }

      const review = new Review({
        userId: new Types.ObjectId(user.userId),
        productId: new Types.ObjectId(productId),
        orderId:
          orderId && Types.ObjectId.isValid(orderId)
            ? new Types.ObjectId(orderId)
            : undefined,
        rating: ratingNum,
        title: title?.trim() || undefined,
        comment: comment.trim(),
        images: images || [],
        isVerifiedPurchase,
        status: "approved",
      });

      await review.save();

      await review.populate("userId", "name photoURL");

      await Promise.all([
        invalidateCacheByPrefix(`reviews:${productId}`),
        invalidateCacheByPrefix(`product:${productId}`),
        updateProductRating(productId),
      ]);

      return NextResponse.json({
        message: "Review added successfully",
        review: {
          _id: review._id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images: review.images,
          isVerifiedPurchase: review.isVerifiedPurchase,
          helpfulVotes: review.helpfulVotes,
          unhelpfulVotes: review.unhelpfulVotes,
          createdAt: review.createdAt,
          userVote: null,
          user: {
            _id: (review.userId as any)?._id || review.userId,
            name: (review.userId as any)?.name || "User",
            photoURL: (review.userId as any)?.photoURL || null,
          },
        },
      });
    } catch (error) {
      console.error("Review POST error:", error);
      return NextResponse.json(
        { error: "Failed to add review" },
        { status: 500 },
      );
    }
  },
);

async function updateProductRating(productId: string) {
  try {
    await connectDB();
    const stats = await (Review as any).getReviewStats(productId);
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
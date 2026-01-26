import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Inspiration from "@/models/Inspiration";
import Product from "@/models/product";
import Category from "@/models/category";
import SubCategory from "@/models/subcategory";
import { SortOrder } from "mongoose";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
interface PopulatedCategory {
  _id: string;
  name: string;
  slug: string;
}

interface PopulatedSubCategory {
  _id: string;
  name: string;
  slug: string;
}

interface InspirationDoc {
  _id: string;
  slug: string;
  title: string;
  categories: PopulatedCategory[];
}

interface CategoryDoc {
  _id: string;
  name: string;
  slug: string;
}

interface SubCategoryDoc {
  _id: string;
  name: string;
  slug: string;
}

interface ProductDoc {
  _id: string;
  name: string;
  description?: string;
  material?: string;
  tags?: string[];
  finalPrice: number;
  categoryId: PopulatedCategory;
  subCategoryId?: PopulatedSubCategory;
  isPublished?: boolean;
  createdAt: Date;
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */
function normalizeSort(input: string): string {
  switch (input) {
    case "newest":
    case "oldest":
    case "price-low":
    case "price-high":
      return input;
    default:
      return "newest";
  }
}

function getSortOption(sort: string): Record<string, SortOrder> {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "price-low":
      return { finalPrice: 1 };
    case "price-high":
      return { finalPrice: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

/* ------------------------------------------------------------------ */
/* Route */
/* ------------------------------------------------------------------ */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    /* ---------------- Validate inputs ---------------- */
    const slug = searchParams.get("slug")?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      50,
    );

    /* ---------------- Intent detection ---------------- */
    const rawSort = searchParams.get("sort");
    const hasExplicitSort = rawSort !== null && rawSort.trim() !== "";

    const intent = hasExplicitSort ? "sorted" : "related";
    const sort = hasExplicitSort ? normalizeSort(rawSort!.trim()) : "related";

    const sortOption = hasExplicitSort ? getSortOption(sort) : null;

    /* ---------------- Cache key ---------------- */
    const cacheKey = `products:${intent}:${slug}:${limit}:${sort}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    let products: ProductDoc[] = [];
    let searchStrategy = "unknown";

    /* 1️⃣ Inspiration → categories */
    const inspiration = await Inspiration.findOne({ slug })
      .populate<{ categories: PopulatedCategory[] }>(
        "categories",
        "name slug _id",
      )
      .lean<InspirationDoc>()
      .catch(() => null);

    if (inspiration?.categories?.length) {
      searchStrategy = "inspiration";
      const categoryIds = inspiration.categories.map((c) => c._id);
      const perCategoryLimit = Math.ceil(limit / categoryIds.length);

      const results = await Promise.all(
        categoryIds.map((categoryId) => {
          if (sortOption) {
            return Product.find({
              categoryId,
              isPublished: { $ne: false },
            })
              .populate("categoryId", "name slug")
              .populate("subCategoryId", "name slug")
              .sort(sortOption)
              .limit(perCategoryLimit)
              .lean<ProductDoc[]>();
          }

          // Related products → random
          return Product.aggregate([
            { $match: { categoryId, isPublished: { $ne: false } } },
            { $sample: { size: perCategoryLimit } },
          ]);
        }),
      );

      products = results.flat().slice(0, limit);
    }

    /* 2️⃣ Category */
    if (!products.length) {
      const category = await Category.findOne({ slug })
        .lean<CategoryDoc>()
        .catch(() => null);

      if (category) {
        searchStrategy = "category";
        products = await Product.find({
          categoryId: category._id,
          isPublished: { $ne: false },
        })
          .populate("categoryId", "name slug")
          .populate("subCategoryId", "name slug")
          .sort(sortOption || undefined)
          .limit(limit)
          .lean<ProductDoc[]>();
      }
    }

    /* 3️⃣ Subcategory */
    if (!products.length) {
      const subcategory = await SubCategory.findOne({ slug })
        .lean<SubCategoryDoc>()
        .catch(() => null);

      if (subcategory) {
        searchStrategy = "subcategory";
        products = await Product.find({
          subCategoryId: subcategory._id,
          isPublished: { $ne: false },
        })
          .populate("categoryId", "name slug")
          .populate("subCategoryId", "name slug")
          .sort(sortOption || undefined)
          .limit(limit)
          .lean<ProductDoc[]>();
      }
    }

    /* 4️⃣ Fuzzy fallback */
    if (!products.length) {
      searchStrategy = "fuzzy";
      const terms = slug.replace(/-/g, " ").split(" ");
      const regex = new RegExp(terms.join("|"), "i");

      products = await Product.find({
        isPublished: { $ne: false },
        $or: [
          { name: regex },
          { description: regex },
          { material: regex },
          { tags: { $in: terms } },
        ],
      })
        .populate("categoryId", "name slug")
        .populate("subCategoryId", "name slug")
        .sort(sortOption || undefined)
        .limit(limit)
        .lean<ProductDoc[]>();
    }

    /* 5️⃣ Final fallback */
    if (!products.length) {
      searchStrategy = "fallback";
      products = await Product.find({ isPublished: { $ne: false } })
        .populate("categoryId", "name slug")
        .populate("subCategoryId", "name slug")
        .sort(sortOption || undefined)
        .limit(limit)
        .lean<ProductDoc[]>();
    }

    const result = {
      products,
      meta: {
        slug,
        limit,
        intent,
        sort: hasExplicitSort ? sort : null,
        totalFound: products.length,
        searchStrategy,
      },
    };

    await setCache(cacheKey, result, CACHE_TTL.RELATED_PRODUCTS);

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET relatedProduct error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch related products",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/product";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
} from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cacheKey = `product:${id}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    const product = await Product.findById(id)
      .populate("categoryId", "name slug")
      .populate("subCategoryId", "name slug");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await setCache(cacheKey, product, CACHE_TTL.PRODUCT);

    return NextResponse.json(product);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await request.json();

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await Promise.all([
      invalidateCacheByPrefix(`product:${id}`),
      invalidateCacheByPrefix("products:"),
      invalidateCacheByPrefix("relatedProducts:"),
      invalidateCacheByPrefix("categoryProducts:"),
      invalidateCacheByPrefix("showcase:"),
    ]);

    return NextResponse.json(product);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
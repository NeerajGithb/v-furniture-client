// app/api/stats/products/count/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/product";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  const startTime = Date.now();

  try {
    const cacheKey = "stats:products:count";

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    const total = await Product.countDocuments({
      isPublished: { $ne: false },
    });

    const result = {
      entity: "PRODUCT",
      type: "COUNT",
      value: total,
      meta: {
        fetchTime: Date.now() - startTime,
      },
    };

    await setCache(cacheKey, result, CACHE_TTL.STATS);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product count" },
      { status: 500 },
    );
  }
}
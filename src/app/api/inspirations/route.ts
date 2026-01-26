import { connectDB } from "@/lib/dbConnect";
import Inspiration from "@/models/Inspiration";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const keyword = searchParams.get("keyword");

    const cacheKey = `inspirations:${searchParams.toString()}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    const query: any = {};
    if (category) query.categories = category;
    if (tag) query.tags = { $in: [tag] };
    if (keyword) query.keywords = { $in: [keyword] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { keywords: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [inspirations, total] = await Promise.all([
      Inspiration.find(query)
        .populate("categories", "name slug")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inspiration.countDocuments(query),
    ]);

    const result = {
      inspirations: inspirations.map((item) => ({
        ...item,
        imageUrl: item.heroImage?.url,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    await setCache(cacheKey, result, CACHE_TTL.INSPIRATIONS);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspirations" },
      { status: 500 },
    );
  }
}
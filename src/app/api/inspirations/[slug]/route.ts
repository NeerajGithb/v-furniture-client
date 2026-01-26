import { connectDB } from "@/lib/dbConnect";
import { ICategory } from "@/models/category";
import Inspiration, { IInspiration } from "@/models/Inspiration";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

type PopulatedInspiration = Omit<IInspiration, "categories"> & {
  categories: ICategory[];
};

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const cacheKey = `inspiration:${slug}`;

    const cached = await getCached<PopulatedInspiration & { imageUrl: string }>(
      cacheKey,
    );
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    await connectDB();

    const inspiration = await Inspiration.findOne({ slug })
      .populate({
        path: "categories",
        select: "_id name slug mainImage",
        model: "Category",
      })
      .lean<PopulatedInspiration>();

    if (!inspiration) {
      return NextResponse.json(
        { error: "Inspiration not found" },
        { status: 404 },
      );
    }

    const transformed: PopulatedInspiration & { imageUrl: string } = {
      ...inspiration,
      categories: inspiration.categories ?? [],
      imageUrl: inspiration.heroImage?.url || "",
    };

    await setCache(cacheKey, transformed, CACHE_TTL.INSPIRATION);

    return NextResponse.json(transformed, { status: 200 });
  } catch (err) {
    console.error("GET Inspiration error:", err);
    return NextResponse.json(
      { error: "Failed to fetch inspiration" },
      { status: 500 },
    );
  }
}
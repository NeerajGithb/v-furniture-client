import {
  IInspirationsRepository,
  PaginationOptions,
  PaginatedResult,
  Inspiration,
  RelatedProductsResult,
} from "./IInspirationsRepository";
import { InspirationNotFoundError } from "./InspirationsErrors";
import { InspirationsFilterRequest } from "./InspirationsSchemas";
import { Product } from "@/types/Product";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import InspirationModel from "@/models/Inspiration";
import ProductModel from "@/models/product";
import CategoryModel from "@/models/category";
import SubCategoryModel from "@/models/subcategory";
import { SortOrder } from "mongoose";

export class InspirationsRepository implements IInspirationsRepository {
  async findBySlug(slug: string): Promise<Inspiration> {
    const inspiration = await InspirationModel.findOne({ slug })
      .populate({
        path: "categories",
        select: "_id name slug mainImage",
        model: "Category",
      })
      .lean();

    if (!inspiration) {
      throw new InspirationNotFoundError(slug);
    }

    return this.mapToInspiration(inspiration);
  }

  async findWithFilters(
    filters: InspirationsFilterRequest,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Inspiration>> {
    const query = this.buildQuery(filters);
    const skip = (pagination.page - 1) * pagination.limit;

    const [inspirations, total] = await Promise.all([
      InspirationModel.find(query)
        .populate({
          path: "categories",
          select: "_id name slug mainImage",
          model: "Category",
        })
        .sort({ name: 1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      InspirationModel.countDocuments(query),
    ]);

    return {
      items: safeMapList(inspirations, this.mapToInspiration.bind(this), "inspiration"),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page < Math.ceil(total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    };
  }

  async findRelatedProducts(
    slug: string,
    limit: number,
    sort?: string,
  ): Promise<RelatedProductsResult> {
    const hasExplicitSort = sort !== undefined;
    const intent = hasExplicitSort ? "sorted" : "related";
    const sortOption = hasExplicitSort ? this.getSortOption(sort) : null;

    let products: any[] = [];
    let searchStrategy = "unknown";

    // Try inspiration → categories
    const inspiration = await InspirationModel.findOne({ slug })
      .populate("categories", "_id name slug mainImage")
      .lean();

    if ((inspiration as any)?.categories?.length) {
      searchStrategy = "inspiration";
      const categoryIds = ((inspiration as any).categories as any[]).map((c: any) => c._id);
      const perCategoryLimit = Math.ceil(limit / categoryIds.length);

      const results = await Promise.all(
        categoryIds.map((categoryId: any) => {
          if (sortOption) {
            return ProductModel.find({
              categoryId,
              isPublished: { $ne: false },
              status: "APPROVED",
              inStockQuantity: { $gt: 0 },
            })
              .populate("categoryId", "_id name slug")
              .populate("subCategoryId", "_id name slug")
              .sort(sortOption)
              .limit(perCategoryLimit)
              .lean();
          }

          return ProductModel.aggregate([
            {
              $match: {
                categoryId,
                isPublished: { $ne: false },
                status: "APPROVED",
                inStockQuantity: { $gt: 0 },
              },
            },
            { $sample: { size: perCategoryLimit } },
          ]);
        }),
      );

      products = results.flat().slice(0, limit);
    }

    // Try category
    if (!products.length) {
      const category = await CategoryModel.findOne({ slug }).lean();

      if (category) {
        searchStrategy = "category";
        products = await ProductModel.find({
          categoryId: (category as any)._id,
          isPublished: { $ne: false },
          status: "APPROVED",
          inStockQuantity: { $gt: 0 },
        })
          .populate("categoryId", "_id name slug")
          .populate("subCategoryId", "_id name slug")
          .sort(sortOption || undefined)
          .limit(limit)
          .lean();
      }
    }

    // Try subcategory
    if (!products.length) {
      const subcategory = await SubCategoryModel.findOne({ slug }).lean();

      if (subcategory) {
        searchStrategy = "subcategory";
        products = await ProductModel.find({
          subCategoryId: (subcategory as any)._id,
          isPublished: { $ne: false },
          status: "APPROVED",
          inStockQuantity: { $gt: 0 },
        })
          .populate("categoryId", "_id name slug")
          .populate("subCategoryId", "_id name slug")
          .sort(sortOption || undefined)
          .limit(limit)
          .lean();
      }
    }

    // Fuzzy fallback
    if (!products.length) {
      searchStrategy = "fuzzy";
      const terms = slug.replace(/-/g, " ").split(" ");
      const regex = new RegExp(terms.join("|"), "i");

      products = await ProductModel.find({
        isPublished: { $ne: false },
        status: "APPROVED",
        inStockQuantity: { $gt: 0 },
        $or: [
          { name: regex },
          { description: regex },
          { material: regex },
          { tags: { $in: terms } },
        ],
      })
        .populate("categoryId", "_id name slug")
        .populate("subCategoryId", "_id name slug")
        .sort(sortOption || undefined)
        .limit(limit)
        .lean();
    }

    // Final fallback
    if (!products.length) {
      searchStrategy = "fallback";
      products = await ProductModel.find({
        isPublished: { $ne: false },
        status: "APPROVED",
        inStockQuantity: { $gt: 0 },
      })
        .populate("categoryId", "_id name slug")
        .populate("subCategoryId", "_id name slug")
        .sort(sortOption || undefined)
        .limit(limit)
        .lean();
    }

    return {
      products: safeMapList(products, this.mapToProduct.bind(this), "product"),
      meta: {
        slug,
        limit,
        intent,
        sort: hasExplicitSort ? sort : null,
        totalFound: products.length,
        searchStrategy,
      },
    };
  }

  private buildQuery(filters: InspirationsFilterRequest): any {
    const query: any = {};

    if (filters.category) {
      query.categories = filters.category;
    }

    if (filters.tag) {
      query.tags = { $in: [filters.tag] };
    }

    if (filters.keyword) {
      query.keywords = { $in: [filters.keyword] };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } },
        { keywords: { $in: [new RegExp(filters.search, "i")] } },
      ];
    }

    return query;
  }

  private getSortOption(sort: string): Record<string, SortOrder> {
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

  private mapToInspiration(db: any): Inspiration {
    validateRequiredFields(db, ["_id"], "inspiration");

    const { tags, keywords, createdAt, updatedAt, __v, ...frontendData } = db;

    return {
      ...frontendData,
      _id: db._id.toString(),
      categories: safeMapList(
        db.categories || [],
        (c: any) => {
          validateRequiredFields(c, ["_id", "name", "slug"], "category");
          return {
            _id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            mainImage: c.mainImage || null,
          };
        },
        "category",
      ),
      imageUrl: db.heroImage?.url || "",
    };
  }

  private mapToProduct(db: any): Product {
    validateRequiredFields(db, ["_id"], "product");

    return {
      ...db,
      _id: db._id.toString(),
      categoryId: db.categoryId
        ? {
            ...db.categoryId,
            _id: db.categoryId._id?.toString() || "",
          }
        : undefined,
      subCategoryId: db.subCategoryId
        ? {
            ...db.subCategoryId,
            _id: db.subCategoryId._id?.toString() || "",
          }
        : undefined,
    };
  }
}
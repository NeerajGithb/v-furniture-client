import {
  ICategoriesRepository,
  Category,
  Subcategory,
  CategoryWithProducts,
} from "./ICategoriesRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { CategoryNotFoundError } from "./CategoriesErrors";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import CategoryModel from "@/models/category";
import SubCategoryModel from "@/models/subcategory";
import ProductModel from "@/models/product";

export class CategoriesRepository implements ICategoriesRepository {
  // Find all categories sorted by name
  async findAllCategories(): Promise<Category[]> {
    try {
      const categories = await CategoryModel.find()
        .sort({ name: 1 })
        .lean<Category[]>();

      return safeMapList(
        categories,
        this.mapCategoryFromDb.bind(this),
        "category",
      );
    } catch (error) {
      throw new RepositoryError("Failed to fetch categories", error as Error);
    }
  }

  // Find all subcategories with populated category data
  async findAllSubcategories(): Promise<Subcategory[]> {
    try {
      const subcategories = await SubCategoryModel.find({
        categoryId: { $exists: true, $ne: null },
      })
        .populate({
          path: "categoryId",
          select: "_id name slug",
          match: { _id: { $exists: true } },
        })
        .sort({ name: 1 })
        .lean<any[]>();

      // Filter out subcategories where populate failed (categoryId exists but category doesn't)
      const validSubcategories = subcategories.filter(
        (sub) => sub.categoryId && sub.categoryId.name,
      );

      return safeMapList(
        validSubcategories,
        this.mapSubcategoryFromDb.bind(this),
        "subcategory",
      );
    } catch (error) {
      throw new RepositoryError(
        "Failed to fetch subcategories",
        error as Error,
      );
    }
  }

  // Find category by slug with associated products
  async findCategoryBySlugWithProducts(
    slug: string,
    productLimit: number = 20,
  ): Promise<CategoryWithProducts> {
    try {
      const category = await CategoryModel.findOne({ slug }).lean<Category>();

      if (!category) {
        throw new CategoryNotFoundError(slug);
      }

      const products = await ProductModel.find({
        categoryId: category._id,
        isPublished: true,
        status: "APPROVED",
      })
        .select("name slug finalPrice mainImage inStockQuantity")
        .limit(productLimit)
        .lean();

      const validProducts = safeMapList(
        products,
        (product: any) => {
          if (!product._id || !product.name || !product.slug) {
            throw new Error(`Invalid product data: ${product._id}`);
          }
          return {
            _id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            finalPrice: product.finalPrice,
            mainImage: product.mainImage,
            inStockQuantity: product.inStockQuantity,
          };
        },
        "product",
      );

      return {
        ...this.mapCategoryFromDb(category),
        products: validProducts,
        productCount: validProducts.length,
      };
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof CategoryNotFoundError) {
        throw error;
      }
      throw new RepositoryError(
        "Failed to fetch category with products",
        error as Error,
      );
    }
  }

  // Map database category to domain type
  private mapCategoryFromDb(db: any): Category {
    validateRequiredFields(db, ["_id", "name", "slug"], "category");

    if (!db.mainImage?.url || !db.mainImage?.alt) {
      throw new Error(`Category ${db._id} missing required mainImage data`);
    }

    return {
      _id: db._id.toString(),
      name: db.name,
      slug: db.slug,
      mainImage: {
        url: db.mainImage.url,
        alt: db.mainImage.alt,
      },
      description: db.description ?? "",
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }

  // Map database subcategory to domain type
  private mapSubcategoryFromDb(db: any): Subcategory {
    validateRequiredFields(db, ["_id", "name", "slug"], "subcategory");

    const category = db.categoryId;
    validateRequiredFields(category, ["_id", "name", "slug"], "category");

    return {
      _id: db._id.toString(),
      name: db.name,
      slug: db.slug,
      categoryId: category._id.toString(),
      mainImage: db.mainImage
        ? {
            url: db.mainImage.url,
            alt: db.mainImage.alt,
          }
        : undefined,
      description: db.description ?? "",
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
      },
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }

  // Find paginated categories
  async findPaginatedCategories(
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;

      const [categories, total] = await Promise.all([
        CategoryModel.find()
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .lean<Category[]>(),
        CategoryModel.countDocuments(),
      ]);

      const validCategories = safeMapList(
        categories,
        this.mapCategoryFromDb.bind(this),
        "category",
      );

      return {
        categories: validCategories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new RepositoryError(
        "Failed to fetch paginated categories",
        error as Error,
      );
    }
  }

  // Find paginated subcategories
  async findPaginatedSubcategories(
    page: number = 1,
    limit: number = 100,
  ): Promise<{
    subcategories: Subcategory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;

      const [subcategories, total] = await Promise.all([
        SubCategoryModel.find({
          categoryId: { $exists: true, $ne: null },
        })
          .populate({
            path: "categoryId",
            select: "_id name slug",
            match: { _id: { $exists: true } },
          })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .lean<any[]>(),
        SubCategoryModel.countDocuments({
          categoryId: { $exists: true, $ne: null },
        }),
      ]);

      // Filter out subcategories where populate failed
      const validSubcategories = subcategories.filter(
        (sub) => sub.categoryId && sub.categoryId.name,
      );
      const mappedSubcategories = safeMapList(
        validSubcategories,
        this.mapSubcategoryFromDb.bind(this),
        "subcategory",
      );

      return {
        subcategories: mappedSubcategories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new RepositoryError(
        "Failed to fetch paginated subcategories",
        error as Error,
      );
    }
  }
}

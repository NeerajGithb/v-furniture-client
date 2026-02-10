import {
  IProductsRepository,
  PaginationOptions,
  PaginatedResult,
  ProductsFilters,
  ProductsByCategory,
} from "./IProductsRepository";
import { ProductNotFoundError } from "./ProductsErrors";
import { ProductsFilterRequest } from "./ProductsSchemas";
import { Product } from "@/types/Product";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import ProductModel from "@/models/product";
import CategoryModel from "@/models/category";
import SubCategoryModel from "@/models/subcategory";
import InspirationModel from "@/models/Inspiration";

export class ProductsRepository implements IProductsRepository {
  // Find product by ID
  async findById(id: string): Promise<Product> {
    // First try with full query (status and isPublished)
    let product = await ProductModel.findOne({
      _id: id,
      $or: [
        { status: "APPROVED" },
        { status: { $exists: false } } // Handle products without status field
      ],
      isPublished: true,
    })
      .populate("categoryId", "_id name slug")
      .populate("subCategoryId", "_id name slug")
      .populate({
        path: "sellerId",
        select:
          "businessName contactPerson address rating totalSales totalProducts verified status createdAt",
      })
      .lean();

    // Fallback: if no product found, try with just ID (for products without status/isPublished fields)
    if (!product) {
      product = await ProductModel.findById(id)
        .populate("categoryId", "_id name slug")
        .populate("subCategoryId", "_id name slug")
        .populate({
          path: "sellerId",
          select:
            "businessName contactPerson address rating totalSales totalProducts verified status createdAt",
        })
        .lean();
    }

    if (!product) {
      throw new ProductNotFoundError(id);
    }

    return this.mapToProduct(product);
  }

  // Find product by slug
  async findBySlug(slug: string): Promise<Product> {
    // First try with full query (status and isPublished)
    let product = await ProductModel.findOne({
      slug: slug,
      $or: [
        { status: "APPROVED" },
        { status: { $exists: false } } // Handle products without status field
      ],
      isPublished: true,
    })
      .populate("categoryId", "_id name slug")
      .populate("subCategoryId", "_id name slug")
      .populate({
        path: "sellerId",
        select:
          "businessName contactPerson address rating totalSales totalProducts verified status createdAt",
      })
      .lean();

    // Fallback: if no product found, try with just slug (for products without status/isPublished fields)
    if (!product) {
      product = await ProductModel.findOne({ slug: slug })
        .populate("categoryId", "_id name slug")
        .populate("subCategoryId", "_id name slug")
        .lean();
    }

    if (!product) {
      throw new ProductNotFoundError(slug);
    }

    return this.mapToProduct(product);
  }

  // Find products with filters and pagination
  async findWithFilters(
    filters: ProductsFilterRequest,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Product>> {
    const query = await this.buildQuery(filters);
    const sortQuery = this.buildSortQuery(filters.sort || "newest");

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .select(
          "_id name finalPrice originalPrice discountPercent mainImage reviews inStockQuantity material dimensions isNewArrival isBestSeller",
        )
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .sort(sortQuery)
        .lean()
        .exec(),
      ProductModel.countDocuments(query),
    ]);

    return {
      items: safeMapList(
        products,
        this.mapToProductMinimal.bind(this),
        "product",
      ),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  // Get popular/best-selling products
  async findPopularProducts(limit: number = 20): Promise<Product[]> {
    const products = await ProductModel.find({
      isPublished: { $ne: false },
      status: "APPROVED",
      $or: [
        { isBestSeller: true },
        { isNewArrival: true },
        { "reviews.average": { $gte: 4 } }
      ]
    })
      .select(
        "_id name finalPrice originalPrice discountPercent mainImage reviews inStockQuantity material dimensions isNewArrival isBestSeller",
      )
      .limit(limit)
      .sort({ "reviews.average": -1, isBestSeller: -1, createdAt: -1 })
      .lean()
      .exec();

    return safeMapList(
      products,
      this.mapToProductMinimal.bind(this),
      "product",
    );
  }

  // Get products by category ID
  async findByCategoryId(categoryId: string, limit: number = 20): Promise<Product[]> {
    const products = await ProductModel.find({
      categoryId,
      isPublished: { $ne: false },
      status: "APPROVED",
      $or: [
        { isBestSeller: true },
        { isNewArrival: true },
        { "reviews.average": { $gte: 4 } }
      ]
    })
      .select(
        "_id name finalPrice originalPrice discountPercent mainImage reviews inStockQuantity material dimensions isNewArrival isBestSeller",
      )
      .limit(limit)
      .sort({ "reviews.average": -1, isBestSeller: -1, createdAt: -1 })
      .lean()
      .exec();

    return safeMapList(
      products,
      this.mapToProductMinimal.bind(this),
      "product",
    );
  }

  // Get subcategory with parent category info
  async findSubcategoryWithCategory(slug: string): Promise<{ subcategory: any; category: any } | null> {
    const subcategory = await SubCategoryModel.findOne({ slug })
      .populate('categoryId', 'slug name _id')
      .lean();

    if (!subcategory || !(subcategory as any).categoryId) {
      return null;
    }

    return {
      subcategory,
      category: (subcategory as any).categoryId
    };
  }

  // Count all products
  async countAll(): Promise<number> {
    return await ProductModel.countDocuments({
      isPublished: { $ne: false },
      status: "APPROVED",
    });
  }

  // Count products with filters
  async countWithFilters(filters: ProductsFilterRequest): Promise<number> {
    const query = await this.buildQuery(filters);
    return await ProductModel.countDocuments(query);
  }

  // Find showcase products
  async findShowcaseProducts(limit: number = 50): Promise<Product[]> {
    const products = await ProductModel.find({
      isPublished: { $ne: false },
      status: "APPROVED",
      inStockQuantity: { $gt: 0 },
    })
      .select(
        "_id name finalPrice originalPrice discountPercent mainImage reviews inStockQuantity material dimensions isNewArrival isBestSeller",
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const mappedProducts = safeMapList(
      products,
      this.mapToProductMinimal.bind(this),
      "product",
    );
    return this.selectDiverseProducts(mappedProducts, limit);
  }

  // Find showcase products by category
  async findShowcaseByCategory(
    categoryId: string,
    limit: number = 50,
  ): Promise<Product[]> {
    const products = await ProductModel.find({
      categoryId,
      isPublished: { $ne: false },
      status: "APPROVED",
      inStockQuantity: { $gt: 0 },
    })
      .select(
        "_id name finalPrice originalPrice discountPercent mainImage reviews inStockQuantity material dimensions isNewArrival isBestSeller",
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const mappedProducts = safeMapList(
      products,
      this.mapToProductMinimal.bind(this),
      "product",
    );
    return this.selectDiverseProducts(mappedProducts, limit);
  }

  // Find products grouped by category
  async findGroupedByCategory(
    filters: ProductsFilterRequest,
    productsPerCategory: number,
  ): Promise<ProductsByCategory[]> {
    const categories = await CategoryModel.find({})
      .select("name slug _id")
      .lean();
    if (!categories || categories.length === 0) {
      return [];
    }

    const baseQuery = await this.buildQuery(filters);
    const sortQuery = this.buildSortQuery(filters.sort || "newest");

    const productsByCategory = await Promise.all(
      categories.map(async (category) => {
        const categoryQuery = {
          ...baseQuery,
          categoryId: category._id,
        };

        const [products, totalInCategory] = await Promise.all([
          ProductModel.find(categoryQuery)
            .select(
              "_id name finalPrice originalPrice discountPercent mainImage reviews inStockQuantity material dimensions isNewArrival isBestSeller",
            )
            .sort(sortQuery)
            .limit(productsPerCategory)
            .lean()
            .exec(),
          ProductModel.countDocuments(categoryQuery),
        ]);

        return {
          category: {
            _id: (category._id as any).toString(),
            name: category.name,
            slug: category.slug,
          },
          products: safeMapList(
            products,
            this.mapToProductMinimal.bind(this),
            "product",
          ),
          totalInCategory,
          hasMore: totalInCategory > productsPerCategory,
        };
      }),
    );

    return productsByCategory.filter((item) => item.products.length > 0);
  }

  // Get filters metadata based on current filters (for dynamic filtering)
  async getFiltersMetadata(): Promise<ProductsFilters> {
    const [materials, priceStats] = await Promise.all([
      ProductModel.distinct("material", {
        material: { $nin: [null, "", undefined] },
        isPublished: { $ne: false },
        status: "APPROVED",
      }),
      ProductModel.aggregate([
        { $match: { isPublished: { $ne: false }, status: "APPROVED" } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$finalPrice" },
            maxPrice: { $max: "$finalPrice" },
          },
        },
      ]),
    ]);

    return {
      materials: (materials || [])
        .filter((m) => m && typeof m === "string")
        .sort(),
      priceRange:
        priceStats.length > 0
          ? {
              minPrice: priceStats[0].minPrice || 0,
              maxPrice: priceStats[0].maxPrice || 100000,
            }
          : { minPrice: 0, maxPrice: 100000 },
    };
  }

  // Get filters metadata based on applied filters (dynamic filtering)
  async getFiltersMetadataForQuery(filters: ProductsFilterRequest): Promise<ProductsFilters & { appliedFilters: any }> {
    // Build base query without price and material filters to get available options
    const baseQuery = await this.buildQuery({ 
      ...filters, 
      material: undefined,
      minPrice: undefined,
      maxPrice: undefined
    });

    const materials = await ProductModel.distinct("material", {
      ...baseQuery,
      material: { $nin: [null, "", undefined] },
    });

    // Auto-detect parent category if subcategory is provided
    let detectedCategory = filters.category;
    if (filters.subcategory && !filters.category) {
      const subcategoryInfo = await this.findSubcategoryWithCategory(filters.subcategory);
      if (subcategoryInfo) {
        detectedCategory = subcategoryInfo.category.slug;
      }
    }

    return {
      materials: (materials || [])
        .filter((m) => m && typeof m === "string")
        .sort(),
      priceRange: { minPrice: 0, maxPrice: 100000 }, // Always full range for slider
      appliedFilters: {
        category: detectedCategory || null,
        subcategory: filters.subcategory || null,
        material: filters.material || null,
        minPrice: filters.minPrice || null,
        maxPrice: filters.maxPrice || null,
        inStock: filters.inStock || null,
        onSale: filters.onSale || null,
        discount: filters.discount || null,
        sort: filters.sort || "newest",
      }
    };
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    try {
      // Fire and forget - don't wait for completion
      ProductModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(
        () => {
          // Silently ignore errors for analytics
        },
      );
    } catch (error) {
      // Silently ignore errors for analytics
    }
  }

  // Validate category exists
  async validateCategoryExists(slug: string): Promise<string | null> {
    const category = await CategoryModel.findOne({ slug }).lean();
    return category ? (category as any)._id.toString() : null;
  }

  // Validate subcategory exists
  async validateSubcategoryExists(slug: string): Promise<string | null> {
    const subcategory = await SubCategoryModel.findOne({ slug }).lean();
    return subcategory ? (subcategory as any)._id.toString() : null;
  }

  // Get inspiration slug by category
  async getInspirationSlugByCategory(
    categoryId: string,
  ): Promise<string | null> {
    const inspiration = await InspirationModel.findOne({
      categories: categoryId,
    })
      .select("slug")
      .lean()
      .exec();

    return (inspiration as any)?.slug || null;
  }

  // Private helper methods
  private async buildQuery(filters: ProductsFilterRequest): Promise<any> {
    const query: any = {
      $or: [
        { 
          status: "APPROVED",
          isPublished: { $ne: false }
        },
        { 
          status: { $exists: false },
          isPublished: { $ne: false }
        },
        {
          status: { $exists: false },
          isPublished: { $exists: false }
        }
      ]
    };

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.finalPrice = {};
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        query.finalPrice.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        query.finalPrice.$lte = filters.maxPrice;
      }
    }

    // Category
    if (filters.category) {
      const categoryId = await this.validateCategoryExists(filters.category);
      if (categoryId) {
        query.categoryId = categoryId;
      } else {
        // Return query that matches nothing
        query._id = { $in: [] };
      }
    }

    // Subcategory
    if (filters.subcategory) {
      const subcategoryId = await this.validateSubcategoryExists(
        filters.subcategory,
      );
      if (subcategoryId) {
        query.subCategoryId = subcategoryId;
      } else {
        // Return query that matches nothing
        query._id = { $in: [] };
      }
    }

    // Material - match slug against available materials
    if (filters.material) {
      // Get all available materials first
      const availableMaterials = await ProductModel.distinct("material", {
        material: { $nin: [null, "", undefined] },
        isPublished: { $ne: false },
        status: "APPROVED",
      });
      
      // Find the material that matches the slug
      const matchingMaterial = availableMaterials.find((material: string) => {
        if (!material) return false;
        const materialSlug = material.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        return materialSlug === filters.material;
      });
      
      if (matchingMaterial) {
        query.material = { $regex: matchingMaterial, $options: "i" };
      } else {
        // If no exact match found, return query that matches nothing
        query._id = { $in: [] };
      }
    }

    // In stock
    if (filters.inStock) {
      query.inStockQuantity = { $gt: 0 };
    }

    // On sale
    if (filters.onSale) {
      query.discountPercent = { $gt: 0 };
    }

    // Discount
    if (filters.discount !== undefined && filters.discount > 0) {
      query.discountPercent = { $gte: filters.discount };
    }

    return query;
  }

  private buildSortQuery(sort: string): any {
    switch (sort) {
      case "price-low":
        return { finalPrice: 1, createdAt: -1 };
      case "price-high":
        return { finalPrice: -1, createdAt: -1 };
      case "name-asc":
        return { name: 1, createdAt: -1 };
      case "name-desc":
        return { name: -1, createdAt: -1 };
      case "rating":
        return { ratings: -1, "reviews.average": -1, createdAt: -1 };
      case "discount":
        return { discountPercent: -1, createdAt: -1 };
      case "newest":
      default:
        return { createdAt: -1 };
    }
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

  private mapToProductMinimal(db: any): any {
    validateRequiredFields(db, ["_id"], "product");

    return {
      _id: db._id.toString(),
      name: db.name,
      finalPrice: db.finalPrice,
      originalPrice: db.originalPrice,
      discountPercent: db.discountPercent,
      mainImage: db.mainImage,
      reviews: db.reviews,
      inStockQuantity: db.inStockQuantity,
      material: db.material,
      dimensions: db.dimensions,
      isNewArrival: db.isNewArrival,
      isBestSeller: db.isBestSeller,
    };
  }

  private selectDiverseProducts(
    products: Product[],
    maxCount: number = 50,
  ): Product[] {
    if (products.length <= maxCount) return products;

    const selected: Product[] = [];
    const usedCategories = new Map<string, number>();
    const usedSubCategories = new Map<string, number>();
    const usedMaterials = new Map<string, number>();

    // First pass: select diverse products
    for (const product of products) {
      if (selected.length >= maxCount) break;

      const categoryKey = product.categoryId?._id?.toString() || "";
      const subCategoryKey = product.subCategoryId?._id?.toString() || "";
      const materialKey = product.material?.toLowerCase() || "";

      const categoryCount = usedCategories.get(categoryKey) || 0;
      const subCategoryCount = usedSubCategories.get(subCategoryKey) || 0;
      const materialCount = usedMaterials.get(materialKey) || 0;

      if (categoryCount < 3 && subCategoryCount < 2 && materialCount < 4) {
        selected.push(product);

        usedCategories.set(categoryKey, categoryCount + 1);
        usedSubCategories.set(subCategoryKey, subCategoryCount + 1);
        usedMaterials.set(materialKey, materialCount + 1);
      }
    }

    // Second pass: fill remaining slots
    const remainingSlots = maxCount - selected.length;
    if (remainingSlots > 0) {
      const remaining = products.filter(
        (p) => !selected.find((s) => s._id === p._id),
      );

      for (
        let i = 0;
        i < remaining.length && selected.length < maxCount;
        i += Math.ceil(remaining.length / remainingSlots)
      ) {
        selected.push(remaining[i]);
      }
    }

    return selected.slice(0, maxCount);
  }
}
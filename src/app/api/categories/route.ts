import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { categoriesService } from "@/lib/domain/categories/CategoriesService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50"); // Default limit for categories

    // For backward compatibility, if no pagination params provided, return all
    if (!searchParams.has("page") && !searchParams.has("limit")) {
      const categories = await categoriesService.getAllCategories();
      return ApiResponseBuilder.success(categories);
    }

    // Return paginated categories
    const result = await categoriesService.getPaginatedCategories(page, limit);
    return ApiResponseBuilder.paginated(result.categories, result.pagination);
  }),
);

import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { categoriesService } from "@/lib/domain/categories/CategoriesService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100"); // Default limit for subcategories

    // For backward compatibility, if no pagination params provided, return all
    if (!searchParams.has("page") && !searchParams.has("limit")) {
      const subcategories = await categoriesService.getAllSubcategories();
      return ApiResponseBuilder.success(subcategories);
    }

    // Return paginated subcategories
    const result = await categoriesService.getPaginatedSubcategories(
      page,
      limit,
    );
    return ApiResponseBuilder.paginated(
      result.subcategories,
      result.pagination,
    );
  }),
);

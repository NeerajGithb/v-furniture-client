import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { categoriesService } from "@/lib/domain/categories/CategoriesService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withDB(
  withRouteErrorHandling(
    async (
      _request: Request,
      { params }: { params: Promise<{ slug: string }> },
    ) => {
      const { slug } = await params;
      const category = await categoriesService.getCategoryBySlug({ slug });
      return ApiResponseBuilder.success(category);
    },
  ),
);

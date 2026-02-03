export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { searchService } from "@/lib/domain/search/SearchService";
import { AutocompleteQuerySchema } from "@/lib/domain/search/SearchSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // Validate query parameters at route boundary
    const query = AutocompleteQuerySchema.parse({
      q: searchParams.get("q")?.trim() || "",
    });

    // Handle short query case
    if (query.q.length < 2) {
      return ApiResponseBuilder.success({ autocomplete: [] });
    }

    // Service handles caching internally
    const result = await searchService.getAutocomplete(query);
    return ApiResponseBuilder.success(result);
  }),
);

/**
 * Reusable helper for safe mapping with error handling
 * Filters out invalid records instead of crashing the entire operation
 */
export function safeMapList<TDb, TDomain>(
  items: TDb[],
  mapper: (item: TDb) => TDomain,
  label: string,
): TDomain[] {
  return items.flatMap((item: any) => {
    try {
      return mapper(item);
    } catch (e) {
      return [];
    }
  });
}

/**
 * Safe mapper for single item with validation
 * Throws error if item is invalid, use with safeMapList for collections
 */
export function validateRequiredFields<T extends object>(
  item: T,
  requiredFields: (keyof T)[],
  entityName: string,
): void {
  const missingFields = requiredFields.filter(
    (field) => item?.[field] === undefined || item?.[field] === null,
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Invalid ${entityName} data: missing ${missingFields.join(", ")} (id: ${(item as any)?._id})`,
    );
  }
}

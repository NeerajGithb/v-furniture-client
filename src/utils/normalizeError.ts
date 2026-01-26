// src/utils/normalizeError.ts
export function normalizeError(err: unknown) {
  if (err instanceof Error) {
    return {
      status: 500,
      body: undefined,
      message: err.message,
    };
  }

  if (typeof err === "object" && err !== null && "status" in err) {
    const e = err as any;
    return {
      status: typeof e.status === "number" ? e.status : 500,
      body: e.body,
      message: e.body?.message ?? "Request failed",
    };
  }

  return {
    status: 500,
    body: undefined,
    message: "Unknown error",
  };
}
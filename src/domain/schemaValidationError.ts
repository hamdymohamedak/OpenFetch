import type { StandardSchemaV1Issue } from "./standardSchema.js";

/**
 * Thrown when {@link OpenFetchConfig.jsonSchema} / fluent `.json(schema)` validation fails.
 * Does not extend {@link OpenFetchError} — the HTTP round-trip succeeded; the schema rejected the payload.
 */
export class SchemaValidationError extends Error {
  override name = "SchemaValidationError" as const;
  readonly issues: readonly StandardSchemaV1Issue[];

  constructor(issues: readonly StandardSchemaV1Issue[]) {
    super("Response schema validation failed");
    this.issues = issues;
  }
}

export function isSchemaValidationError(
  err: unknown
): err is SchemaValidationError {
  return err instanceof SchemaValidationError;
}

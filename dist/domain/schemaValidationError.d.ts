import type { StandardSchemaV1Issue } from "./standardSchema.js";
/**
 * Thrown when {@link OpenFetchConfig.jsonSchema} / fluent `.json(schema)` validation fails.
 * Does not extend {@link OpenFetchError} — the HTTP round-trip succeeded; the schema rejected the payload.
 */
export declare class SchemaValidationError extends Error {
    name: "SchemaValidationError";
    readonly issues: readonly StandardSchemaV1Issue[];
    constructor(issues: readonly StandardSchemaV1Issue[]);
}
export declare function isSchemaValidationError(err: unknown): err is SchemaValidationError;
//# sourceMappingURL=schemaValidationError.d.ts.map
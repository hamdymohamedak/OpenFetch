/**
 * Thrown when {@link OpenFetchConfig.jsonSchema} / fluent `.json(schema)` validation fails.
 * Does not extend {@link OpenFetchError} — the HTTP round-trip succeeded; the schema rejected the payload.
 */
export class SchemaValidationError extends Error {
    name = "SchemaValidationError";
    issues;
    constructor(issues) {
        super("Response schema validation failed");
        this.issues = issues;
    }
}
export function isSchemaValidationError(err) {
    return err instanceof SchemaValidationError;
}

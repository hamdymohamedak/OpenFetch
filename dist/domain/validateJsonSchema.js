import { SchemaValidationError } from "./schemaValidationError.js";
const invalidSchemaMessage = "The `jsonSchema` value must follow the Standard Schema specification";
export async function validateJsonWithStandardSchema(jsonValue, schema) {
    if ((typeof schema !== "object" && typeof schema !== "function") ||
        schema === null) {
        throw new TypeError(invalidSchemaMessage);
    }
    const standardSchema = schema["~standard"];
    if (typeof standardSchema !== "object" ||
        standardSchema === null ||
        typeof standardSchema.validate !== "function") {
        throw new TypeError(invalidSchemaMessage);
    }
    const validationResult = await standardSchema.validate(jsonValue);
    if (validationResult.issues) {
        throw new SchemaValidationError(validationResult.issues);
    }
    return validationResult.value;
}

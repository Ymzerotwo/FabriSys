import { z } from "zod";

/**
 * Reusable Zod schemas factories for FabriSys application.
 * These functions accept a translation function `t` to return localized schemas.
 */

// 1. Email Validation
export const getEmailSchema = (t: (key: string) => string) => z
    .string()
    .min(1, { message: t('email_required') })
    .email({ message: t('invalid_email') });

// 2. Generic Text Validation (Non-empty)
export const getTextSchema = (t: (key: string, values?: Record<string, unknown>) => string, min = 1, max = 255) =>
    z.string()
        .min(min, { message: t('min_length', { min }) })
        .max(max, { message: t('max_length', { max }) });

// 3. Integer Validation
export const getIntegerSchema = (t: (key: string) => string) => z
    .number()
    .int({ message: t('integer_only') });

// 4. Decimal/Float Validation (General Number)
export const getNumberSchema = () => z.number();

// 5. Mixed Number (Accepts string inputs that can be parsed to numbers)
export const getNumericStringSchema = (t: (key: string) => string) =>
    z.string().regex(/^\d+(\.\d+)?$/, t('number_only'));

/**
 * Validates a value against a schema and returns the result.
 * @param schema The Zod schema to use
 * @param value The value to validate
 * @returns { success: boolean, data?: any, error?: string }
 */
export const validateInput = <T>(schema: z.ZodType<T>, value: unknown) => {
    const result = schema.safeParse(value);
    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, error: result.error.issues[0]?.message || "Validation error" };
    }
};

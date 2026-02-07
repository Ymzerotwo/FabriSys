import { z } from "zod";

export const getUserSchema = (t: (key: string) => string) => z.object({
    username: z.string().min(3, t('min_3_chars')),
    password: z.string().min(6, t('min_6_chars')).optional().or(z.literal('')),
    // Password is optional for edit, but required for create. We'll handle this refined validation in the form or easier: just optional here and check in onSubmit if creating.
    // Actually for simplicity in Zod, making it optional here and handling logic in UI is easiest.
    displayName: z.string().min(2, t('min_2_chars')),
    role: z.enum(['admin', 'user']),
    status: z.enum(['active', 'blocked']),
    profileImage: z.string().optional(),
});

export type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;

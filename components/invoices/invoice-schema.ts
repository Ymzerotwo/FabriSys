import { z } from "zod";

export const getInvoiceSchema = (t: (key: string) => string) => z.object({
    invoiceNumber: z.string().min(1, t('required')),
    supplierId: z.coerce.number().min(1, t('required')),
    amount: z.coerce.number().min(0.01, t('amount_positive')),
    paymentMethod: z.string().min(1, t('required')),
    status: z.enum(['paid', 'credit', 'cancelled']),
    date: z.date(),
    notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<ReturnType<typeof getInvoiceSchema>>;

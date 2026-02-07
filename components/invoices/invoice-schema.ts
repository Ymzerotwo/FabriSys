import { z } from "zod";

export const getInvoiceSchema = (t: (key: string) => string) => z.object({
    invoiceNumber: z.string().min(1, t('required')),
    supplierId: z.coerce.number().min(1, t('required')),
    amount: z.coerce.number().min(0.01, t('amount_positive')),
    paidAmount: z.coerce.number().min(0, t('amount_positive')).optional(),
    paymentMethod: z.string().min(1, t('required')),
    status: z.enum(['paid', 'credit', 'cancelled']),
    date: z.date(),
    dueDate: z.date().optional(),
    notes: z.string().optional(),
}).refine((data) => {
    if (data.status === 'credit') {
        const paid = data.paidAmount || 0;
        return paid <= data.amount;
    }
    return true;
}, {
    message: "المبلغ المدفوع يجب أن يكون أقل من أو يساوي المبلغ الإجمالي", // Paid amount must be <= Total
    path: ["paidAmount"],
}).refine((data) => {
    if (data.status === 'credit' && !data.dueDate) {
        return false;
    }
    return true;
}, {
    message: "ميعاد الاستحقاق مطلوب للفواتير الآجلة", // Due date required for credit
    path: ["dueDate"],
});

export type InvoiceFormValues = z.infer<ReturnType<typeof getInvoiceSchema>>;

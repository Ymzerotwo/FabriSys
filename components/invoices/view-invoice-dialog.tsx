"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { useTranslations, useFormatter } from "next-intl"
import { Badge } from "@/components/ui/badge"

interface ViewInvoiceDialogProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoice: any | null // Using any for simplicity as we pass the enhanced invoice object with supplier
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
    const t = useTranslations("Invoices")
    const tStatus = useTranslations("Invoices.status")
    const tTable = useTranslations("Invoices.table")
    const tForm = useTranslations("Invoices.form")
    const formatter = useFormatter()

    if (!invoice) return null

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return "default";
            case 'credit': return "secondary";
            case 'cancelled': return "destructive";
            default: return "outline";
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('view_details')}</DialogTitle>
                    <DialogDescription>
                        {t('invoice_number')}: {invoice.invoiceNumber}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tTable('supplier')}</p>
                            <p>{invoice.supplier?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tTable('amount')}</p>
                            <p>{formatter.number(invoice.amount, { style: 'currency', currency: 'EGP' })}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tTable('date')}</p>
                            <p>{formatter.dateTime(invoice.date, { dateStyle: 'medium' })}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tTable('status')}</p>
                            <Badge variant={getStatusVariant(invoice.status)}>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {tStatus(invoice.status as any)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tForm('payment_method')}</p>
                            {/* Simplified display, ideally translate the value */}
                            <p>{invoice.paymentMethod}</p>
                        </div>
                    </div>
                    {invoice.notes && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tForm('notes')}</p>
                            <p className="text-sm bg-muted p-2 rounded-md">{invoice.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

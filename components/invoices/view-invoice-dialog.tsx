"use client"

import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
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
    const { toast } = useToast()
    const [isUpdating, setIsUpdating] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("")

    if (!invoice) return null

    // Fallback for paidAmount if it doesn't exist on older records
    const paidAmount = invoice.paidAmount ?? (invoice.status === 'paid' ? invoice.amount : 0);
    const remainingAmount = invoice.amount - paidAmount;
    const isFullyPaid = paidAmount >= invoice.amount;

    const handleAddPayment = async () => {
        const amountToAdd = Number(paymentAmount);
        if (isNaN(amountToAdd) || amountToAdd <= 0) return;

        setIsUpdating(true)
        try {
            const newPaidAmount = paidAmount + amountToAdd;
            const newStatus = newPaidAmount >= invoice.amount ? 'paid' : 'credit';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: any = {
                paidAmount: newPaidAmount,
                status: newStatus,
                updatedAt: new Date()
            };

            if (newStatus === 'paid') {
                updates.paidDate = new Date();
            }

            await db.invoices.update(invoice.id, updates);

            toast({
                variant: "success",
                title: t('payment_completed'),
                description: t('payment_added') || "Payment Added Successfully",
            })
            setPaymentAmount("")
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update invoice:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update payment",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // Keep handleCompletePayment logic just in case we need it or as part of the 'max' button

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
                        {tForm('invoice_number') || "Invoice Number"}: {invoice.invoiceNumber}
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
                            <p className="text-sm font-medium text-muted-foreground">{tForm('paid_amount') || "المبلغ المدفوع"}</p>
                            <p className="text-green-600 font-medium">
                                {formatter.number(paidAmount, { style: 'currency', currency: 'EGP' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tForm('remaining_amount') || "المتبقي"}</p>
                            <p className="text-red-500 font-medium">
                                {formatter.number(Math.max(0, remainingAmount), { style: 'currency', currency: 'EGP' })}
                            </p>
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
                        {invoice.status === 'credit' && invoice.dueDate && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{tForm('due_date') || "ميعاد الاستحقاق"}</p>
                                <p className="text-red-500 font-medium">
                                    {formatter.dateTime(invoice.dueDate, { dateStyle: 'medium' })}
                                </p>
                            </div>
                        )}
                    </div>
                    {invoice.notes && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{tForm('notes')}</p>
                            <p className="text-sm bg-muted p-2 rounded-md">{invoice.notes}</p>
                        </div>
                    )}

                    {!isFullyPaid && (
                        <div className="pt-4 border-t mt-2 space-y-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{t('amount_to_pay') || "المبلغ المراد دفعه"}</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        max={remainingAmount}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => handleAddPayment()}
                                        disabled={isUpdating || !paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > remainingAmount}
                                    >
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('add_payment') || "إضافة دفعة"}
                                    </Button>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Max: {formatter.number(remainingAmount, { style: 'currency', currency: 'EGP' })}</span>
                                    <button
                                        onClick={() => setPaymentAmount(remainingAmount.toString())}
                                        className="text-primary hover:underline"
                                    >
                                        {t('complete_payment') || "دفع كامل المبلغ"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { useTranslations } from "next-intl"
import { MoreHorizontal, FileText } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { ViewInvoiceDialog } from "./view-invoice-dialog"
import { useToast } from "@/hooks/use-toast"

import { useFormatter } from "next-intl"

export function InvoicesTable() {
    const t = useTranslations("Invoices")
    const tTable = useTranslations("Invoices.table")
    const tStatus = useTranslations("Invoices.status")
    const formatter = useFormatter();

    // Fetch invoices and related suppliers
    const invoices = useLiveQuery(async () => {
        const allInvoices = await db.invoices.toArray();
        const allSuppliers = await db.suppliers.toArray();

        // Map supplier details to invoice
        return allInvoices.map(invoice => ({
            ...invoice,
            supplier: allSuppliers.find(s => s.id === invoice.supplierId)
        })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewInvoice, setViewInvoice] = useState<any | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [openDelete, setOpenDelete] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await db.invoices.delete(deleteId)
            toast({
                title: t('delete_invoice'),
                description: "تم حذف الفاتورة بنجاح" // Or use generic success message
            })
            setOpenDelete(false)
        } catch (error) {
            console.error("Failed to delete invoice", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete invoice"
            })
        }
    }



    if (!invoices) {
        return <div className="p-8 text-center text-muted-foreground">{t('loading')}...</div>
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return "default";
            case 'credit': return "secondary";
            case 'cancelled': return "destructive";
            default: return "outline";
        }
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{tTable('invoice_number')}</TableHead>
                        <TableHead>{tTable('supplier')}</TableHead>
                        <TableHead>{tTable('amount')}</TableHead>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{tTable('status')}</TableHead>
                        <TableHead className="text-right">{tTable('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                {tTable('no_invoices')}
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {invoice.invoiceNumber}
                                    </div>
                                </TableCell>
                                <TableCell>{invoice.supplier?.name || "Unknown Supplier"}</TableCell>
                                <TableCell>
                                    {formatter.number(invoice.amount, { style: 'currency', currency: 'EGP' })}
                                </TableCell>
                                <TableCell>{formatter.dateTime(invoice.date, { dateStyle: 'medium' })}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(invoice.status)}>
                                        {tStatus(invoice.status as "paid" | "credit" | "cancelled")}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>{t('actions_menu')}</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}
                                            >
                                                {t('copy_number')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => setViewInvoice(invoice)}>
                                                {t('view_details')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onSelect={() => {
                                                    setDeleteId(invoice.id!)
                                                    setOpenDelete(true)
                                                }}
                                            >
                                                {t('delete_invoice')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <ViewInvoiceDialog
                open={!!viewInvoice}
                onOpenChange={(open) => !open && setViewInvoice(null)}
                invoice={viewInvoice}
            />

            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete_confirm_desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

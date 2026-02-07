"use client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, SortAsc, FileText, Calendar, DollarSign, User, MoreHorizontal, Trash, CreditCard, Banknote, CheckCircle, LucideIcon } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Invoice, Supplier } from "@/lib/db"
import { AddInvoiceDialog } from "@/components/invoices/add-invoice-dialog"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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
import { ViewInvoiceDialog } from "@/components/invoices/view-invoice-dialog"
import { useFormatter } from "next-intl"

export default function InvoicesContent() {
    const t = useTranslations("Invoices")
    const tTable = useTranslations("Invoices.table")
    const tStatus = useTranslations("Invoices.status")
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")

    // Live query to fetch invoices with suppliers
    const invoices = useLiveQuery(async () => {
        const allInvoices = await db.invoices.toArray();
        const allSuppliers = await db.suppliers.toArray();

        let result = allInvoices.map(invoice => ({
            ...invoice,
            supplier: allSuppliers.find(s => s.id === invoice.supplierId)
        }));

        // Sorting
        if (sortOrder === "newest") {
            result.sort((a, b) => b.date.getTime() - a.date.getTime());
        } else {
            result.sort((a, b) => a.date.getTime() - b.date.getTime());
        }

        // Filtering
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(invoice =>
                invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
                invoice.supplier?.name.toLowerCase().includes(lowerQuery)
            )
        }

        if (statusFilter !== "all") {
            result = result.filter(invoice => invoice.status === statusFilter)
        }

        return result
    }, [searchQuery, statusFilter, sortOrder])

    // Stats
    const totalCount = useLiveQuery(() => db.invoices.count())
    const paidCount = useLiveQuery(() => db.invoices.where('status').equals('paid').count())
    const creditCount = useLiveQuery(() => db.invoices.where('status').equals('credit').count())
    const cancelledCount = useLiveQuery(() => db.invoices.where('status').equals('cancelled').count())

    const isLoading = invoices === undefined

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h2>
                </div>
                <div className="w-full sm:w-auto">
                    <AddInvoiceDialog />
                </div>
            </div>

            {/* Stats Cards - Optional but nice to have consistent with suppliers */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {/* Reusing a simple stat card for now, or could make a reusable component */}
                <StatsCard title={t("stats.total_invoices")} value={totalCount?.toString() || "0"} icon={FileText} isLoading={totalCount === undefined} />
                <StatsCard title={t("status.paid")} value={paidCount?.toString() || "0"} icon={CheckCircle} variant="success" isLoading={paidCount === undefined} />
                <StatsCard title={t("status.credit")} value={creditCount?.toString() || "0"} icon={CreditCard} variant="warning" isLoading={creditCount === undefined} />
                <StatsCard title={t("status.cancelled")} value={cancelledCount?.toString() || "0"} icon={Trash} variant="destructive" isLoading={cancelledCount === undefined} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                    <Input
                        placeholder={t("toolbar.search_placeholder")}
                        className="pl-9 rtl:pr-9 rtl:pl-3"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="flex-1 md:w-[140px]">
                            <Filter className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.filter_all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("toolbar.filter_all")}</SelectItem>
                            <SelectItem value="paid">{tStatus("paid")}</SelectItem>
                            <SelectItem value="credit">{tStatus("credit")}</SelectItem>
                            <SelectItem value="cancelled">{tStatus("cancelled")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="flex-1 md:w-[160px]">
                            <SortAsc className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.sort_newest")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("toolbar.sort_newest")}</SelectItem>
                            <SelectItem value="oldest">{t("toolbar.sort_oldest")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Invoices Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <InvoiceCardSkeleton key={i} />)
                ) : invoices?.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>{tTable("no_invoices")}</p>
                    </div>
                ) : (
                    invoices?.map((invoice) => (
                        <InvoiceCard key={invoice.id} invoice={invoice} t={t} tStatus={tStatus} />
                    ))
                )}
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, variant = "default", isLoading }: { title: string; value: string; icon: LucideIcon; variant?: "default" | "destructive" | "success" | "warning"; isLoading: boolean }) {
    const variantColors = {
        default: "text-muted-foreground",
        destructive: "text-destructive",
        success: "text-emerald-500",
        warning: "text-amber-500"
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", variantColors[variant])} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className={cn("text-2xl font-bold")}>{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

interface InvoiceWithSupplier extends Invoice {
    supplier?: Supplier;
}

function InvoiceCard({ invoice, t, tStatus }: { invoice: InvoiceWithSupplier, t: (key: string) => string, tStatus: (key: string) => string }) {
    const { toast } = useToast()
    const formatter = useFormatter()
    const tForm = useTranslations("Invoices.form")
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const [viewInvoice, setViewInvoice] = useState<InvoiceWithSupplier | null>(null)

    const handleDelete = async () => {
        try {
            await db.invoices.delete(invoice.id!)
            toast({
                title: t("delete_invoice"),
                description: "تم حذف الفاتورة بنجاح", // Or generic message
                variant: "success", // Using success style
            })
            setShowDeleteAlert(false)
        } catch (error) {
            console.error("Failed to delete invoice", error)
            toast({
                title: "Error",
                description: "Failed to delete invoice",
                variant: "destructive",
            })
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'default'; // We override color with className
            case 'credit': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    }

    const remainingAmount = invoice.amount - (invoice.paidAmount || 0);

    return (
        <>
            <Card className="group hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                            {invoice.invoiceNumber}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatter.dateTime(invoice.date, { dateStyle: 'medium' })}
                        </p>
                    </div>
                    <Badge
                        variant={getStatusVariant(invoice.status)}
                        className={cn(invoice.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : '')}
                    >
                        {tStatus(invoice.status)}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate font-medium text-foreground">{invoice.supplier?.name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate font-bold text-lg text-foreground">
                                {formatter.number(invoice.amount, { style: 'currency', currency: 'EGP' })}
                            </span>
                        </div>

                        {invoice.status === 'credit' && (
                            <div className="pt-2 mt-2 border-t border-dashed space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{tForm('remaining_amount')}</span>
                                    <span className="font-semibold text-destructive">
                                        {formatter.number(remainingAmount, { style: 'currency', currency: 'EGP' })}
                                    </span>
                                </div>
                                {invoice.dueDate && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">{tForm('due_date')}</span>
                                        <span className="font-medium text-orange-600">
                                            {formatter.dateTime(invoice.dueDate, { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {invoice.status === 'paid' && invoice.paidDate && (
                            <div className="pt-2 mt-2 border-t border-dashed space-y-1">
                                <div className="flex justify-between text-xs text-emerald-600">
                                    <span className="text-muted-foreground">{t('paid_on') || "Paid On"}</span>
                                    <span className="font-medium">
                                        {formatter.dateTime(invoice.paidDate, { dateStyle: 'medium' })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {invoice.notes && (
                            <div className="pt-2 mt-2 border-t border-dashed text-xs text-muted-foreground line-clamp-2" title={invoice.notes}>
                                <FileText className="h-3 w-3 inline mr-1" />
                                {invoice.notes}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex justify-between items-end border-t border-border/40 mt-3 pt-3">
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Banknote className="h-3 w-3" />
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <span>{t(`payment_methods.${invoice.paymentMethod}` as any)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {invoice.status === 'credit' && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    onClick={() => setViewInvoice(invoice)}
                                >
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {t('pay') || "Pay"}
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t("actions_menu")}</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        {t("copy_number")}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setViewInvoice(invoice)}>
                                        {t("view_details")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setShowDeleteAlert(true)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        {t("delete_invoice")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ViewInvoiceDialog
                open={!!viewInvoice}
                onOpenChange={(open) => !open && setViewInvoice(null)}
                invoice={viewInvoice}
            />

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("delete_confirm_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function InvoiceCardSkeleton() {
    return (
        <Card>
            <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    )
}

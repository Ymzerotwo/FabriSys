"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, SortAsc, Users, UserCheck, UserX, Phone, Mail, MapPin, MoreHorizontal, type LucideIcon, Trash } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Supplier } from "@/lib/db"
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog"
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

export default function SuppliersContent() {
    const t = useTranslations("Suppliers")
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")

    // Live query to fetch suppliers
    const suppliers = useLiveQuery(async () => {
        let collection = db.suppliers.toCollection()

        if (sortOrder === "newest") {
            collection = collection.reverse()
        }

        let result = await collection.toArray()

        // In-memory filtering (Dexie complex queries are limited)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(s =>
                s.name.toLowerCase().includes(lowerQuery) ||
                s.phone.includes(lowerQuery) ||
                (s.contactPerson && s.contactPerson.toLowerCase().includes(lowerQuery))
            )
        }

        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter)
        }

        return result
    }, [searchQuery, statusFilter, sortOrder])

    // Specific counts queries
    const totalCount = useLiveQuery(() => db.suppliers.count())
    const activeCount = useLiveQuery(() => db.suppliers.where('status').equals('active').count())
    const inactiveCount = useLiveQuery(() => db.suppliers.where('status').equals('inactive').count())
    const blockedCount = useLiveQuery(() => db.suppliers.where('status').equals('blocked').count())

    const isLoading = suppliers === undefined

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h2>
                <div className="w-full sm:w-auto">
                    <AddSupplierDialog />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title={t("stats.total")}
                    value={totalCount?.toString() || "0"}
                    icon={Users}
                    isLoading={totalCount === undefined}
                />
                <StatsCard
                    title={t("stats.active")}
                    value={activeCount?.toString() || "0"}
                    icon={UserCheck}
                    variant="success"
                    isLoading={activeCount === undefined}
                />
                <StatsCard
                    title={t("form.inactive")}
                    value={inactiveCount?.toString() || "0"}
                    icon={UserX}
                    variant="warning"
                    isLoading={inactiveCount === undefined}
                />
                <StatsCard
                    title={t("stats.blocked")}
                    value={blockedCount?.toString() || "0"}
                    icon={UserX}
                    variant="destructive"
                    isLoading={blockedCount === undefined}
                />
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
                            <SelectItem value="active">{t("toolbar.filter_active")}</SelectItem>
                            <SelectItem value="inactive">{t("form.inactive")}</SelectItem>
                            <SelectItem value="blocked">{t("toolbar.filter_blocked")}</SelectItem>
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

            {/* Suppliers Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SupplierCardSkeleton key={i} />)
                ) : suppliers?.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>{t("toolbar.search_placeholder")} - No results</p>
                    </div>
                ) : (
                    suppliers?.map((supplier) => (
                        <SupplierCard key={supplier.id} supplier={supplier} t={t} />
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

function SupplierCard({ supplier, t }: { supplier: Supplier, t: (key: string, values?: Record<string, string | number>) => string }) {
    const { toast } = useToast()
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)

    const handleStatusUpdate = async (newStatus: 'active' | 'inactive' | 'blocked') => {
        try {
            await db.suppliers.update(supplier.id!, { status: newStatus })
            toast({
                title: t("messages.status_updated"),
                description: t("messages.status_updated_desc", { status: t(`form.${newStatus}`) }),
                variant: "success",
            })
        } catch (error) {
            console.error("Failed to update status", error)
            toast({
                title: t("messages.error_generic"),
                description: t("messages.error_generic_desc"),
                variant: "destructive",
            })
        }
    }

    const handleDelete = async () => {
        try {
            await db.suppliers.delete(supplier.id!)
            toast({
                title: t("messages.deleted"),
                description: t("messages.deleted_desc"),
                variant: "success",
            })
            setShowDeleteAlert(false) // Close the dialog after successful deletion
        } catch (error) {
            console.error("Failed to delete supplier", error)
            toast({
                title: t("messages.error_generic"),
                description: t("messages.error_generic_desc"),
                variant: "destructive",
            })
        }
    }

    return (
        <>
            <Card className="group hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                            {supplier.name}
                        </CardTitle>
                        {supplier.contactPerson && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="opacity-70">{t("form.contact_person")}:</span>
                                {supplier.contactPerson}
                            </p>
                        )}
                    </div>
                    <Badge variant={supplier.status === 'active' ? 'default' : supplier.status === 'blocked' ? 'destructive' : 'secondary'} className={cn(supplier.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : '')}>
                        {t(`form.${supplier.status}`)}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate scroll-m-20" dir="ltr">{supplier.phone}</span>
                        </div>
                        {supplier.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{supplier.email}</span>
                            </div>
                        )}
                        {supplier.address && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{supplier.address}</span>
                            </div>
                        )}
                    </div>

                    {supplier.supplyCategories && supplier.supplyCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {supplier.supplyCategories.map(cat => (
                                <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                    {t(`form.cat_${cat}`)}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {supplier.paymentMethods && supplier.paymentMethods.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {supplier.paymentMethods.map(method => (
                                <Badge key={method} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/20 bg-primary/5 text-primary">
                                    {t(`form.pm_${method}`)}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="pt-2 flex justify-between items-end border-t border-border/40 mt-3 pt-3">
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                            {supplier.taxId && <div><span className="opacity-70">{t("form.tax_id")}:</span> {supplier.taxId}</div>}
                            {supplier.commercialRecord && <div><span className="opacity-70">CR:</span> {supplier.commercialRecord}</div>}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("form.status")}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleStatusUpdate('active')}>
                                    <UserCheck className="mr-2 h-4 w-4 text-emerald-500 rtl:ml-2 rtl:mr-0" />
                                    {t("form.active")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate('inactive')}>
                                    <UserX className="mr-2 h-4 w-4 text-amber-500 rtl:ml-2 rtl:mr-0" />
                                    {t("form.inactive")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate('blocked')}>
                                    <UserCheck className="mr-2 h-4 w-4 text-destructive rtl:ml-2 rtl:mr-0" />
                                    {t("form.blocked")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setShowDeleteAlert(true)}
                                >
                                    <Trash className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                                    {t("form.delete_supplier")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("messages.delete_dialog_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("messages.delete_dialog_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {t("messages.confirm_delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function SupplierCardSkeleton() {
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

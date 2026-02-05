"use client"

import { use } from "react"
import { useTranslations } from "next-intl"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Box, PackageOpen, AlertTriangle, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { AddItemDialog } from "@/components/inventory/add-item-dialog"
import { ItemsTable } from "@/components/inventory/items-table"

export default function WarehousePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const t = useTranslations("Inventory")
    const warehouseId = parseInt(id)

    const warehouse = useLiveQuery(() => db.warehouses.get(warehouseId), [warehouseId])
    const items = useLiveQuery(() => db.items.where('warehouseId').equals(warehouseId).toArray(), [warehouseId])

    const itemsCount = items?.length || 0;
    const totalQuantity = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const lowStockCount = items?.filter(item => item.quantity <= item.minQuantity).length || 0;

    // While loading
    if (warehouse === undefined) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        )
    }

    // If loaded but not found
    if (warehouse === null) {
        notFound()
    }

    // We check for undefined above, so here warehouse is Warehouse (or null in theory if not found, handled above)
    // We safeguard just in case
    if (!warehouse) return null;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header / Nav */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" asChild className="shrink-0 mt-1">
                        <Link href="/inventory">
                            <ArrowLeft className="h-4 w-4 rtl:flip" />
                        </Link>
                    </Button>
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{warehouse.name}</h2>
                            <div className="flex flex-wrap gap-2">
                                {warehouse.categories.map((cat) => (
                                    <Badge key={cat} variant="secondary" className="px-2.5 py-0.5">
                                        {t(`form.${cat}`)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                                <span className="text-xs font-medium uppercase tracking-wider opacity-70">{t("form.code")}:</span>
                                <span className="font-mono font-medium text-foreground">{warehouse.code}</span>
                            </div>
                            <span className="text-border">|</span>
                            <div className="flex items-center gap-1.5">
                                <span>{warehouse.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <AddItemDialog warehouseId={warehouseId} supportedCategories={warehouse.categories} />
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <StatsCard
                    title={t("stats.total_quantity")}
                    value={totalQuantity}
                    icon={PackageOpen}
                />
                <StatsCard
                    title={t("stats.items")}
                    value={itemsCount}
                    icon={Box}
                />
                <StatsCard
                    title={t("stats.low_stock")}
                    value={lowStockCount}
                    icon={AlertTriangle}
                    variant={lowStockCount > 0 ? "destructive" : "default"}
                />
            </div>

            {/* Items Table with Advanced Filter/Sort */}
            <ItemsTable warehouseId={warehouseId} categories={warehouse.categories} />
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, variant = "default" }: { title: string; value: number | string; icon: LucideIcon; variant?: "default" | "destructive" }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", variant === "destructive" ? "text-destructive" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", variant === "destructive" && "text-destructive")}>{value}</div>
            </CardContent>
        </Card>
    )
}

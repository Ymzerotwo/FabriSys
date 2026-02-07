"use client"

import { use } from "react"
import { useTranslations } from "next-intl"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowLeft, Package, ScrollText, AlertTriangle, Layers, Search, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddStockDialog } from "@/components/inventory/add-stock-dialog"
import { useState } from "react"
import { BatchCard } from "@/components/inventory/batch-card"

export default function ItemDetailsPage({
    params
}: {
    params: Promise<{ id: string; itemId: string }>
}) {
    const { id: warehouseIdStr, itemId: itemIdStr } = use(params)
    const t = useTranslations("Inventory")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState("newest")

    const warehouseId = parseInt(warehouseIdStr)
    const itemId = parseInt(itemIdStr)

    const warehouse = useLiveQuery(() => db.warehouses.get(warehouseId), [warehouseId])
    const item = useLiveQuery(() => db.items.get(itemId), [itemId])
    // Fetch variants (batches) for this item
    const variants = useLiveQuery(() => db.variants.where('itemId').equals(itemId).toArray(), [itemId])

    if (warehouse === undefined || item === undefined || variants === undefined) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        )
    }

    if (!warehouse || !item) {
        notFound()
    }

    const isFabric = item.category === 'fabric'
    const Icon = isFabric ? ScrollText : Package

    // --- Stats Calculation ---
    const totalQty = variants.reduce((acc, v) => acc + v.quantity, 0)
    const totalBatches = variants.length
    const isLowStock = totalQty <= item.minQuantity

    // --- Filtering & Sorting ---
    const filteredVariants = variants.filter(v => {
        // Simple search (placeholder as variants don't have names, search by ID or attributes?)
        // Let's search by color or size or ID
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
            v.id?.toString().includes(searchLower) ||
            v.color?.toLowerCase().includes(searchLower) ||
            v.size?.toLowerCase().includes(searchLower) ||
            v.material?.toLowerCase().includes(searchLower)

        return matchesSearch
    }).sort((a, b) => {
        if (sortOrder === "newest") return b.createdAt.getTime() - a.createdAt.getTime()
        if (sortOrder === "oldest") return a.createdAt.getTime() - b.createdAt.getTime()
        if (sortOrder === "qty_high") return b.quantity - a.quantity
        if (sortOrder === "qty_low") return a.quantity - b.quantity
        return 0
    })


    return (
        <div className="flex-1 space-y-6 pt-6">
            {/* Header / Nav */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/inventory/${warehouseId}`} className="hover:text-foreground transition-colors">
                        {warehouse.name}
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{item.name}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0 mt-1">
                            <Link href={`/inventory/${warehouseId}`}>
                                <ArrowLeft className="h-4 w-4 rtl:flip" />
                            </Link>
                        </Button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
                                <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                                    {isFabric ? t("form.fabric") : t("form.accessories")}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                                <span>SKU: <span className="text-foreground">{item.sku}</span></span>
                                <span>•</span>
                                <span>{t("form.unit")}: {item.unit}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto">
                        <AddStockDialog item={item} />
                    </div>
                </div>
            </div>

            {/* Stats Cards (Dashboard Style) */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <StatsCard
                    title={t("stats.total_quantity")}
                    value={`${totalQty} ${item.unit}`}
                    icon={Layers}
                    variant={isLowStock ? "warning" : "success"}
                />
                <StatsCard
                    title={t("warehouse.total_batches")}
                    value={totalBatches.toString()}
                    icon={Icon}
                />
                <StatsCard
                    title={t("form.min_quantity")}
                    value={`${item.minQuantity} ${item.unit}`}
                    icon={AlertTriangle}
                    variant="default"
                />
                {isLowStock && (
                    <Card className="bg-destructive/10 border-destructive/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-destructive">{t("warehouse.low_stock")}</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-destructive">{t("warehouse.alert")}</div>
                            <p className="text-xs text-destructive/80">{t("warehouse.stock_low_desc")}</p>
                        </CardContent>
                    </Card>
                )}
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
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="flex-1 md:w-[170px]">
                            <SortAsc className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.newest")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("toolbar.newest")}</SelectItem>
                            <SelectItem value="oldest">{t("toolbar.oldest")}</SelectItem>
                            <SelectItem value="qty_high">{t("form.sort_qty_desc")}</SelectItem>
                            <SelectItem value="qty_low">{t("form.sort_qty_asc")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Variants Grid (Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredVariants.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                        <Icon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>{t("form.no_items")}</p>
                        <p className="text-sm text-muted-foreground/60">{t("form.no_stock_desc")}</p>
                    </div>
                ) : (
                    filteredVariants.map((variant) => (
                        <BatchCard key={variant.id} variant={variant} unit={item.unit} isFabric={isFabric} />
                    ))
                )}
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, variant = "default" }: { title: string; value: string; icon: React.ComponentType<{ className?: string }>; variant?: "default" | "destructive" | "success" | "warning" }) {
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
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

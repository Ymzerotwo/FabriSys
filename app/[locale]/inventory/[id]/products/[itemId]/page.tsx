"use client"

import { use } from "react"
import { useTranslations } from "next-intl"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ArrowLeft, Package, ScrollText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ItemDetailsPage({
    params
}: {
    params: Promise<{ id: string; itemId: string }>
}) {
    const { id: warehouseIdStr, itemId: itemIdStr } = use(params)
    const t = useTranslations("Inventory")


    const warehouseId = parseInt(warehouseIdStr)
    const itemId = parseInt(itemIdStr)

    const warehouse = useLiveQuery(() => db.warehouses.get(warehouseId), [warehouseId])
    const item = useLiveQuery(() => db.items.get(itemId), [itemId])
    // const variants = useLiveQuery(() => db.variants.where('itemId').equals(itemId).toArray(), [itemId])

    if (warehouse === undefined || item === undefined) {
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

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
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
                                <span>Unit: {item.unit}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Stock</p>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className={`text-3xl font-bold ${item.totalQuantity <= item.minQuantity ? 'text-orange-500' : ''}`}>
                                    {item.totalQuantity}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">{item.unit}</span>
                            </div>
                        </div>
                        <Button size="lg" className="gap-2">
                            <Plus className="w-4 h-4" />
                            {t("actions.add_stock")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6">

                {/* Variants List (Placeholder for now) */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("stats.items")}</CardTitle>
                        <CardDescription>
                            List of current stock batches / rolls.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                            <Icon className="w-12 h-12 mb-4 opacity-20" />
                            <h3 className="font-semibold text-lg mb-1">No stock added yet</h3>
                            <p className="text-sm max-w-sm mx-auto mb-4">
                                Add your first batch of stock to track specific details like roll length, color, or batch numbers.
                            </p>
                            <Button variant="outline">
                                Add {item.unit}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

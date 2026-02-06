"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Warehouse, PackageOpen, AlertTriangle, Search, Filter, SortAsc, type LucideIcon } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Link } from "@/i18n/routing"

import { AddWarehouseDialog } from "@/components/inventory/add-warehouse-dialog"

export default function InventoryPage() {
    const t = useTranslations("Inventory")

    // Live query to fetch warehouses from Dexie
    const warehouses = useLiveQuery(() => db.warehouses.filter(w => w.isActive !== false).toArray())
    const isLoading = warehouses === undefined

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h2>
                <div className="w-full sm:w-auto">
                    <AddWarehouseDialog />
                </div>
            </div>

            {/* Stats Cards - Currently static/mocked for counts as we transition */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title={t("stats.warehouses")}
                    value={warehouses ? warehouses.length.toString() : "-"}
                    icon={Warehouse}
                    isLoading={isLoading}
                />
                <StatsCard title={t("stats.items")} value="0" icon={PackageOpen} isLoading={isLoading} />
                <StatsCard title={t("stats.low_stock")} value="0" icon={AlertTriangle} variant="destructive" isLoading={isLoading} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                    <Input
                        placeholder={t("toolbar.search_placeholder")}
                        className="pl-9 rtl:pr-9 rtl:pl-3"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select>
                        <SelectTrigger className="flex-1 md:w-[140px]">
                            <Filter className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.filter")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">{t("toolbar.active")}</SelectItem>
                            <SelectItem value="inactive">{t("toolbar.inactive")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="flex-1 md:w-[140px]">
                            <SortAsc className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.sort")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("toolbar.newest")}</SelectItem>
                            <SelectItem value="oldest">{t("toolbar.oldest")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Warehouses Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-5 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-1/3" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : warehouses?.map((warehouse) => (
                        <Link key={warehouse.id} href={`/inventory/${warehouse.id}`} className="block">
                            <Card className="group hover:border-primary transition-colors cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold truncate text-primary">
                                            {warehouse.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {warehouse.code}
                                        </p>
                                    </div>
                                    <Warehouse className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {warehouse.categories.map((cat) => (
                                            <Badge key={cat} variant="secondary" className="text-xs">
                                                {t(`form.${cat}`)}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                {!isLoading && warehouses?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No warehouses found. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, variant = "default", isLoading }: { title: string; value: string; icon: LucideIcon; variant?: "default" | "destructive"; isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", variant === "destructive" ? "text-destructive" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className={cn("text-2xl font-bold", variant === "destructive" && "text-destructive")}>{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

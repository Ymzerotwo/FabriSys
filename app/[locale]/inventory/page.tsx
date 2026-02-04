"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Warehouse, PackageOpen, AlertTriangle, Search, Filter, SortAsc, type LucideIcon } from "lucide-react"

// Mock Data
const MOCK_WAREHOUSES = [
    { id: 1, name: "Main Warehouse", capacity: 85, storekeeper: "Ahmed Hassan", status: "Active" },
    { id: 2, name: "Raw Materials A", capacity: 45, storekeeper: "Mohamed Ali", status: "Active" },
    { id: 3, name: "Logistics Hub", capacity: 12, storekeeper: "Sara Mahmoud", status: "Active" },
    { id: 4, name: "Backup Storage", capacity: 5, storekeeper: "Khaled Omar", status: "Inactive" },
    { id: 5, name: "North Branch", capacity: 65, storekeeper: "Mai Ezz", status: "Active" },
    { id: 6, name: "South Branch", capacity: 92, storekeeper: "Ibrahim Adel", status: "Active" },
]

import { AddWarehouseDialog } from "@/components/inventory/add-warehouse-dialog"

export default function InventoryPage() {
    const t = useTranslations("Inventory")
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<typeof MOCK_WAREHOUSES>([])

    // Simulate data fetching
    useEffect(() => {
        const timer = setTimeout(() => {
            setData(MOCK_WAREHOUSES)
            setIsLoading(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
                <AddWarehouseDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard title={t("stats.warehouses")} value="6" icon={Warehouse} isLoading={isLoading} />
                <StatsCard title={t("stats.items")} value="1,250" icon={PackageOpen} isLoading={isLoading} />
                <StatsCard title={t("stats.low_stock")} value="5" icon={AlertTriangle} variant="destructive" isLoading={isLoading} />
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
                <div className="flex gap-2">
                    <Select>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.filter")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">{t("toolbar.active")}</SelectItem>
                            <SelectItem value="inactive">{t("toolbar.inactive")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-[140px]">
                            <SortAsc className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.sort")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("toolbar.newest")}</SelectItem>
                            <SelectItem value="oldest">{t("toolbar.oldest")}</SelectItem>
                            <SelectItem value="full">{t("toolbar.most_full")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Warehouses Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-5 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-2 w-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : data.map((warehouse) => (
                        <Card key={warehouse.id} className="group hover:border-primary transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-semibold truncate text-primary">
                                    {warehouse.name}
                                </CardTitle>
                                <Warehouse className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t("warehouse.capacity")}</span>
                                        <span className={cn("font-medium", warehouse.capacity > 90 ? "text-destructive" : "")}>
                                            {warehouse.capacity}%
                                        </span>
                                    </div>
                                    <Progress value={warehouse.capacity} className="h-2" />
                                </div>
                                <div className="flex items-center justify-between text-sm pt-2 border-t">
                                    <span className="text-muted-foreground">{t("warehouse.storekeeper")}</span>
                                    <span>{warehouse.storekeeper}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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

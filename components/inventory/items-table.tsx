"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Search,
    Filter
} from "lucide-react"
import { ItemsGrid } from "./items-grid"
import { CategoryViews, DefaultCategoryView } from "./category-lists/registry"

interface ItemsTableProps {
    warehouseId: number
    categories: string[]
}

type SortOption =
    | "name-az"
    | "qty-asc"
    | "qty-desc"
    | "date-new"
    | "date-old"


export function ItemsTable({ warehouseId, categories }: ItemsTableProps) {
    // ... existing hooks and state ...
    const t = useTranslations("Inventory")
    const [activeTab, setActiveTab] = useState<string>(() => {
        return categories.length === 1 ? categories[0] : "all"
    })

    // ... existing state ...
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState<SortOption>("date-new")

    const items = useLiveQuery(
        () => db.items.where("warehouseId").equals(warehouseId).toArray(),
        [warehouseId]
    )

    // ... existing filter logic (copied to ensure it's preserved) ...
    const filteredItems = items?.filter(item => {
        if (activeTab !== "all" && item.category !== activeTab) return false
        const query = searchQuery.toLowerCase()
        if (query && !item.name.toLowerCase().includes(query) && !item.sku.toLowerCase().includes(query)) return false
        return true
    })

    const sortedItems = filteredItems?.sort((a, b) => {
        switch (sortOption) {
            case "name-az": return a.name.localeCompare(b.name)
            case "qty-asc": return (a.totalQuantity || 0) - (b.totalQuantity || 0)
            case "qty-desc": return (b.totalQuantity || 0) - (a.totalQuantity || 0)
            case "date-new": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            case "date-old": return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            default: return 0
        }
    })

    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }

    const showTabs = categories.length > 1

    // Determine which view to render
    const renderContent = () => {
        if (activeTab === 'all') {
            return <ItemsGrid items={sortedItems || []} />
        }

        const CategoryComponent = CategoryViews[activeTab] || DefaultCategoryView
        return <CategoryComponent items={sortedItems || []} />
    }

    return (
        <div className="space-y-6">
            {/* Top Bar: Tabs & Main Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {showTabs ? (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all">{t("form.filter_all")}</TabsTrigger>
                            {categories.map(cat => (
                                <TabsTrigger key={cat} value={cat}>
                                    {cat === 'fabric' ? t("form.filter_fabric") :
                                        cat === 'accessories' ? t("form.filter_accessories") :
                                            cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                ) : (
                    <div className="hidden md:block" />
                )}

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                        <Input
                            placeholder={t("form.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 rtl:pr-9 rtl:pl-3"
                        />
                    </div>
                </div>
            </div>

            {/* Smart Filters Bar */}
            <div className="flex flex-wrap gap-2 items-center bg-muted/20 p-2 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">{t("form.sort_by")}:</span>
                    <Select value={sortOption} onValueChange={(val) => setSortOption(val as SortOption)}>
                        <SelectTrigger className="w-[180px] h-9 bg-background">
                            <SelectValue placeholder={t("form.sort_by")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name-az">{t("form.sort_az")}</SelectItem>
                            <SelectItem value="qty-asc">{t("form.sort_qty_asc")}</SelectItem>
                            <SelectItem value="qty-desc">{t("form.sort_qty_desc")}</SelectItem>
                            <SelectItem value="date-new">{t("form.sort_date_new")}</SelectItem>
                            <SelectItem value="date-old">{t("form.sort_date_old")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid Display */}
            {renderContent()}
        </div>
    )
}

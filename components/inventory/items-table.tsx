"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ItemsTableProps {
    warehouseId: number
    categories: string[]
}

type SortOption =
    | "name-az"
    | "qty-asc"
    | "qty-desc"
    | "price-asc"
    | "price-desc"
    | "date-new"
    | "date-old"

export function ItemsTable({ warehouseId, categories }: ItemsTableProps) {
    const t = useTranslations("Inventory")

    // Determine initial tab: if only one category, auto-select it. Otherwise 'all'.
    // We use a state initializer function to run this logic once.
    const [activeTab, setActiveTab] = useState<string>(() => {
        return categories.length === 1 ? categories[0] : "all"
    })

    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState<SortOption>("date-new")

    // Dynamic Filters
    const [filterWidth, setFilterWidth] = useState("")
    const [filterColor, setFilterColor] = useState("")
    const [filterSize, setFilterSize] = useState("")

    const items = useLiveQuery(
        () => db.items.where("warehouseId").equals(warehouseId).toArray(),
        [warehouseId]
    )

    // Filter Logic
    const filteredItems = items?.filter(item => {
        // Tab Filter
        // If activeTab is 'all', show everything. 
        // If activeTab is specific, matches category.
        if (activeTab !== "all" && item.category !== activeTab) return false

        // Search Filter
        const query = searchQuery.toLowerCase()
        if (query && !item.name.toLowerCase().includes(query) && !item.sku.toLowerCase().includes(query)) {
            return false
        }

        // Dynamic Filters
        // Note: We check activeTab OR if the single category implies specific fields.
        // Actually, checking activeTab is sufficient because we force activeTab to the category if strictly one.
        if (activeTab === "fabric") {
            if (filterWidth && item.width?.toString() !== filterWidth) return false
            if (filterColor && !item.color?.toLowerCase().includes(filterColor.toLowerCase())) return false
        }

        if (activeTab === "accessories") {
            if (filterSize && !item.size?.toLowerCase().includes(filterSize.toLowerCase())) return false
        }

        return true
    })

    // Sort Logic
    const sortedItems = filteredItems?.sort((a, b) => {
        switch (sortOption) {
            case "name-az": return a.name.localeCompare(b.name)
            case "qty-asc": return a.quantity - b.quantity
            case "qty-desc": return b.quantity - a.quantity
            case "price-asc": return (a.price || 0) - (b.price || 0)
            case "price-desc": return (b.price || 0) - (a.price || 0)
            case "date-new": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            case "date-old": return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            default: return 0
        }
    })

    // Reset filters when changing tabs
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setFilterWidth("")
        setFilterColor("")
        setFilterSize("")
    }

    const showTabs = categories.length > 1

    return (
        <div className="space-y-4">
            {/* Top Bar: Tabs & Main Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {showTabs ? (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all">{t("form.filter_all")}</TabsTrigger>
                            {categories.includes("fabric") && <TabsTrigger value="fabric">{t("form.filter_fabric")}</TabsTrigger>}
                            {categories.includes("accessories") && <TabsTrigger value="accessories">{t("form.filter_accessories")}</TabsTrigger>}
                        </TabsList>
                    </Tabs>
                ) : (
                    // Spacer/Title if no tabs, or just empty?
                    // Maybe show label of the current category?
                    // Let's just keep it clean or show a static badge? 
                    // For now, empty placeholder to keep layout if needed, or nothing.
                    // The user said "don't show filtering", so we show nothing here.
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
                            <SelectItem value="price-asc">{t("form.sort_price_asc")}</SelectItem>
                            <SelectItem value="price-desc">{t("form.sort_price_desc")}</SelectItem>
                            <SelectItem value="date-new">{t("form.sort_date_new")}</SelectItem>
                            <SelectItem value="date-old">{t("form.sort_date_old")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Vertical Separator */}
                {(activeTab !== 'all') && <div className="h-6 w-px bg-border mx-2" />}

                {/* Context-Aware Filters */}
                {activeTab === "fabric" && (
                    <>
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <Input
                                placeholder={t("form.width")}
                                value={filterWidth}
                                onChange={(e) => setFilterWidth(e.target.value)}
                                className="h-9 w-[120px] bg-background"
                                type="number"
                            />
                        </div>
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <Input
                                placeholder={t("form.color")}
                                value={filterColor}
                                onChange={(e) => setFilterColor(e.target.value)}
                                className="h-9 w-[120px] bg-background"
                            />
                        </div>
                    </>
                )}

                {activeTab === "accessories" && (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <Input
                            placeholder={t("form.size")}
                            value={filterSize}
                            onChange={(e) => setFilterSize(e.target.value)}
                            className="h-9 w-[120px] bg-background"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("form.name")}</TableHead>
                            <TableHead>{t("form.sku")}</TableHead>

                            {/* Dynamic Fabric Headers */}
                            {(activeTab === "all" || activeTab === "fabric") && (
                                <>
                                    <TableHead className="hidden md:table-cell">{t("form.fabric_type")}</TableHead>
                                    <TableHead className="hidden md:table-cell">{t("form.color")}</TableHead>
                                    <TableHead className="hidden lg:table-cell">{t("form.width")}</TableHead>
                                </>
                            )}

                            {/* Dynamic Accessory Headers */}
                            {(activeTab === "all" || activeTab === "accessories") && (
                                <>
                                    <TableHead className="hidden md:table-cell">{t("form.accessory_type")}</TableHead>
                                    <TableHead className="hidden md:table-cell">{t("form.size")}</TableHead>
                                </>
                            )}

                            <TableHead className="text-right">{t("form.quantity")}</TableHead>
                            <TableHead className="text-right">{t("form.price")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!sortedItems?.length && (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    {t("form.no_items")}
                                </TableCell>
                            </TableRow>
                        )}
                        {sortedItems?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.name}</span>
                                        <span className="text-xs text-muted-foreground md:hidden">{item.category}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{item.sku}</TableCell>

                                {/* Fabric Cells */}
                                {(activeTab === "all" || activeTab === "fabric") && (
                                    <>
                                        <TableCell className="hidden md:table-cell">
                                            {item.category === 'fabric' ? item.fabricType : '-'}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {item.category === 'fabric' ? (
                                                <div className="flex items-center gap-2">
                                                    {item.color && (
                                                        <div
                                                            className="w-3 h-3 rounded-full border shadow-sm"
                                                            style={{ backgroundColor: item.color }}
                                                            title={item.color}
                                                        />
                                                    )}
                                                    {item.color || '-'}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {item.category === 'fabric' ? `${item.width || '-'} cm` : '-'}
                                        </TableCell>
                                    </>
                                )}

                                {/* Accessory Cells */}
                                {(activeTab === "all" || activeTab === "accessories") && (
                                    <>
                                        <TableCell className="hidden md:table-cell">
                                            {item.category === 'accessories' ? item.accessoryType : '-'}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {item.category === 'accessories' ? item.size : '-'}
                                        </TableCell>
                                    </>
                                )}

                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {item.quantity <= item.minQuantity && (
                                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Low</Badge>
                                        )}
                                        <span className="font-bold font-mono">{item.quantity}</span>
                                        <span className="text-xs text-muted-foreground">{item.unit}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {item.price ? `$${item.price.toFixed(2)}` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

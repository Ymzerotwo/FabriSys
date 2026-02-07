"use client"

import { useTranslations } from "next-intl"
import {
    Card,
} from "@/components/ui/card"
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Package,
    ScrollText
} from "lucide-react"

interface ItemCardProps {
    item: {
        id?: number
        warehouseId: number
        name: string
        sku: string
        category: string
        minQuantity: number
        totalQuantity: number
        unit: string
        image?: string
    }
}

import { useRouter } from "@/i18n/routing"

export function ItemCard({ item }: ItemCardProps) {
    const t = useTranslations("Inventory")
    const router = useRouter()

    const getStockStatus = (quantity: number, minQuantity: number) => {
        if (quantity === 0) return { label: t("warehouse.out_of_stock"), color: "text-destructive", icon: XCircle, bg: "bg-destructive/10" }
        if (quantity <= minQuantity) return { label: t("warehouse.low_stock"), color: "text-orange-500", icon: AlertTriangle, bg: "bg-orange-500/10" }
        return { label: t("warehouse.in_stock"), color: "text-green-500", icon: CheckCircle2, bg: "bg-green-500/10" }
    }

    const status = getStockStatus(item.totalQuantity || 0, item.minQuantity)
    const StatusIcon = status.icon

    // Determine category icon/color
    const isFabric = item.category === 'fabric'
    const CategoryIcon = isFabric ? ScrollText : Package

    // More professional, subtle color palette
    const accentColor = isFabric ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
    const iconBg = isFabric ? "bg-blue-50 dark:bg-blue-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"
    const borderColor = isFabric ? "hover:border-blue-500/30" : "hover:border-emerald-500/30"

    return (
        <Card
            onClick={() => router.push(`/inventory/${item.warehouseId}/products/${item.id}`)}
            className={`
                group cursor-pointer transition-all duration-300
                hover:shadow-lg hover:-translate-y-1
                border-border/60 ${borderColor}
                flex flex-col
            `}
        >
            <div className="p-5 flex flex-col gap-4">
                {/* Header: Icon + Name */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${iconBg} ${accentColor} transition-colors`}>
                            <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold text-base leading-tight truncate text-foreground/90" title={item.name}>
                                {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                                <span className="opacity-50">{t("form.sku")}</span>
                                <span className="font-medium">{item.sku}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider with dashed line */}
                <div className="h-px w-full bg-border/50 border-t border-dashed" />

                {/* Footer: Stats + Status */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {t("warehouse.total_stock")}
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground tracking-tight">
                                {item.totalQuantity || 0}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                                {item.unit}
                            </span>
                        </div>
                    </div>

                    <div className={`
                        flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                        text-[10px] font-semibold border
                        ${status.bg} ${status.color} border-${status.color}/20
                    `}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                    </div>
                </div>
            </div>
        </Card>
    )
}

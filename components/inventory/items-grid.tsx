import {
    ScrollText,
    Box,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { ItemCard } from "@/components/inventory/item-card"

import { Item } from "@/lib/db"

interface ItemsGridProps {
    items: Item[]
    emptyIconCategory?: 'fabric' | 'other'
}

export function ItemsGrid({ items, emptyIconCategory = 'other' }: ItemsGridProps) {
    const t = useTranslations("Inventory")

    if (!items?.length) {
        return (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5 gap-2">
                <div className="p-4 rounded-full bg-muted/20">
                    {emptyIconCategory === 'fabric' ? <ScrollText className="h-8 w-8 opacity-50" /> : <Box className="h-8 w-8 opacity-50" />}
                </div>
                <p>{t("form.no_items")}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}

import { ItemsGrid } from "../items-grid"
import { Item } from "@/lib/db"

interface FabricListProps {
    items: Item[]
}

export function FabricList({ items }: FabricListProps) {
    return (
        <ItemsGrid items={items} emptyIconCategory="fabric" />
    )
}

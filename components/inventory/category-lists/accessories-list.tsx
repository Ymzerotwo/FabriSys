import { ItemsGrid } from "../items-grid"
import { Item } from "@/lib/db"

interface AccessoriesListProps {
    items: Item[]
}

export function AccessoriesList({ items }: AccessoriesListProps) {
    return (
        <ItemsGrid items={items} emptyIconCategory="other" />
    )
}

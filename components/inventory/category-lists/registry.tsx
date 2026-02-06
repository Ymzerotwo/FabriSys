import { FabricList } from "./fabric-list"
import { AccessoriesList } from "./accessories-list"
import { Item } from "@/lib/db"

export const CategoryViews: Record<string, React.ComponentType<{ items: Item[] }>> = {
    fabric: FabricList,
    accessories: AccessoriesList,
}

// Fallback for unmapped categories
export const DefaultCategoryView = AccessoriesList

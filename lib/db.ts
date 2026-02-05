import Dexie, { Table } from 'dexie';

export interface Warehouse {
    id?: number;
    name: string;
    code: string;
    location: string;
    categories: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Item {
    id?: number;
    warehouseId: number;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    minQuantity: number;
    unit: string;

    price?: number;

    // Fabric specific
    fabricType?: string;
    color?: string;
    width?: number;
    weight?: number; // gsm

    // Accessory specific
    accessoryType?: string;
    size?: string;
    material?: string;

    createdAt: Date;
    updatedAt: Date;
}

export class FabriSysDatabase extends Dexie {
    warehouses!: Table<Warehouse>;
    items!: Table<Item>;

    constructor() {
        super('FabriSysDB');
        this.version(3).stores({
            warehouses: '++id, name, code, location, *categories',
            items: '++id, warehouseId, name, sku, category, price'
        });
    }
}

export const db = new FabriSysDatabase();

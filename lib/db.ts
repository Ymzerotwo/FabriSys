import Dexie, { Table } from 'dexie';

export interface Warehouse {
    id?: number;
    name: string;
    code: string;
    location: string;
    categories: string[];
    isActive?: boolean; // New field for soft delete
    createdAt: Date;
    updatedAt: Date;
}

// The Parent Product (e.g., "Parasol Fabric")
export interface Item {
    id?: number;
    warehouseId: number;
    name: string;
    sku: string; // Base Code
    category: string; // 'fabric', 'accessories'
    minQuantity: number; // For low stock alerts (on total)
    unit: string; // 'meters', 'kg', 'pcs'
    image?: string;

    // Physical Dimensions (Optional defaults or specific item data)
    width?: number;
    length?: number;
    weight?: number;

    // Cached totals for list views (updated when variants change)
    totalQuantity: number;

    createdAt: Date;
    updatedAt: Date;
}

// The Child Variant (e.g., "Red Roll, 150cm")
export interface Variant {
    id?: number;
    itemId: number; // FK to Item
    warehouseId: number; // Denormalized for rapid filtering

    quantity: number;
    price: number;

    // Dynamic attributes based on category
    // For Fabric:
    color?: string;
    width?: number;
    weight?: number; // gsm
    fabricType?: string; // specific weave if needed? usually on parent, but let's keep flexibility

    // For Accessories:
    size?: string;
    material?: string;
    accessoryType?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface Supplier {
    id?: number;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    supplyCategories?: string[]; // e.g., ['fabric', 'accessories']
    taxId?: string;
    commercialRecord?: string;
    paymentMethods?: string[]; // e.g., ['cash', 'credit', 'check']
    status: 'active' | 'inactive' | 'blocked';
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id?: number;
    username: string;
    password?: string;
    displayName: string;
    role: 'admin' | 'user';
    status: 'active' | 'blocked';
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class FabriSysDatabase extends Dexie {
    warehouses!: Table<Warehouse>;
    items!: Table<Item>;
    variants!: Table<Variant>;
    suppliers!: Table<Supplier>;
    invoices!: Table<Invoice>;
    users!: Table<User>;

    constructor() {
        super('FabriSysDB');
        this.version(8).stores({
            warehouses: '++id, name, code, location, *categories, isActive',
            items: '++id, warehouseId, name, sku, category',
            variants: '++id, itemId, warehouseId',
            suppliers: '++id, name, status, phone, *supplyCategories, *paymentMethods',
            invoices: '++id, invoiceNumber, supplierId, status, paymentMethod, date',
            users: '++id, username, role, status'
        });
    }
}

export interface Invoice {
    id?: number;
    invoiceNumber: string;
    supplierId: number; // Link to Supplier
    amount: number;
    paymentMethod: string; // 'cash', 'check', 'credit', etc.
    status: 'paid' | 'credit' | 'cancelled';
    date: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const db = new FabriSysDatabase();

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Plus,
    Package,
    Barcode,
    Scale,
    Ruler,
    Palette,
    Layers,
    BoxSelect,
    Info,
    Copy
} from "lucide-react"
import { db } from "@/lib/db"

interface AddItemDialogProps {
    warehouseId: number
    supportedCategories: string[]
}

export function AddItemDialog({ warehouseId, supportedCategories }: AddItemDialogProps) {
    const t = useTranslations("Inventory")
    const tVal = useTranslations("Validation")
    const [open, setOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>("")

    const formSchema = z.object({
        name: z.string().min(1, { message: tVal("required") }),
        sku: z.string().min(1, { message: tVal("required") }),
        quantity: z.coerce.number().min(0, { message: tVal("number_only") }),
        minQuantity: z.coerce.number().min(0, { message: tVal("number_only") }),
        price: z.coerce.number().min(0, { message: tVal("number_only") }).optional(),
        unit: z.string().min(1, { message: tVal("required") }),

        // Optional fields based on category
        fabricType: z.string().optional(),
        color: z.string().optional(),
        width: z.coerce.number().optional(),
        weight: z.coerce.number().optional(),

        accessoryType: z.string().optional(),
        size: z.string().optional(),
        material: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (selectedCategory === "fabric") {
            if (!data.fabricType) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: tVal("required"),
                    path: ["fabricType"],
                });
            }
        }
        // Add more specific validations if needed
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            sku: "",
            quantity: 0,
            minQuantity: 0,
            price: 0,
            unit: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!selectedCategory) return;

        try {
            await db.items.add({
                warehouseId,
                category: selectedCategory,
                name: values.name,
                sku: values.sku,
                quantity: values.quantity,
                minQuantity: values.minQuantity,
                unit: values.unit,
                price: values.price || 0,

                // Fabric Check
                ...(selectedCategory === 'fabric' && {
                    fabricType: values.fabricType,
                    color: values.color,
                    width: values.width,
                    weight: values.weight,
                }),

                // Accessory Check
                ...(selectedCategory === 'accessories' && {
                    accessoryType: values.accessoryType,
                    size: values.size,
                    material: values.material,
                }),

                createdAt: new Date(),
                updatedAt: new Date(),
            })
            setOpen(false)
            form.reset()
            setSelectedCategory("")
        } catch (error) {
            console.error("Failed to add item:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    <Plus className="me-2 h-4 w-4 rtl:flip" />
                    {t("form.add_item")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="p-6 pb-2 border-b border-border/40 bg-muted/10">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                            <Plus className="h-5 w-5" />
                        </div>
                        {t("form.add_item")}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <BoxSelect className="h-4 w-4" />
                            {t("form.select_category")}
                        </label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-12 text-base bg-muted/30 border-border/50 focus:ring-primary/20">
                                <SelectValue placeholder={t("form.select_category")} />
                            </SelectTrigger>
                            <SelectContent>
                                {supportedCategories?.map(cat => (
                                    <SelectItem key={cat} value={cat} className="py-3">
                                        <span className="font-medium">{t(`form.${cat}`)}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedCategory && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                        <Info className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">{t("form.name")} & {t("form.sku")}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">{t("form.name")}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                            <Input className="ps-9 rtl:pe-9 rtl:ps-3 bg-muted/20" placeholder={t("form.name")} {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="sku"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">{t("form.sku")}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                            <Input className="ps-9 rtl:pe-9 rtl:ps-3 bg-muted/20 font-mono" placeholder="SKU-000" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Inventory Stats Section */}
                                <div className="rounded-lg border border-border/50 bg-muted/10 p-4 space-y-4">
                                    <div className="flex items-center gap-2 pb-1">
                                        <Layers className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">{t("form.quantity")}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">{t("form.quantity")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="bg-background" {...field} value={field.value as number} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">{t("form.price")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="bg-background" {...field} value={field.value as number} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="unit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">{t("form.unit")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="pcs" className="bg-background" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="minQuantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-orange-500/80">{t("form.min_quantity")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="bg-background border-orange-200 focus-visible:ring-orange-500/20 dark:border-orange-900/50" {...field} value={field.value as number} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields Section */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                        <Copy className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">{t(`form.${selectedCategory}`)} {t("form.details")}</h3>
                                    </div>

                                    {/* Fabric Specifics */}
                                    {selectedCategory === "fabric" && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <FormField
                                                control={form.control}
                                                name="fabricType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">{t("form.fabric_type")}</FormLabel>
                                                        <FormControl>
                                                            <Input className="bg-muted/20" placeholder="Cotton, Silk..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="color"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs flex items-center gap-1">
                                                            <Palette className="h-3 w-3" />
                                                            {t("form.color")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input className="bg-muted/20" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="width"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs flex items-center gap-1">
                                                            <Ruler className="h-3 w-3" />
                                                            {t("form.width")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input type="number" className="bg-muted/20" {...field} value={field.value as number ?? ''} onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="weight"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs flex items-center gap-1">
                                                            <Scale className="h-3 w-3" />
                                                            {t("form.weight")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input type="number" className="bg-muted/20" {...field} value={field.value as number ?? ''} onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Accessory Specifics */}
                                    {selectedCategory === "accessories" && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <FormField
                                                control={form.control}
                                                name="accessoryType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">{t("form.accessory_type")}</FormLabel>
                                                        <FormControl>
                                                            <Input className="bg-muted/20" placeholder="Button, Zipper..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="material"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">{t("form.material")}</FormLabel>
                                                        <FormControl>
                                                            <Input className="bg-muted/20" placeholder="Metal, Plastic..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="size"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel className="text-xs flex items-center gap-1">
                                                            <Ruler className="h-3 w-3" />
                                                            {t("form.size")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input className="bg-muted/20" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="pt-4 border-t border-border/40">
                                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-destructive/10 hover:text-destructive">
                                        {t("form.cancel")}
                                    </Button>
                                    <Button type="submit" className="min-w-[100px] shadow-lg shadow-primary/20">{t("form.save")}</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

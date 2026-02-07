"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
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
import {
    Plus,
    Palette,
    Ruler,
    Weight,
    DollarSign,
    Layers
} from "lucide-react"
import { db, Item } from "@/lib/db"

interface AddStockDialogProps {
    item: Item
}

export function AddStockDialog({ item }: AddStockDialogProps) {
    const t = useTranslations("Inventory")
    const tVal = useTranslations("Validation")
    const { toast } = useToast()
    const [open, setOpen] = useState(false)

    // Base schema
    // Note: z.coerce.number() creates a schema that accepts any input and tries to convert to number.
    // The output type is number.
    const baseSchema = z.object({
        quantity: z.coerce.number().min(1, { message: tVal("number_only") }),
        price: z.coerce.number().min(0, { message: tVal("number_only") }).optional(),
        // Fabric specific
        color: z.string().optional(),
        width: z.coerce.number().optional(),
        weight: z.coerce.number().optional(),
        // Accessory specific
        size: z.string().optional(),
        material: z.string().optional(),
        accessoryType: z.string().optional(),
    })

    type FormValues = z.infer<typeof baseSchema>

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(baseSchema) as any,
        defaultValues: {
            quantity: 0,
            price: 0,
            color: "",
            width: 0,
            weight: 0,
            size: "",
            material: "",
            accessoryType: "",
        },
    })

    const onSubmit = async (values: FormValues) => {
        try {
            await db.transaction('rw', db.variants, db.items, async () => {
                // Add the variant
                await db.variants.add({
                    itemId: item.id!,
                    warehouseId: item.warehouseId,
                    quantity: values.quantity,
                    price: values.price || 0,
                    // Fabric
                    color: item.category === 'fabric' ? values.color : undefined,
                    width: item.category === 'fabric' ? values.width : undefined,
                    weight: item.category === 'fabric' ? values.weight : undefined,
                    // Accessory
                    size: item.category === 'accessories' ? values.size : undefined,
                    material: item.category === 'accessories' ? values.material : undefined,
                    accessoryType: item.category === 'accessories' ? values.accessoryType : undefined,

                    createdAt: new Date(),
                    updatedAt: new Date(),
                })

                // Update parent item total quantity
                const currentTotal = item.totalQuantity || 0
                await db.items.update(item.id!, {
                    totalQuantity: currentTotal + values.quantity,
                    updatedAt: new Date()
                })
            })

            setOpen(false)
            form.reset()
            toast({
                title: t("item_added"),
                description: t("item_added_desc"),
                variant: "success",
            })
        } catch (error) {
            console.error("Failed to add stock:", error)
            toast({
                title: t("error_title"),
                description: t("error_desc"),
                variant: "destructive",
            })
        }
    }

    const isFabric = item.category === 'fabric'

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    <Plus className="h-4 w-4" />
                    {t("actions.add_stock")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        {t("actions.add_stock")}
                        <span className="text-muted-foreground font-normal text-sm ml-2">
                            ({item.name})
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                        {/* Common: Quantity & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.quantity")} ({item.unit})</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
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
                                        <FormLabel>{t("form.price")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" className="pl-9" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Fabric Specific Fields */}
                        {isFabric && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Palette className="h-3.5 w-3.5" />
                                                {t("form.color")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Navy Blue" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="width"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Ruler className="h-3.5 w-3.5" />
                                                    {t("form.width")} (cm)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="150" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
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
                                                <FormLabel className="flex items-center gap-2">
                                                    <Weight className="h-3.5 w-3.5" />
                                                    {t("form.weight")} (gsm)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="180" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        {/* Accessory Specific Fields */}
                        {!isFabric && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.size")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. XL or 50cm" {...field} />
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
                                            <FormLabel>{t("form.material")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Plastic, Metal" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                {t("form.cancel")}
                            </Button>
                            <Button type="submit">{t("form.save")}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

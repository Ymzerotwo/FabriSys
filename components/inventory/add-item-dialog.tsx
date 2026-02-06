"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { useForm, SubmitHandler } from "react-hook-form"
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
    BoxSelect,
    Info,
} from "lucide-react"
import { db } from "@/lib/db"

interface AddItemDialogProps {
    warehouseId: number
    supportedCategories: string[]
}

export function AddItemDialog({ warehouseId, supportedCategories }: AddItemDialogProps) {
    const t = useTranslations("Inventory")
    const { toast } = useToast()
    const tVal = useTranslations("Validation")
    const [open, setOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>("")

    const formSchema = z.object({
        name: z.string().min(1, { message: tVal("required") }),
        sku: z.string().min(1, { message: tVal("required") }),
        minQuantity: z.coerce.number().min(0, { message: tVal("number_only") }),
        unit: z.string().min(1, { message: tVal("required") }),
    })

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            minQuantity: 0,
            unit: "",
        },
    })

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        if (!selectedCategory) return;

        try {
            await db.items.add({
                warehouseId,
                category: selectedCategory,
                name: values.name,
                sku: values.sku,
                minQuantity: values.minQuantity,
                unit: values.unit,
                totalQuantity: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            setOpen(false)
            form.reset()
            setSelectedCategory("")
            toast({
                title: t("item_added"),
                description: t("item_added_desc"),
            })
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">
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

                                {/* Dynamic Form Fields based on Category */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                        <Info className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">
                                            {selectedCategory === 'fabric' ? t("form.fabric_details") : t("form.accessory_details")}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        {selectedCategory === 'fabric' ? t("form.fabric_name") : t("form.item_name")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                            <Input
                                                                className="ps-9 bg-muted/20"
                                                                placeholder={selectedCategory === 'fabric' ? t("form.placeholder_fabric_name") : t("form.placeholder_accessory_name")}
                                                                {...field}
                                                            />
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
                                                            <Input
                                                                className="ps-9 bg-muted/20 font-mono"
                                                                placeholder={selectedCategory === 'fabric' ? t("form.placeholder_fabric_sku") : t("form.placeholder_accessory_sku")}
                                                                {...field}
                                                            />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">{t("form.unit")}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-muted/20">
                                                                <SelectValue placeholder={t("form.select_unit")} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {selectedCategory === 'fabric' ? (
                                                                <>
                                                                    <SelectItem value="meter">{t("units.meter")}</SelectItem>
                                                                    <SelectItem value="yard">{t("units.yard")}</SelectItem>
                                                                    <SelectItem value="kg">{t("units.kg")}</SelectItem>
                                                                    <SelectItem value="roll">{t("units.roll")}</SelectItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <SelectItem value="piece">{t("units.piece")}</SelectItem>
                                                                    <SelectItem value="box">{t("units.box")}</SelectItem>
                                                                    <SelectItem value="pack">{t("units.pack")}</SelectItem>
                                                                    <SelectItem value="pair">{t("units.pair")}</SelectItem>
                                                                    <SelectItem value="set">{t("units.set")}</SelectItem>
                                                                    <SelectItem value="dozen">{t("units.dozen")}</SelectItem>
                                                                    <SelectItem value="gross">{t("units.gross")}</SelectItem>
                                                                </>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="minQuantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-xs text-orange-500/80">{t("form.min_quantity")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="bg-muted/20 border-orange-200 focus-visible:ring-orange-500/20" {...field} value={field.value as number} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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

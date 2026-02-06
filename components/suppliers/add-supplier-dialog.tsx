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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, User, Phone, Mail, MapPin, Truck, Receipt } from "lucide-react"
import { db } from "@/lib/db"

const CATEGORIES = ['fabric', 'accessories', 'machines', 'services']
const PAYMENT_METHODS = ['cash', 'credit', 'check', 'bank_transfer']

export function AddSupplierDialog() {
    const t = useTranslations("Suppliers")
    const tVal = useTranslations("Validation")
    const { toast } = useToast()
    const [open, setOpen] = useState(false)

    const formSchema = z.object({
        name: z.string().min(2, { message: tVal("name_min") }),
        contactPerson: z.string().optional(),
        phone: z.string().min(1, { message: tVal("required") }),
        email: z.string().email({ message: tVal("invalid_email") }).optional().or(z.literal("")),
        address: z.string().optional(),
        status: z.enum(["active", "inactive", "blocked"]),
        supplyCategories: z.array(z.string()).refine((value) => value.length > 0, {
            message: tVal("categories_min"),
        }),
        taxId: z.string().optional(),
        commercialRecord: z.string().optional(),
        paymentMethods: z.array(z.string()).optional(),
    })

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            status: "active",
            supplyCategories: [],
            taxId: "",
            commercialRecord: "",
            paymentMethods: [],
        },
    })

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            await db.suppliers.add({
                name: values.name,
                contactPerson: values.contactPerson,
                phone: values.phone,
                email: values.email || undefined,
                address: values.address,
                status: values.status,
                supplyCategories: values.supplyCategories,
                taxId: values.taxId,
                commercialRecord: values.commercialRecord,
                paymentMethods: values.paymentMethods,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            setOpen(false)
            form.reset()
            toast({
                title: t("messages.added_success"),
                description: t("messages.added_success_desc"),
                variant: "success",
            })
        } catch (error) {
            console.error("Failed to add supplier:", error)
            toast({
                title: t("messages.error_generic"),
                description: t("messages.error_generic_desc"),
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    <Plus className="me-2 h-4 w-4 rtl:flip" />
                    {t("add_supplier")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="p-6 pb-2 border-b border-border/40 bg-muted/10">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        {t("add_supplier")}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.name")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                <Input className="ps-9 bg-muted/20" placeholder={t("form.placeholder_name")} {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.contact_person")}</FormLabel>
                                            <FormControl>
                                                <Input className="bg-muted/20" placeholder={t("form.placeholder_contact")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.phone")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                    <Input className="ps-9 bg-muted/20" placeholder={t("form.placeholder_phone")} {...field} />
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
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.email")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                    <Input className="ps-9 bg-muted/20" placeholder={t("form.placeholder_email")} {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.address")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
                                                    <Input className="ps-9 bg-muted/20" placeholder={t("form.placeholder_address")} {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Supply Categories */}
                        <div className="space-y-4 pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">{t("form.supply_categories")}</h3>
                            </div>
                            <FormField
                                control={form.control}
                                name="supplyCategories"
                                render={() => (
                                    <FormItem>
                                        <div className="grid grid-cols-2 gap-4">
                                            {CATEGORIES.map((cat) => (
                                                <FormField
                                                    key={cat}
                                                    control={form.control}
                                                    name="supplyCategories"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={cat}
                                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors rtl:space-x-reverse"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(cat)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, cat])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== cat
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal cursor-pointer w-full">
                                                                    {t(`form.cat_${cat}`)}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Payment & Accounting Info */}
                        <div className="space-y-4 pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">{t("form.payment_info")}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="taxId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.tax_id")}</FormLabel>
                                            <FormControl>
                                                <Input className="bg-muted/20" placeholder={t("form.placeholder_tax_id")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="commercialRecord"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("form.commercial_record")}</FormLabel>
                                            <FormControl>
                                                <Input className="bg-muted/20" placeholder={t("form.placeholder_commercial_record")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="paymentMethods"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">{t("form.payment_methods")}</FormLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PAYMENT_METHODS.map((method) => (
                                                <FormField
                                                    key={method}
                                                    control={form.control}
                                                    name="paymentMethods"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={method}
                                                                className="flex flex-row items-center space-x-2 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(method)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange(field.value ? [...field.value, method] : [method])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== method
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer">
                                                                    {t(`form.pm_${method}`)}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.status")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-muted/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">{t("form.active")}</SelectItem>
                                                <SelectItem value="inactive">{t("form.inactive")}</SelectItem>
                                                <SelectItem value="blocked">{t("form.blocked")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/40">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                {t("form.cancel")}
                            </Button>
                            <Button type="submit" className="min-w-[100px] shadow-lg shadow-primary/20">
                                {t("form.save")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

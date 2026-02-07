"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { getInvoiceSchema } from "./invoice-schema"
import { db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { toast } from "@/hooks/use-toast"

interface InvoiceFormProps {
    onSuccess?: () => void
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
    const t = useTranslations("Invoices.form")
    const tCommon = useTranslations("Common")
    const tValidation = useTranslations("Validation")

    // Fetch suppliers for the dropdown
    const suppliers = useLiveQuery(() => db.suppliers.where('status').equals('active').toArray())

    const [openSupplier, setOpenSupplier] = React.useState(false)
    const [supplierSearch, setSupplierSearch] = React.useState("")

    const form = useForm({
        resolver: zodResolver(getInvoiceSchema((key) => {
            // Simple mapping for now, ideally pass full translation function or specific keys
            if (key === 'required') return tValidation('required');
            if (key === 'amount_positive') return "المبلغ يجب أن يكون أكبر من 0"; // Fallback or add to json
            return "Invalid";
        })),
        defaultValues: {
            invoiceNumber: "",
            supplierId: 0,
            amount: 0,
            status: "paid",
            paymentMethod: "cash",
            date: new Date(),
            notes: ""
        },
    })

    const filteredSuppliers = suppliers?.filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function onSubmit(data: any) {
        try {
            await db.invoices.add({
                invoiceNumber: data.invoiceNumber,
                supplierId: data.supplierId,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                status: data.status as 'paid' | 'credit' | 'cancelled',
                date: data.date,
                notes: data.notes,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            toast({
                title: t('save'),
                description: "تم حفظ الفاتورة بنجاح", // Or use translation key
            })

            form.reset()
            onSuccess?.()
        } catch (error) {
            console.error("Failed to save invoice:", error)
            toast({
                variant: "destructive",
                title: tCommon('error'),
                description: "حدث خطأ أثناء الحفظ",
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('invoice_number')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('placeholder_invoice_number')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{t('supplier')}</FormLabel>
                            <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openSupplier}
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? suppliers?.find((s) => s.id === field.value)?.name
                                                : t('select_supplier')}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <div className="p-2 border-b">
                                        <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                            <input
                                                className="flex-1 bg-transparent outline-none text-sm"
                                                placeholder={t('search_supplier')}
                                                value={supplierSearch}
                                                onChange={(e) => setSupplierSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto p-1">
                                        {filteredSuppliers?.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                {t('no_supplier_found')}
                                            </div>
                                        ) : (
                                            filteredSuppliers?.map((supplier) => (
                                                <div
                                                    key={supplier.id}
                                                    className={cn(
                                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                        supplier.id === field.value && "bg-accent/50"
                                                    )}
                                                    onClick={() => {
                                                        form.setValue("supplierId", supplier.id!)
                                                        setOpenSupplier(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            supplier.id === field.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {supplier.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('amount')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={t('placeholder_amount')}
                                        {...field}
                                        value={field.value as number}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{t('date')}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>{t('date')}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('payment_method')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_payment_method')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>

                                        <SelectItem value="cash">نقدي (Cash)</SelectItem>
                                        <SelectItem value="check">شيك (Check)</SelectItem>
                                        <SelectItem value="bank_transfer">تحويل بنكي (Bank Transfer)</SelectItem>
                                        <SelectItem value="credit">آجل (Credit)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('status')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_status')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="paid">مدفوعة (Paid)</SelectItem>
                                        <SelectItem value="credit">آجل (Credit)</SelectItem>
                                        <SelectItem value="cancelled">ملغية (Cancelled)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('notes')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('placeholder_notes')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Form>
    )
}

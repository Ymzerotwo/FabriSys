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
    DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { db } from "@/lib/db"

export function AddWarehouseDialog() {
    const t = useTranslations("Inventory")
    const tVal = useTranslations("Validation")
    const [open, setOpen] = useState(false)

    const formSchema = z.object({
        name: z.string().min(2, {
            message: t("validation.name_min"),
        }),
        code: z.string().min(1, {
            message: tVal("required"),
        }),
        location: z.string().min(1, {
            message: tVal("required"),
        }),
        categories: z.array(z.string()).refine((value) => value.length > 0, {
            message: t("validation.categories_min"),
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            location: "",
            categories: [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await db.warehouses.add({
                name: values.name,
                code: values.code,
                location: values.location,
                categories: values.categories,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error("Failed to add warehouse:", error)
            alert(t("Errors.generic")) // Fallback if no toast
        }
    }

    const categoryItems = [
        {
            id: "fabric",
            label: t("form.fabric"),
        },
        {
            id: "accessories",
            label: t("form.accessories"),
        },
        {
            id: "finished",
            label: t("form.finished"),
        },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="me-2 h-4 w-4 rtl:flip" />
                    {t("add_warehouse")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("form.add_title")}</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">

                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.name")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.code")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.location")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categories"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">{t("form.categories")}</FormLabel>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {categoryItems.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="categories"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-sm cursor-pointer">
                                                                {item.label}
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

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

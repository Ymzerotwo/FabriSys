import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useForm, SubmitHandler } from "react-hook-form"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Settings, Trash2, Archive, MapPin, Package } from "lucide-react"
import { db, Warehouse } from "@/lib/db"
import { useRouter } from "@/i18n/routing"
import { useToast } from "@/hooks/use-toast"

interface WarehouseSettingsDialogProps {
    warehouse: Warehouse
}

export function WarehouseSettingsDialog({ warehouse }: WarehouseSettingsDialogProps) {
    const t = useTranslations("Inventory")
    const tVal = useTranslations("Validation")
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const formSchema = z.object({
        name: z.string().min(1, { message: tVal("required") }),
        location: z.string().min(1, { message: tVal("required") }),
    })

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: warehouse.name,
            location: warehouse.location,
        },
    })

    useEffect(() => {
        form.reset({
            name: warehouse.name,
            location: warehouse.location
        })
    }, [warehouse, form])

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            await db.warehouses.update(warehouse.id!, {
                name: values.name,
                location: values.location,
                updatedAt: new Date()
            })
            setOpen(false)
            toast({
                title: t("settings_saved"),
                description: t("settings_saved_desc"),
                variant: "success",
            })
        } catch (error) {
            console.error("Failed to update warehouse:", error)
            toast({
                title: t("error_title"),
                description: t("error_desc"),
                variant: "destructive",
            })
        }
    }

    const handleSoftDelete = async () => {
        try {
            await db.warehouses.update(warehouse.id!, {
                isActive: false,
                updatedAt: new Date()
            })

            setOpen(false)
            toast({
                title: t("warehouse_deactivated"),
                description: t("warehouse_deactivated_desc"),
                variant: "success",
            })

            router.push("/inventory")
        } catch (error) {
            console.error("Failed to deactivate warehouse:", error)
            toast({
                title: t("error_title"),
                description: t("error_desc"),
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("settings")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Settings className="h-5 w-5 text-primary" />
                        {t("warehouse_settings")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("warehouse_settings_desc")}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        {t("form.name")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.name_placeholder")} {...field} />
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
                                    <FormLabel className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {t("form.location")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.location_placeholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4 border-t border-border flex justify-between items-center bg-destructive/5 p-4 rounded-lg">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                                    <Archive className="h-4 w-4" />
                                    {t("danger_zone")}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {t("mark_out_of_service_desc")}
                                </p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="shadow-lg shadow-destructive/20"
                                    >
                                        <Trash2 className="h-4 w-4 me-2" />
                                        {t("mark_out_of_service")}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t("confirm_delete_warehouse")}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("mark_out_of_service_desc")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSoftDelete} className="bg-destructive hover:bg-destructive/90">
                                            {t("confirm_yes")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        <DialogFooter>
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

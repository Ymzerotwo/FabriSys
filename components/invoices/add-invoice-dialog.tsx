"use client"

import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { InvoiceForm } from "./invoice-form"
import { useState } from "react"

export function AddInvoiceDialog() {
    const t = useTranslations("Invoices")
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('add_invoice')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('add_invoice')}</DialogTitle>
                </DialogHeader>
                <InvoiceForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

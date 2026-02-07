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
import { UserForm } from "./user-form"
import { useState } from "react"
import { User } from "@/lib/db"

export function AddUserDialog() {
    const t = useTranslations("Users")
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('add_user')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('add_user')}</DialogTitle>
                </DialogHeader>
                <UserForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

export function EditUserDialog({ user, open, onOpenChange }: { user: User, open: boolean, onOpenChange: (open: boolean) => void }) {
    const t = useTranslations("Users.actions")
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('edit')}</DialogTitle>
                </DialogHeader>
                <UserForm user={user} onSuccess={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}

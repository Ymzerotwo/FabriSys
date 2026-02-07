"use client"

import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useTranslations } from "next-intl"

export function NotificationsNav() {
    const t = useTranslations('Notifications')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {/* Badge placeholder - uncomment when real notifications are implemented */}
                    {/* <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" /> */}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{t('title')}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {t('unread', { count: 0 })}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm gap-2">
                    <Bell className="h-8 w-8 opacity-20" />
                    <p>{t('empty')}</p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

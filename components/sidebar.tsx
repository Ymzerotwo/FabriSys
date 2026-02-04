"use client"

import * as React from "react"
import { usePathname } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Menu // Added Menu icon for mobile
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet" // Import Sheet components

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const t = useTranslations('Navigation')
    const pathname = usePathname()
    // State for Desktop Collapse
    const [isCollapsed, setIsCollapsed] = React.useState(false)

    const toggleSidebar = () => setIsCollapsed(!isCollapsed)

    const items = [
        {
            title: t('dashboard'),
            href: "/dashboard",
            icon: LayoutDashboard,
            variant: "default",
        },
        {
            title: t('inventory'),
            href: "/inventory",
            icon: Package,
            variant: "ghost",
        },
        {
            title: t('suppliers'),
            href: "/suppliers",
            icon: Users,
            variant: "ghost",
        },
        {
            title: t('invoices'),
            href: "/invoices",
            icon: FileText,
            variant: "ghost",
        },
        {
            title: t('statistics'),
            href: "/statistics",
            icon: BarChart3,
            variant: "ghost",
        },
    ]

    const sidebarItems = items.map((item, index) => {
        const isActive = pathname.startsWith(item.href)
        return (
            <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={cn(
                    "justify-start gap-3",
                    isActive && "bg-secondary text-secondary-foreground shadow-sm",
                    isCollapsed && "justify-center px-2"
                )}
            >
                <Link href={item.href}>
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    {!isCollapsed && <span className="text-base font-medium">{item.title}</span>}
                </Link>
            </Button>
        )
    })

    // Desktop Sidebar
    return (
        <>
            {/* Mobile Trigger - This should be placed in the Header usually, but if Sidebar wraps layout, we might need a different approach.
                However, usually the Trigger is in the Navbar.
                Since this component is <Sidebar /> and is placed in Layout aside the main content, 
                we might need to export the MobileTrigger separately OR render it here if it's visible only on mobile.
                
                Actually, usually the layout has:
                [DesktopSidebar (hidden on mobile)]
                [MainContent]
                   [Header (contains MobileMenuTrigger)]
            */}

            <div
                className={cn(
                    "hidden md:flex relative flex-col border-e bg-card transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64",
                    className
                )}
            >
                <div className="flex h-16 items-center border-b px-4">
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-primary">FabriSys</span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("ms-auto", isCollapsed && "mx-auto")}
                        onClick={toggleSidebar}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                        )}
                    </Button>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid gap-1 px-2">
                        {sidebarItems}
                    </nav>
                </div>
            </div>

            {/* We export the MobileSheet to be used in the Header */}
        </>
    )
}

// Separate component for the Mobile Trigger to place in the Header
export function MobileSidebarTrigger() {
    const t = useTranslations('Navigation')
    const pathname = usePathname()
    const [open, setOpen] = React.useState(false)

    const items = [
        { title: t('dashboard'), href: "/dashboard", icon: LayoutDashboard },
        { title: t('inventory'), href: "/inventory", icon: Package },
        { title: t('suppliers'), href: "/suppliers", icon: Users },
        { title: t('invoices'), href: "/invoices", icon: FileText },
        { title: t('statistics'), href: "/statistics", icon: BarChart3 },
    ]

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden me-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[300px] p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="text-start font-bold text-xl text-primary">FabriSys</SheetTitle>
                    <SheetDescription className="sr-only">Main Navigation Menu</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid gap-1 px-2">
                        {items.map((item, index) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Button
                                    key={index}
                                    variant={isActive ? "secondary" : "ghost"}
                                    asChild
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "justify-start gap-3",
                                        isActive && "bg-secondary text-secondary-foreground shadow-sm"
                                    )}
                                >
                                    <Link href={item.href}>
                                        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                        <span className="text-base font-medium">{item.title}</span>
                                    </Link>
                                </Button>
                            )
                        })}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    )
}

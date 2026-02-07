"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, SortAsc, Users, UserCheck, Shield, UserX, MoreHorizontal, MessageSquare, Trash } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, User } from "@/lib/db"
import { AddUserDialog, EditUserDialog } from "@/components/users/user-dialogs"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UsersContent() {
    const t = useTranslations("Users")
    const tStats = useTranslations("Users.stats")
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")

    // Live query to fetch users
    const users = useLiveQuery(async () => {
        const collection = db.users.toCollection()
        let result = await collection.toArray()

        // Filtering
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(u =>
                u.username.toLowerCase().includes(lowerQuery) ||
                u.displayName.toLowerCase().includes(lowerQuery)
            )
        }

        if (roleFilter !== "all") {
            result = result.filter(u => u.role === roleFilter)
        }

        // Sorting
        if (sortOrder === "newest") {
            result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else {
            result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }

        return result
    }, [searchQuery, roleFilter, sortOrder])

    // Stats
    const totalCount = useLiveQuery(() => db.users.count())
    const activeCount = useLiveQuery(() => db.users.where('status').equals('active').count())
    const blockedCount = useLiveQuery(() => db.users.where('status').equals('blocked').count())
    const adminCount = useLiveQuery(() => db.users.where('role').equals('admin').count())

    const isLoading = users === undefined

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h2>
                </div>
                <div className="w-full sm:w-auto">
                    <AddUserDialog />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatsCard title={tStats("total_users")} value={totalCount?.toString() || "0"} icon={Users} isLoading={totalCount === undefined} />
                <StatsCard title={tStats("active_users")} value={activeCount?.toString() || "0"} icon={UserCheck} variant="success" isLoading={activeCount === undefined} />
                <StatsCard title={tStats("blocked_users")} value={blockedCount?.toString() || "0"} icon={UserX} variant="destructive" isLoading={blockedCount === undefined} />
                <StatsCard title={tStats("admins")} value={adminCount?.toString() || "0"} icon={Shield} variant="warning" isLoading={adminCount === undefined} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                    <Input
                        placeholder={t("toolbar.search_placeholder")}
                        className="pl-9 rtl:pr-9 rtl:pl-3"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="flex-1 md:w-[140px]">
                            <Filter className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.filter_all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("toolbar.filter_all")}</SelectItem>
                            <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                            <SelectItem value="user">{t("roles.user")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="flex-1 md:w-[160px]">
                            <SortAsc className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                            <SelectValue placeholder={t("toolbar.sort_newest")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("toolbar.sort_newest")}</SelectItem>
                            <SelectItem value="oldest">{t("toolbar.sort_oldest")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <UserCardSkeleton key={i} />)
                ) : users?.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>{t("toolbar.no_users")}</p>
                    </div>
                ) : (
                    users?.map((user) => (
                        <UserCard key={user.id} user={user} t={t} />
                    ))
                )}
            </div>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatsCard({ title, value, icon: Icon, variant = "default", isLoading }: { title: string; value: string; icon: any; variant?: "default" | "destructive" | "success" | "warning"; isLoading: boolean }) {
    const variantColors = {
        default: "text-muted-foreground",
        destructive: "text-destructive",
        success: "text-emerald-500",
        warning: "text-amber-500"
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", variantColors[variant])} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className={cn("text-2xl font-bold")}>{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserCard({ user, t }: { user: User, t: any }) {
    const { toast } = useToast()
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const handleDelete = async () => {
        try {
            await db.users.delete(user.id!)
            toast({
                title: t("messages.deleted_success"),
                description: t("messages.desc_deleted"),
            })
            setDeleteOpen(false)
        } catch (error) {
            console.error("Failed to delete user", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete user"
            })
        }
    }

    const handleBlockToggle = async () => {
        const newStatus = user.status === 'active' ? 'blocked' : 'active'
        await db.users.update(user.id!, { status: newStatus })
        toast({
            title: t("messages.status_changed"),
            description: t("messages.desc_status_changed"),
        })
    }

    return (
        <>
            <Card className="group hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold truncate">
                                {user.displayName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {t(`roles.${user.role}`)}
                        </Badge>
                        <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}
                            className={cn(user.status === 'active' && "text-emerald-500 border-emerald-500 bg-emerald-500/10")}>
                            {t(`status.${user.status}`)}
                        </Badge>
                    </div>

                    <div className="pt-2 flex justify-end border-t border-border/40 mt-3 pt-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("actions.edit")}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <MessageSquare className="mr-2 h-4 w-4 opacity-70" />
                                    {/* Using MessageSquare as placeholder for Edit icon if Pen not imported? UserCog imported? I'll use generic edit text */}
                                    {t("actions.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBlockToggle}>
                                    {user.status === 'active' ? (
                                        <>
                                            <UserX className="mr-2 h-4 w-4 text-destructive" />
                                            {t("actions.block")}
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
                                            {t("actions.unblock")}
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    {t("actions.delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            <EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("messages.confirm_delete_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("messages.confirm_delete_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {t("actions.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function UserCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}

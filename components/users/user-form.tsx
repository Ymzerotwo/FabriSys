"use client"

import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getUserSchema, UserFormValues } from "./user-schema"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db, User } from "@/lib/db"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"

interface UserFormProps {
    onSuccess?: () => void
    user?: User
}

export function UserForm({ onSuccess, user }: UserFormProps) {
    const t = useTranslations("Users.form")
    const tErrors = useTranslations("Validation")
    const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null)

    const form = useForm({
        resolver: zodResolver(getUserSchema((key) => {
            // quick mapping for now
            if (key === 'min_3_chars') return tErrors('min_length', { "min": 3 });
            if (key === 'min_2_chars') return tErrors('min_length', { "min": 2 });
            if (key === 'min_6_chars') return tErrors('min_length', { "min": 6 });
            return "Invalid";
        })),
        defaultValues: {
            username: user?.username || "",
            password: "",
            displayName: user?.displayName || "",
            role: user?.role || "user",
            status: user?.status || "active",
            profileImage: user?.profileImage || ""
        },
    })

    const displayName = useWatch({
        control: form.control,
        name: "displayName"
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setImagePreview(result)
                form.setValue("profileImage", result)
            }
            reader.readAsDataURL(file)
        }
    }


    async function onSubmit(data: UserFormValues) {
        try {
            if (user) {
                // Update existing user
                const updates: Partial<User> = {
                    username: data.username,
                    displayName: data.displayName,
                    role: data.role,
                    status: data.status,
                    profileImage: data.profileImage,
                    updatedAt: new Date()
                }
                if (data.password) {
                    updates.password = data.password // Only update password if provided
                }

                await db.users.update(user.id!, updates)
                toast({
                    title: "User Updated", // Localize later
                    description: "User details updated successfully."
                })
            } else {
                // specific check: password is required for new users
                if (!data.password) {
                    form.setError("password", { message: tErrors('required') })
                    return
                }

                await db.users.add({
                    username: data.username,
                    password: data.password,
                    displayName: data.displayName,
                    role: data.role as 'admin' | 'user',
                    status: data.status as 'active' | 'blocked',
                    profileImage: data.profileImage || undefined,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                toast({
                    title: "User Added",
                    description: "User created successfully."
                })
            }

            if (!user) form.reset()
            onSuccess?.()
        } catch (error) {
            console.error("Failed to save user:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save user."
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 mb-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={imagePreview || ""} />
                        <AvatarFallback className="text-2xl">{displayName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="relative cursor-pointer"
                            onClick={() => document.getElementById('image-upload')?.click()}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {imagePreview ? "Change Image" : "Upload Image"}
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </Button>
                        {imagePreview && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setImagePreview(null)
                                    form.setValue("profileImage", "")
                                }}
                            >
                                <X className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('display_name')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('placeholder_display_name')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('username')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('placeholder_username')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('password')}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={user ? "Leave blank to keep current" : "*******"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('role')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_role')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
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
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Form>
    )
}

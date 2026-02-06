"use client"

import { useToast } from "@/hooks/use-toast"
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                const variant = props.variant as "default" | "destructive" | "success" | "warning" | undefined

                return (
                    <Toast key={id} {...props}>
                        <div className="flex gap-3 items-start">
                            {variant === "success" && <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                            {variant === "destructive" && <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                            {variant === "warning" && <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />}
                            {/* Optional: Add Info icon for default if desired, or leave blank */}

                            <div className="grid gap-1">
                                {title && <ToastTitle>{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription>{description}</ToastDescription>
                                )}
                            </div>
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}

"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations('Errors');
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
            <div className="flex max-w-md flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-secondary blur-xl opacity-50" />
                    <div className="relative rounded-full bg-secondary/30 p-6 ring-1 ring-border">
                        <FileQuestion className="h-16 w-16 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-black tracking-tight text-primary/20">404</h1>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('notFoundTitle')}
                    </h2>
                    <p className="text-muted-foreground">
                        {t('notFoundDesc')}
                    </p>
                </div>

                <Button asChild size="lg" className="gap-2">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 rtl:flip" />
                        {t('returnHome')}
                    </Link>
                </Button>
            </div>
        </div>
    );
}

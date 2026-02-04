"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="rounded-full bg-destructive/10 p-4 ring-2 ring-destructive/20">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Something went wrong!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We encountered an unexpected error while processing your request.
                        <br />
                        <span className="text-xs opacity-70">Error Code: {error.digest || 'Unknown'}</span>
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <Button onClick={() => reset()} className="flex-1 gap-2" size="lg">
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="flex-1 gap-2"
                        size="lg"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

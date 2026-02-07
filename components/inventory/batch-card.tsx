"use client"

import { useTranslations } from "next-intl"
import { Variant } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Weight, Palette, Info, Calendar } from "lucide-react"

interface BatchCardProps {
    variant: Variant
    unit: string
    isFabric: boolean
}

export function BatchCard({ variant, unit, isFabric }: BatchCardProps) {
    const t = useTranslations("Inventory.form")

    return (
        <Card className="items-start relative overflow-hidden transition-all hover:shadow-md border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-1">
                    {variant.quantity} <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                    #{variant.id}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {isFabric ? (
                        <>
                            {variant.color && (
                                <div className="flex items-center gap-2 col-span-2">
                                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className="w-3 h-3 rounded-full border shadow-sm"
                                            style={{ backgroundColor: variant.color }}
                                        />
                                        <span className="font-medium text-foreground">{variant.color}</span>
                                    </div>
                                </div>
                            )}
                            {variant.width && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Ruler className="h-3.5 w-3.5" />
                                    <span>{variant.width} cm</span>
                                </div>
                            )}
                            {variant.weight && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Weight className="h-3.5 w-3.5" />
                                    <span>{variant.weight} gsm</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {variant.size && (
                                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                    <Ruler className="h-3.5 w-3.5" />
                                    <span>{t("size")}: {variant.size}</span>
                                </div>
                            )}
                            {variant.material && (
                                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                    <Info className="h-3.5 w-3.5" />
                                    <span>{variant.material}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground border-t border-border/40 pt-2 mt-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(variant.createdAt).toLocaleDateString()}</span>
                </div>
            </CardContent>
            {/* Visual accent bar on left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isFabric ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`} />
        </Card>
    )
}

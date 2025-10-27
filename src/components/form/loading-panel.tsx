"use client";


import * as React from "react";


export default function LoadingPanel({ label }: { label: string }) {
    return (
        <div className="flex-1 min-h-0">
            <div
                className="h-full w-full flex items-center justify-center p-8"
                aria-busy="true"
                aria-live="polite"
            >
                <div className="w-full max-w-xl">
                    <div className="flex items-center gap-3 mb-6">
                        {/* spinner */}
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{label}</span>
                            <span className="ml-2 animate-pulse">Please wait…</span>
                        </div>
                    </div>


                    {/* Skeleton stack resembling form fields */}
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-40 rounded bg-muted/60" />
                                <div className="h-9 w-full rounded bg-muted/50" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
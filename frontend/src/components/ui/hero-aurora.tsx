"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HeroAurora = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-[100vh] overflow-hidden bg-slate-950",
                className
            )}
        >
            <div className="absolute inset-0 w-full h-full bg-slate-950 z-0">
                <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[-10%] h-[500px] w-[140%] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] opacity-70 blur-[100px]" />
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[50%] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,182,255,.15),rgba(255,255,255,0))] opacity-70 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[20%] h-[500px] w-[50%] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(100,50,255,.15),rgba(255,255,255,0))] opacity-70 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>

            {/* Texture Overlay */}
            <div className="absolute inset-0 w-full h-full z-[1] opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
            />
        </div>
    );
};

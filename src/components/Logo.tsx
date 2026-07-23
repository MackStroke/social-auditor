"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export default function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Image
                src="/logo.svg"
                alt="Logo"
                width={48}
                height={22}
                className="shrink-0"
                priority
            />
            <span className="font-display font-black text-2xl italic tracking-tight leading-none flex items-center">
                <span
                    className="text-slate-900 dark:text-white relative z-10"
                    style={{ textShadow: '-1.5px 0px 0px #ea4335, 1.5px 0px 0px #00d2ff' }}
                >
                    Social
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 relative z-20">
                    Auditor
                </span>
            </span>
        </div>
    );
}

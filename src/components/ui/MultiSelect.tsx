"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    id: string;
    value: string[];
    onChange: (value: string[]) => void;
    options: Option[] | string[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}

export default function MultiSelect({
    id,
    value,
    onChange,
    options,
    placeholder = "Select options",
    className,
    disabled = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const formattedOptions: Option[] =
        options.length > 0 && typeof options[0] === "string"
            ? (options as string[]).map((opt) => ({ value: opt, label: opt }))
            : (options as Option[]);

    // Close when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    // Adjust scroll position when navigating with keyboard
    useEffect(() => {
        if (isOpen && listboxRef.current && highlightedIndex >= 0) {
            const activeElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev < formattedOptions.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (formattedOptions[highlightedIndex]) {
                    toggleOption(formattedOptions[highlightedIndex].value);
                }
                break;
            case "Escape":
            case "Tab":
                setIsOpen(false);
                break;
        }
    };

    const toggleOption = (optValue: string) => {
        if (value.includes(optValue)) {
            onChange(value.filter((v) => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    const removeOption = (e: React.MouseEvent, optValue: string) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optValue));
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full", className)}
            onKeyDown={handleKeyDown}
        >
            <div
                id={id}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id}-listbox`}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledby}
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "min-h-[46px] w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg py-1.5 px-3 text-slate-900 dark:text-white transition-all flex flex-wrap gap-1.5 items-center group",
                    !disabled && "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer",
                    !disabled && isOpen ? "ring-2 ring-primary border-primary bg-slate-50 dark:bg-black/50" : (!disabled && "hover:border-slate-300 dark:hover:border-white/20"),
                    disabled && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-white/5"
                )}
            >
                <div className="flex-1 flex flex-wrap gap-2 items-center">
                    {value.length === 0 ? (
                        <span className="text-slate-400 py-1.5 pl-1">{placeholder}</span>
                    ) : (
                        value.map((v) => {
                            const opt = formattedOptions.find((o) => o.value === v);
                            return (
                                <span
                                    key={v}
                                    className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-sm font-medium"
                                >
                                    {opt ? opt.label : v}
                                    <button
                                        type="button"
                                        onClick={(e) => removeOption(e, v)}
                                        className="hover:bg-primary/20 p-0.5 rounded-full transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })
                    )}
                </div>
                <div className="flex items-center gap-1 ml-auto shrink-0 pl-1">
                    {value.length > 0 && !disabled && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDown
                        className={cn(
                            "w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200",
                            isOpen && "rotate-180 text-primary"
                        )}
                    />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        id={`${id}-listbox`}
                        ref={listboxRef}
                        role="listbox"
                        aria-multiselectable="true"
                        autoFocus
                        tabIndex={-1}
                        aria-activedescendant={
                            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
                        }
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-auto max-h-60 py-1 outline-none ring-1 ring-black/5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10"
                    >
                        {formattedOptions.map((option, index) => {
                            const isSelected = value.includes(option.value);
                            const isHighlighted = index === highlightedIndex;

                            return (
                                <li
                                    key={option.value}
                                    id={`${id}-option-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(option.value);
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={cn(
                                        "relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm transition-colors",
                                        isHighlighted ? "bg-primary/10 dark:bg-primary/20 text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200",
                                        isSelected ? "font-semibold text-primary bg-primary/5" : "font-normal"
                                    )}
                                >
                                    <span className="block truncate">{option.label}</span>
                                    {isSelected && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                            <Check className="w-4 h-4" aria-hidden="true" />
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface Option {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface SelectProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[] | string[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}

export default function Select({
    id,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className,
    disabled = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const formattedOptions: Option[] =
        options.length > 0 && typeof options[0] === "string"
            ? (options as string[]).map((opt) => ({ value: opt, label: opt }))
            : (options as Option[]);

    const selectedOption = formattedOptions.find((opt) => opt.value === value);

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

    // Handle open state focusing
    useEffect(() => {
        if (isOpen) {
            const idx = formattedOptions.findIndex((opt) => opt.value === value);
            setHighlightedIndex(idx >= 0 ? idx : 0);
        }
    }, [isOpen, value, formattedOptions]);

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
                    onChange(formattedOptions[highlightedIndex].value);
                    setIsOpen(false);
                }
                break;
            case "Escape":
            case "Tab":
                setIsOpen(false);
                break;
        }
    };

    const selectOption = (optValue: string) => {
        onChange(optValue);
        setIsOpen(false);
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
                    "w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white transition-all flex justify-between items-center group",
                    !disabled && "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer",
                    !disabled && isOpen ? "ring-2 ring-primary border-primary bg-slate-50 dark:bg-black/50" : (!disabled && "hover:border-slate-300 dark:hover:border-white/20"),
                    disabled && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-white/5"
                )}
            >
                <div className="flex items-center gap-2">
                    {selectedOption?.icon && <span className="text-slate-500 shrink-0 flex items-center">{selectedOption.icon}</span>}
                    <span className={cn("block truncate", !selectedOption && "text-slate-400")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={cn(
                        "w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
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
                        autoFocus
                        tabIndex={-1}
                        aria-activedescendant={
                            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
                        }
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-auto max-h-60 py-1 outline-none ring-1 ring-black/5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10"
                    >
                        {formattedOptions.map((option, index) => {
                            const isSelected = option.value === value;
                            const isHighlighted = index === highlightedIndex;

                            return (
                                <li
                                    key={option.value}
                                    id={`${id}-option-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => selectOption(option.value)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={cn(
                                        "relative flex items-center gap-2 cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm transition-colors",
                                        isHighlighted ? "bg-primary/10 dark:bg-primary/20 text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200",
                                        isSelected ? "font-semibold text-primary" : "font-normal"
                                    )}
                                >
                                    {option.icon && <span className="text-slate-400 shrink-0 flex items-center">{option.icon}</span>}
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

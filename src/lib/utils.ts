import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isBlankDisplayValue(value: unknown) {
  if (value === null || value === undefined) return true
  if (typeof value !== "string") return false

  const normalized = value.trim().toLowerCase()
  return normalized === "" || normalized === "null" || normalized === "undefined"
}

export function displayValue(value: unknown, fallback = "Not specified") {
  return isBlankDisplayValue(value) ? fallback : String(value)
}

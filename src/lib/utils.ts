import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Render `count` salinan elemen, mis. baris kerangka saat memuat.
export function repeat<T>(count: number, render: (index: number) => T) {
  return Array.from({ length: count }, (_, index) => render(index))
}

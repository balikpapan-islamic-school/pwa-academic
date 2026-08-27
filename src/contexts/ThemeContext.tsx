import { createContext, ReactNode, use } from "react"

type ThemeType = {
    theme: string
}

export const ThemeContext = createContext<ThemeType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    if (typeof window !== "undefined") {
        const root = window.document.documentElement
        root.classList.remove("dark")
        root.classList.add("light")
    }

    return (
        <ThemeContext value={{ theme: "light" }}>
            {children}
        </ThemeContext>
    )
}

export function useTheme(): ThemeType {
    const context = use(ThemeContext)

    if (context === null) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}
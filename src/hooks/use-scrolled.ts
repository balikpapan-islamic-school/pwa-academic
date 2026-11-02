import { useEffect, useState } from 'react'

export function useScrolled(threshold = 8) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > threshold)
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [threshold])

    return isScrolled
}

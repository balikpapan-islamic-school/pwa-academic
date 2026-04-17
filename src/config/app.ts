type AppConfigType = {
    name: string,
    github: {
        title: string,
        url: string
    },
    author: {
        name: string,
        url: string
    },
}

export const appConfig: AppConfigType = {
    name: import.meta.env.VITE_APP_NAME ?? 'PWA Academic',
    github: {
        title: 'PWA Academic Repository',
        url: 'https://github.com/balikpapan-islamic-school/pwa-academic',
    },
    author: {
        name: 'Balikpapan Islamic School',
        url: 'https://github.com/balikpapan-islamic-school',
    }
}

export const baseUrl = import.meta.env.VITE_BASE_URL ?? ""

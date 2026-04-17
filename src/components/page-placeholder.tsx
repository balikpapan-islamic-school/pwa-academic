import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type PagePlaceholderProps = {
    title: string
    description: string
    summary: string
}

export function PagePlaceholder({ title, description, summary }: PagePlaceholderProps) {
    return (
        <>
            <PageHeader>
                <PageHeaderHeading>{title}</PageHeaderHeading>
                <PageHeaderDescription>{description}</PageHeaderDescription>
            </PageHeader>

            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>Fondasi UI tahap awal untuk route MVP.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{summary}</p>
                </CardContent>
            </Card>
        </>
    )
}

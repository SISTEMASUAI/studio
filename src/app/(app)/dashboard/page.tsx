import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, School, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Welcome, John!</h1>
        <p className="text-muted-foreground">
          Quickly access your campus resources from here.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-primary" />
                        Intranet Portal
                    </CardTitle>
                    <CardDescription>News, announcements, and resources.</CardDescription>
                </div>
                <Link href="/intranet" passHref legacyBehavior>
                    <Button variant="ghost" size="icon" aria-label="Go to Intranet">
                        <ArrowRight />
                    </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Stay up-to-date with the latest campus news, find important documents, and connect with colleagues.
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
             <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <School className="w-6 h-6 text-primary" />
                        Virtual Classroom
                    </CardTitle>
                    <CardDescription>Courses, assignments, and learning.</CardDescription>
                </div>
                <Link href="/classroom" passHref legacyBehavior>
                    <Button variant="ghost" size="icon" aria-label="Go to Classroom">
                        <ArrowRight />
                    </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
                Access your course materials, submit assignments, and collaborate with your peers in our interactive learning environment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

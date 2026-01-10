import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Megaphone, Rss } from 'lucide-react';
import Summarizer from '@/components/intranet/Summarizer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const announcements = [
  {
    title: 'System Maintenance Scheduled',
    date: '2024-08-15',
    content: 'Please be advised that all campus systems will be down for scheduled maintenance on August 20th from 2 AM to 4 AM.',
  },
  {
    title: 'Annual Campus Festival',
    date: '2024-08-10',
    content: 'Join us for the annual campus festival on September 5th! More details to follow.',
  },
];

const newsItems = [
  {
    id: 'news-1',
    title: 'Innovation Fair Highlights Student Creativity',
    excerpt: 'This year\'s innovation fair was a massive success, showcasing projects from over 50 student teams...',
    date: '2024-08-12',
  },
  {
    id: 'news-2',
    title: 'Library Expansion Project Breaks Ground',
    excerpt: 'Construction has officially begun on the new wing of the campus library, expected to open in Fall 2025...',
    date: '2024-08-10',
  },
  {
    id: 'news-3',
    title: 'A New Semester Kicks Off with Record Enrollment',
    excerpt: 'We are thrilled to welcome the largest incoming class in the university\'s history this fall...',
    date: '2024-08-05',
  },
];

const resources = [
    { title: 'Employee Handbook', type: 'PDF' },
    { title: 'IT Support Guide', type: 'PDF' },
    { title: 'Campus Map', type: 'PNG' },
]

export default function IntranetPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <section>
            <h1 className="text-3xl font-bold font-headline">Intranet Portal</h1>
            <p className="text-muted-foreground">Your central hub for campus communication.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center gap-2"><Megaphone className="text-primary"/>Announcements</h2>
          <div className="space-y-4">
            {announcements.map((item, index) => (
              <Alert key={index}>
                <Megaphone className="h-4 w-4" />
                <AlertTitle className="font-headline">{item.title}</AlertTitle>
                <AlertDescription>{item.content} <span className="text-xs text-muted-foreground/80">({item.date})</span></AlertDescription>
              </Alert>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center gap-2"><Rss className="text-primary"/>News Feed</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {newsItems.map((item) => {
              const image = PlaceHolderImages.find(img => img.id === item.id);
              return (
                <Card key={item.id} className="overflow-hidden transition-all hover:shadow-lg">
                  {image && <Image src={image.imageUrl} alt={image.description} width={300} height={200} className="w-full h-40 object-cover" data-ai-hint={image.imageHint} />}
                  <CardHeader>
                    <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">AI Summarizer</CardTitle>
                <CardDescription>Summarize any text using AI.</CardDescription>
            </CardHeader>
            <CardContent>
                <Summarizer />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><FileText className="text-primary"/>Resources</CardTitle>
                <CardDescription>Quick access to important documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {resources.map((res, i) => (
                        <li key={i} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent">
                            <span>{res.title}</span>
                            <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-full">{res.type}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Megaphone, Rss } from 'lucide-react';
import Summarizer from '@/components/intranet/Summarizer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const announcements = [
  {
    title: 'Mantenimiento del Sistema Programado',
    date: '2024-08-15',
    content: 'Se informa que todos los sistemas del campus estarán fuera de servicio por mantenimiento programado el 20 de agosto de 2 a 4 AM.',
  },
  {
    title: 'Festival Anual del Campus',
    date: '2024-08-10',
    content: '¡Únete a nosotros para el festival anual del campus el 5 de septiembre! Más detalles próximamente.',
  },
];

const newsItems = [
  {
    id: 'news-1',
    title: 'Feria de Innovación Destaca la Creatividad Estudiantil',
    excerpt: 'La feria de innovación de este año fue un gran éxito, mostrando proyectos de más de 50 equipos de estudiantes...',
    date: '2024-08-12',
  },
  {
    id: 'news-2',
    title: 'Proyecto de Expansión de la Biblioteca Inicia Construcción',
    excerpt: 'La construcción del nuevo ala de la biblioteca del campus ha comenzado oficialmente, se espera que abra en otoño de 2025...',
    date: '2024-08-10',
  },
  {
    id: 'news-3',
    title: 'Un Nuevo Semestre Arranca con Matrícula Récord',
    excerpt: 'Estamos encantados de dar la bienvenida a la clase entrante más grande en la historia de la universidad este otoño...',
    date: '2024-08-05',
  },
];

const resources = [
    { title: 'Manual del Empleado', type: 'PDF' },
    { title: 'Guía de Soporte TI', type: 'PDF' },
    { title: 'Mapa del Campus', type: 'PNG' },
]

export default function IntranetPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <section>
            <h1 className="text-3xl font-bold font-headline">Portal Nuxtu</h1>
            <p className="text-muted-foreground">Tu centro de comunicación para todo el campus.</p>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center gap-2"><Megaphone className="text-primary"/>Anuncios</h2>
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
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center gap-2"><Rss className="text-primary"/>Noticias</h2>
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
                <CardTitle className="font-headline">Resumidor con IA</CardTitle>
                <CardDescription>Resume cualquier texto usando IA.</CardDescription>
            </CardHeader>
            <CardContent>
                <Summarizer />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><FileText className="text-primary"/>Recursos</CardTitle>
                <CardDescription>Acceso rápido a documentos importantes.</CardDescription>
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

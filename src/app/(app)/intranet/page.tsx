
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, DocumentData } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Megaphone, Rss, PlusCircle, Loader2, Image as ImageIcon, Send } from 'lucide-react';
import Summarizer from '@/components/intranet/Summarizer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

interface Post extends DocumentData {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'news';
  imageUrl?: string;
  createdAt: string;
  authorId: string;
}

const PostSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
  type: z.enum(['announcement', 'news']),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

const resources = [
    { title: 'Manual del Estudiante', type: 'PDF' },
    { title: 'Guía de Soporte TI', type: 'PDF' },
    { title: 'Reglamento Académico', type: 'PDF' },
]

export default function IntranetPage() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'intranet_posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

  const isAdmin = profile?.role === 'admin';

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: { title: '', content: '', type: 'news', imageUrl: '' },
  });

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    if (!firestore || !user) return;
    try {
      const postData = {
        ...values,
        authorId: user.uid,
        createdAt: new Date().toISOString(),
      };
      await addDocumentNonBlocking(collection(firestore, 'intranet_posts'), postData);
      toast({ title: "Publicación Exitosa", description: "El contenido ha sido publicado en el portal." });
      form.reset();
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudo publicar el contenido." });
    }
  }

  const announcements = posts?.filter(p => p.type === 'announcement') || [];
  const newsItems = posts?.filter(p => p.type === 'news') || [];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <section className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline">Portal Nuxtu</h1>
                <p className="text-muted-foreground">Tu centro de comunicación para todo el campus.</p>
            </div>
            {isAdmin && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2"/> Nuevo Post</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <DialogHeader>
                                    <DialogTitle>Crear Publicación</DialogTitle>
                                    <DialogDescription>Publica noticias o anuncios para toda la comunidad.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <FormField control={form.control} name="type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Publicación</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="announcement">Anuncio (Alerta)</SelectItem>
                                                    <SelectItem value="news">Noticia (Imagen + Texto)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título</FormLabel>
                                            <FormControl><Input placeholder="Título llamativo..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="content" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contenido</FormLabel>
                                            <FormControl><Textarea placeholder="Escribe el cuerpo de la publicación..." className="min-h-[120px]" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {form.watch('type') === 'news' && (
                                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL de la Imagen</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="https://ejemplo.com/foto.jpg" {...field} />
                                                        <Button type="button" variant="outline" size="icon" title="Sube imágenes a un servidor externo y pega el link aquí."><ImageIcon className="h-4 w-4"/></Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                        Publicar ahora
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center gap-2"><Megaphone className="text-primary"/>Anuncios</h2>
          <div className="space-y-4">
            {arePostsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : announcements.length > 0 ? (
                announcements.map((item) => (
                    <Alert key={item.id} className="bg-primary/5 border-primary/20">
                        <Megaphone className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-headline font-bold text-primary">{item.title}</AlertTitle>
                        <AlertDescription className="mt-1">
                            {item.content}
                            <div className="text-[10px] text-muted-foreground mt-2">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </AlertDescription>
                    </Alert>
                ))
            ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No hay anuncios recientes.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center gap-2"><Rss className="text-primary"/>Noticias Recientes</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {newsItems.length > 0 ? (
                newsItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden transition-all hover:shadow-lg border-muted">
                        {item.imageUrl && (
                            <div className="relative h-48 w-full">
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    fill 
                                    className="object-cover" 
                                    data-ai-hint="campus news"
                                />
                            </div>
                        )}
                        <CardHeader className="pb-2">
                            <CardTitle className="font-headline text-lg line-clamp-2">{item.title}</CardTitle>
                            <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                        </CardContent>
                    </Card>
                ))
            ) : !arePostsLoading && (
                <p className="col-span-2 text-sm text-muted-foreground italic text-center py-8 border-2 border-dashed rounded-lg">No hay noticias publicadas.</p>
            )}
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
                <CardTitle className="font-headline flex items-center gap-2"><FileText className="text-primary"/>Recursos Institucionales</CardTitle>
                <CardDescription>Acceso rápido a documentos importantes.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {resources.map((res, i) => (
                        <li key={i} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent border">
                            <span>{res.title}</span>
                            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-full uppercase">{res.type}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}

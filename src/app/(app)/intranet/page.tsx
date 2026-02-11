'use client';

import { useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useStorage, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, DocumentData, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Megaphone, 
  Rss, 
  PlusCircle, 
  Loader2, 
  Image as ImageIcon, 
  Video, 
  Send, 
  X, 
  Upload, 
  Link as LinkIcon,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Summarizer from '@/components/intranet/Summarizer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Post extends DocumentData {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'news';
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  authorId: string;
}

const PostSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
  type: z.enum(['announcement', 'news']),
  videoUrl: z.string().optional(),
});

const resources = [
    { title: 'Manual del Estudiante', type: 'PDF' },
    { title: 'Guía de Soporte TI', type: 'PDF' },
    { title: 'Reglamento Académico', type: 'PDF' },
]

function VideoPlayer({ url }: { url: string }) {
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  
  if (isYouTube) {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }
    
    return (
      <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black">
      <video src={url} controls className="w-full h-full object-contain" />
    </div>
  );
}

export default function IntranetPage() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoMethod, setVideoMethod] = useState<'upload' | 'link'>('upload');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'intranet_posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

  const isAdmin = profile?.role === 'admin';

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: { title: '', content: '', type: 'news', videoUrl: '' },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const clearFiles = () => {
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    form.reset();
  };

  const handleDeletePost = (postId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'intranet_posts', postId));
    toast({ title: "Publicación eliminada", description: "El post ha sido removido del portal." });
  };

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    if (!firestore || !user || !storage) return;
    
    try {
      let imageUrl = '';
      let videoUrl = values.videoUrl || '';

      if (imageFile) {
        const imageRef = ref(storage, `intranet/images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      if (videoMethod === 'upload' && videoFile) {
        const videoRef = ref(storage, `intranet/videos/${Date.now()}_${videoFile.name}`);
        const snapshot = await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(snapshot.ref);
      }

      const postData = {
        ...values,
        imageUrl,
        videoUrl,
        authorId: user.uid,
        createdAt: new Date().toISOString(),
      };

      await addDocumentNonBlocking(collection(firestore, 'intranet_posts'), postData);
      
      toast({ title: "Publicación Exitosa", description: "El contenido ha sido publicado en el portal." });
      clearFiles();
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudo publicar el contenido. Revisa tu conexión." });
    }
  }

  const announcements = posts?.filter(p => p.type === 'announcement') || [];
  const newsItems = posts?.filter(p => p.type === 'news') || [];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <section className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary">Portal Nuxtu</h1>
                <p className="text-muted-foreground">Centro de noticias y comunicaciones oficiales.</p>
            </div>
            {isAdmin && (
                <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(!open) clearFiles(); }}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2"/> Nuevo Post</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <DialogHeader>
                                    <DialogTitle>Crear Publicación</DialogTitle>
                                    <DialogDescription>Sube archivos multimedia directamente desde tu equipo.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                                    <FormField control={form.control} name="type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Publicación</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="announcement">Anuncio (Alerta de texto)</SelectItem>
                                                    <SelectItem value="news">Noticia (Imagen/Video + Texto)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título</FormLabel>
                                            <FormControl><Input placeholder="Escribe un título impactante..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="content" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contenido</FormLabel>
                                            <FormControl><Textarea placeholder="Desarrolla la noticia aquí..." className="min-h-[120px]" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    {form.watch('type') === 'news' && (
                                        <div className="space-y-6 border-t pt-4">
                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagen de Portada</Label>
                                                <div className="flex items-center gap-4">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => imageInputRef.current?.click()}
                                                        className="w-full h-24 border-dashed flex flex-col gap-2"
                                                    >
                                                        <Upload className="h-6 w-6 opacity-50" />
                                                        <span>{imageFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</span>
                                                    </Button>
                                                    <input 
                                                        ref={imageInputRef} 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={handleImageChange} 
                                                    />
                                                    {imagePreview && (
                                                        <div className="relative h-24 w-32 rounded-md overflow-hidden border">
                                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                            <button 
                                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2"><Video className="h-4 w-4"/> Video del Post (Opcional)</Label>
                                                <Tabs value={videoMethod} onValueChange={(v) => setVideoMethod(v as any)}>
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="upload"><Upload className="h-3 w-3 mr-2"/>Subir Archivo</TabsTrigger>
                                                        <TabsTrigger value="link"><LinkIcon className="h-3 w-3 mr-2"/>Link YouTube</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="upload" className="pt-2">
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            onClick={() => videoInputRef.current?.click()}
                                                            className="w-full h-12 border-dashed"
                                                        >
                                                            {videoFile ? `Seleccionado: ${videoFile.name}` : 'Seleccionar video (.mp4, .mov)'}
                                                        </Button>
                                                        <input 
                                                            ref={videoInputRef} 
                                                            type="file" 
                                                            accept="video/*" 
                                                            className="hidden" 
                                                            onChange={handleVideoChange} 
                                                        />
                                                    </TabsContent>
                                                    <TabsContent value="link" className="pt-2">
                                                        <FormField control={form.control} name="videoUrl" render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl><Input placeholder="Pegar URL de YouTube..." {...field} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 animate-spin h-4 w-4" />
                                                Subiendo archivos...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Publicar ahora
                                            </>
                                        )}
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
                    <Alert key={item.id} className="bg-primary/5 border-primary/20 relative group">
                        <Megaphone className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-headline font-bold text-primary pr-8">{item.title}</AlertTitle>
                        <AlertDescription className="mt-1">
                            {item.content}
                            <div className="text-[10px] text-muted-foreground mt-2">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </AlertDescription>
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePost(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                    <Card key={item.id} className="overflow-hidden transition-all hover:shadow-lg border-muted flex flex-col group">
                        <div className="relative">
                          {item.videoUrl ? (
                              <VideoPlayer url={item.videoUrl} />
                          ) : item.imageUrl ? (
                              <div className="relative h-48 w-full">
                                  <Image 
                                      src={item.imageUrl} 
                                      alt={item.title} 
                                      fill 
                                      className="object-cover" 
                                      data-ai-hint="campus news"
                                  />
                              </div>
                          ) : (
                            <div className="h-48 w-full bg-accent flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          {isAdmin && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeletePost(item.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar Post
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="font-headline text-lg line-clamp-2">{item.title}</CardTitle>
                            <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
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
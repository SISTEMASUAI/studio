
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResourceSchema = z.object({
  title: z.string().min(3, "Título demasiado corto"),
  url: z.string().url("URL inválida"),
});

export default function ResourceManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const resourcesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'wellness_resources') : null),
    [firestore]
  );
  const { data: resources } = useCollection(resourcesQuery);

  const form = useForm<z.infer<typeof ResourceSchema>>({
    resolver: zodResolver(ResourceSchema),
    defaultValues: { title: '', url: '' },
  });

  async function onSubmit(values: z.infer<typeof ResourceSchema>) {
    if (!firestore) return;
    try {
      await addDocumentNonBlocking(collection(firestore, 'wellness_resources'), values);
      form.reset();
      toast({ title: "Recurso añadido" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Error" });
    }
  }

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'wellness_resources', id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gestionar Recursos de Apoyo</CardTitle>
        <CardDescription>Agrega enlaces útiles para los estudiantes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormControl><Input placeholder="Título del recurso" {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem><FormControl><Input placeholder="https://..." {...field} /></FormControl></FormItem>
            )} />
            <Button type="submit" size="sm" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
            </Button>
          </form>
        </Form>

        <div className="space-y-2 pt-4 border-t">
          {resources?.map((res) => (
            <div key={res.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
              <span className="flex items-center gap-2 truncate">
                <LinkIcon className="h-3 w-3" /> {res.title}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(res.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

const EventSchema = z.object({
  name: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  description: z.string().min(20, "Describe la actividad con más detalle."),
  category: z.string().min(1, "Selecciona una categoría."),
  date: z.string().min(1, "La fecha es requerida."),
  location: z.string().min(2, "Indica el lugar del evento."),
});

export default function ActivityForm({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (o: boolean) => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof EventSchema>>({
    resolver: zodResolver(EventSchema),
    defaultValues: { name: '', description: '', category: '', date: '', location: '' },
  });

  async function onSubmit(values: z.infer<typeof EventSchema>) {
    if (!firestore || !user) return;
    try {
      await addDocumentNonBlocking(collection(firestore, 'events'), {
        ...values,
        organizerId: user.uid,
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Actividad publicada", description: "El evento ya está disponible para inscripción." });
      form.reset();
      onOpenChange(false);
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar la actividad." });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Crear Actividad</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nueva Actividad/Evento</DialogTitle>
              <DialogDescription>Completa el formulario para publicar en el catálogo institucional.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre de la Actividad</FormLabel><FormControl><Input placeholder="Ej: Club de Robótica" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea className="min-h-[100px]" placeholder="Detalla los objetivos y requisitos..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Tipo..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Académico">Académico</SelectItem>
                        <SelectItem value="Deportivo">Deportivo</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Fecha y Hora</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Lugar / Enlace</FormLabel><FormControl><Input placeholder="Ej: Auditorio B o Zoom" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publicar Actividad
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Course, CourseModule } from '@/types/course';

const ModuleSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  weekNumber: z.coerce.number().min(1, "El número de semana debe ser al menos 1."),
  description: z.string().optional(),
});

interface ModuleManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  course: Course | null;
}

export default function ModuleManagementDialog({ isOpen, onOpenChange, course }: ModuleManagementDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const moduleForm = useForm<z.infer<typeof ModuleSchema>>({
    resolver: zodResolver(ModuleSchema),
    defaultValues: { title: '', weekNumber: 1, description: '' },
  });

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !course) return null;
    return query(collection(firestore, 'courses', course.id, 'modules'), orderBy('weekNumber'));
  }, [firestore, course]);

  const { data: modules, isLoading: areModulesLoading } = useCollection<CourseModule>(modulesQuery);

  async function onCreateModuleSubmit(values: z.infer<typeof ModuleSchema>) {
    if (!firestore || !course) return;
    try {
      const modulesCollection = collection(firestore, 'courses', course.id, 'modules');
      await addDocumentNonBlocking(modulesCollection, values);
      toast({ title: "Módulo Creado", description: `Se ha añadido "${values.title}" al curso.` });
      moduleForm.reset({ title: '', weekNumber: (modules?.length || 0) + 2, description: '' });
    } catch (error) {
      console.error("Error creating module: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo crear el módulo." });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestionar Módulos/Semanas para: {course?.name}</DialogTitle>
          <DialogDescription>Añade, edita o elimina las semanas de contenido para este curso.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 flex-grow overflow-hidden">
          <div className="flex flex-col">
            <h3 className="font-semibold mb-4">Añadir Nuevo Módulo</h3>
            <Form {...moduleForm}>
              <form onSubmit={moduleForm.handleSubmit(onCreateModuleSubmit)} className="space-y-4">
                <FormField
                  control={moduleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Módulo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Semana 1: Introducción" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={moduleForm.control}
                  name="weekNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Semana</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={moduleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Temas a cubrir en la semana..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={moduleForm.formState.isSubmitting}>
                  {moduleForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Añadir Módulo
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="font-semibold mb-4">Módulos Existentes</h3>
            <div className="flex-grow overflow-y-auto border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Semana</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areModulesLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : modules && modules.length > 0 ? (
                    modules.map(module => (
                      <TableRow key={module.id}>
                        <TableCell className="text-center font-mono">{module.weekNumber}</TableCell>
                        <TableCell>{module.title}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" disabled>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        No hay módulos creados para este curso.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

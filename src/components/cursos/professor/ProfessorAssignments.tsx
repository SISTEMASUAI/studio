
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { Course } from '@/types/course';

interface Assignment {
    id: string;
    title: string;
    dueDate: string;
    description: string;
}

const AssignmentSchema = z.object({
    title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
    description: z.string().min(10, "La descripción es requerida."),
    dueDate: z.string().min(1, "La fecha de entrega es requerida."),
});

export default function ProfessorAssignments({ course }: { course: Course }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const assignmentsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'courses', course.id, 'assignments'), orderBy('dueDate')) : null),
    [firestore, course.id]
  );
  const { data: assignments, isLoading } = useCollection<Assignment>(assignmentsQuery);

  const form = useForm<z.infer<typeof AssignmentSchema>>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: { title: '', description: '', dueDate: '' },
  });

  async function onSubmit(values: z.infer<typeof AssignmentSchema>) {
    if (!firestore) return;
    try {
        const assignmentsCollection = collection(firestore, 'courses', course.id, 'assignments');
        await addDocumentNonBlocking(assignmentsCollection, values);
        toast({ title: "Tarea Creada", description: `La tarea "${values.title}" ha sido creada.` });
        form.reset();
        setIsCreateOpen(false);
    } catch (error) {
        console.error("Error creating assignment:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo crear la tarea." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestión de Tareas</CardTitle>
            <CardDescription>Crea, edita y revisa las evaluaciones del curso.</CardDescription>
          </div>
           <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2"/>Crear Tarea</Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Crear Nueva Tarea</DialogTitle>
                            <DialogDescription>Completa los detalles de la nueva evaluación.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                             <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl><Input placeholder="Ej: Ensayo Final" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción / Instrucciones</FormLabel>
                                    <FormControl><Textarea placeholder="Describe los requisitos de la tarea." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Entrega</FormLabel>
                                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                Crear Tarea
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
           </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evaluación</TableHead>
                <TableHead>Fecha de Entrega</TableHead>
                <TableHead>Entregas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments && assignments.length > 0 ? assignments.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{new Date(assignment.dueDate).toLocaleString()}</TableCell>
                  <TableCell>0/{course.enrolled || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                             <DropdownMenuItem disabled>Ver Entregas</DropdownMenuItem>
                             <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No se han creado tareas para este curso.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

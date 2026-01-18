'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
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
import { Loader2, PlusCircle, Trash2, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Course, CourseModule, ScheduleItem } from '@/types/course';

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

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [semesterStartDate, setSemesterStartDate] = useState('');
  const [semesterEndDate, setSemesterEndDate] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  useEffect(() => {
    if (course) {
      setSchedule(course.schedule || [{ title: '', day: '', startTime: '', endTime: '', classroom: '' }]);
      setSemesterStartDate(course.semesterStartDate || '');
      setSemesterEndDate(course.semesterEndDate || '');
    }
  }, [course]);

  const moduleForm = useForm<z.infer<typeof ModuleSchema>>({
    resolver: zodResolver(ModuleSchema),
    defaultValues: { title: '', weekNumber: 1, description: '' },
  });

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !course) return null;
    return query(collection(firestore, 'courses', course.id, 'modules'), orderBy('weekNumber'));
  }, [firestore, course]);

  const { data: modules, isLoading: areModulesLoading } = useCollection<CourseModule>(modulesQuery);
  
  useEffect(() => {
    if (modules) {
      moduleForm.setValue('weekNumber', modules.length + 1);
    }
  }, [modules, moduleForm]);


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

  const handleScheduleChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const addScheduleRow = () => {
    setSchedule([...schedule, { title: '', day: '', startTime: '', endTime: '', classroom: '' }]);
  };

  const removeScheduleRow = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
  };
  
  const handleSaveSchedule = async () => {
    if (!firestore || !course) return;
    setIsSavingSchedule(true);
    try {
      const courseRef = doc(firestore, 'courses', course.id);
      await updateDocumentNonBlocking(courseRef, {
        semesterStartDate,
        semesterEndDate,
        schedule: schedule.filter(s => s.day && s.startTime && s.endTime),
      });
      toast({ title: "Horario Guardado", description: "Las fechas y el horario del curso han sido actualizados." });
    } catch (error) {
      console.error("Error saving schedule: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el horario." });
    } finally {
      setIsSavingSchedule(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestionar Módulos y Horario para: {course?.name}</DialogTitle>
          <DialogDescription>Añade semanas de contenido, define las fechas del ciclo y el horario de clases.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 flex-grow overflow-hidden">
          <div className="flex flex-col space-y-8 overflow-y-auto pr-4">
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-semibold flex items-center gap-2"><Clock /> Fechas y Horario del Semestre</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="start-date">Fecha de Inicio del Semestre</Label>
                        <Input id="start-date" type="date" value={semesterStartDate} onChange={(e) => setSemesterStartDate(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="end-date">Fecha de Fin del Semestre</Label>
                        <Input id="end-date" type="date" value={semesterEndDate} onChange={(e) => setSemesterEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <h4 className="font-medium">Sesiones de Clase</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}><PlusCircle className='mr-2 h-4 w-4'/> Añadir Sesión</Button>
                </div>
                <div className="space-y-4">
                  {schedule.map((session, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                          <div className="space-y-1 col-span-2 md:col-span-1">
                              <Label>Título Sesión</Label>
                              <Input placeholder="Ej: Teoría" value={session.title} onChange={(e) => handleScheduleChange(index, 'title', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                              <Label>Día</Label>
                              <Select onValueChange={(value) => handleScheduleChange(index, 'day', value)} value={session.day}>
                                  <SelectTrigger><SelectValue placeholder="Día"/></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Lunes">Lunes</SelectItem>
                                      <SelectItem value="Martes">Martes</SelectItem>
                                      <SelectItem value="Miércoles">Miércoles</SelectItem>
                                      <SelectItem value="Jueves">Jueves</SelectItem>
                                      <SelectItem value="Viernes">Viernes</SelectItem>
                                      <SelectItem value="Sábado">Sábado</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-1">
                              <Label>Hora Inicio</Label>
                              <Input type="time" value={session.startTime} onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                              <Label>Hora Fin</Label>
                              <Input type="time" value={session.endTime} onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)} />
                          </div>
                          <div className="flex gap-1 items-center">
                              <div className='space-y-1 w-full'>
                                  <Label>Aula</Label>
                                  <Input placeholder="Ej: A-101" value={session.classroom} onChange={(e) => handleScheduleChange(index, 'classroom', e.target.value)} />
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleRow(index)} disabled={schedule.length <= 1}><Trash2 className="text-destructive h-4 w-4"/></Button>
                          </div>
                      </div>
                  ))}
                </div>
                 <Button type="button" onClick={handleSaveSchedule} disabled={isSavingSchedule}>
                  {isSavingSchedule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Guardar Horario
                </Button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Añadir Nuevo Módulo Semanal</h3>
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

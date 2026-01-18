'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, DocumentData, getDocs } from 'firebase/firestore';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useMemo, useState } from 'react';
import type { ScheduleItem } from '@/types/course';

const CourseSchema = z.object({
  courseId: z.string().min(3, "El código debe tener al menos 3 caracteres."),
  name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  credits: z.coerce.number().min(1, "Debe tener al menos 1 crédito."),
  capacity: z.coerce.number().min(0, "La capacidad no puede ser negativa."),
  facultyId: z.string().min(1, "Debe seleccionar una facultad."),
  programId: z.string().min(1, "Debe seleccionar un programa."),
  cycle: z.coerce.number().min(1, "Debe seleccionar un ciclo."),
  level: z.string().min(1, "Debe seleccionar un nivel."),
  instructorId: z.string().min(1, "Debe seleccionar un instructor."),
  mode: z.string().min(1, "Debe seleccionar una modalidad."),
  semesterStartDate: z.string().optional(),
  semesterEndDate: z.string().optional(),
});

interface Faculty extends DocumentData {
    id: string;
    name: string;
}

interface Program extends DocumentData {
    id: string;
    name: string;
    facultyId: string;
    totalCycles: number;
}

interface Professor extends DocumentData {
    id: string;
    firstName: string;
    lastName: string;
}

interface CreateCourseFormProps {
  form: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateCourseForm({ form, onSuccess, onCancel }: CreateCourseFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ title: '', day: '', startTime: '', endTime: '', classroom: '' }]);

  const professorsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'professor')) : null,
  [firestore]);
  const { data: professors } = useCollection<Professor>(professorsQuery);

  const programsQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'programs') : null,
  [firestore]);
  const { data: programs } = useCollection<Program>(programsQuery);

  const facultiesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'faculties') : null,
  [firestore]);
  const { data: faculties } = useCollection<Faculty>(facultiesQuery);

  const selectedFacultyId = form.watch('facultyId');
  const selectedProgramId = form.watch('programId');

  const cyclesForSelectedProgram = useMemo(() => {
    if (!selectedProgramId || !programs) return [];
    const program = programs.find(p => p.id === selectedProgramId);
    return program ? Array.from({ length: program.totalCycles }, (_, i) => i + 1) : [];
  }, [selectedProgramId, programs]);

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

  async function onSubmit(values: z.infer<typeof CourseSchema>) {
    if (!firestore) return;
    
    try {
        const q = query(collection(firestore, 'courses'), where('courseId', '==', values.courseId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Error al crear el curso",
                description: "Ya existe un curso con este código. Por favor, utiliza uno diferente.",
            });
            return;
        }

        const courseCollection = collection(firestore, 'courses');
        
        await addDocumentNonBlocking(courseCollection, {
            ...values,
            enrolled: 0,
            status: 'active',
            schedule: schedule.filter(s => s.day && s.startTime && s.endTime),
            prerequisites: [],
            objectives: [],
            methodology: "",
            syllabusUrl: "",
            virtualRoomUrl: "",
        });
        
        toast({
            title: "Curso Creado",
            description: `El curso "${values.name}" ha sido creado exitosamente.`,
        });
        onSuccess();
    } catch (error) {
        console.error("Error creating course: ", error);
        toast({
            variant: "destructive",
            title: "Error al crear el curso",
            description: "Hubo un problema al guardar el curso. Por favor, inténtalo de nuevo.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
          <DialogDescription>Completa el formulario para registrar un nuevo curso en el sistema.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="courseId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Código del Curso</FormLabel>
                        <FormControl><Input placeholder="Ej: CS-101" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Nombre del Curso</FormLabel>
                        <FormControl><Input placeholder="Introducción a la Programación" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                    <FormLabel>Descripción Breve</FormLabel>
                    <FormControl><Textarea placeholder="Describe el curso en una o dos frases." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="credits" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Créditos</FormLabel>
                        <FormControl><Input type="number" placeholder="4" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="capacity" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Capacidad</FormLabel>
                        <FormControl><Input type="number" placeholder="30" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="level" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Nivel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Pregrado">Pregrado</SelectItem>
                                <SelectItem value="Postgrado">Postgrado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="facultyId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Facultad</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.setValue('programId', ''); form.setValue('cycle', 1); }} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una facultad..."/></SelectTrigger></FormControl>
                            <SelectContent>
                                {faculties ? faculties.map(fac => (
                                    <SelectItem key={fac.id} value={fac.id}>{fac.name}</SelectItem>
                                )) : <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="programId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Programa Académico</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.setValue('cycle', 1); }} value={field.value} disabled={!selectedFacultyId}>
                            <FormControl><SelectTrigger><SelectValue placeholder={!selectedFacultyId ? "Selecciona una facultad primero" : "Asigna un programa..."}/></SelectTrigger></FormControl>
                            <SelectContent>
                                {programs?.filter(p => p.facultyId === selectedFacultyId).map(prog => (
                                    <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="cycle" render={({ field }) => (
                <FormItem>
                    <FormLabel>Ciclo</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value)} disabled={!selectedProgramId}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!selectedProgramId ? "Selecciona un programa primero" : "Asigna un ciclo..."}/></SelectTrigger></FormControl>
                        <SelectContent>
                            {cyclesForSelectedProgram.map(cycleNum => (
                                <SelectItem key={cycleNum} value={String(cycleNum)}>Ciclo {cycleNum}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="instructorId" render={({ field }) => (
                <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Asigna un instructor al curso..."/>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {professors ? professors.map(prof => (
                                <SelectItem key={prof.id} value={prof.id}>{prof.firstName} {prof.lastName}</SelectItem>
                            )) : <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            
            
                  <FormField control={form.control} name="mode" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Modalidad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Presencial">Presencial</SelectItem>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="Híbrido">Híbrido</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            
           <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium flex items-center gap-2"><Clock /> Fechas y Horario del Semestre</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="semesterStartDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha de Inicio del Semestre</FormLabel>
                            <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="semesterEndDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha de Fin del Semestre</FormLabel>
                            <FormControl><Input type="date" {...field} value={field.value || ''}/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <h5 className="font-medium">Sesiones de Clase</h5>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}><PlusCircle className='mr-2 h-4 w-4'/> Añadir Sesión</Button>
                </div>
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

            <div className="space-y-2">
                <Label>Prerrequisitos</Label>
                <Button type="button" variant="outline" disabled>Seleccionar cursos</Button>
                <p className="text-xs text-muted-foreground">Funcionalidad para seleccionar prerrequisitos en desarrollo.</p>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Curso
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

    
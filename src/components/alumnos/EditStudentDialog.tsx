'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, DocumentData } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface StudentProfile extends DocumentData {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  programId: string;
  dni: string;
}

interface Faculty extends DocumentData {
  id: string;
  name: string;
}

interface Program extends DocumentData {
  id: string;
  name: string;
  facultyId: string;
}

const UpdateStudentSchema = z.object({
  firstName: z.string().min(2, 'El nombre es requerido.'),
  lastName: z.string().min(2, 'El apellido es requerido.'),
  dni: z.string().length(8, 'El DNI debe tener 8 dígitos.'),
  email: z.string().email('Debe ser un email válido.'),
  facultyId: z.string().min(1, 'Debe seleccionar una facultad.'),
  programId: z.string().min(1, 'Debe seleccionar un programa.'),
});

interface EditStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: StudentProfile;
}

export default function EditStudentDialog({ isOpen, onOpenChange, student }: EditStudentDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const programsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'programs') : null), [firestore]);
  const { data: programs } = useCollection<Program>(programsQuery);

  const facultiesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'faculties') : null), [firestore]);
  const { data: faculties } = useCollection<Faculty>(facultiesQuery);

  const form = useForm<z.infer<typeof UpdateStudentSchema>>({
    resolver: zodResolver(UpdateStudentSchema),
  });
  
  const selectedFacultyId = form.watch('facultyId');

  const selectedStudentFacultyId = useMemo(() => {
    if (!student || !programs) return '';
    return programs.find((p) => p.id === student.programId)?.facultyId || '';
  }, [student, programs]);
  
  useEffect(() => {
    if (student && programs) {
      form.reset({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dni: student.dni || '',
        email: student.email || '',
        programId: student.programId || '',
        facultyId: selectedStudentFacultyId,
      });
    }
  }, [student, selectedStudentFacultyId, programs, form]);

  async function onSubmit(values: z.infer<typeof UpdateStudentSchema>) {
    if (!firestore || !student) return;
    try {
      const studentDocRef = doc(firestore, 'users', student.uid);
      await updateDocumentNonBlocking(studentDocRef, values);
      toast({
        title: 'Estudiante Actualizado',
        description: `Los datos de ${values.firstName} ${values.lastName} han sido actualizados.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating student: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'No se pudieron guardar los cambios.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Editar Estudiante</DialogTitle>
              <DialogDescription>
                Actualiza la información del estudiante. El email no se puede cambiar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="facultyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facultad</FormLabel>
                      <Select
                        onValueChange={(value) => { field.onChange(value); form.setValue('programId', ''); }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {faculties?.map((fac) => (
                            <SelectItem key={fac.id} value={fac.id}>
                              {fac.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programa</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedFacultyId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!selectedFacultyId ? 'Primero selecciona' : 'Asigna...'}/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs?.filter((p) => p.facultyId === selectedFacultyId).map((prog) => (
                              <SelectItem key={prog.id} value={prog.id}>
                                {prog.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

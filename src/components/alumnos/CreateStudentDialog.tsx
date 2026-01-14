'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, DocumentData } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

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

interface Faculty extends DocumentData {
  id: string;
  name: string;
}

interface Program extends DocumentData {
  id: string;
  name: string;
  facultyId: string;
}

const StudentSchema = z.object({
  firstName: z.string().min(2, 'El nombre es requerido.'),
  lastName: z.string().min(2, 'El apellido es requerido.'),
  dni: z.string().length(8, 'El DNI debe tener 8 dígitos.'),
  email: z.string().email('Debe ser un email válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  facultyId: z.string().min(1, 'Debe seleccionar una facultad.'),
  programId: z.string().min(1, 'Debe seleccionar un programa.'),
});

interface CreateStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function CreateStudentDialog({ isOpen, onOpenChange }: CreateStudentDialogProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof StudentSchema>>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      password: '',
      facultyId: '',
      programId: '',
    },
  });

  const programsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'programs') : null),
    [firestore]
  );
  const { data: programs } = useCollection<Program>(programsQuery);

  const facultiesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'faculties') : null),
    [firestore]
  );
  const { data: faculties } = useCollection<Faculty>(facultiesQuery);
  
  const selectedFacultyId = form.watch('facultyId');
  
  async function onSubmit(values: z.infer<typeof StudentSchema>) {
    if (!firestore || !auth) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userProfile = {
        uid: user.uid,
        email: values.email,
        dni: values.dni,
        role: 'student',
        firstName: values.firstName,
        lastName: values.lastName,
        programId: values.programId,
        profilePicture: `https://i.pravatar.cc/150?u=${user.uid}`,
      };

      await setDocumentNonBlocking(doc(firestore, 'users', user.uid), userProfile, { merge: true });

      toast({
        title: 'Estudiante Creado',
        description: `El estudiante ${values.firstName} ${values.lastName} ha sido registrado.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Error al crear estudiante',
          description: 'El correo electrónico ya está registrado. Por favor, utiliza otro.',
        });
      } else {
        console.error('Error creating student: ', error);
        toast({
          variant: 'destructive',
          title: 'Error al crear estudiante',
          description: error.message || 'No se pudo crear el estudiante. Verifique si el email ya existe.',
        });
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Estudiante</DialogTitle>
              <DialogDescription>
                Completa el formulario para registrar un nuevo estudiante.
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
                        <Input placeholder="John" {...field} />
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
                        <Input placeholder="Doe" {...field} />
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
                      <Input placeholder="12345678" {...field} />
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
                      <Input type="email" placeholder="j.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Inicial</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                      <Select onValueChange={(value) => { field.onChange(value); form.setValue('programId', ''); }} defaultValue={field.value}>
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
                            <SelectValue placeholder={!selectedFacultyId ? 'Primero selecciona' : 'Asigna...'} />
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
                Guardar Estudiante
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Loader2,
  Search,
  Users,
  User,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { collection, query, where, DocumentData, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface Program extends DocumentData {
    id: string;
    programId: string;
    name: string;
    facultyId: string;
}

interface Faculty extends DocumentData {
    id: string;
    facultyId: string;
    name: string;
}

const StudentSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  lastName: z.string().min(2, "El apellido es requerido."),
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  facultyId: z.string().min(1, "Debe seleccionar una facultad."),
  programId: z.string().min(1, "Debe seleccionar un programa."),
});


export default function AlumnosPage() {
    const { toast } = useToast();
    const auth = useAuth();
    const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);

    const firestore = useFirestore();

    const programsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'programs') : null,
    [firestore]);
    const { data: programs } = useCollection<Program>(programsQuery);

    const facultiesQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'faculties') : null,
    [firestore]);
    const { data: faculties } = useCollection<Faculty>(facultiesQuery);

    const studentForm = useForm<z.infer<typeof StudentSchema>>({
      resolver: zodResolver(StudentSchema),
      defaultValues: {
        firstName: '', lastName: '', email: '', password: '', facultyId: '', programId: ''
      }
    })

    const selectedFacultyIdStudent = studentForm.watch('facultyId');

    async function onCreateStudentSubmit(values: z.infer<typeof StudentSchema>) {
        if (!firestore || !auth) return;

        try {
          const tempAuth = auth;
          const userCredential = await createUserWithEmailAndPassword(tempAuth, values.email, values.password);
          const user = userCredential.user;

          const userProfile = {
            uid: user.uid,
            email: values.email,
            role: 'student',
            firstName: values.firstName,
            lastName: values.lastName,
            programId: values.programId,
            profilePicture: `https://i.pravatar.cc/150?u=${user.uid}`,
          };

          await setDocumentNonBlocking(doc(firestore, 'users', user.uid), userProfile, { merge: true });

          toast({
            title: "Estudiante Creado",
            description: `El estudiante ${values.firstName} ${values.lastName} ha sido registrado.`,
          });
          studentForm.reset();
          setIsCreateStudentOpen(false);

        } catch (error: any) {
            console.error("Error creating student: ", error);
            toast({
                variant: "destructive",
                title: "Error al crear estudiante",
                description: error.message || "No se pudo crear el estudiante. Verifique si el email ya existe.",
            });
        }
    }


  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Users className="text-primary" />
            Gestión de Alumnos
          </h1>
          <p className="text-muted-foreground">
            Busca, visualiza y gestiona la información académica de los estudiantes.
          </p>
        </div>
      </section>

      <Card>
          <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                      <CardTitle className="flex items-center gap-2"><User /> Lista de Alumnos</CardTitle>
                      <CardDescription>Directorio de todos los estudiantes registrados.</CardDescription>
                  </div>
                  <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
                      <DialogTrigger asChild>
                          <Button><PlusCircle className='mr-2'/> Crear Alumno</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl">
                          <Form {...studentForm}>
                              <form onSubmit={studentForm.handleSubmit(onCreateStudentSubmit)}>
                                  <DialogHeader>
                                      <DialogTitle>Crear Nuevo Estudiante</DialogTitle>
                                      <DialogDescription>Completa el formulario para registrar un nuevo estudiante.</DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4 space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                          <FormField control={studentForm.control} name="firstName" render={({ field }) => (
                                              <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                          )}/>
                                          <FormField control={studentForm.control} name="lastName" render={({ field }) => (
                                              <FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                          )}/>
                                      </div>
                                      <FormField control={studentForm.control} name="email" render={({ field }) => (
                                          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="j.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                      )}/>
                                      <FormField control={studentForm.control} name="password" render={({ field }) => (
                                          <FormItem><FormLabel>Contraseña Inicial</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                      )}/>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormField control={studentForm.control} name="facultyId" render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel>Facultad</FormLabel>
                                                  <Select onValueChange={(value) => { field.onChange(value); studentForm.setValue('programId', ''); }} defaultValue={field.value}>
                                                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..."/></SelectTrigger></FormControl>
                                                      <SelectContent>
                                                          {faculties?.map(fac => <SelectItem key={fac.id} value={fac.id}>{fac.name}</SelectItem>)}
                                                      </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                              </FormItem>
                                          )}/>
                                          <FormField control={studentForm.control} name="programId" render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel>Programa</FormLabel>
                                                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedFacultyIdStudent}>
                                                      <FormControl><SelectTrigger><SelectValue placeholder={!selectedFacultyIdStudent ? "Primero selecciona" : "Asigna..."}/></SelectTrigger></FormControl>
                                                      <SelectContent>
                                                          {programs?.filter(p => p.facultyId === selectedFacultyIdStudent).map(prog => <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>)}
                                                      </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                              </FormItem>
                                          )}/>
                                      </div>
                                  </div>
                                  <DialogFooter>
                                      <Button variant="outline" type="button" onClick={() => setIsCreateStudentOpen(false)}>Cancelar</Button>
                                      <Button type="submit" disabled={studentForm.formState.isSubmitting}>
                                          {studentForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                          Guardar Estudiante
                                      </Button>
                                  </DialogFooter>
                              </form>
                          </Form>
                      </DialogContent>
                  </Dialog>
              </div>
               <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por matrícula o nombre..." className="pl-9" />
                  </div>
                  <Select>
                      <SelectTrigger className="w-full sm:w-[220px]">
                          <SelectValue placeholder="Filtrar por programa" />
                      </SelectTrigger>
                      <SelectContent>
                          {programs?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Select>
                      <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="probation">Probatorio</SelectItem>
                          <SelectItem value="honor">Honor</SelectItem>
                      </SelectContent>
                  </Select>
               </div>
          </CardHeader>
          <CardContent>
               <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Nombre Completo</TableHead>
                          <TableHead>Programa</TableHead>
                          <TableHead className="text-center">Semestre</TableHead>
                          <TableHead className="text-center">GPA</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell colSpan={7} className="text-center">
                              No se encontraron estudiantes. La carga de datos está en desarrollo.
                          </TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
               <Alert className="mt-6">
                  <UserCog className="h-4 w-4" />
                  <AlertTitle>En Desarrollo</AlertTitle>
                  <AlertDescription>
                      La vista detallada de cada estudiante, junto con las acciones de gestión (inscripción forzosa, retiro, modificación de GPA), se implementará próximamente.
                  </AlertDescription>
               </Alert>
          </CardContent>
      </Card>
    </div>
  );
}

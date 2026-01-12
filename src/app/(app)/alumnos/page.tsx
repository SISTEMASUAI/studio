'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
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
  MoreHorizontal,
  Edit,
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
import { useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface StudentProfile extends DocumentData {
  id: string;
  uid: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  programId: string;
  facultyId?: string; // This might be needed if we store it directly
  semester?: number;
  gpa?: number;
  status?: string;
}

const StudentSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido."),
  lastName: z.string().min(2, "El apellido es requerido."),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos."),
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  facultyId: z.string().min(1, "Debe seleccionar una facultad."),
  programId: z.string().min(1, "Debe seleccionar un programa."),
});

const UpdateStudentSchema = StudentSchema.omit({ password: true });


export default function AlumnosPage() {
    const { toast } = useToast();
    const auth = useAuth();
    const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
    const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

    const firestore = useFirestore();

    const programsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'programs') : null,
    [firestore]);
    const { data: programs } = useCollection<Program>(programsQuery);

    const facultiesQuery = useMemoFirebase(() => 
        firestore ? collection(firestore, 'faculties') : null,
    [firestore]);
    const { data: faculties } = useCollection<Faculty>(facultiesQuery);

    const studentsQuery = useMemoFirebase(() =>
      firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null,
    [firestore]);
    const { data: students, isLoading: areStudentsLoading } = useCollection<StudentProfile>(studentsQuery);


    const studentForm = useForm<z.infer<typeof StudentSchema>>({
      resolver: zodResolver(StudentSchema),
      defaultValues: {
        firstName: '', lastName: '', dni: '', email: '', password: '', facultyId: '', programId: ''
      }
    })
    
    const updateStudentForm = useForm<z.infer<typeof UpdateStudentSchema>>({
        resolver: zodResolver(UpdateStudentSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            dni: '',
            email: '',
            facultyId: '',
            programId: '',
        }
    });

    const selectedFacultyIdStudent = studentForm.watch('facultyId');
    const selectedFacultyIdUpdateStudent = updateStudentForm.watch('facultyId');

    const selectedStudentFacultyId = useMemo(() => {
        if (!selectedStudent || !programs) return '';
        return programs.find(p => p.id === selectedStudent.programId)?.facultyId || '';
    }, [selectedStudent, programs]);


    const handleOpenEditDialog = (student: StudentProfile) => {
        setSelectedStudent(student);
        updateStudentForm.reset({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            dni: student.dni || '',
            email: student.email || '',
            programId: student.programId || '',
            facultyId: selectedStudentFacultyId,
        });
        setIsEditStudentOpen(true);
    };

    async function onCreateStudentSubmit(values: z.infer<typeof StudentSchema>) {
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
            title: "Estudiante Creado",
            description: `El estudiante ${values.firstName} ${values.lastName} ha sido registrado.`,
          });
          studentForm.reset();
          setIsCreateStudentOpen(false);

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                 toast({
                    variant: "destructive",
                    title: "Error al crear estudiante",
                    description: "El correo electrónico ya está registrado. Por favor, utiliza otro.",
                });
            } else {
                console.error("Error creating student: ", error);
                toast({
                    variant: "destructive",
                    title: "Error al crear estudiante",
                    description: error.message || "No se pudo crear el estudiante. Verifique si el email ya existe.",
                });
            }
        }
    }
    
    async function onUpdateStudentSubmit(values: z.infer<typeof UpdateStudentSchema>) {
        if (!firestore || !selectedStudent) return;
        try {
            const studentDocRef = doc(firestore, 'users', selectedStudent.uid);
            await updateDocumentNonBlocking(studentDocRef, values);
            toast({
                title: "Estudiante Actualizado",
                description: `Los datos de ${values.firstName} ${values.lastName} han sido actualizados.`,
            });
            setIsEditStudentOpen(false);
            setSelectedStudent(null);
        } catch(error: any) {
            console.error("Error updating student: ", error);
            toast({
                variant: "destructive",
                title: "Error al actualizar",
                description: "No se pudieron guardar los cambios.",
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
                                  <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                                      <div className="grid grid-cols-2 gap-4">
                                          <FormField control={studentForm.control} name="firstName" render={({ field }) => (
                                              <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                          )}/>
                                          <FormField control={studentForm.control} name="lastName" render={({ field }) => (
                                              <FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                          )}/>
                                      </div>
                                      <FormField control={studentForm.control} name="dni" render={({ field }) => (
                                          <FormItem><FormLabel>DNI</FormLabel><FormControl><Input placeholder="12345678" {...field} /></FormControl><FormMessage /></FormItem>
                                      )}/>
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
                          <TableHead>Matrícula (DNI)</TableHead>
                          <TableHead>Nombre Completo</TableHead>
                          <TableHead>Programa</TableHead>
                          <TableHead className="text-center">Semestre</TableHead>
                          <TableHead className="text-center">GPA</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areStudentsLoading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                            </TableCell>
                        </TableRow>
                    ) : students && students.length > 0 ? (
                        students.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="font-mono">{student.dni}</TableCell>
                                <TableCell className="font-medium">{student.lastName}, {student.firstName}</TableCell>
                                <TableCell>{programs?.find(p => p.id === student.programId)?.name || 'N/A'}</TableCell>
                                <TableCell className="text-center">{student.semester || 'N/A'}</TableCell>
                                <TableCell className="text-center">{student.gpa || 'N/A'}</TableCell>
                                <TableCell>{student.status || 'Regular'}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                          <DropdownMenuItem disabled>Ver Expediente</DropdownMenuItem>
                                          <DropdownMenuItem onSelect={() => handleOpenEditDialog(student)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar Alumno
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                No se encontraron estudiantes.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
      
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="sm:max-w-xl">
          <Form {...updateStudentForm}>
            <form onSubmit={updateStudentForm.handleSubmit(onUpdateStudentSubmit)}>
              <DialogHeader>
                <DialogTitle>Editar Estudiante</DialogTitle>
                <DialogDescription>Actualiza la información del estudiante. El email no se puede cambiar.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={updateStudentForm.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={updateStudentForm.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={updateStudentForm.control} name="dni" render={({ field }) => (
                  <FormItem><FormLabel>DNI</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={updateStudentForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={updateStudentForm.control} name="facultyId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facultad</FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); updateStudentForm.setValue('programId', ''); }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                        <SelectContent>{faculties?.map(fac => <SelectItem key={fac.id} value={fac.id}>{fac.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={updateStudentForm.control} name="programId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programa</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedFacultyIdUpdateStudent}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!selectedFacultyIdUpdateStudent ? "Primero selecciona" : "Asigna..."} /></SelectTrigger></FormControl>
                        <SelectContent>{programs?.filter(p => p.facultyId === selectedFacultyIdUpdateStudent).map(prog => <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditStudentOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={updateStudentForm.formState.isSubmitting}>
                  {updateStudentForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

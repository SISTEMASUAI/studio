
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, DocumentData } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

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
  } from '@/components/ui/dialog';
import {
  GraduationCap,
  PlusCircle,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Book,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Program extends DocumentData {
    id: string;
    programId: string;
    name: string;
    facultyId: string;
    totalCredits: number;
    totalCycles: number;
}

interface Faculty extends DocumentData {
    id: string;
    facultyId: string;
    name: string;
}

const ProgramSchema = z.object({
    programId: z.string().min(3, "El ID debe tener al menos 3 caracteres."),
    name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
    facultyId: z.string().min(1, "Debe seleccionar una facultad."),
    totalCredits: z.coerce.number().min(1, "Debe tener al menos 1 crédito."),
    totalCycles: z.coerce.number().min(1, "Debe tener al menos 1 ciclo."),
  });

const FacultySchema = z.object({
    facultyId: z.string().min(3, "El ID debe tener al menos 3 caracteres."),
    name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
});

export default function ProgramsPage() {
    const { profile } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [isCreateProgramDialogOpen, setIsCreateProgramDialogOpen] = useState(false);
    const [isEditProgramDialogOpen, setIsEditProgramDialogOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

    const [isCreateFacultyDialogOpen, setIsCreateFacultyDialogOpen] = useState(false);
    const [isEditFacultyDialogOpen, setIsEditFacultyDialogOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

    const programsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'programs') : null, [firestore]);
    const { data: programs, isLoading: areProgramsLoading } = useCollection<Program>(programsQuery);

    const facultiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'faculties') : null, [firestore]);
    const { data: faculties, isLoading: areFacultiesLoading } = useCollection<Faculty>(facultiesQuery);

    const facultyNames = useMemo(() => {
        if (!faculties) return {};
        return faculties.reduce((acc, faculty) => {
            acc[faculty.id] = faculty.name;
            return acc;
        }, {} as Record<string, string>);
    }, [faculties]);

    const programForm = useForm<z.infer<typeof ProgramSchema>>({
        resolver: zodResolver(ProgramSchema),
        defaultValues: { programId: '', name: '', facultyId: '', totalCredits: 0, totalCycles: 10 },
    });

    const updateProgramForm = useForm<z.infer<typeof ProgramSchema>>({
        resolver: zodResolver(ProgramSchema),
    });

    const facultyForm = useForm<z.infer<typeof FacultySchema>>({
        resolver: zodResolver(FacultySchema),
        defaultValues: { facultyId: '', name: '' },
    });

    const updateFacultyForm = useForm<z.infer<typeof FacultySchema>>({
        resolver: zodResolver(FacultySchema),
    });

    if (profile && profile.role !== 'admin') {
        router.replace('/intranet');
        return null;
    }

    const handleOpenEditProgramDialog = (program: Program) => {
        setSelectedProgram(program);
        updateProgramForm.reset(program);
        setIsEditProgramDialogOpen(true);
    };

    const handleOpenEditFacultyDialog = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        updateFacultyForm.reset(faculty);
        setIsEditFacultyDialogOpen(true);
    };

    async function onCreateProgramSubmit(values: z.infer<typeof ProgramSchema>) {
        if (!firestore) return;
        try {
            await addDocumentNonBlocking(collection(firestore, 'programs'), values);
            toast({ title: "Programa Creado", description: `El programa "${values.name}" ha sido creado.` });
            programForm.reset();
            setIsCreateProgramDialogOpen(false);
        } catch (error) {
            console.error("Error creating program: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear el programa." });
        }
    }

    async function onUpdateProgramSubmit(values: z.infer<typeof ProgramSchema>) {
        if (!firestore || !selectedProgram) return;
        try {
            await updateDocumentNonBlocking(doc(firestore, 'programs', selectedProgram.id), values);
            toast({ title: "Programa Actualizado", description: `El programa "${values.name}" ha sido actualizado.` });
            setIsEditProgramDialogOpen(false);
            setSelectedProgram(null);
        } catch (error) {
             console.error("Error updating program: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el programa." });
        }
    }

    async function onCreateFacultySubmit(values: z.infer<typeof FacultySchema>) {
        if (!firestore) return;
        try {
            await addDocumentNonBlocking(collection(firestore, 'faculties'), values);
            toast({ title: "Facultad Creada", description: `La facultad "${values.name}" ha sido creada.` });
            facultyForm.reset();
            setIsCreateFacultyDialogOpen(false);
        } catch (error) {
            console.error("Error creating faculty: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear la facultad." });
        }
    }

    async function onUpdateFacultySubmit(values: z.infer<typeof FacultySchema>) {
        if (!firestore || !selectedFaculty) return;
        try {
            await updateDocumentNonBlocking(doc(firestore, 'faculties', selectedFaculty.id), values);
            toast({ title: "Facultad Actualizada", description: `La facultad "${values.name}" ha sido actualizada.` });
            setIsEditFacultyDialogOpen(false);
            setSelectedFaculty(null);
        } catch (error) {
             console.error("Error updating faculty: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la facultad." });
        }
    }

    return (
    <div className="space-y-8">
        <section>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <GraduationCap className="text-primary" />
                        Gestión de Programas y Facultades
                    </h1>
                    <p className="text-muted-foreground">
                        Crea, edita y administra las carreras y facultades de la institución.
                    </p>
                </div>
            </div>
        </section>

        <Tabs defaultValue="programs">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="programs"><Book className="mr-2"/>Programas</TabsTrigger>
                <TabsTrigger value="faculties"><Building className="mr-2"/>Facultades</TabsTrigger>
            </TabsList>
            <TabsContent value="programs" className="mt-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Lista de Programas</CardTitle>
                                <CardDescription>Programas académicos activos en la institución.</CardDescription>
                            </div>
                            <Dialog open={isCreateProgramDialogOpen} onOpenChange={setIsCreateProgramDialogOpen}>
                                <DialogTrigger asChild><Button><PlusCircle className="mr-2"/> Crear Programa</Button></DialogTrigger>
                                <DialogContent>
                                    <Form {...programForm}>
                                        <form onSubmit={programForm.handleSubmit(onCreateProgramSubmit)}>
                                            <DialogHeader><DialogTitle>Crear Nuevo Programa Académico</DialogTitle></DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <FormField control={programForm.control} name="programId" render={({ field }) => (
                                                    <FormItem><FormLabel>ID del Programa</FormLabel><FormControl><Input placeholder="ej: ing-soft" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={programForm.control} name="name" render={={({ field }) => (
                                                    <FormItem><FormLabel>Nombre del Programa</FormLabel><FormControl><Input placeholder="Ingeniería de Software" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={programForm.control} name="facultyId" render={({ field }) => (
                                                    <FormItem><FormLabel>Facultad</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una facultad..."/></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {areFacultiesLoading ? <SelectItem value="loading" disabled>Cargando...</SelectItem> : faculties?.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    <FormMessage /></FormItem>
                                                )} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={programForm.control} name="totalCredits" render={({ field }) => (
                                                        <FormItem><FormLabel>Créditos Totales</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <FormField control={programForm.control} name="totalCycles" render={({ field }) => (
                                                        <FormItem><FormLabel>Total de Ciclos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" type="button" onClick={() => setIsCreateProgramDialogOpen(false)}>Cancelar</Button>
                                                <Button type="submit" disabled={programForm.formState.isSubmitting}>{programForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Programa</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>ID del Programa</TableHead><TableHead>Nombre</TableHead><TableHead>Facultad</TableHead><TableHead className="text-center">Créditos</TableHead><TableHead className="text-center">Ciclos</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {areProgramsLoading ? <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                : programs && programs.length > 0 ? programs.map(program => (
                                    <TableRow key={program.id}>
                                        <TableCell className="font-mono">{program.programId}</TableCell>
                                        <TableCell className="font-medium">{program.name}</TableCell>
                                        <TableCell>{facultyNames[program.facultyId] || 'N/A'}</TableCell>
                                        <TableCell className="text-center">{program.totalCredits}</TableCell>
                                        <TableCell className="text-center">{program.totalCycles}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => handleOpenEditProgramDialog(program)}><Edit className="mr-2"/>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator/><DropdownMenuItem className="text-destructive" disabled><Trash2 className="mr-2"/>Deshabilitar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={6} className="text-center">No se encontraron programas.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="faculties" className="mt-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Lista de Facultades</CardTitle>
                                <CardDescription>Facultades activas en la institución.</CardDescription>
                            </div>
                            <Dialog open={isCreateFacultyDialogOpen} onOpenChange={setIsCreateFacultyDialogOpen}>
                                <DialogTrigger asChild><Button><PlusCircle className="mr-2"/> Crear Facultad</Button></DialogTrigger>
                                <DialogContent>
                                    <Form {...facultyForm}>
                                        <form onSubmit={facultyForm.handleSubmit(onCreateFacultySubmit)}>
                                            <DialogHeader><DialogTitle>Crear Nueva Facultad</DialogTitle></DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <FormField control={facultyForm.control} name="facultyId" render={({ field }) => (
                                                    <FormItem><FormLabel>ID de la Facultad</FormLabel><FormControl><Input placeholder="ej: ing" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={facultyForm.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel>Nombre de la Facultad</FormLabel><FormControl><Input placeholder="Facultad de Ingeniería" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" type="button" onClick={() => setIsCreateFacultyDialogOpen(false)}>Cancelar</Button>
                                                <Button type="submit" disabled={facultyForm.formState.isSubmitting}>{facultyForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Facultad</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>ID de Facultad</TableHead><TableHead>Nombre</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {areFacultiesLoading ? <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                : faculties && faculties.length > 0 ? faculties.map(faculty => (
                                    <TableRow key={faculty.id}>
                                        <TableCell className="font-mono">{faculty.facultyId}</TableCell>
                                        <TableCell className="font-medium">{faculty.name}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => handleOpenEditFacultyDialog(faculty)}><Edit className="mr-2"/>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator/><DropdownMenuItem className="text-destructive" disabled><Trash2 className="mr-2"/>Deshabilitar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center">No se encontraron facultades.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        <Dialog open={isEditProgramDialogOpen} onOpenChange={setIsEditProgramDialogOpen}>
            <DialogContent>
                <Form {...updateProgramForm}>
                    <form onSubmit={updateProgramForm.handleSubmit(onUpdateProgramSubmit)}>
                        <DialogHeader><DialogTitle>Editar Programa Académico</DialogTitle></DialogHeader>
                        <div className="py-4 space-y-4">
                            <FormField control={updateProgramForm.control} name="programId" render={({ field }) => (
                                <FormItem><FormLabel>ID del Programa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={updateProgramForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nombre del Programa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={updateProgramForm.control} name="facultyId" render={({ field }) => (
                                <FormItem><FormLabel>Facultad</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una facultad..."/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {areFacultiesLoading ? <SelectItem value="loading" disabled>Cargando...</SelectItem> : faculties?.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={updateProgramForm.control} name="totalCredits" render={({ field }) => (
                                    <FormItem><FormLabel>Créditos Totales</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={updateProgramForm.control} name="totalCycles" render={({ field }) => (
                                    <FormItem><FormLabel>Total de Ciclos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsEditProgramDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={updateProgramForm.formState.isSubmitting}>{updateProgramForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        <Dialog open={isEditFacultyDialogOpen} onOpenChange={setIsEditFacultyDialogOpen}>
            <DialogContent>
                <Form {...updateFacultyForm}>
                    <form onSubmit={updateFacultyForm.handleSubmit(onUpdateFacultySubmit)}>
                        <DialogHeader><DialogTitle>Editar Facultad</DialogTitle></DialogHeader>
                        <div className="py-4 space-y-4">
                            <FormField control={updateFacultyForm.control} name="facultyId" render={({ field }) => (
                                <FormItem><FormLabel>ID de la Facultad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={updateFacultyForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nombre de la Facultad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsEditFacultyDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={updateFacultyForm.formState.isSubmitting}>{updateFacultyForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
    );
}

    

    
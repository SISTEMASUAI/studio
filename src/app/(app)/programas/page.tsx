'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface Program extends DocumentData {
    id: string;
    programId: string;
    name: string;
    faculty: string;
    totalCredits: number;
}

const ProgramSchema = z.object({
    programId: z.string().min(3, "El ID debe tener al menos 3 caracteres."),
    name: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
    faculty: z.string().min(5, "La facultad debe tener al menos 5 caracteres."),
    totalCredits: z.coerce.number().min(1, "Debe tener al menos 1 crédito."),
  });

export default function ProgramsPage() {
    const { profile } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

    const programsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'programs') : null,
    [firestore]);
    const { data: programs, isLoading: areProgramsLoading } = useCollection<Program>(programsQuery);

    const form = useForm<z.infer<typeof ProgramSchema>>({
        resolver: zodResolver(ProgramSchema),
        defaultValues: {
            programId: '',
            name: '',
            faculty: '',
            totalCredits: 0,
        },
    });

    const updateForm = useForm<z.infer<typeof ProgramSchema>>({
        resolver: zodResolver(ProgramSchema),
    });

    if (profile && profile.role !== 'admin') {
        router.replace('/intranet');
        return null;
    }

    const handleOpenEditDialog = (program: Program) => {
        setSelectedProgram(program);
        updateForm.reset(program);
        setIsEditDialogOpen(true);
    };

    async function onCreateSubmit(values: z.infer<typeof ProgramSchema>) {
        if (!firestore) return;
        
        try {
            await addDocumentNonBlocking(collection(firestore, 'programs'), values);
            toast({ title: "Programa Creado", description: `El programa "${values.name}" ha sido creado.` });
            form.reset();
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Error creating program: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear el programa." });
        }
    }

    async function onUpdateSubmit(values: z.infer<typeof ProgramSchema>) {
        if (!firestore || !selectedProgram) return;

        try {
            const programDocRef = doc(firestore, 'programs', selectedProgram.id);
            await updateDocumentNonBlocking(programDocRef, values);
            toast({ title: "Programa Actualizado", description: `El programa "${values.name}" ha sido actualizado.` });
            setIsEditDialogOpen(false);
            setSelectedProgram(null);
        } catch (error) {
             console.error("Error updating program: ", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el programa." });
        }
    }

    return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
            <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <GraduationCap className="text-primary" />
                Gestión de Programas Académicos
            </h1>
            <p className="text-muted-foreground">
                Crea, edita y administra las carreras o programas de la institución.
            </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2"/> Crear Programa</Button>
                </DialogTrigger>
                <DialogContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCreateSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Programa Académico</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <FormField control={form.control} name="programId" render={({ field }) => (
                                    <FormItem><FormLabel>ID del Programa</FormLabel><FormControl><Input placeholder="ej: ing-soft" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nombre del Programa</FormLabel><FormControl><Input placeholder="Ingeniería de Software" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="faculty" render={({ field }) => (
                                    <FormItem><FormLabel>Facultad</FormLabel><FormControl><Input placeholder="Facultad de Ingeniería" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="totalCredits" render={({ field }) => (
                                    <FormItem><FormLabel>Créditos Totales</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Programa
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      </section>

      <Card>
        <CardHeader>
            <CardTitle>Lista de Programas</CardTitle>
            <CardDescription>Programas académicos activos en la institución.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID del Programa</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Facultad</TableHead>
                        <TableHead className="text-center">Créditos</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {areProgramsLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                    ) : programs && programs.length > 0 ? (
                        programs.map(program => (
                            <TableRow key={program.id}>
                                <TableCell className="font-mono">{program.programId}</TableCell>
                                <TableCell className="font-medium">{program.name}</TableCell>
                                <TableCell>{program.faculty}</TableCell>
                                <TableCell className="text-center">{program.totalCredits}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => handleOpenEditDialog(program)}><Edit className="mr-2"/>Editar</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem className="text-destructive" disabled><Trash2 className="mr-2"/>Deshabilitar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5} className="text-center">No se encontraron programas.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <Form {...updateForm}>
                    <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Editar Programa Académico</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                                <FormField control={updateForm.control} name="programId" render={({ field }) => (
                                    <FormItem><FormLabel>ID del Programa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={updateForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nombre del Programa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={updateForm.control} name="faculty" render={({ field }) => (
                                    <FormItem><FormLabel>Facultad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={updateForm.control} name="totalCredits" render={({ field }) => (
                                    <FormItem><FormLabel>Créditos Totales</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                                {updateForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

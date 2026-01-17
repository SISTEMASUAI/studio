'use client';

import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { collection, query, where, DocumentData, doc, getDocs } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    UserCog,
    Search,
    PlusCircle,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
import CoursesTable from './CoursesTable';
import CreateCourseForm from '../forms/CreateCourseForm';
import EditCourseForm from '../forms/EditCourseForm';
import ModuleManagementDialog from './ModuleManagementDialog';
import type { Course, Program } from '@/types/course';


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
});


export default function AdminCoursesView() {
    const { toast } = useToast();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const firestore = useFirestore();

    const programsQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'programs') : null,
    [firestore]);
    const { data: programs } = useCollection<Program>(programsQuery);

    const activeCoursesQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'courses'), where('status', '==', 'active')) : null,
    [firestore]);
    const { data: activeCourses, isLoading: areActiveCoursesLoading } = useCollection<Course>(activeCoursesQuery);

    const inactiveCoursesQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'courses'), where('status', '==', 'inactive')) : null,
    [firestore]);
    const { data: inactiveCourses, isLoading: areInactiveCoursesLoading } = useCollection<Course>(inactiveCoursesQuery);

    const courseForm = useForm<z.infer<typeof CourseSchema>>({
        resolver: zodResolver(CourseSchema),
        defaultValues: {
            courseId: '', name: '', description: '', credits: 1, capacity: 30, facultyId: '',
            programId: '', cycle: 1, level: 'Pregrado', instructorId: '', mode: 'Presencial',
        },
    });
    
    const updateCourseForm = useForm<z.infer<typeof CourseSchema>>({
        resolver: zodResolver(CourseSchema),
    });

    const handleOpenEditDialog = (course: Course) => {
        setSelectedCourse(course);
        setIsEditDialogOpen(true);
    };

    const handleOpenModulesDialog = (course: Course) => {
        setSelectedCourse(course);
        setIsModulesDialogOpen(true);
    }

    const handleDeactivateCourse = async (course: Course) => {
        if (!firestore) return;
        try {
            const courseDocRef = doc(firestore, 'courses', course.id);
            await updateDocumentNonBlocking(courseDocRef, { status: 'inactive' });
            toast({
                title: "Curso Desactivado",
                description: `El curso "${course.name}" ha sido desactivado.`,
            });
        } catch (error) {
            console.error("Error deactivating course: ", error);
            toast({ variant: "destructive", title: "Error al desactivar", description: "No se pudo desactivar el curso." });
        }
    }

    const handleActivateCourse = async (course: Course) => {
        if (!firestore) return;
        try {
            const courseDocRef = doc(firestore, 'courses', course.id);
            await updateDocumentNonBlocking(courseDocRef, { status: 'active' });
            toast({ title: "Curso Activado", description: `El curso "${course.name}" ha sido activado.` });
        } catch (error) {
            console.error("Error activating course: ", error);
            toast({ variant: "destructive", title: "Error al activar", description: "No se pudo activar el curso." });
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog /> Administración de Cursos
                    </CardTitle>
                    <CardDescription>
                        Panel para administrar todos los cursos de la plataforma, asignaturas y profesores.
                    </CardDescription>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por código o nombre..." className="pl-9" />
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <PlusCircle className="mr-2" /> Crear Curso
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl">
                                <CreateCourseForm
                                    form={courseForm}
                                    onSuccess={() => {
                                        courseForm.reset();
                                        setIsCreateDialogOpen(false);
                                    }}
                                    onCancel={() => setIsCreateDialogOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="active">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="active">Activos</TabsTrigger>
                            <TabsTrigger value="inactive">Inactivos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="active" className="mt-4">
                            <CoursesTable
                                courses={activeCourses}
                                isLoading={areActiveCoursesLoading}
                                programs={programs}
                                onEdit={handleOpenEditDialog}
                                onDeactivate={handleDeactivateCourse}
                                onManageModules={handleOpenModulesDialog}
                                isActive={true}
                            />
                        </TabsContent>
                        <TabsContent value="inactive" className="mt-4">
                            <CoursesTable
                                courses={inactiveCourses}
                                isLoading={areInactiveCoursesLoading}
                                programs={programs}
                                onEdit={handleOpenEditDialog}
                                onActivate={handleActivateCourse}
                                onManageModules={handleOpenModulesDialog}
                                isActive={false}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {selectedCourse && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-3xl">
                        <EditCourseForm
                            form={updateCourseForm}
                            course={selectedCourse}
                            onSuccess={() => {
                                setIsEditDialogOpen(false);
                                setSelectedCourse(null);
                            }}
                            onCancel={() => setIsEditDialogOpen(false)}
                        />
                    </DialogContent>
                 </Dialog>
            )}
            
            {selectedCourse && (
                <ModuleManagementDialog
                    isOpen={isModulesDialogOpen}
                    onOpenChange={setIsModulesDialogOpen}
                    course={selectedCourse}
                />
            )}
        </>
    );
}

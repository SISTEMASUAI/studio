'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    ClipboardList,
  FilePenLine,
  UserCog,
  BookOpenCheck,
  PlusCircle,
  MinusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Calendar,
  ListPlus,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { collection, query, where, DocumentData, doc, updateDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface Course extends DocumentData {
    id: string;
    courseId: string;
    name: string;
    description: string;
    credits: number;
    level: string;
    instructorId: string;
    programId: string;
    facultyId: string;
    semesterStartDate?: string;
    semesterEndDate?: string;
    schedule?: { day: string; startTime: string; endTime: string; classroom: string }[];
    mode?: string;
    enrolled?: number;
    capacity?: number;
    prerequisiteStatus?: 'met' | 'partial' | 'unmet';
    conflict?: boolean;
    waitlistStatus?: 'none' | 'on_waitlist';
    status?: 'active' | 'inactive';
}

interface Professor extends DocumentData {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

interface Enrollment extends DocumentData {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    professorName: string;
}


const PrerequisiteBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'met':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1"/> Prerrequisitos Cumplidos</Badge>;
    case 'partial':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="mr-1"/> Requiere Excepción</Badge>;
    case 'unmet':
      return <Badge variant="destructive"><XCircle className="mr-1"/> No Cumple Prerrequisitos</Badge>;
    default:
      return null;
  }
}

function StudentEnrollmentView() {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isEnrollmentPeriod = true; 
  const isEarlyWithdrawal = true; 

  const availableCoursesQuery = useMemoFirebase(() => {
      if (!firestore || !profile?.programId) return null;
      return query(
        collection(firestore, 'courses'), 
        where('programId', '==', profile.programId),
        where('status', '==', 'active')
      );
  }, [firestore, profile]);

  const { data: availableCourses, isLoading: areCoursesLoading } = useCollection<Course>(availableCoursesQuery);

  const enrolledCoursesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid));
  }, [firestore, user]);

  const { data: enrolledCourses, isLoading: areEnrolledLoading } = useCollection<Enrollment>(enrolledCoursesQuery);

  const professorsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'professor')) : null,
  [firestore]);
  const { data: professors } = useCollection<Professor>(professorsQuery);


  const getProgressColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  const handleEnroll = async (course: Course) => {
    if (!firestore || !user || !profile) return;
    setIsEnrolling(course.id);

    const professor = professors?.find(p => p.id === course.instructorId);
    const courseDocRef = doc(firestore, "courses", course.id);

    const enrollmentData = {
        studentId: user.uid,
        courseId: course.id,
        courseCode: course.courseId,
        courseName: course.name,
        courseImage: `https://picsum.photos/seed/${course.id}/400/200`,
        professorId: course.instructorId,
        professorName: professor ? `${professor.firstName} ${professor.lastName}` : 'No asignado',
        professorProfilePicture: professor ? professor.profilePicture : `https://i.pravatar.cc/150?u=${course.instructorId}`,
        semester: '2024-2', // Placeholder
        year: 2024, // Placeholder
    };

    try {
        await addDocumentNonBlocking(collection(firestore, 'enrollments'), enrollmentData);
        await updateDoc(courseDocRef, { enrolled: increment(1) });
        
        toast({
            title: "Inscripción Exitosa",
            description: `Te has inscrito en ${course.name}.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Error de Inscripción",
            description: "No se pudo completar la inscripción. Inténtalo de nuevo.",
        });
    } finally {
        setIsEnrolling(null);
    }
  };

  const handleWithdraw = async (enrollmentId: string, courseId: string) => {
    if (!firestore) return;
    setIsWithdrawing(enrollmentId);
    
    const enrollmentDocRef = doc(firestore, 'enrollments', enrollmentId);
    const courseDocRef = doc(firestore, "courses", courseId);

    try {
        await deleteDocumentNonBlocking(enrollmentDocRef);
        await updateDoc(courseDocRef, { enrolled: increment(-1) });
        
        toast({
            title: "Retiro Exitoso",
            description: "Has sido retirado del curso.",
        });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: "Error al Retirar",
            description: "No se pudo procesar el retiro del curso.",
        });
    } finally {
        setIsWithdrawing(null);
    }
  }

  const handleConfirmEnrollment = () => {
    setIsConfirmed(true);
    toast({
        title: "Matrícula Confirmada",
        description: "Tu matrícula ha sido registrada oficialmente.",
    });
  }


  if (!isEnrollmentPeriod) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Período de Matrícula</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Período de Matrícula Cerrado</AlertTitle>
                    <AlertDescription>
                        El período de matrícula para el semestre actual ha finalizado. Podrás inscribir cursos nuevamente en las próximas fechas que serán anunciadas.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
  }

  const renderActionButton = (course: Course) => {
    const isFull = (course.enrolled || 0) >= (course.capacity || 0);
    const isAlreadyEnrolled = enrolledCourses?.some(e => e.courseId === course.id);

    if (isAlreadyEnrolled) {
        return <Button variant="secondary" size="sm" className="w-full" disabled>Ya estás inscrito</Button>;
    }

    if (isEnrolling === course.id) {
        return <Button size="sm" className="w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Inscribiendo...</Button>
    }

    if (course.waitlistStatus === 'on_waitlist') {
        return <Button variant="outline" size="sm" className="w-full" disabled><ListPlus className="mr-2 h-4 w-4" /> Estás en la lista de espera</Button>;
    }

    if (isFull) {
        return (
            <Button variant="secondary" size="sm" className="w-full" disabled={!isEnrollmentPeriod || course.prerequisiteStatus === 'unmet'}>
                <ListPlus className="mr-2 h-4 w-4" /> Unirse a lista de espera
            </Button>
        );
    }
    
    return (
        <Button size="sm" className="w-full" onClick={() => handleEnroll(course)} disabled={!isEnrollmentPeriod || course.prerequisiteStatus === 'unmet' || course.conflict}>
            <PlusCircle className="mr-2 h-4 w-4" /> Inscribir
        </Button>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BookOpenCheck /> Cursos Disponibles
            </CardTitle>
            <CardDescription>
                Explora y inscríbete en las asignaturas para el próximo semestre.
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Período de Matrícula Abierto</Badge>
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {areCoursesLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>
                ) : availableCourses && availableCourses.length > 0 ? (
                    availableCourses.map((course) => {
                        const professor = professors?.find(p => p.id === course.instructorId);
                        return (
                        <Card key={course.id} className={`border-2 ${course.conflict ? 'border-destructive/50' : 'border-transparent'}`}>
                        <CardHeader className="pb-2">
                            {course.conflict && (
                                <Alert variant="destructive" className="mb-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>¡Conflicto de Horario!</AlertTitle>
                                </Alert>
                            )}
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{course.name}</CardTitle>
                                    <CardDescription>{course.courseId} - {course.credits} créditos</CardDescription>
                                </div>
                                <PrerequisiteBadge status={course.prerequisiteStatus || 'met'} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2"><UserCog /> {professor ? `${professor.firstName} ${professor.lastName}` : 'No asignado'}</div>
                                    <div className="flex items-center gap-2"><Calendar /> {course.schedule?.[0]?.day} {course.schedule?.[0]?.startTime}-{course.schedule?.[0]?.endTime}</div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                        <span>Cupos</span>
                                        <span>{course.enrolled || 0}/{course.capacity || 0}</span>
                                    </div>
                                    <Progress value={((course.enrolled || 0) / (course.capacity || 1)) * 100} indicatorClassName={getProgressColor(course.enrolled || 0, course.capacity || 1)} />
                                </div>
                        </CardContent>
                            <CardFooter>
                                {renderActionButton(course)}
                            </CardFooter>
                        </Card>
                        )
                    })
                ) : (
                    <Alert>
                        <BookOpenCheck className="h-4 w-4" />
                        <AlertTitle>No hay cursos disponibles</AlertTitle>
                        <AlertDescription>
                            No hay cursos disponibles para tu programa en este momento.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
      </div>
      <div className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ClipboardList /> Mis Asignaturas (Pre-matrícula)
            </CardTitle>
            <CardDescription>
                Asignaturas seleccionadas para este semestre.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {areEnrolledLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>
            ) : enrolledCourses && enrolledCourses.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {enrolledCourses.map((course) => (
                        <TableRow key={course.id}>
                        <TableCell>
                            <div className="font-medium">{course.courseName}</div>
                            <div className="text-sm text-muted-foreground">
                            {course.courseCode}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" disabled={!isEnrollmentPeriod || isWithdrawing === course.id}>
                                         {isWithdrawing === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MinusCircle className="mr-2 h-4 w-4" />}
                                        Retirar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="text-destructive" />
                                            Confirmar Baja de Asignatura
                                        </DialogTitle>
                                        <DialogDescription>
                                            Estás a punto de dar de baja "{course.courseName}".
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <Alert variant={isEarlyWithdrawal ? "default" : "destructive"}>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>¡Atención!</AlertTitle>
                                            <AlertDescription>
                                                {isEarlyWithdrawal
                                                    ? "Estás en el período de retiro sin penalización. El curso se eliminará de tu registro sin afectar tu promedio."
                                                    : "Ha finalizado el período sin penalización. El curso aparecerá en tu historial como 'Retirado' y no habrá reembolso."
                                                }
                                            </AlertDescription>
                                        </Alert>
                                        <div className="space-y-2">
                                            <Label htmlFor="reason-drop">Motivo de la baja (requerido)</Label>
                                            <Select>
                                                <SelectTrigger id="reason-drop">
                                                    <SelectValue placeholder="Selecciona un motivo..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="academic">Carga académica</SelectItem>
                                                    <SelectItem value="personal">Personal</SelectItem>
                                                    <SelectItem value="work">Laboral</SelectItem>
                                                    <SelectItem value="other">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="comments-drop">Comentarios (opcional)</Label>
                                            <Textarea id="comments-drop" placeholder="Añade un comentario si es necesario." />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="terms-drop" />
                                            <label
                                                htmlFor="terms-drop"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Entiendo y acepto las consecuencias de esta acción.
                                            </label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline">Cancelar</Button>
                                        <Button variant="destructive" onClick={() => handleWithdraw(course.id, course.courseId)} disabled={isWithdrawing === course.id}><MinusCircle className="mr-2"/> Confirmar Baja</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                ) : (
                <Alert>
                    <ClipboardList className="h-4 w-4" />
                    <AlertTitle>Sin Cursos Inscritos</AlertTitle>
                    <AlertDescription>
                        Aún no has inscrito ningún curso.
                    </AlertDescription>
                </Alert>
            )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button className="w-full" disabled={!enrolledCourses || enrolledCourses.length === 0 || isConfirmed} onClick={handleConfirmEnrollment}>
                    {isConfirmed ? 'Matrícula Confirmada' : 'Confirmar Matrícula'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">La confirmación guarda tu matrícula oficialmente.</p>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function AdminEnrollmentView() {
    return (
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <CardTitle className="flex items-center gap-2"><UserCog/> Gestión de Matrícula</CardTitle>
                    <CardDescription>
                    Panel para gestionar el proceso de matrícula, cupos y excepciones.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled><Calendar className="mr-2"/> Periodos</Button>
                    <Button variant="outline" disabled><Users className="mr-2"/> Cupos</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <UserCog className="h-4 w-4" />
            <AlertTitle>En Desarrollo</AlertTitle>
            <AlertDescription>
                Aquí encontrarás el dashboard de control, herramientas para inscripción forzosa, aprobación de excepciones y gestión de periodos de matrícula.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

function ProfessorEnrollmentView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matrícula de Cursos</CardTitle>
          <CardDescription>
            Este panel es para la gestión de matrícula por parte de alumnos y administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <Clock className="h-4 w-4" />
            <AlertTitle>No hay acciones disponibles</AlertTitle>
            <AlertDescription>
              Los docentes no tienen acciones directas en el proceso de matrícula desde este panel. Podrás ver tus listas de clase en la sección de cursos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

export default function EnrollmentPage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>
    }

    switch (profile.role) {
      case 'student':
        return <StudentEnrollmentView />;
      case 'admin':
        return <AdminEnrollmentView />;
      case 'professor':
        return <ProfessorEnrollmentView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p>Cargando información del usuario...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <FilePenLine className="text-primary" />
              Matrícula y Gestión de Asignaturas
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Inscribe, da de baja y gestiona tus asignaturas.'
                : 'Gestiona el proceso de matrícula de la universidad.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}

'use client';

import { useUser } from '@/firebase';
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const availableCourses = [
  {
    code: 'CS404',
    name: 'Algoritmos Avanzados',
    credits: 4,
    enrolled: 25,
    capacity: 30,
    professor: 'Dr. Alan Turing',
    schedule: 'Lun/Mié 10:00-12:00',
    prerequisiteStatus: 'met', // 'met', 'partial', 'unmet'
    conflict: false,
  },
  {
    code: 'HI202',
    name: 'Historia de la Tecnología',
    credits: 3,
    enrolled: 48,
    capacity: 50,
    professor: 'Dra. Ada Lovelace',
    schedule: 'Mar/Jue 14:00-16:00',
    prerequisiteStatus: 'met',
    conflict: true,
  },
  {
    code: 'MA501',
    name: 'Matemáticas Discretas II',
    credits: 4,
    enrolled: 30,
    capacity: 30,
    professor: 'Dr. John von Neumann',
    schedule: 'Vie 08:00-11:00',
    prerequisiteStatus: 'unmet',
    conflict: false,
  },
   {
    code: 'DS301',
    name: 'Bases de Datos Avanzadas',
    credits: 4,
    enrolled: 15,
    capacity: 40,
    professor: 'Dr. Edgar Codd',
    schedule: 'Mar/Jue 14:00-16:00',
    prerequisiteStatus: 'partial',
    conflict: true,
  },
];

const enrolledCourses = [
  {
    code: 'CS101',
    name: 'Introducción a la Programación',
    credits: 4,
    professor: 'Dr. Guido van Rossum',
  },
  {
    code: 'MA203',
    name: 'Cálculo Avanzado',
    credits: 4,
    professor: 'Dr. Isaac Newton',
  },
];

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
  const isEnrollmentPeriod = true; // Placeholder
  const isEarlyWithdrawal = true; // Placeholder for withdrawal period logic

  const getProgressColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
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
            {/* TODO: Add filters here */}
            </CardHeader>
            <CardContent className="space-y-4">
                {availableCourses.map((course) => {
                    const isFull = course.enrolled >= course.capacity;
                    return (
                        <Card key={course.code} className={`border-2 ${course.conflict ? 'border-destructive/50' : 'border-transparent'}`}>
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
                                    <CardDescription>{course.code} - {course.credits} créditos</CardDescription>
                                </div>
                                <PrerequisiteBadge status={course.prerequisiteStatus} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2"><UserCog /> {course.professor}</div>
                                    <div className="flex items-center gap-2"><Calendar /> {course.schedule}</div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                        <span>Cupos</span>
                                        <span>{course.enrolled}/{course.capacity}</span>
                                    </div>
                                    <Progress value={(course.enrolled / course.capacity) * 100} indicatorClassName={getProgressColor(course.enrolled, course.capacity)} />
                                </div>
                        </CardContent>
                            <CardFooter>
                                {isFull ? (
                                    <Button variant="secondary" size="sm" className="w-full" disabled={!isEnrollmentPeriod || course.prerequisiteStatus === 'unmet'}>
                                        Unirse a lista de espera
                                    </Button>
                                ) : (
                                    <Button size="sm" className="w-full" disabled={!isEnrollmentPeriod || course.prerequisiteStatus === 'unmet' || course.conflict}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Inscribir
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
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
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {enrolledCourses.map((course) => (
                    <TableRow key={course.code}>
                    <TableCell>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground">
                        {course.code} - {course.credits} créditos
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" disabled={!isEnrollmentPeriod}>
                                    <MinusCircle className="mr-2 h-4 w-4" />
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
                                        Estás a punto de dar de baja "{course.name}".
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
                                    <Button variant="destructive" disabled><MinusCircle className="mr-2"/> Confirmar Baja</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button className="w-full" disabled>Confirmar Matrícula</Button>
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
        <CardTitle>Gestión de Matrícula</CardTitle>
        <CardDescription>
          Panel para gestionar cupos, aprobar inscripciones y habilitar períodos de matrícula.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>En Desarrollo</AlertTitle>
          <AlertDescription>
            Esta sección está en construcción y pronto permitirá la gestión completa del proceso de matrícula.
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
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
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

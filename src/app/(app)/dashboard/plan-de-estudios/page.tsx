

'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookMarked, UserCog, Download, Edit, PlusCircle, BarChart3, ListTree, ListTodo, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const curriculum = {
  semesters: [
    {
      semester: 1,
      courses: [
        { code: 'CS101', name: 'Introducción a la Programación', credits: 4, status: 'completed' },
        { code: 'MA101', name: 'Cálculo I', credits: 4, status: 'completed' },
        { code: 'PY101', name: 'Física I', credits: 3, status: 'completed' },
      ],
    },
    {
      semester: 2,
      courses: [
        { code: 'CS201', name: 'Estructuras de Datos', credits: 4, status: 'enrolled' },
        { code: 'MA201', name: 'Cálculo II', credits: 4, status: 'enrolled' },
        { code: 'HU201', name: 'Humanidades I', credits: 2, status: 'enrolled' },
      ],
    },
    {
      semester: 3,
      courses: [
        { code: 'CS301', name: 'Algoritmos y Complejidad', credits: 4, status: 'pending' },
        { code: 'DB101', name: 'Bases de Datos', credits: 4, status: 'pending' },
        { code: 'EL101', name: 'Electiva I', credits: 3, status: 'pending' },
      ],
    }
  ],
  totalCredits: 140,
  completedCredits: 24,
};


function StudentCurriculumView() {
  const progress = (curriculum.completedCredits / curriculum.totalCredits) * 100;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListTree /> Malla Curricular</CardTitle>
            <CardDescription>Visualiza el progreso de tu carrera y las asignaturas por semestre.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {curriculum.semesters.map(s => (
              <div key={s.semester}>
                <h3 className="font-headline font-semibold mb-2">Semestre {s.semester}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {s.courses.map(c => (
                    <Card key={c.code} className={`opacity-80 ${c.status === 'completed' ? 'border-green-500 bg-green-50' : c.status === 'enrolled' ? 'border-blue-500' : ''}`}>
                      <CardContent className="p-3">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.code} - {c.credits} créditos</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 /> Progreso de Carrera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium">Créditos Aprobados</p>
                    <p><span className="font-bold text-xl">{curriculum.completedCredits}</span> / {curriculum.totalCredits}</p>
                </div>
                <Progress value={progress} />
            </div>
            <Button className="w-full"><Download className="mr-2"/> Descargar Plan de Estudios</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ListTodo /> Prerrequisitos</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Próximamente: Visualizador de prerrequisitos.</p></CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star /> Asignaturas Optativas</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Próximamente: Lista de asignaturas optativas disponibles.</p></CardContent>
        </Card>
      </aside>
    </div>
  );
}

function AdminCurriculumView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión del Plan de Estudios</CardTitle>
        <CardDescription>
          Panel para visualizar y administrar la malla curricular, prerrequisitos y estadísticas de avance de los estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="flex gap-2">
            <Button><Edit className="mr-2"/> Modificar Malla Curricular</Button>
            <Button variant="outline"><PlusCircle className="mr-2"/> Gestionar Prerrequisitos</Button>
         </div>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>En Desarrollo</AlertTitle>
          <AlertDescription>
            Esta sección permitirá la gestión completa de los planes de estudio de la universidad.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function ProfessorCurriculumView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan de Estudios</CardTitle>
          <CardDescription>
            Desde aquí puedes consultar la malla curricular completa, los prerrequisitos de las asignaturas y las optativas disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button className="w-full"><Download className="mr-2"/> Descargar Plan de Estudios</Button>
            <Alert>
                <BookMarked className="h-4 w-4" />
                <AlertTitle>Acceso de Consulta</AlertTitle>
                <AlertDescription>
                Los docentes tienen acceso de solo lectura a la información del plan de estudios. Las modificaciones son gestionadas por los administradores.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
  }

export default function CurriculumPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentCurriculumView />;
      case 'admin':
        return <AdminCurriculumView />;
      case 'professor':
        return <ProfessorCurriculumView />;
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
              <BookMarked className="text-primary" />
              Plan de Estudios
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Consulta tu progreso y la estructura de tu carrera.'
                : 'Consulta y gestiona la malla curricular de la universidad.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}

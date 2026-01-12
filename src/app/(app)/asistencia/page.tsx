
'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  UserCheck,
  UserCog,
  BookOpen,
  BarChart,
  Upload,
  ThumbsUp,
  Settings2,
  FileSearch,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function ProfessorAttendanceView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2">
                <BookOpen /> Mis Cursos
                </CardTitle>
                <CardDescription>
                Selecciona un curso para gestionar la asistencia.
                </CardDescription>
            </div>
            <Select>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Seleccionar curso..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="course-1">Introducción al Desarrollo Web</SelectItem>
                    <SelectItem value="course-2">Estrategias de Marketing Avanzado</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
          <AlertDescription>
            Próximamente podrás tomar asistencia, ver listas, generar reportes y
            gestionar las justificaciones para el curso seleccionado.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function AdminAttendanceView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog /> Gestión de Asistencia
        </CardTitle>
        <CardDescription>
          Administra la asistencia de todos los cursos, justificaciones y políticas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
            <Button variant="outline"><FileSearch className="mr-2"/> Ver Asistencia General</Button>
            <Button variant="outline"><ThumbsUp className="mr-2"/> Gestionar Justificaciones</Button>
            <Button variant="outline"><BarChart className="mr-2"/> Ver Estadísticas Globales</Button>
            <Button variant="outline"><Settings2 className="mr-2"/> Configurar Políticas</Button>
        </div>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>Panel de Administrador en Desarrollo</AlertTitle>
          <AlertDescription>
            Las herramientas avanzadas para la gestión global de la asistencia
            estarán disponibles en esta sección próximamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default function AttendancePage() {
  const { profile } = useUser();

  const renderContent = () => {
    // According to the table, this page is only for professors and admins
    switch (profile?.role) {
      case 'professor':
        return <ProfessorAttendanceView />;
      case 'admin':
        return <AdminAttendanceView />;
      default:
        // Students or other roles should not see this page.
        // The navigation is already filtering this, but as a fallback:
        return (
          <Card>
            <CardContent className="pt-6">
              <p>No tienes permiso para acceder a esta sección.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UserCheck className="text-primary" />
            Gestión de Asistencia
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'admin'
              ? 'Panel de control para la asistencia de toda la institución.'
              : 'Gestiona la asistencia de tus cursos.'}
          </p>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}

    

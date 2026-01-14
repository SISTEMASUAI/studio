'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProfessorAttendanceView from '@/components/asistencia/ProfessorAttendanceView';
import AdminAttendanceView from '@/components/asistencia/AdminAttendanceView';
import { Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const { profile, isUserLoading } = useUser();

  const renderContent = () => {
    if (isUserLoading || !profile) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    switch (profile.role) {
      case 'professor':
        return <ProfessorAttendanceView />;
      case 'admin':
        return <AdminAttendanceView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>No tienes permiso para acceder a esta sección.</AlertDescription>
              </Alert>
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

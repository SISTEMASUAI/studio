'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminAttendanceView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog /> Gestión de Asistencia
        </CardTitle>
        <CardDescription>
          Panel de administrador para supervisar la asistencia y gestionar justificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <UserCog className="h-4 w-4" />
          <AlertTitle>Panel de Administrador en Desarrollo</AlertTitle>
          <AlertDescription>
            Las herramientas para supervisar la asistencia de todos los cursos, ver estadísticas y gestionar las justificaciones de los alumnos estarán disponibles aquí.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

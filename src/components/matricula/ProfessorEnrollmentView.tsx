'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProfessorEnrollmentView() {
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

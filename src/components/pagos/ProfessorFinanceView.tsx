'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProfessorFinanceView() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos y Finanzas</CardTitle>
          <CardDescription>
            Este módulo es para la gestión financiera por parte de alumnos y administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <Landmark className="h-4 w-4" />
            <AlertTitle>No hay acciones disponibles</AlertTitle>
            <AlertDescription>
              Los docentes no tienen acceso a la información financiera desde este panel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

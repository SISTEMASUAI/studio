'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  UserCog,
  Calendar,
  Users,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AdminEnrollmentView() {
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

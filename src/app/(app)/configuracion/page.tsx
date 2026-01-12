'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings, UserCog, Calendar, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AdminConfigView() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Modificar Cupos de Secciones</CardTitle>
                    <CardDescription>Ajusta la capacidad de las secciones de cursos de manera excepcional.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <UserCog className="h-4 w-4" />
                        <AlertTitle>En Desarrollo</AlertTitle>
                        <AlertDescription>
                            Aquí podrás buscar secciones específicas y modificar su capacidad. El sistema validará los cambios y te permitirá gestionar la lista de espera si es necesario.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> Gestionar Calendario Académico</CardTitle>
                    <CardDescription>Define las fechas clave del semestre para toda la institución.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert>
                        <UserCog className="h-4 w-4" />
                        <AlertTitle>En Desarrollo</AlertTitle>
                        <AlertDescription>
                            Desde aquí podrás establecer los períodos de matrícula, fechas de exámenes y feriados. Los cambios notificarán a todos los usuarios.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
}


export default function ConfigurationPage() {
  const { profile } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [profile, router]);

  if (profile?.role !== 'admin') {
    return (
        <Card>
            <CardContent className="pt-6">
              <p>No tienes permiso para acceder a esta sección.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Settings className="text-primary" />
            Configuración Académica
          </h1>
          <p className="text-muted-foreground">
            Herramientas de alto nivel para la administración de la plataforma.
          </p>
        </div>
      </section>

      <AdminConfigView />
    </div>
  );
}

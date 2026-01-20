'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings, UserCog, Calendar, Users, Search, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function AdminConfigView() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Modificar Cupos de Secciones</CardTitle>
                    <CardDescription>Ajusta la capacidad de las secciones de cursos de manera excepcional.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input placeholder="Buscar curso o sección..."/>
                        <Button><Search className="mr-2"/>Buscar</Button>
                    </div>
                    <Card className="bg-accent/50">
                        <CardHeader>
                            <CardTitle className="text-lg">CS-101 - Sección A</CardTitle>
                            <CardDescription>Introducción a la Programación</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-end gap-4">
                            <div className="space-y-2 flex-grow">
                                <Label htmlFor="capacity">Cupos Actuales</Label>
                                <Input id="capacity" type="number" defaultValue="30"/>
                            </div>
                            <Button><Save className="mr-2"/>Guardar</Button>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> Gestionar Calendario Académico</CardTitle>
                    <CardDescription>Define las fechas clave del semestre para toda la institución.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Inicio de Matrícula</Label>
                            <Input type="date" defaultValue="2024-08-01"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Fin de Matrícula</Label>
                            <Input type="date" defaultValue="2024-08-15"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Inicio de Clases</Label>
                            <Input type="date" defaultValue="2024-08-19"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Fin de Semestre</Label>
                            <Input type="date" defaultValue="2024-12-20"/>
                        </div>
                    </div>
                    <Button className="w-full">Guardar Cambios del Calendario</Button>
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

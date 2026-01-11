

'use client';

import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HeartPulse,
  Calendar,
  BookOpen,
  LifeBuoy,
  History,
  Users,
  BarChart,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const serviceHistory = [
  {
    id: 'WH-001',
    service: 'Cita de Orientación Psicológica',
    date: '2024-07-20',
    status: 'Completado',
  },
  {
    id: 'WH-002',
    service: 'Tutoría Académica - Cálculo',
    date: '2024-08-05',
    status: 'Programada',
  },
];

const availableResources = [
    { title: 'Guía de Manejo de Estrés', url: '#' },
    { title: 'Técnicas de Estudio Efectivas', url: '#' },
    { title: 'Contacto de Emergencia 24/7', url: '#' },
]

export default function WellnessPage() {
  const { profile } = useUser();

  const isAdmin = profile?.role === 'admin';
  const canRequestTutoring = profile?.role === 'student' || profile?.role === 'professor';

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <HeartPulse className="text-primary" />
              Servicios de Bienestar
            </h1>
            <p className="text-muted-foreground">
              Tu salud física y mental es nuestra prioridad.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Actions Column */}
        <div className="lg:col-span-2 space-y-8">
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar /> Solicitar Cita</CardTitle>
                <CardDescription>Agenda una sesión de orientación o tutoría.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full">
                    Solicitar Cita de Orientación
                </Button>
                {canRequestTutoring && (
                    <Button variant="secondary" className="w-full">
                        Solicitar Tutoría Académica
                    </Button>
                )}
            </CardContent>
           </Card>
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Mi Historial de Servicios</CardTitle>
                <CardDescription>Revisa tus citas pasadas y programadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {serviceHistory.map(item => (
                        <li key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-accent/50 rounded-lg">
                            <div>
                                <p className="font-semibold">{item.service}</p>
                                <p className="text-sm text-muted-foreground">Fecha: {item.date}</p>
                            </div>
                            <Badge variant={item.status === 'Completado' ? 'default' : 'secondary'}>{item.status}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
           </Card>
        </div>

        {/* Aside Column */}
        <aside className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LifeBuoy /> Recursos de Ayuda</CardTitle>
                    <CardDescription>Material y contactos de soporte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {availableResources.map((res, index) => (
                            <li key={index}>
                                <Button variant="link" className="p-0 h-auto font-normal">
                                    {res.title}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Gestión de Bienestar</CardTitle>
                        <CardDescription>Panel para administrar citas, tutores y recursos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Button variant="outline"><UserCheck className="mr-2"/> Asignar Tutores</Button>
                            <Button variant="outline"><BarChart className="mr-2"/> Ver Estadísticas</Button>
                            <Button variant="outline"><Calendar className="mr-2"/> Gestionar Agenda</Button>
                        </div>
                        <Alert>
                            <HeartPulse className="h-4 w-4" />
                            <AlertTitle>En Desarrollo</AlertTitle>
                            <AlertDescription>
                                Las funcionalidades avanzadas para la gestión de bienestar estarán disponibles próximamente.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </aside>
      </div>
    </div>
  );
}

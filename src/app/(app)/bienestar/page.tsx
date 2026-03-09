'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { HeartPulse, History, Users, BarChart, CalendarIcon, LifeBuoy, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppointmentForm from '@/components/bienestar/AppointmentForm';
import AppointmentList from '@/components/bienestar/AppointmentList';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const resources = [
  { title: 'Guía de Manejo de Estrés', url: '#' },
  { title: 'Técnicas de Estudio Efectivas', url: '#' },
  { title: 'Contacto de Emergencia 24/7', url: '#' },
];

export default function WellnessPage() {
  const { profile, user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userAppointmentsQuery = useMemoFirebase(
    () => (firestore && user ? query(
      collection(firestore, 'wellness_services'), 
      where('userId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    ) : null),
    [firestore, user?.uid]
  );
  const { data: myAppointments, isLoading: isMyHistoryLoading, error: myError } = useCollection(userAppointmentsQuery);

  const isAdmin = profile?.role === 'admin';

  const adminAppointmentsQuery = useMemoFirebase(
    () => (firestore && isAdmin ? query(
      collection(firestore, 'wellness_services'), 
      orderBy('requestedAt', 'desc')
    ) : null),
    [firestore, isAdmin]
  );
  const { data: allAppointments, isLoading: isAdminLoading, error: adminError } = useCollection(adminAppointmentsQuery);

  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <HeartPulse className="text-primary" />
          Servicios de Bienestar
        </h1>
        <p className="text-muted-foreground mt-1">
          Atención psicológica, tutorías académicas y recursos de salud para tu bienestar integral.
        </p>
      </section>

      {/* Alerta si hay error de base de datos (como falta de índices) */}
      {(myError || (isAdmin && adminError)) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de consulta</AlertTitle>
          <AlertDescription>
            {myError?.message || adminError?.message}
            <p className="mt-2 text-xs opacity-70">
              Nota: Si el error menciona que "la consulta requiere un índice", haz clic en el enlace que aparece en la consola del navegador para crearlo.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarIcon className="text-primary" /> Solicitar una Cita</CardTitle>
              <CardDescription>Selecciona un servicio y reserva tu espacio de atención.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="text-primary" /> Mi Historial de Atención</CardTitle>
              <CardDescription>Seguimiento de tus citas solicitadas y programadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {isMyHistoryLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin opacity-20" /></div>
              ) : (
                <AppointmentList appointments={myAppointments || []} />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><LifeBuoy className="text-primary" /> Recursos de Apoyo</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resources.map((res, i) => (
                  <li key={i}>
                    <Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
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
                <CardTitle className="flex items-center gap-2"><Users /> Gestión Institucional</CardTitle>
                <CardDescription>Panel para administradores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Solicitudes Globales</p>
                  <p className="text-2xl font-bold">{allAppointments?.length || 0}</p>
                </div>
                <Button variant="outline" className="w-full justify-start"><BarChart className="mr-2" /> Reporte Semanal</Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {isAdmin && allAppointments && allAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cola de Atención Institucional</CardTitle>
            <CardDescription>Todas las solicitudes de bienestar ordenadas por fecha.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentList appointments={allAppointments} isAdminView />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

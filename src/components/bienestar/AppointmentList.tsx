
'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Appointment {
  id: string;
  serviceType: 'orientation' | 'tutoring';
  status: 'requested' | 'scheduled' | 'completed' | 'canceled';
  requestedAt: string;
  scheduledAt?: string;
  reason: string;
}

export default function AppointmentList({ appointments, isAdminView = false }: { appointments: Appointment[], isAdminView?: boolean }) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-none"><AlertCircle className="h-3 w-3 mr-1" /> Solicitado</Badge>;
      case 'scheduled': return <Badge variant="default" className="bg-blue-100 text-blue-800 border-none"><Calendar className="h-3 w-3 mr-1" /> Programado</Badge>;
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800 border-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Completado</Badge>;
      case 'canceled': return <Badge variant="destructive" className="bg-red-100 text-red-800 border-none"><XCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground italic">
        <p>No hay registros para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servicio</TableHead>
            <TableHead>Fecha Solicitud</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className={isAdminView ? "" : "text-right"}>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <TableRow key={apt.id}>
              <TableCell className="font-medium">
                {apt.serviceType === 'orientation' ? 'Orientación Psicológica' : 'Tutoría Académica'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(apt.requestedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{getStatusBadge(apt.status)}</TableCell>
              <TableCell className={isAdminView ? "" : "text-right"}>
                <div className="text-xs text-muted-foreground line-clamp-1 italic max-w-[150px]">
                  {apt.reason}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}



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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    FileClock,
  UserCog,
  FileDown,
  FilePlus,
  BarChart,
  MessageSquare,
  History,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const userRequests = [
  {
    id: 'TR-123',
    type: 'Certificado de Notas',
    status: 'Completado',
    date: '2024-07-15',
  },
  {
    id: 'TR-124',
    type: 'Constancia de Matrícula',
    status: 'En Proceso',
    date: '2024-08-01',
  },
];

const allRequests = [
    ...userRequests,
    {
      id: 'TR-125',
      type: 'Retiro de Asignatura',
      status: 'Aprobado',
      date: '2024-07-20',
      user: 'Prof. Alan Turing'
    },
    {
        id: 'TR-126',
        type: 'Certificado de Notas',
        status: 'Enviado',
        date: '2024-08-05',
        user: 'Jane Doe'
    },
]

function getStatusVariant(status: string) {
    switch (status) {
      case 'Completado':
      case 'Aprobado':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

function UserProceduresView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><History /> Mis Trámites</CardTitle>
                <CardDescription>
                Realiza el seguimiento del estado de tus solicitudes.
                </CardDescription>
            </div>
            <Button><FilePlus className="mr-2"/> Iniciar Nuevo Trámite</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° de Trámite</TableHead>
              <TableHead>Tipo de Solicitud</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.id}</TableCell>
                <TableCell>{req.type}</TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusVariant(req.status)}>{req.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled={req.status !== 'Completado'}>
                        <FileDown className="mr-2"/> Descargar
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AdminProceduresView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><UserCog /> Gestión de Trámites</CardTitle>
                <CardDescription>
                    Visualiza, gestiona y actualiza el estado de todas las solicitudes.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline"><BarChart className="mr-2"/> Ver Estadísticas</Button>
                <Button><FilePlus className="mr-2"/> Crear Trámite Manual</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° de Trámite</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.id}</TableCell>
                <TableCell>{req.user || 'Estudiante Actual'}</TableCell>
                <TableCell>{req.type}</TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell>
                  <Select defaultValue={req.status}>
                    <SelectTrigger className="w-40 focus:ring-0 border-0 shadow-none focus:ring-offset-0" style={{backgroundColor: 'transparent'}}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Enviado">Enviado</SelectItem>
                        <SelectItem value="En Proceso">En Proceso</SelectItem>
                        <SelectItem value="Aprobado">Aprobado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <MessageSquare className="h-4 w-4"/>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default function ProceduresPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
      case 'professor':
        return <UserProceduresView />;
      case 'admin':
        return <AdminProceduresView />;
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p>Cargando información del usuario...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <FileClock className="text-primary" />
              Estado de Trámites
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'admin'
                ? 'Gestiona todas las solicitudes de la institución.'
                : 'Consulta el estado y el historial de tus solicitudes.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}


'use client';

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
  UserCog,
  BarChart,
  MessageSquare,
  Check,
  X,
  MoreHorizontal,
  Users,
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
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search as SearchIcon } from 'lucide-react';

const allRequests = [
    {
        id: 'TR-126',
        type: 'Certificado de Notas',
        status: 'Enviado',
        date: '2024-08-05',
        user: 'García, Ana'
    },
    {
      id: 'TR-127',
      type: 'Inscripción Excepcional',
      status: 'Enviado',
      date: '2024-08-04',
      user: 'Pérez, Juan'
    },
    {
      id: 'TR-125',
      type: 'Retiro de Asignatura',
      status: 'Aprobado',
      date: '2024-07-20',
      user: 'Martínez, Luis'
    },
]

export default function AdminProceduresView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="flex items-center gap-2"><UserCog /> Gestión de Trámites</CardTitle>
                <CardDescription>
                    Visualiza, gestiona y actualiza el estado de todas las solicitudes.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline"><BarChart className="mr-2"/> Ver Estadísticas</Button>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por solicitante o N° de trámite..." className="pl-9" />
            </div>
            <Select>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="enrollment">Inscripción Excepcional</SelectItem>
                    <SelectItem value="grades">Certificado de Notas</SelectItem>
                    <SelectItem value="drop">Retiro de Asignatura</SelectItem>
                </SelectContent>
            </Select>
             <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Enviado</SelectItem>
                    <SelectItem value="in-progress">En Proceso</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
            </Select>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem><MessageSquare className="mr-2"/> Ver Detalles / Comentar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={req.status !== 'Enviado'}><Check className="mr-2"/> Aprobar</DropdownMenuItem>
                        <DropdownMenuItem disabled={req.status !== 'Enviado'} className="text-destructive"><X className="mr-2"/> Rechazar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled><Users className="mr-2"/> Asignar a...</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Alert className="mt-6">
            <UserCog className="h-4 w-4" />
            <AlertTitle>En Desarrollo</AlertTitle>
            <AlertDescription>
                La lógica para aprobar, rechazar, reasignar, generar y firmar documentos, así como ver los detalles y estadísticas de cada solicitud, se implementará próximamente.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
    FileClock,
  UserCog,
  FileDown,
  FilePlus,
  BarChart,
  MessageSquare,
  History,
  Check,
  X,
  MoreHorizontal,
  GraduationCap,
  Upload,
  AlertTriangle,
  XCircle,
  Users,
  Search as SearchIcon,
  Clock,
  CircleDot,
  CheckCircle,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const userRequests = [
  {
    id: 'TR-123',
    type: 'Certificado de Notas',
    status: 'Completado',
    date: '2024-07-15',
    workflow: [
        { stage: 'Completado', actionBy: 'Oficina de Registros', timestamp: '2024-07-15 11:00', comment: 'Documento adjunto generado.', icon: CheckCircle, color: 'text-green-500' },
        { stage: 'Aprobado', actionBy: 'J. Smith', timestamp: '2024-07-15 09:30', comment: 'Aprobado para generación.', icon: Check, color: 'text-blue-500' },
        { stage: 'En Revisión', actionBy: 'J. Smith', timestamp: '2024-07-14 14:00', comment: 'Solicitud en revisión.', icon: SearchIcon, color: 'text-yellow-500' },
        { stage: 'Recibido', actionBy: 'Sistema', timestamp: '2024-07-14 10:00', comment: 'Solicitud enviada.', icon: CircleDot, color: 'text-gray-500' },
    ]
  },
  {
    id: 'TR-124',
    type: 'Constancia de Matrícula',
    status: 'En Proceso',
    date: '2024-08-01',
    workflow: [
        { stage: 'En Revisión', actionBy: 'M. Jones', timestamp: '2024-08-01 15:00', comment: null, icon: SearchIcon, color: 'text-yellow-500' },
        { stage: 'Recibido', actionBy: 'Sistema', timestamp: '2024-08-01 14:30', comment: 'Solicitud enviada.', icon: CircleDot, color: 'text-gray-500' },
    ]
  },
  {
    id: 'TR-125',
    type: 'Carta de Presentación',
    status: 'Enviado',
    date: '2024-08-05',
    workflow: [
         { stage: 'Recibido', actionBy: 'Sistema', timestamp: '2024-08-05 09:00', comment: 'Solicitud enviada.', icon: CircleDot, color: 'text-gray-500' },
    ]
  },
];

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

function getStatusVariant(status: string) {
    switch (status) {
      case 'Completado':
      case 'Aprobado':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
       case 'Enviado':
         return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

function UserProceduresView() {
  const [requestType, setRequestType] = useState('');

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
            <Dialog>
                <DialogTrigger asChild>
                    <Button><FilePlus className="mr-2"/> Iniciar Nuevo Trámite</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Iniciar Nuevo Trámite</DialogTitle>
                        <DialogDescription>
                            Selecciona el tipo de trámite y completa la información requerida.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="request-type">Tipo de Solicitud</Label>
                            <Select onValueChange={setRequestType}>
                                <SelectTrigger id="request-type">
                                    <SelectValue placeholder="Selecciona un tipo de trámite..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grade-certificate">Certificado de Notas</SelectItem>
                                    <SelectItem value="enrollment-proof">Constancia de Matrícula</SelectItem>
                                    <SelectItem value="graduate-certificate">Certificado de Egresado</SelectItem>
                                    <SelectItem value="custom-request">Otro tipo de solicitud</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {requestType === 'grade-certificate' && (
                             <div className="p-4 border rounded-md space-y-4">
                                <h4 className="font-semibold">Opciones para Certificado de Notas</h4>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Idioma</Label>
                                        <Select defaultValue="es">
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="es">Español</SelectItem>
                                                <SelectItem value="en">Inglés</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>N° de Copias</Label>
                                        <Input type="number" min="1" max="5" defaultValue="1" />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="request-reason">Motivo / Uso de la Solicitud</Label>
                            <Textarea id="request-reason" placeholder="Ej: Para postulación a beca en el extranjero." />
                        </div>

                         <div className="space-y-2">
                            <Label>Documentos de Respaldo (Opcional)</Label>
                            <Button variant="outline" asChild className="w-full">
                                <label className="cursor-pointer flex items-center gap-2">
                                    <Upload className="h-4 w-4"/>
                                    <span>Adjuntar archivos (PDF, JPG, PNG)</span>
                                    <input type="file" multiple className="sr-only" />
                                </label>
                            </Button>
                            <p className="text-xs text-muted-foreground">Puedes adjuntar hasta 5 archivos (máx 20MB total).</p>
                        </div>
                        
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Próximos Pasos</AlertTitle>
                            <AlertDescription>
                                La lógica para enviar la solicitud, realizar validaciones de pago y generar el documento se implementará próximamente.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button disabled><FilePlus className="mr-2"/> Enviar Solicitud</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRequests.map((req) => (
                <Dialog key={req.id}>
                    <DialogTrigger asChild>
                        <TableRow className="cursor-pointer">
                            <TableCell className="font-medium">{req.id}</TableCell>
                            <TableCell>{req.type}</TableCell>
                            <TableCell>{req.date}</TableCell>
                            <TableCell>
                            <Badge className={getStatusVariant(req.status)}>{req.status}</Badge>
                            </TableCell>
                        </TableRow>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Detalle del Trámite: {req.id}</DialogTitle>
                            <DialogDescription>{req.type}</DialogDescription>
                        </DialogHeader>
                        <div className="grid md:grid-cols-2 gap-8 py-4">
                            <div>
                                <h4 className="font-semibold mb-4">Información de la Solicitud</h4>
                                <div className="space-y-3 text-sm">
                                    <p><span className="font-medium text-muted-foreground">Fecha:</span> {req.date}</p>
                                    <p><span className="font-medium text-muted-foreground">Estado:</span> <Badge className={getStatusVariant(req.status)}>{req.status}</Badge></p>
                                    <p><span className="font-medium text-muted-foreground">Tiempo Estimado:</span> {req.status === 'Completado' ? '-' : '2-3 días hábiles'}</p>
                                </div>
                                <div className="mt-6 space-y-4">
                                     <Button variant="outline" className="w-full" disabled={req.status !== 'Completado'}>
                                        <FileDown className="mr-2 h-4 w-4"/> Descargar Documento
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" className="w-full" disabled={req.status !== 'En Proceso' && req.status !== 'Enviado'}>
                                                <XCircle className="mr-2 h-4 w-4"/> Cancelar Solicitud
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Confirmar Cancelación</DialogTitle>
                                                <DialogDescription>
                                                    ¿Estás seguro de que deseas cancelar la solicitud para "{req.type}"?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label htmlFor="cancel-reason">Motivo (opcional)</Label>
                                                <Textarea id="cancel-reason" placeholder="Describe por qué estás cancelando..."/>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">No, mantener</Button>
                                                </DialogClose>
                                                <Button variant="destructive" disabled>Sí, Cancelar</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Historial de la Solicitud</h4>
                                <ul className="space-y-6">
                                    {req.workflow.map((item, index) => (
                                        <li key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-accent ${item.color}`}>
                                                    <item.icon className="h-5 w-5 text-white bg-inherit"/>
                                                </div>
                                                {index < req.workflow.length - 1 && <div className="w-px h-full bg-border"></div>}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{item.stage}</p>
                                                <p className="text-xs text-muted-foreground">{item.timestamp} por {item.actionBy}</p>
                                                {item.comment && <p className="text-sm mt-1 p-2 bg-accent/50 rounded-md">{item.comment}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
            <Input placeholder="Buscar por solicitante o N° de trámite..." className="flex-grow" />
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


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
  Briefcase,
  Search,
  Bookmark,
  FileText,
  Building,
  BarChart,
  UserCog,
  PlusCircle,
  MoreHorizontal,
  Trash2,
  Edit,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const jobOffers = [
  {
    id: '1',
    title: 'Desarrollador Frontend React',
    company: 'Tech Solutions Inc.',
    location: 'Remoto',
    type: 'Full-time',
    postedAt: '2024-08-01',
    applicants: 12,
  },
  {
    id: '2',
    title: 'Prácticas de Marketing Digital',
    company: 'Creative Minds Agency',
    location: 'Lima, Perú',
    type: 'Internship',
    postedAt: '2024-08-05',
    applicants: 25,
  },
  {
    id: '3',
    title: 'Analista de Datos Junior',
    company: 'DataCorp',
    location: 'Arequipa, Perú',
    type: 'Part-time',
    postedAt: '2024-07-28',
    applicants: 8,
  },
];

function JobBoardView() {
    const { profile } = useUser();
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Buscar Ofertas</CardTitle>
          <div className="flex gap-2 pt-2">
            <Input placeholder="Puesto, empresa o palabra clave" className="flex-grow" />
            <Button>
              <Search className="mr-2" /> Buscar
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobOffers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <CardTitle>{offer.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-1">
                <Building className="h-4 w-4" /> {offer.company}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="secondary">{offer.location}</Badge>
                <Badge variant="outline">{offer.type}</Badge>
              </div>
              <div className="flex gap-2">
                {profile?.role === 'student' && <Button className="w-full"><FileText className="mr-2"/> Postular</Button>}
                <Button variant="outline" className="w-full"><Bookmark className="mr-2"/> Guardar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminJobBoardView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog /> Gestión de Bolsa de Trabajo
            </CardTitle>
            <CardDescription>
              Administra las ofertas laborales, convenios empresariales y revisa estadísticas de empleabilidad.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
              <Button><PlusCircle className="mr-2" /> Publicar Nueva Oferta</Button>
              <Button variant="outline"><Building className="mr-2" /> Gestionar Convenios</Button>
              <Button variant="outline"><BarChart className="mr-2" /> Ver Estadísticas</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título de la Oferta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha de Publicación</TableHead>
                <TableHead className="text-center">Postulantes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobOffers.map(offer => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>{offer.company}</TableCell>
                  <TableCell>{offer.postedAt}</TableCell>
                  <TableCell className="text-center">{offer.applicants}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem><Edit className="mr-2"/> Editar</DropdownMenuItem>
                        <DropdownMenuItem><Search className="mr-2"/> Ver Postulantes</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/> Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}

function ProfessorJobBoardView() {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Ofertas Laborales y Prácticas</h2>
            <p className="text-muted-foreground">Explora las oportunidades disponibles para los estudiantes.</p>
            <JobBoardView />
        </div>
    )
}

function StudentJobBoardView() {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           <JobBoardView />
        </div>
        <aside className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Mi Perfil de Candidato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full"><FileText className="mr-2"/> Subir/Actualizar CV</Button>
                    <Button variant="secondary" className="w-full"><Bookmark className="mr-2"/> Ver Mis Postulaciones</Button>
                </CardContent>
            </Card>
        </aside>
      </div>
    );
  }

export default function JobBoardPage() {
  const { profile } = useUser();

  const renderContent = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentJobBoardView />;
      case 'professor':
        return <ProfessorJobBoardView />;
      case 'admin':
        return <AdminJobBoardView />;
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
              <Briefcase className="text-primary" />
              Bolsa de Trabajo y Prácticas
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === 'student'
                ? 'Encuentra tu próxima oportunidad profesional.'
                : 'Explora y gestiona las ofertas laborales para la comunidad.'}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}

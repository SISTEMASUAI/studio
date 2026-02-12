'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
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
  Sparkles,
  Loader2,
  Info,
  ChevronRight,
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
import { collection, query, orderBy, DocumentData } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { matchJobs } from '@/ai/flows/match-jobs-flow';
import Link from 'next/link';

interface JobOffer extends DocumentData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  postedAt: string;
}

interface MatchResult {
  jobId: string;
  matchScore: number;
  reason: string;
}

function JobCard({ offer, match }: { offer: JobOffer; match?: MatchResult }) {
  const { profile } = useUser();
  
  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md border-primary/10 ${match ? 'bg-primary/5' : ''}`}>
      {match && (
        <div className="absolute top-0 right-0 p-2">
          <Badge className="bg-primary text-white border-none shadow-sm">
            <Sparkles className="h-3 w-3 mr-1" /> {match.matchScore}% Match
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl leading-tight line-clamp-2 pr-12">{offer.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1 font-medium text-foreground/80">
          <Building className="h-4 w-4" /> {offer.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-background border">{offer.location}</Badge>
          <Badge variant="outline" className="bg-background">{offer.type}</Badge>
        </div>
        
        {match && (
          <div className="bg-background/80 p-3 rounded-lg border border-primary/20 flex gap-2 items-start">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{match.reason}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {profile?.role === 'student' && (
            <Button className="flex-1 shadow-sm"><FileText className="mr-2 h-4 w-4"/> Postular</Button>
          )}
          <Button variant="outline" size="icon" className="shrink-0"><Bookmark className="h-4 w-4"/></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function JobBoardView() {
  const { profile } = useUser();
  const firestore = useFirestore();
  const [matchingResults, setMatchingResults] = useState<MatchResult[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const jobsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'job_offers'), orderBy('postedAt', 'desc')) : null),
    [firestore]
  );
  const { data: jobs, isLoading: isJobsLoading } = useCollection<JobOffer>(jobsQuery);

  const userHasCV = !!(profile?.skills?.length || profile?.experience);

  useEffect(() => {
    if (jobs && jobs.length > 0 && userHasCV && profile) {
      const runMatching = async () => {
        setIsMatching(true);
        try {
          const result = await matchJobs({
            userProfile: {
              professionalTitle: profile.professionalTitle,
              summary: profile.summary,
              skills: profile.skills,
              experience: profile.experience,
            },
            jobOffers: jobs.map(j => ({
              id: j.id,
              title: j.title,
              company: j.company,
              description: j.description,
              type: j.type,
            })),
          });
          setMatchingResults(result.matches);
        } catch (error) {
          console.error('Matching failed:', error);
        } finally {
          setIsMatching(false);
        }
      };
      runMatching();
    }
  }, [jobs, profile, userHasCV]);

  if (isJobsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const suggestedJobs = matchingResults
    .filter(m => m.matchScore > 60)
    .map(m => ({
      job: jobs?.find(j => j.id === m.jobId),
      match: m
    }))
    .filter(item => item.job !== undefined);

  return (
    <div className="space-y-10">
      {/* Sección de Recomendaciones IA */}
      {userHasCV && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              Sugerencias para ti
            </h2>
            <Link href="/curriculum" className="text-xs text-primary hover:underline font-medium">Actualizar mi CV</Link>
          </div>
          
          {isMatching ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-accent/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium animate-pulse text-muted-foreground">La IA está analizando las mejores ofertas para tu perfil...</p>
            </div>
          ) : suggestedJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestedJobs.map((item) => (
                <JobCard key={item.job!.id} offer={item.job as JobOffer} match={item.match} />
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sin sugerencias destacadas</AlertTitle>
              <AlertDescription>No hemos encontrado ofertas que coincidan significativamente con tu perfil actual. Sigue explorando la lista general.</AlertDescription>
            </Alert>
          )}
        </section>
      )}

      {/* Buscador General */}
      <section className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Explorar todas las ofertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Puesto, empresa o palabra clave..." className="pl-9 h-11" />
              </div>
              <Button size="lg" className="px-8 shadow-sm">Buscar</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs?.map((offer) => (
            <JobCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminJobBoardView() {
  const firestore = useFirestore();
  const jobsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'job_offers'), orderBy('postedAt', 'desc')) : null),
    [firestore]
  );
  const { data: jobs } = useCollection<JobOffer>(jobsQuery);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="text-primary" /> Gestión de Bolsa de Trabajo
              </CardTitle>
              <CardDescription>
                Administra las ofertas laborales y convenios empresariales.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button className="shadow-sm"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Oferta</Button>
                <Button variant="outline"><BarChart className="mr-2 h-4 w-4" /> Estadísticas</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs?.map(offer => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="font-bold">{offer.title}</div>
                      <div className="text-xs text-muted-foreground">{offer.type}</div>
                    </TableCell>
                    <TableCell>{offer.company}</TableCell>
                    <TableCell className="text-xs">{new Date(offer.postedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/> Editar</DropdownMenuItem>
                          <DropdownMenuItem><Search className="mr-2 h-4 w-4"/> Ver Postulantes</DropdownMenuItem>
                          <DropdownMenuSeparator/>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobBoardPage() {
  const { profile, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Briefcase className="text-primary h-6 w-6" />
          </div>
          Bolsa de Trabajo y Prácticas
        </h1>
        <p className="text-muted-foreground text-lg">
          {profile?.role === 'student'
            ? 'Tu próximo paso profesional comienza aquí.'
            : 'Gestiona las oportunidades de carrera para la comunidad.'}
        </p>
      </header>

      {profile?.role === 'admin' ? (
        <AdminJobBoardView />
      ) : profile?.role === 'student' ? (
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <JobBoardView />
          </div>
          <aside className="space-y-6">
            <Card className="border-primary/10 shadow-sm">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  Perfil de Candidato
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Acceso Rápido</p>
                  <Button asChild className="w-full justify-start h-11 shadow-sm" variant="default">
                    <Link href="/curriculum"><FileText className="mr-2 h-4 w-4"/> Gestionar CV</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-11" disabled>
                    <Bookmark className="mr-2 h-4 w-4"/> Mis Guardados
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="bg-accent/50 p-4 rounded-xl space-y-2">
                    <p className="text-xs font-bold flex items-center gap-1.5 text-primary">
                      <Sparkles className="h-3 w-3" /> CONSEJO IA
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Tu perfil está completo al 85%. Añade tus habilidades técnicas para mejorar tus coincidencias automáticas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : (
        <JobBoardView />
      )}
    </div>
  );
}

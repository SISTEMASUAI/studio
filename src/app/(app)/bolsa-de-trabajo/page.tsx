'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  MapPin,
  Clock,
  ExternalLink,
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
import { useState, useEffect } from 'react';
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
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-primary/5 ${match ? 'border-primary/20 bg-gradient-to-br from-primary/[0.02] to-background' : ''}`}>
      {match && (
        <div className="absolute top-0 right-0 p-2">
          <Badge className="bg-primary text-white border-none shadow-md animate-in fade-in zoom-in duration-500">
            <Sparkles className="h-3 w-3 mr-1" /> {match.matchScore}% Match
          </Badge>
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-headline font-bold leading-tight line-clamp-2 pr-10 group-hover:text-primary transition-colors">
          {offer.title}
        </CardTitle>
        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <Building className="h-4 w-4 text-muted-foreground" /> 
            {offer.company}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {offer.location}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {offer.type}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4">
        {match ? (
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
              <span className="text-primary font-bold">Análisis IA:</span> {match.reason}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            {offer.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        {profile?.role === 'student' ? (
          <Button className="flex-1 shadow-sm font-bold h-9">Postular</Button>
        ) : (
          <Button variant="outline" className="flex-1 h-9">Ver Detalles</Button>
        )}
        <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-lg hover:text-primary hover:border-primary/30">
          <Bookmark className="h-4 w-4" />
        </Button>
      </CardFooter>
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
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Cargando oportunidades...</p>
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
    <div className="space-y-12">
      {/* Sección de Recomendaciones IA */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold font-headline">Sugerencias para ti</h2>
          </div>
          <Link href="/curriculum" className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
            Actualizar mi CV <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        
        {!userHasCV ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">IA desactivada</p>
                <p className="text-sm text-muted-foreground">Sube tu currículum para que la IA pueda encontrarte el trabajo ideal.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/curriculum">Subir mi CV ahora</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isMatching ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-primary/[0.02] border-primary/10">
            <div className="relative mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-foreground/80">Analizando compatibilidad...</p>
            <p className="text-[11px] text-muted-foreground mt-1">Comparando tus habilidades con las ofertas disponibles</p>
          </div>
        ) : suggestedJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestedJobs.map((item) => (
              <JobCard key={item.job!.id} offer={item.job as JobOffer} match={item.match} />
            ))}
          </div>
        ) : (
          <Alert className="bg-muted/50 border-none shadow-none py-6">
            <Info className="h-5 w-5 text-muted-foreground" />
            <AlertTitle className="font-bold">Aún no hay coincidencias perfectas</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              No hemos encontrado ofertas que encajen al 100% con tu perfil actual. Intenta añadir más habilidades técnicas en tu sección de currículum.
            </AlertDescription>
          </Alert>
        )}
      </section>

      {/* Buscador General */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-grow space-y-2">
            <h3 className="text-lg font-bold font-headline flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Explorar todas las ofertas
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Puesto, empresa o palabra clave..." className="pl-10 h-12 shadow-sm rounded-xl border-muted-foreground/20" />
            </div>
          </div>
          <Button size="lg" className="px-10 h-12 rounded-xl shadow-lg font-bold">Buscar</Button>
        </div>
        
        {jobs && jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((offer) => (
              <JobCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 border-2 border-dashed rounded-3xl opacity-40">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-8 w-8" />
            </div>
            <p className="font-medium">No hay ofertas publicadas en este momento.</p>
          </div>
        )}
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
      <Card className="border-none shadow-md">
        <CardHeader className="bg-primary/5 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary">
                <UserCog className="h-6 w-6" /> Gestión de Bolsa de Trabajo
              </CardTitle>
              <CardDescription>
                Panel administrativo para moderar ofertas y convenios.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button className="shadow-md font-bold"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Oferta</Button>
                <Button variant="outline" className="bg-background"><BarChart className="mr-2 h-4 w-4" /> Stats</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{offer.type}</div>
                    </TableCell>
                    <TableCell className="font-medium">{offer.company}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(offer.postedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/> Editar Oferta</DropdownMenuItem>
                          <DropdownMenuItem><Search className="mr-2 h-4 w-4"/> Ver Postulantes</DropdownMenuItem>
                          <DropdownMenuSeparator/>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
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
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-primary shadow-lg shadow-primary/20 p-3 rounded-2xl">
            <Briefcase className="text-white h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold font-headline tracking-tight">
            Bolsa de Trabajo y Prácticas
          </h1>
        </div>
        <p className="text-muted-foreground text-lg font-medium pl-1">
          {profile?.role === 'student'
            ? 'Tu próximo paso profesional comienza aquí.'
            : 'Gestiona las oportunidades de carrera para la comunidad.'}
        </p>
      </header>

      {profile?.role === 'admin' ? (
        <AdminJobBoardView />
      ) : (
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <JobBoardView />
          </div>
          <aside className="space-y-8">
            <Card className="border-none shadow-xl bg-card">
              <CardHeader className="bg-primary/[0.03] pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 font-headline">
                  <UserCog className="h-5 w-5 text-primary" />
                  Perfil de Candidato
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Acceso Rápido</p>
                  <Button asChild className="w-full justify-start h-12 shadow-sm font-bold text-sm" variant="default">
                    <Link href="/curriculum"><FileText className="mr-3 h-5 w-5"/> Gestionar mi CV</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 font-bold text-sm border-muted-foreground/20" disabled>
                    <Bookmark className="mr-3 h-5 w-5"/> Mis Guardados
                  </Button>
                </div>
                
                <div className="pt-6 border-t">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 rounded-2xl space-y-3 border border-amber-100 dark:border-amber-900/30">
                    <p className="text-xs font-black flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Sparkles className="h-4 w-4" /> CONSEJO IA
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-900/80 dark:text-amber-200/80 font-medium">
                      {profile?.skills?.length ? 
                        `¡Buen trabajo! Tienes ${profile.skills.length} habilidades registradas. Cuantas más detalles, mejores serán tus coincidencias.` :
                        "Tu perfil está incompleto. Sube tu CV para activar las recomendaciones personalizadas basadas en tus habilidades."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}

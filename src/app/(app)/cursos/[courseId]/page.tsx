'use client';

import { useDoc, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, BookOpen, CheckCircle, XCircle, FileText, Info, BookMarked, ListChecks, Mail } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define the type for the course data we expect from Firestore
interface CourseDetails {
  id: string;
  name: string;
  description: string;
  instructorId: string;
  objectives?: string[];
  methodology?: string;
  syllabusUrl?: string;
  level?: string;
  department?: string;
  prerequisites?: string[];
}

// Define the type for the instructor's profile data
interface InstructorProfile {
    firstName: string;
    lastName: string;
    profilePicture: string;
    email: string;
}

function CourseHeader({ course, instructor }: { course: CourseDetails, instructor: InstructorProfile | null }) {
    const image = PlaceHolderImages.find(p => p.id === course.id);
    
    return (
        <Card className="overflow-hidden">
            <div className="relative w-full h-48">
                {image ? (
                    <Image
                    src={image.imageUrl}
                    alt={course.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                    />
                ) : (
                    <div className="w-full h-full bg-secondary"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h1 className="text-3xl font-bold font-headline text-white">{course.name}</h1>
                </div>
            </div>
             <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {instructor ? (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={instructor.profilePicture} />
                            <AvatarFallback>{instructor.firstName?.[0]}{instructor.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">{instructor.firstName} {instructor.lastName}</p>
                            <p className="text-sm text-muted-foreground">Instructor</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Button size="sm" variant="outline" asChild>
                                    <a href={`mailto:${instructor.email}`}>
                                        <Mail className="mr-2 h-4 w-4" /> Contactar
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : <Loader2 className="w-5 h-5 animate-spin" />}
                <div className="flex items-center gap-2">
                    {course.department && <Badge variant="secondary">{course.department}</Badge>}
                    {course.level && <Badge variant="outline">{course.level}</Badge>}
                </div>
             </CardContent>
        </Card>
    )
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const firestore = useFirestore();

  // Memoize the document reference for the course
  const courseDocRef = useMemoFirebase(() => {
    if (!firestore || !courseId) return null;
    return doc(firestore, 'courses', courseId);
  }, [firestore, courseId]);

  const { data: course, isLoading: isCourseLoading, error: courseError } = useDoc<CourseDetails>(courseDocRef);

  // Memoize the document reference for the instructor
  const instructorDocRef = useMemoFirebase(() => {
    if (!firestore || !course?.instructorId) return null;
    return doc(firestore, 'users', course.instructorId);
  }, [firestore, course]);
  
  const { data: instructor, isLoading: isInstructorLoading } = useDoc<InstructorProfile>(instructorDocRef);

  if (isCourseLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error al Cargar el Curso</AlertTitle>
        <AlertDescription>
          No se pudo encontrar el curso solicitado o no tienes permiso para verlo.
        </AlertDescription>
      </Alert>
    );
  }

  // Placeholder for approved prerequisites
  const approvedPrerequisites = ['CS101'];

  return (
    <div className="space-y-8">
        <CourseHeader course={course} instructor={instructor} />

        <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description"><Info className="mr-2"/>Descripción</TabsTrigger>
                <TabsTrigger value="content"><BookMarked className="mr-2"/>Contenido</TabsTrigger>
                <TabsTrigger value="prerequisites"><ListChecks className="mr-2"/>Prerrequisitos</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Descripción del Curso</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{course.description}</p>
                        <h3 className="font-semibold">Metodología</h3>
                        <p className="text-muted-foreground">{course.methodology || 'No especificada.'}</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="content" className="mt-6">
                 <Card>
                    <CardHeader><CardTitle>Contenido y Objetivos</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Objetivos de Aprendizaje</h3>
                            {course.objectives && course.objectives.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {course.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No se han especificado objetivos.</p>
                            )}
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Syllabus del Curso</h3>
                            {course.syllabusUrl ? (
                                <Button asChild>
                                    <Link href={course.syllabusUrl} target="_blank"><FileText className="mr-2"/> Descargar Syllabus (PDF)</Link>
                                </Button>
                            ): (
                                <p className="text-sm text-muted-foreground">El syllabus no está disponible actualmente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="prerequisites" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Prerrequisitos</CardTitle></CardHeader>
                    <CardContent>
                        {course.prerequisites && course.prerequisites.length > 0 ? (
                             <ul className="space-y-2">
                                {course.prerequisites.map(prereq => (
                                    <li key={prereq} className="flex items-center gap-2 text-muted-foreground">
                                        {approvedPrerequisites.includes(prereq) ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>}
                                        <span>{prereq}</span>
                                        {approvedPrerequisites.includes(prereq) ? <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobado</Badge> : null}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Este curso no tiene prerrequisitos.</p>
                        )}
                         <Alert className="mt-6">
                            <BookOpen className="h-4 w-4" />
                            <AlertTitle>Visualización en Desarrollo</AlertTitle>
                            <AlertDescription>
                                Próximamente, se mostrará el nombre completo de los cursos y tu estado académico real.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

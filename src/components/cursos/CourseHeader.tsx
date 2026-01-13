'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Edit, Megaphone } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface ScheduleItem {
    day: string;
    startTime: string;
    endTime: string;
    classroom: string;
}

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
  schedule?: ScheduleItem[];
  mode?: 'Presencial' | 'Online' | 'Híbrido';
  virtualRoomUrl?: string;
}

// Define the type for the instructor's profile data
interface InstructorProfile {
    firstName: string;
    lastName: string;
    profilePicture: string;
    email: string;
}

export default function CourseHeader({ course, instructor }: { course: CourseDetails, instructor: InstructorProfile | null }) {
    const { profile } = useUser();
    const isInstructor = profile?.uid === course.instructorId;

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
                 {isInstructor && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                 <Button variant="secondary" size="sm"><Edit className="mr-2"/> Editar</Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Editar Información del Curso</DialogTitle>
                                    <DialogDescription>
                                        Realiza cambios en la descripción, objetivos y otros detalles del curso.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                     <div className="space-y-2">
                                        <Label>Descripción</Label>
                                        <Textarea defaultValue={course.description} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Metodología</Label>
                                        <Textarea defaultValue={course.methodology} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline">Cancelar</Button>
                                    <Button disabled>Guardar Cambios</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="secondary" size="sm" disabled><Megaphone className="mr-2"/> Publicar Anuncio</Button>
                    </div>
                )}
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

    
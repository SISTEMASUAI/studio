
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { collection, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  category: string;
  location: string;
  imageUrl?: string;
}

export default function ActivityCard({ event }: { event: Event }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const enrollmentQuery = useMemoFirebase(
    () => (firestore && user ? query(
      collection(firestore, 'activity_enrollments'), 
      where('eventId', '==', event.id),
      where('userId', '==', user.uid)
    ) : null),
    [firestore, user, event.id]
  );
  
  const { data: enrollments } = useCollection(enrollmentQuery);
  const isEnrolled = enrollments && enrollments.length > 0;

  const handleEnroll = async () => {
    if (!firestore || !user) return;
    setIsProcessing(true);
    try {
      if (isEnrolled) {
        const enrollmentDoc = doc(firestore, 'activity_enrollments', enrollments[0].id);
        deleteDocumentNonBlocking(enrollmentDoc);
        toast({ title: "Inscripción cancelada", description: "Ya no participarás en esta actividad." });
      } else {
        const enrollmentsRef = collection(firestore, 'activity_enrollments');
        addDocumentNonBlocking(enrollmentsRef, {
          userId: user.uid,
          eventId: event.id,
          enrolledAt: new Date().toISOString(),
        });
        toast({ title: "¡Inscripción exitosa!", description: `Te has unido a ${event.name}.` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo procesar la solicitud." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-44 w-full">
        <Image
          src={event.imageUrl || `https://picsum.photos/seed/${event.id}/400/200`}
          alt={event.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-primary hover:bg-white">{event.category}</Badge>
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl line-clamp-1">{event.name}</CardTitle>
        <CardDescription className="flex flex-col gap-1.5 mt-2">
          <span className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <span className="flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {event.location}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isEnrolled ? "outline" : "default"}
          onClick={handleEnroll}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEnrolled ? (
            <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Inscrito</>
          ) : (
            "Inscribirme ahora"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

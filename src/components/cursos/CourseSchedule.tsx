'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, AlertTriangle, Calendar, Download } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
}

interface CourseScheduleProps {
  schedule?: ScheduleItem[];
  mode?: 'Presencial' | 'Online' | 'Híbrido';
  virtualRoomUrl?: string;
}

export default function CourseSchedule({ schedule, mode, virtualRoomUrl }: CourseScheduleProps) {
  const hasSchedule = schedule && schedule.length > 0;
  // Placeholder for conflict detection
  const hasConflict = false; 

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horario de Clases
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Días y horas de cursada.</span>
           <Button variant="outline" size="sm" disabled>
             <Download className="mr-2 h-4 w-4" /> Exportar
           </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSchedule ? (
          <div className="space-y-3">
            {schedule.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <div>
                  <p className="font-semibold">{item.day}</p>
                  <p className="text-sm text-muted-foreground">{`${item.startTime} - ${item.endTime}`}</p>
                </div>
                <Badge variant="secondary">{item.classroom}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">El horario para este curso no ha sido definido.</p>
        )}

        {mode === 'Online' || mode === 'Híbrido' ? (
          <Button asChild className="w-full">
            <Link href={virtualRoomUrl || '#'} target="_blank" rel="noopener noreferrer">
              <Video className="mr-2" /> Acceder a la Sala Virtual
            </Link>
          </Button>
        ) : null}

        {hasConflict && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Conflicto de Horario Detectado</AlertTitle>
            <AlertDescription>
              Este curso tiene un conflicto con otra asignatura inscrita.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

    
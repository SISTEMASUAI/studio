
'use client';

import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { File, Tv, BookOpen, Download, FileText, Table, FileArchive, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { CourseMaterial } from '@/types/course';

interface CourseMaterialsProps {
  courseId: string;
}

function FileIcon({ type, url }: { type: string; url: string }) {
  const lowercaseUrl = url.toLowerCase();
  
  if (type === 'video' || lowercaseUrl.endsWith('.mp4') || lowercaseUrl.endsWith('.mov')) {
    return <Tv className="h-5 w-5 text-blue-500" />;
  }
  
  if (lowercaseUrl.endsWith('.pdf')) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  
  if (lowercaseUrl.endsWith('.xls') || lowercaseUrl.endsWith('.xlsx') || lowercaseUrl.endsWith('.csv')) {
    return <Table className="h-5 w-5 text-green-600" />;
  }
  
  if (lowercaseUrl.endsWith('.zip') || lowercaseUrl.endsWith('.rar') || lowercaseUrl.endsWith('.7z')) {
    return <FileArchive className="h-5 w-5 text-yellow-600" />;
  }

  if (type === 'link') {
    return <Globe className="h-5 w-5 text-sky-500" />;
  }

  return <File className="h-5 w-5 text-muted-foreground" />;
}

export default function CourseMaterials({ courseId }: CourseMaterialsProps) {
  const firestore = useFirestore();

  const materialsQuery = useMemoFirebase(() => {
    if (!firestore || !courseId) return null;
    return collection(firestore, 'courses', courseId, 'materials');
  }, [firestore, courseId]);

  const { data: materials, isLoading, error } = useCollection<CourseMaterial>(materialsQuery);

  if (!courseId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Materiales del Curso
        </CardTitle>
        <CardDescription>Presentaciones, lecturas, videos y recursos adicionales de la base de datos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive text-sm bg-destructive/10 rounded-md">
            Error al cargar los materiales. Por favor, intente más tarde.
          </div>
        ) : materials && materials.length > 0 ? (
          <div className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors border"
              >
                <div className="flex items-center gap-3">
                  <FileIcon type={material.type} url={material.url} />
                  <div>
                    <p className="text-sm font-medium">{material.title}</p>
                    {material.description && (
                      <p className="text-xs text-muted-foreground">{material.description}</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={material.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Aún no se han subido materiales para este curso.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Folder, File, Tv, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Datos mock temporales
const courseMaterials = [
  {
    type: 'folder',
    name: 'Presentaciones',
    items: [
      { type: 'file', name: 'Semana 1 - Introducción.pptx', size: '5.2 MB' },
      { type: 'file', name: 'Semana 2 - Conceptos básicos.pptx', size: '7.8 MB' },
    ],
  },
  {
    type: 'folder',
    name: 'Lecturas obligatorias',
    items: [
      { type: 'file', name: 'Artículo principal.pdf', size: '2.1 MB' },
      { type: 'file', name: 'Complementaria 1.pdf', size: '1.4 MB' },
    ],
  },
  {
    type: 'folder',
    name: 'Videos y grabaciones',
    items: [{ type: 'video', name: 'Clase 03 - Grabada.mp4', size: '180 MB' }],
  },
];

function FileIcon({ name }: { name: string }) {
  if (name.includes('.pdf')) return <File className="h-5 w-5 text-red-500" />;
  if (name.includes('.ppt') || name.includes('.pptx')) return <File className="h-5 w-5 text-orange-500" />;
  if (name.includes('.mp4')) return <Tv className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export default function CourseMaterials() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Materiales del Curso
        </CardTitle>
        <CardDescription>Presentaciones, lecturas, videos y recursos adicionales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {courseMaterials.map((folder, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              {folder.name}
            </h3>
            <div className="space-y-2 pl-6">
              {folder.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon name={item.name} />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

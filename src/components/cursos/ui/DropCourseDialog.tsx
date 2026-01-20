'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DropCourseDialogProps {
  courseName: string;
  courseId: string;
}

export default function DropCourseDialog({ courseName, courseId }: DropCourseDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Dar de baja el curso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar baja del curso
          </DialogTitle>
          <DialogDescription>
            Estás a punto de darte de baja de <strong>{courseName}</strong>. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Consecuencias importantes</AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              <li>Perderás acceso inmediato a materiales y calificaciones</li>
              <li>No se generará reembolso automático (si aplica)</li>
              <li>Puede afectar tu carga académica y avance curricular</li>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de la baja (requerido)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Razones académicas</SelectItem>
                  <SelectItem value="personal">Razones personales</SelectItem>
                  <SelectItem value="health">Problemas de salud</SelectItem>
                  <SelectItem value="work">Carga laboral incompatible</SelectItem>
                  <SelectItem value="other">Otro motivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comentarios adicionales (opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Explica con más detalle si lo deseas..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">
            Confirmar baja del curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

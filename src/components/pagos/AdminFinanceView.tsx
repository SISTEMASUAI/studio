'use client';

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
    UserCog,
    Percent,
    Banknote,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const allStudentsFinancials = [
    { student: 'Juan Pérez', balance: -250.00, pending: 2 },
    { student: 'Ana García', balance: 0.00, pending: 0 },
    { student: 'Luis Martínez', balance: -1200.00, pending: 4 },
];

export default function AdminFinanceView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><UserCog /> Gestión Financiera</CardTitle>
            <CardDescription>
                Administra los pagos, becas y estados de cuenta de los estudiantes.
            </CardDescription>
          </div>
           <div className="flex gap-2">
                <Button variant="outline" disabled><Percent className="mr-2"/> Aplicar Descuentos</Button>
                <Button disabled><Banknote className="mr-2"/> Registrar Pago</Button>
           </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Pagos Pendientes</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allStudentsFinancials.map(s => (
                    <TableRow key={s.student}>
                        <TableCell className="font-medium">{s.student}</TableCell>
                        <TableCell className={s.balance < 0 ? 'text-destructive' : ''}>${s.balance.toFixed(2)}</TableCell>
                        <TableCell>{s.pending}</TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" disabled>Ver Detalles</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
         <Alert className="mt-6">
            <UserCog className="h-4 w-4" />
            <AlertTitle>En Desarrollo</AlertTitle>
            <AlertDescription>
                La lógica para ver el detalle de cada estudiante, registrar pagos, generar estados de cuenta, modificar montos y aplicar becas se implementará próximamente.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

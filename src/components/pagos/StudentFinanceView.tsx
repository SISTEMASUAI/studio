'use client';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import {
    CreditCard,
    History,
    ShieldCheck,
    DollarSign,
    FileDown,
    Banknote,
    Scale,
    AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const studentFinancials = {
    balance: -250.00, // Negative means debt
    pendingPayments: [
        { id: 'P001', concept: 'Matrícula Semestre 2024-2', amount: 150.00, dueDate: '2024-08-30' },
        { id: 'P002', concept: 'Cuota Laboratorio de Química', amount: 100.00, dueDate: '2024-09-15' },
    ],
    paymentHistory: [
        { id: 'H001', concept: 'Cuota 1 - Semestre 2024-1', amount: 500.00, date: '2024-03-15', status: 'Completado' },
        { id: 'H002', concept: 'Materiales Curso Arte', amount: 75.00, date: '2024-04-02', status: 'Completado' },
    ],
    scholarships: {
        active: true,
        name: 'Beca al Mérito Académico',
        coverage: '50% de la matrícula',
    }
};

function getStatusVariant(status: string) {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
}

export default function StudentFinanceView() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Pagos Pendientes</CardTitle>
                    <CardDescription>Pagos que requieren tu atención.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentFinancials.pendingPayments.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.concept}</TableCell>
                                    <TableCell>{p.dueDate}</TableCell>
                                    <TableCell className="text-right font-medium">${p.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm"><Banknote className="mr-2"/> Pagar</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Realizar Pago</DialogTitle>
                                                    <DialogDescription>
                                                        Estás a punto de pagar por el concepto: "{p.concept}".
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4 space-y-6">
                                                    <div className="flex justify-between items-center bg-accent/50 p-3 rounded-md">
                                                        <span className="text-muted-foreground">Monto a pagar:</span>
                                                        <span className="text-lg font-bold">${p.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Método de Pago</Label>
                                                        <Select>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecciona un método"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="credit_card">Tarjeta de Crédito/Débito</SelectItem>
                                                                <SelectItem value="bank_transfer" disabled>Transferencia Bancaria</SelectItem>
                                                                <SelectItem value="digital_wallet" disabled>Billetera Digital</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Alert>
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertTitle>En Desarrollo</AlertTitle>
                                                        <AlertDescription>
                                                            La integración con pasarelas de pago seguras (Niubiz, Culqi, etc.) y la lógica de procesamiento de pagos se implementará próximamente.
                                                        </AlertDescription>
                                                    </Alert>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline">Cancelar</Button>
                                                    <Button disabled><CreditCard className="mr-2"/> Proceder al Pago</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History /> Historial de Pagos</CardTitle>
                    <CardDescription>Tus transacciones y recibos anteriores.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Recibo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentFinancials.paymentHistory.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.concept}</TableCell>
                                    <TableCell>{p.date}</TableCell>
                                    <TableCell><Badge className={getStatusVariant(p.status)}>{p.status}</Badge></TableCell>
                                    <TableCell className="text-right">${p.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" disabled={p.status !== 'Completado'}><FileDown className="mr-2"/> Descargar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <aside className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign /> Estado de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">Deuda Total</p>
                        <p className="text-4xl font-bold text-destructive">${Math.abs(studentFinancials.balance).toFixed(2)}</p>
                    </div>
                    <Button className="w-full" disabled><CreditCard className="mr-2"/> Realizar Pago General</Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full"><Scale className="mr-2"/> Solicitar Plan de Pagos</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Solicitar Plan de Pagos</DialogTitle>
                                <DialogDescription>
                                    Envía una solicitud para fraccionar tu deuda pendiente en cuotas.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-6">
                                <div className="space-y-2">
                                    <Label>Monto a fraccionar</Label>
                                    <p className="text-xl font-bold">${Math.abs(studentFinancials.balance).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Este es el monto total de tu deuda actual que será fraccionado.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cantidad de Cuotas</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el número de cuotas"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Cuotas</SelectItem>
                                            <SelectItem value="6">6 Cuotas</SelectItem>
                                            <SelectItem value="9" disabled>9 Cuotas (Requiere evaluación)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plan-reason">Motivo de la solicitud (Opcional)</Label>
                                    <Textarea id="plan-reason" placeholder="Si lo deseas, explica brevemente por qué solicitas el plan de pagos."/>
                                </div>
                                 <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Revisión Manual</AlertTitle>
                                    <AlertDescription>
                                        Tu solicitud será enviada al departamento financiero para su revisión y aprobación.
                                    </AlertDescription>
                                </Alert>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancelar</Button>
                                <Button disabled><Scale className="mr-2"/> Enviar Solicitud</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck /> Becas y Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                    {studentFinancials.scholarships.active ? (
                        <div>
                            <p className="font-semibold">{studentFinancials.scholarships.name}</p>
                            <p className="text-sm text-muted-foreground">Cobertura: {studentFinancials.scholarships.coverage}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Actualmente no tienes becas o beneficios activos.</p>
                    )}
                </CardContent>
            </Card>
        </aside>
    </div>
  );
}

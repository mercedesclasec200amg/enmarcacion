'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, QrCode, Printer, Mail } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<string | null>(null)
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [selectedPresupuestoId, setSelectedPresupuestoId] = useState<string | null>(null)

  const fetchPresupuestos = async () => {
    try {
      const res = await fetch('/api/presupuestos')
      const data = await res.json()
      setPresupuestos(data)
    } catch (e) {
      toast.error('Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPresupuestos()
  }, [])

  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/presupuestos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (res.ok) {
        toast.success('Estado actualizado')
        fetchPresupuestos()
      } else {
        toast.error('Error al actualizar')
      }
    } catch (e) {
      toast.error('Error al actualizar')
    }
  }

  const handlePagadoChange = async (id: string, pagado: boolean) => {
    try {
      const res = await fetch(`/api/presupuestos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagado })
      })
      if (res.ok) {
        toast.success('Pago actualizado')
        fetchPresupuestos()
      } else {
        toast.error('Error al actualizar')
      }
    } catch (e) {
      toast.error('Error al actualizar')
    }
  }

  const showQr = (codigo: string) => {
    const url = `${window.location.origin}/seguimiento?codigo=${codigo}`
    setQrData(url)
    setIsQrOpen(true)
  }

  const generatePDF = (p: any, action: 'download' | 'print' | 'base64' = 'download'): string | void => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Presupuesto de Enmarcación', 14, 22);

    doc.setFontSize(12);
    doc.text(`Código de Seguimiento: ${p.codigoSeguimiento}`, 14, 32);
    doc.text(`Fecha: ${new Date(p.createdAt).toLocaleDateString()}`, 14, 40);

    if (p.cliente) {
      doc.text(`Cliente: ${p.cliente.nombre}`, 14, 48);
      if (p.cliente.telefono) doc.text(`Teléfono: ${p.cliente.telefono}`, 14, 56);
    } else {
      doc.text(`Cliente: General`, 14, 48);
    }

    doc.text(`Medidas Obra: ${p.anchoObra}x${p.altoObra} cm`, 14, 68);

    const itemsBody = p.items.map((i: any) => [
      i.tipoItem,
      i.producto?.nombre || '-',
      `${i.descuentoArticulo > 0 ? `(-${i.descuentoArticulo}%)` : ''}`,
      `${i.precioCalculado.toFixed(2)} €`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Concepto', 'Artículo', 'Descuento', 'Precio']],
      body: itemsBody,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text(`Subtotal: ${(p.precioTotal + p.descuentoGlobal * p.precioTotal / (100 - p.descuentoGlobal)).toFixed(2)} €`, 140, finalY);
    if (p.descuentoGlobal > 0) {
      doc.text(`Descuento Global: ${p.descuentoGlobal}%`, 140, finalY + 8);
    }
    doc.setFontSize(14);
    doc.text(`Total a pagar: ${p.precioTotal.toFixed(2)} €`, 140, finalY + 18);

    doc.setFontSize(12);
    doc.text(`Entregado a cuenta: ${p.cantidadAcuenta.toFixed(2)} €`, 140, finalY + 28);
    doc.text(`Restante: ${(Math.max(0, p.precioTotal - p.cantidadAcuenta)).toFixed(2)} €`, 140, finalY + 36);

    if (p.pagado) {
       doc.setTextColor(0, 128, 0);
       doc.text(`[ PAGADO EN SU TOTALIDAD ]`, 140, finalY + 46);
       doc.setTextColor(0, 0, 0);
    }

    if (p.observaciones) {
      doc.text(`Observaciones: ${p.observaciones}`, 14, finalY + 56);
    }

    // Dibujar codigo QR de seguimiento en el PDF
    const qrUrl = `${window.location.origin}/seguimiento?codigo=${p.codigoSeguimiento}`;
    // Usar la API de jsPDF para generar un barcode o un placeholder de momento (o el usuario podria usar la libreria, pero requeriria integrarlo con un canvas. Por simplicidad, agregamos la URL textual).
    doc.setFontSize(10);
    doc.text(`Sigue tu pedido en: ${qrUrl}`, 14, 280);

    if (action === 'download') {
      doc.save(`Presupuesto_${p.codigoSeguimiento}.pdf`);
    } else if (action === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else if (action === 'base64') {
      return doc.output('datauristring');
    }
  }

  const openEmailModal = (p: any) => {
    setSelectedPresupuestoId(p.id);
    setEmailTo(p.cliente?.email || '');
    setIsEmailOpen(true);
  }

  const handleSendEmail = async () => {
    if (!selectedPresupuestoId || !emailTo) return;

    const p = presupuestos.find(pr => pr.id === selectedPresupuestoId);
    if (!p) return;

    try {
      const pdfBase64 = generatePDF(p, 'base64');

      const res = await fetch(`/api/presupuestos/${p.id}/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailDestino: emailTo, pdfBase64 })
      });

      if (res.ok) {
        toast.success('Correo enviado correctamente');
        setIsEmailOpen(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Error al enviar el correo');
      }
    } catch (error) {
      toast.error('Error de red al enviar el correo');
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PRESUPUESTO': return 'bg-gray-100 text-gray-800'
      case 'ACEPTADO': return 'bg-blue-100 text-blue-800'
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800'
      case 'FABRICACION': return 'bg-purple-100 text-purple-800'
      case 'TERMINADO': return 'bg-green-100 text-green-800'
      case 'ENTREGADO': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Presupuestos y Pedidos</h1>
        <div className="flex gap-2">
          <Link href="/seguimiento" target="_blank">
            <Button variant="outline">Ver Portal Público</Button>
          </Link>
          <Link href="/admin/presupuestos/nuevo">
            <Button>Nuevo Presupuesto</Button>
          </Link>
        </div>
      </div>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">Código QR de Seguimiento</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-4 rounded-lg">
            {qrData && <QRCodeSVG value={qrData} size={256} />}
          </div>
          <p className="text-sm text-center text-gray-500 mt-4 break-all">
            {qrData}
          </p>
          <Button onClick={() => window.open(qrData!, '_blank')} className="mt-4 w-full">
            Abrir Enlace
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Presupuesto por Email</DialogTitle>
            <DialogDescription>El presupuesto se enviará adjunto como PDF.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
                <Label>Correo electrónico del destinatario</Label>
                <Input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="cliente@email.com" />
             </div>
          </div>
          <Button onClick={handleSendEmail} className="w-full">
            Enviar Email
          </Button>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Código Seg.</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Precio Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presupuestos.map(p => (
              <TableRow key={p.id}>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono">{p.codigoSeguimiento}</TableCell>
                <TableCell>{p.cliente?.nombre || 'Cliente Final'}</TableCell>
                <TableCell>
                  <Select value={p.estado} onValueChange={(v) => handleEstadoChange(p.id, v)}>
                    <SelectTrigger className={`h-8 text-xs font-medium w-32 ${getEstadoColor(p.estado)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESUPUESTO">Presupuesto</SelectItem>
                      <SelectItem value="ACEPTADO">Aceptado</SelectItem>
                      <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                      <SelectItem value="FABRICACION">Fabricación</SelectItem>
                      <SelectItem value="TERMINADO">Terminado</SelectItem>
                      <SelectItem value="ENTREGADO">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={p.pagado ? 'SI' : 'NO'} onValueChange={(v) => handlePagadoChange(p.id, v === 'SI')}>
                    <SelectTrigger className={`h-8 text-xs font-medium w-24 ${p.pagado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO">No Pagado</SelectItem>
                      <SelectItem value="SI">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="font-medium">{p.precioTotal.toFixed(2)} €</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => generatePDF(p, 'download')} title="Descargar PDF">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEmailModal(p)} title="Enviar por Email">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => showQr(p.codigoSeguimiento)} title="Ver QR">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {presupuestos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No hay presupuestos todavía. ¡Crea el primero!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

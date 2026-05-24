'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    descuentoFijo: 0,
    aplicarDescuentoSiempre: false
  })

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      setClientes(data)
    } catch (e) {
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Cliente creado')
        setIsOpen(false)
        setFormData({ nombre: '', email: '', telefono: '', direccion: '', descuentoFijo: 0, aplicarDescuentoSiempre: false })
        fetchClientes()
      } else {
        toast.error('Error al crear cliente')
      }
    } catch (e) {
      toast.error('Error al crear cliente')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Cliente eliminado')
        fetchClientes()
      } else {
        toast.error('Error al eliminar')
      }
    } catch (e) {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Clientes</h1>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Nuevo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-2">
                <Label>Nombre Completo / Empresa</Label>
                <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Teléfono</Label>
                <Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Dirección</Label>
                <Input value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Descuento Fijo (%)</Label>
                <Input type="number" min="0" max="100" value={formData.descuentoFijo} onChange={e => setFormData({...formData, descuentoFijo: Number(e.target.value)})} />
              </div>
              <div className="flex items-center justify-between">
                 <Label>Aplicar descuento automáticamente</Label>
                 <Switch checked={formData.aplicarDescuentoSiempre} onCheckedChange={v => setFormData({...formData, aplicarDescuentoSiempre: v})} />
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map(c => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => window.location.href=`/admin/clientes/${c.id}`}>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
                <TableCell>{c.telefono || '-'}</TableCell>
                <TableCell>
                  {c.descuentoFijo > 0 ? (
                     <span className={`text-xs px-2 py-1 rounded ${c.aplicarDescuentoSiempre ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                       {c.descuentoFijo}% {c.aplicarDescuentoSiempre && '(Auto)'}
                     </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {clientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-4">No hay clientes registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

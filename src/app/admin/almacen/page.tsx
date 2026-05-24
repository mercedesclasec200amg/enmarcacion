'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export default function AlmacenPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [fabricantes, setFabricantes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({
    tipo: 'MOLDURA',
    referencia: '',
    nombre: '',
    precio: '',
    coste: '',
    stock: '',
    stockMinimo: '',
    fabricanteId: 'none',
    anchoMoldura: '',
    largoBarra: '',
    anchoMaximo: '',
    altoMaximo: ''
  })

  const fetchData = async () => {
    try {
      const [prodRes, fabRes] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/fabricantes')
      ])
      const prods = await prodRes.json()
      const fabs = await fabRes.json()
      setProductos(prods)
      setFabricantes(fabs)
    } catch (e) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      fabricanteId: formData.fabricanteId === 'none' ? null : formData.fabricanteId
    }

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success('Producto creado')
        setIsOpen(false)
        setFormData({
          tipo: 'MOLDURA', referencia: '', nombre: '', precio: '', coste: '', stock: '',
          stockMinimo: '', fabricanteId: 'none', anchoMoldura: '', largoBarra: '', anchoMaximo: '', altoMaximo: ''
        })
        fetchData()
      } else {
        toast.error('Error al crear producto')
      }
    } catch (e) {
      toast.error('Error al crear producto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return
    try {
      const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Producto eliminado')
        fetchData()
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
        <h1 className="text-2xl font-bold">Gestión de Almacén</h1>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Nuevo Producto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir al Almacén</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo de Producto</Label>
                  <Select value={formData.tipo} onValueChange={v => setFormData({...formData, tipo: v || 'MOLDURA'})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOLDURA">Moldura</SelectItem>
                      <SelectItem value="PROTECCION">Protección (Cristal, etc)</SelectItem>
                      <SelectItem value="TRASERA">Trasera</SelectItem>
                      <SelectItem value="PASSE_PARTOUT">Passe Partout</SelectItem>
                      <SelectItem value="ARTICULO_UNITARIO">Artículo Unitario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Fabricante</Label>
                  <Select value={formData.fabricanteId} onValueChange={v => setFormData({...formData, fabricanteId: v || 'none'})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin Fabricante</SelectItem>
                      {fabricantes.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Referencia (Única)</Label>
                  <Input value={formData.referencia} onChange={e => setFormData({...formData, referencia: e.target.value})} required />
                </div>

                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                </div>

                <div className="grid gap-2">
                  <Label>Precio Venta (€)</Label>
                  <Input type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required />
                </div>

                <div className="grid gap-2">
                  <Label>Coste (€)</Label>
                  <Input type="number" step="0.01" value={formData.coste} onChange={e => setFormData({...formData, coste: e.target.value})} />
                </div>

                <div className="grid gap-2">
                  <Label>Stock Actual (m, m², ud)</Label>
                  <Input type="number" step="0.01" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                </div>

                <div className="grid gap-2">
                  <Label>Alerta Stock Mínimo</Label>
                  <Input type="number" step="0.01" value={formData.stockMinimo} onChange={e => setFormData({...formData, stockMinimo: e.target.value})} />
                </div>
              </div>

              {formData.tipo === 'MOLDURA' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="grid gap-2">
                    <Label>Ancho de la Moldura (cm)</Label>
                    <Input type="number" step="0.1" value={formData.anchoMoldura} onChange={e => setFormData({...formData, anchoMoldura: e.target.value})} required={formData.tipo === 'MOLDURA'} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Largo máx. de la Barra (cm)</Label>
                    <Input type="number" step="0.1" value={formData.largoBarra} onChange={e => setFormData({...formData, largoBarra: e.target.value})} required={formData.tipo === 'MOLDURA'} />
                  </div>
                </div>
              )}

              {['PROTECCION', 'TRASERA', 'PASSE_PARTOUT'].includes(formData.tipo) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="grid gap-2">
                    <Label>Ancho Máximo Plancha (cm)</Label>
                    <Input type="number" step="0.1" value={formData.anchoMaximo} onChange={e => setFormData({...formData, anchoMaximo: e.target.value})} required={['PROTECCION', 'TRASERA', 'PASSE_PARTOUT'].includes(formData.tipo)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Alto Máximo Plancha (cm)</Label>
                    <Input type="number" step="0.1" value={formData.altoMaximo} onChange={e => setFormData({...formData, altoMaximo: e.target.value})} required={['PROTECCION', 'TRASERA', 'PASSE_PARTOUT'].includes(formData.tipo)} />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full mt-4">Guardar Producto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref.</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.referencia}</TableCell>
                <TableCell>{p.nombre}</TableCell>
                <TableCell>{p.tipo}</TableCell>
                <TableCell>
                  <span className={p.stock <= (p.stockMinimo || 0) ? "text-red-600 font-bold" : ""}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell>{p.precio} €</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {productos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-4">No hay productos en el almacén</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

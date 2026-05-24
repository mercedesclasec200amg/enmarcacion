'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ClienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cliRes, presRes] = await Promise.all([
          fetch(`/api/clientes/${params.id}/detalle`), // Asumimos crear esta ruta
          fetch(`/api/presupuestos?clienteId=${params.id}`) // Modificaremos la ruta GET de presupuestos
        ])

        if (cliRes.ok) {
          setCliente(await cliRes.json())
        }
        if (presRes.ok) {
          setPresupuestos(await presRes.json())
        }
      } catch (e) {
        toast.error('Error al cargar datos del cliente')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
       fetchData()
    }
  }, [params.id])

  if (loading) return <div>Cargando...</div>
  if (!cliente) return <div>Cliente no encontrado</div>

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/clientes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Ficha de Cliente</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border grid md:grid-cols-2 gap-6">
        <div>
           <h2 className="text-xl font-bold mb-4">{cliente.nombre}</h2>
           <div className="space-y-2 text-sm text-gray-600">
             <p><span className="font-semibold text-gray-800">Email:</span> {cliente.email || '-'}</p>
             <p><span className="font-semibold text-gray-800">Teléfono:</span> {cliente.telefono || '-'}</p>
             <p><span className="font-semibold text-gray-800">Dirección:</span> {cliente.direccion || '-'}</p>
             <p><span className="font-semibold text-gray-800">Registrado el:</span> {new Date(cliente.createdAt).toLocaleDateString()}</p>
           </div>
        </div>
        <div className="bg-gray-50 p-4 rounded border">
           <h3 className="font-bold mb-2">Condiciones Comerciales</h3>
           <p className="text-sm"><span className="font-semibold">Descuento Fijo:</span> {cliente.descuentoFijo}%</p>
           <p className="text-sm"><span className="font-semibold">Aplicar automáticamente:</span> {cliente.aplicarDescuentoSiempre ? 'Sí' : 'No'}</p>

           <div className="mt-6">
             <h3 className="font-bold mb-2">Resumen Operativo</h3>
             <p className="text-sm"><span className="font-semibold">Total Trabajos:</span> {presupuestos.length}</p>
           </div>
        </div>
      </div>

      <div>
         <h2 className="text-xl font-bold mb-4">Historial de Presupuestos / Trabajos</h2>
         <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Fecha</TableHead>
                     <TableHead>Código Seg.</TableHead>
                     <TableHead>Estado</TableHead>
                     <TableHead>Pagado</TableHead>
                     <TableHead>Total</TableHead>
                     <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {presupuestos.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                           No hay presupuestos para este cliente.
                        </TableCell>
                     </TableRow>
                  ) : (
                     presupuestos.map(p => (
                        <TableRow key={p.id}>
                           <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                           <TableCell className="font-mono">{p.codigoSeguimiento}</TableCell>
                           <TableCell>
                              <Badge variant="outline" className={getEstadoColor(p.estado)}>
                                 {p.estado}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <span className={p.pagado ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                 {p.pagado ? 'Sí' : 'No'}
                              </span>
                           </TableCell>
                           <TableCell className="font-medium">{p.precioTotal.toFixed(2)} €</TableCell>
                           <TableCell className="text-right">
                              <Link href={`/admin/presupuestos`}>
                                 <Button variant="ghost" size="sm">Ver en Presupuestos</Button>
                              </Link>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
    </div>
  )
}

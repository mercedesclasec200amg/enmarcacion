'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Search, QrCode } from 'lucide-react'

function SeguimientoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [codigo, setCodigo] = useState(searchParams.get('codigo') || '')
  const [pedido, setPedido] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  const buscarPedido = async (codigoABuscar: string) => {
    if (!codigoABuscar) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/seguimiento?codigo=${codigoABuscar}`)
      if (res.ok) {
        const data = await res.json()
        setPedido(data)
        router.push(`/seguimiento?codigo=${codigoABuscar}`, { scroll: false })
      } else {
        setPedido(null)
        setError('No se ha encontrado ningún pedido con ese código.')
      }
    } catch (e) {
      setError('Error al consultar el pedido.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (codigo) {
      buscarPedido(codigo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false)
      scanner.render(
        (decodedText) => {
          scanner.clear()
          setScannerOpen(false)
          let codeToSearch = decodedText
          try {
            const url = new URL(decodedText)
            codeToSearch = url.searchParams.get('codigo') || decodedText
          } catch(e) {}

          setCodigo(codeToSearch)
          buscarPedido(codeToSearch)
        },
        (error) => {
        }
      )
      return () => { scanner.clear().catch(e => {}) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOpen])

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md border text-center">
        <h1 className="text-2xl font-bold mb-2">Sigue tu Enmarcación</h1>
        <p className="text-gray-500 mb-6">Introduce tu código de seguimiento o escanea el QR de tu resguardo.</p>

        {!scannerOpen ? (
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Ej. A1B2C3"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && buscarPedido(codigo)}
            />
            <Button onClick={() => buscarPedido(codigo)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" /> Buscar
            </Button>
            <Button variant="outline" onClick={() => setScannerOpen(true)}>
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-6">
            <div id="reader" className="mb-4"></div>
            <Button variant="outline" onClick={() => setScannerOpen(false)}>Cancelar Escáner</Button>
          </div>
        )}

        {error && <div className="text-red-500 bg-red-50 p-3 rounded mb-6">{error}</div>}

        {pedido && (
          <div className="text-left border-t pt-6 mt-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-bold text-lg">{pedido.cliente?.nombre || 'Cliente General'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Estado Actual</p>
                <Badge className="text-sm bg-blue-100 text-blue-800 hover:bg-blue-100">{pedido.estado}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-500">Fecha de Entrada</p>
                <p className="font-medium">{new Date(pedido.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-500">Estado de Pago</p>
                <p className={`font-medium ${pedido.pagado ? 'text-green-600' : 'text-red-600'}`}>
                  {pedido.pagado ? 'Pagado' : 'Pendiente de Pago'}
                </p>
              </div>
            </div>

            {pedido.observaciones && (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <p className="text-xs text-gray-500 mb-1">Observaciones / Notas</p>
                <p className="text-sm">{pedido.observaciones}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SeguimientoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SeguimientoContent />
    </Suspense>
  )
}

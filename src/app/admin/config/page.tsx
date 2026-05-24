'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function ConfigPage() {
  const [config, setConfig] = useState({
    holgura: 2.0,
    theme: 'light',
    checkStock: true,
    stockAlerts: true,
    deliveryDays: 14,
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    smtpPassword: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setConfig({
             holgura: data.holgura || 2.0,
             theme: data.theme || 'light',
             checkStock: data.checkStock ?? true,
             stockAlerts: data.stockAlerts ?? true,
             deliveryDays: data.deliveryDays || 14,
             smtpHost: data.smtpHost || '',
             smtpPort: data.smtpPort || 465,
             smtpUser: data.smtpUser || '',
             smtpPassword: data.smtpPassword || ''
          })
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error('Error al cargar la configuración')
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (res.ok) {
        toast.success('Configuración guardada correctamente')
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      toast.error('Error al guardar la configuración')
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-6">Configuración Global</h1>

        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="holgura">Holgura por defecto (mm)</Label>
            <Input
              id="holgura"
              type="number"
              step="0.1"
              value={config.holgura}
              onChange={e => setConfig({...config, holgura: parseFloat(e.target.value)})}
            />
            <p className="text-sm text-gray-500">Milímetros añadidos a la medida de la obra para el corte.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deliveryDays">Días de entrega estándar</Label>
            <Input
              id="deliveryDays"
              type="number"
              value={config.deliveryDays}
              onChange={e => setConfig({...config, deliveryDays: parseInt(e.target.value)})}
            />
          </div>

          <div className="grid gap-2">
            <Label>Tema Visual</Label>
            <Select
              value={config.theme}
              onValueChange={v => setConfig({...config, theme: v || 'light'})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Día (Claro)</SelectItem>
                <SelectItem value="dark">Noche (Oscuro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Comprobar Stock</Label>
              <p className="text-sm text-gray-500">Verificar existencias al hacer presupuestos</p>
            </div>
            <Switch
              checked={config.checkStock}
              onCheckedChange={v => setConfig({...config, checkStock: v})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Alertas de Stock</Label>
              <p className="text-sm text-gray-500">Avisar si no hay stock suficiente</p>
            </div>
            <Switch
              checked={config.stockAlerts}
              onCheckedChange={v => setConfig({...config, stockAlerts: v})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
         <h1 className="text-2xl font-bold mb-6">Envío de Correos (SMTP)</h1>
         <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">Configura los datos de tu servidor de correo para poder enviar presupuestos en PDF a los clientes.</p>

            <div className="grid gap-2">
               <Label>Servidor SMTP (Host)</Label>
               <Input value={config.smtpHost} onChange={e => setConfig({...config, smtpHost: e.target.value})} placeholder="ej. smtp.gmail.com" />
            </div>

            <div className="grid gap-2">
               <Label>Puerto SMTP</Label>
               <Input type="number" value={config.smtpPort} onChange={e => setConfig({...config, smtpPort: Number(e.target.value)})} placeholder="ej. 465 o 587" />
            </div>

            <div className="grid gap-2">
               <Label>Usuario / Email</Label>
               <Input type="email" value={config.smtpUser} onChange={e => setConfig({...config, smtpUser: e.target.value})} placeholder="ej. info@taller.com" />
            </div>

            <div className="grid gap-2">
               <Label>Contraseña</Label>
               <Input type="password" value={config.smtpPassword} onChange={e => setConfig({...config, smtpPassword: e.target.value})} placeholder="********" />
            </div>
         </div>

         <Button onClick={handleSave} className="w-full mt-8" size="lg">Guardar Toda la Configuración</Button>
      </div>
    </div>
  )
}

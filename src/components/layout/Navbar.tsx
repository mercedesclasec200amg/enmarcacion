import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="font-bold text-xl mr-6">
          Enmarcación App
        </Link>
        <div className="flex gap-4">
          <Link href="/admin/presupuestos" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Presupuestos
          </Link>
          <Link href="/admin/almacen" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Almacén
          </Link>
          <Link href="/admin/clientes" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Clientes
          </Link>
          <Link href="/admin/fabricantes" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Fabricantes
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/admin/usuarios" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Usuarios
          </Link>
          <Link href="/admin/config" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Configuración
          </Link>
        </div>
      </div>
    </nav>
  )
}

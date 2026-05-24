import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        descuentoFijo: Number(data.descuentoFijo || 0),
        aplicarDescuentoSiempre: Boolean(data.aplicarDescuentoSiempre)
      }
    });
    return NextResponse.json(cliente);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}

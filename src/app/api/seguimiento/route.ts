import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo');

  if (!codigo) {
    return NextResponse.json({ error: 'Código no proporcionado' }, { status: 400 });
  }

  try {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { codigoSeguimiento: codigo.toUpperCase() },
      include: {
        cliente: {
          select: { nombre: true }
        }
      }
    });

    if (!presupuesto) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(presupuesto);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

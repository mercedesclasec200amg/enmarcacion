import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.config.findFirst();
    if (!config) {
      config = await prisma.config.create({ data: {} });
    }
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const config = await prisma.config.upsert({
      where: { id: 1 },
      update: {
        holgura: Number(data.holgura),
        theme: data.theme,
        checkStock: Boolean(data.checkStock),
        stockAlerts: Boolean(data.stockAlerts),
        deliveryDays: Number(data.deliveryDays),
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort ? Number(data.smtpPort) : null,
        smtpUser: data.smtpUser || null,
        smtpPassword: data.smtpPassword || null
      },
      create: {
        id: 1,
        holgura: Number(data.holgura),
        theme: data.theme,
        checkStock: Boolean(data.checkStock),
        stockAlerts: Boolean(data.stockAlerts),
        deliveryDays: Number(data.deliveryDays),
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort ? Number(data.smtpPort) : null,
        smtpUser: data.smtpUser || null,
        smtpPassword: data.smtpPassword || null
      }
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la configuración' }, { status: 500 });
  }
}

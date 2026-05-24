import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { pdfBase64, emailDestino } = await request.json();

    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: params.id },
      include: { cliente: true }
    });

    if (!presupuesto) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
    }

    const config = await prisma.config.findFirst();
    if (!config?.smtpHost || !config?.smtpPort || !config?.smtpUser || !config?.smtpPassword) {
      return NextResponse.json({ error: 'Servidor de correo no configurado. Contacte a un administrador.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });

    // Convertir el base64 a buffer
    const base64Data = pdfBase64.replace(/^data:application\/pdf;filename=generated\.pdf;base64,/, "").replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(base64Data, "base64");

    const emailTo = emailDestino || presupuesto.cliente?.email;
    if (!emailTo) {
      return NextResponse.json({ error: 'No hay dirección de correo electrónico especificada' }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"Taller de Enmarcación" <${config.smtpUser}>`,
      to: emailTo,
      subject: `Presupuesto de Enmarcación - ${presupuesto.codigoSeguimiento}`,
      text: `Hola,\n\nAdjuntamos el presupuesto de enmarcación con código de seguimiento ${presupuesto.codigoSeguimiento}.\n\nPara revisar el estado de su pedido, visite nuestra página web e introduzca su código.\n\nSaludos,\nTaller de Enmarcación`,
      attachments: [
        {
          filename: `Presupuesto_${presupuesto.codigoSeguimiento}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ error: 'Error al enviar correo' }, { status: 500 });
  }
}

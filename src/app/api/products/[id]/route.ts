import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, context: { params: { id: string } }) {
  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id: id },
  });

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(product);
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  const body = await req.json();

  const updated = await prisma.product.update({
    where: { id: id },
    data: {
      productName: body.productName,
      currentPrice: body.currentPrice,
      quantity: body.quantity,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  await prisma.product.delete({
    where: { id: id },
  });

  return NextResponse.json({ message: 'Deleted successfully' });
}

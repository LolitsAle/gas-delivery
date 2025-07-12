import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newProduct = await prisma.product.create({
    data: {
      productName: body.productName,
      currentPrice: body.currentPrice,
      quantity: body.quantity,
    },
  });

  return NextResponse.json(newProduct, { status: 201 });
}

// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { phoneNumber, password } = await req.json();

  if (!phoneNumber || !password) {
    return NextResponse.json({ message: 'Phone and password required' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      nickname: '',
      phoneNumber,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ message: 'User registered successfully' }, { status: 200 });
}

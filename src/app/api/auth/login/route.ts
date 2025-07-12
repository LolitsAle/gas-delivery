// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(req: NextRequest) {
  const { phoneNumber, password } = await req.json();

  if (!phoneNumber || !password) {
    return NextResponse.json({ message: 'Phone and password required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phoneNumber } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ message: 'Invalid phone or password' }, { status: 401 });
  }

  const token = jwt.sign({ userId: user.id, phone: user.phoneNumber }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return NextResponse.json({ token }, { status: 200 });
}

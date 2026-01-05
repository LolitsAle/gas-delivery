// // app/api/admin/users/[id]/route.ts
// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import { requireAdmin } from "@/lib/auth/requireAdmin";

import { a } from "framer-motion/client";

// type Params = {
//   params: {
//     id: string;
//   };
// };

// export async function PATCH(req: NextRequest, { params }: Params) {
//   await requireAdmin(req);

//   const body = await req.json();

//   const user = await prisma.user.update({
//     where: { id: params.id },
//     data: {
//       nickname: body.nickname,
//       role: body.role,
//       isVerified: body.isVerified,
//       address: body.address,
//       addressNote: body.addressNote,
//       houseImage: body.houseImage,
//       isActive: body.isActive,
//     },
//   });

//   return NextResponse.json({ user });
// }

// export async function DELETE(req: NextRequest, { params }: Params) {
//   await requireAdmin(req);

//   await prisma.user.update({
//     where: { id: params.id },
//     data: { isActive: false },
//   });

//   return NextResponse.json({ ok: true });
// }

// export async function PUT(req: NextRequest, { params }: Params) {
//   await requireAdmin(req);

//   const body = await req.json();

//   const user = await prisma.user.update({
//     where: { id: params.id },
//     data: {
//       nickname: body.nickname,
//       address: body.address,
//       addressNote: body.addressNote,
//       role: body.role,
//       isActive: body.isActive,
//     },
//   });

//   return NextResponse.json({ user });
// }
export async function GET() {}

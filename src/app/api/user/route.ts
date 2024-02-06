import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface UserRequest {
  userId: string;
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = (await request.json()) as UserRequest;
    if (!userId) {
      return NextResponse.json(
        {
          message: "Bad request",
        },
        {
          status: 400,
        }
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          userId: userId,
        },
      });
    }
    return NextResponse.json(
      {
        user,
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log("🚀 ~ e:", e);
    return NextResponse.json({
      message: "Internal Error",
    });
  }
}

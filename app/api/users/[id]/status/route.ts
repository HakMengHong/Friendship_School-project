import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isActive } = await request.json();

    // Validate the user ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "លេខ ID មិនត្រឹមត្រូវ" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "រកមិនឃើញអ្នកប្រើប្រាស់" },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        status: isActive ? "active" : "inactive"
      }
    });

    return NextResponse.json({
      message: "ផ្លាស់ប្តូរស្ថានភាពជោគជ័យ",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "មានបញ្ហាក្នុងការផ្លាស់ប្តូរស្ថានភាព" },
      { status: 500 }
    );
  }
} 
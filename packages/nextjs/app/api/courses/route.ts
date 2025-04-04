import { NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, fileUrl, quizData } = await request.json();
    if (!title || !description || !fileUrl) {
      return NextResponse.json({ error: "Missing course details" }, { status: 400 });
    }
    const course = await prisma.course.create({
      data: {
        title,
        description,
        fileUrl,
        quizData: quizData ? JSON.parse(quizData) : null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

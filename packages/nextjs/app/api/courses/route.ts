import { NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

interface Quiz {
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

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

    // Validate quizData if provided
    if (quizData) {
      try {
        const parsedQuiz = JSON.parse(quizData) as Quiz;
        if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
          throw new Error("Invalid quiz format");
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid quiz data format" }, { status: 400 });
      }
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        fileUrl,
        quizData: quizData ? quizData : null, // Store as string (Prisma will handle JSON)
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

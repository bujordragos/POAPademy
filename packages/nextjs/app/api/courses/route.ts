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
    // For multipart/form-data requests
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const quizDataRaw = formData.get("quizData") as string;
    const file = formData.get("file") as File | null;

    if (!title || !description) {
      return NextResponse.json({ error: "Missing course details" }, { status: 400 });
    }

    // Validate quizData if provided
    let parsedQuiz: Quiz | null = null;
    if (quizDataRaw) {
      try {
        parsedQuiz = JSON.parse(quizDataRaw) as Quiz;
        if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
          throw new Error("Invalid quiz format");
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid quiz data format" }, { status: 400 });
      }
    }

    // Prepare data for course creation
    const courseData: any = {
      title,
      description,
      fileUrl: "", // We'll store an empty or placeholder URL
      quizData: quizDataRaw || null,
    };

    // Process file if provided
    if (file) {
      // Get file details
      const fileName = file.name;
      const fileType = file.type;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = Buffer.from(arrayBuffer);

      // Add file data to course data
      courseData.fileData = fileData;
      courseData.fileName = fileName;
      courseData.fileType = fileType;
    }

    // Create course with all the data
    const course = await prisma.course.create({
      data: courseData,
    });

    return NextResponse.json(
      {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

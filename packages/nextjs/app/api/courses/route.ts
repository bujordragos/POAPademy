import { NextResponse } from "next/server";

type Course = {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData?: string;
};

const courses: Course[] = [];
let courseIdCounter = 1;

/**
 * Handle GET requests -> return the list of courses
 */
export async function GET() {
  return NextResponse.json({ courses }, { status: 200 });
}

/**
 * Handle POST requests -> create a new course
 */
export async function POST(request: Request) {
  try {
    const { title, description, fileUrl, quizData } = await request.json();
    if (!title || !description || !fileUrl) {
      return NextResponse.json({ error: "Missing course details" }, { status: 400 });
    }

    const newCourse: Course = {
      id: courseIdCounter++,
      title,
      description,
      fileUrl,
      quizData,
    };
    courses.push(newCourse);

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

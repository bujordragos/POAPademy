import { NextResponse } from "next/server";
import { Course, courseIdCounter, courses } from "../../../lib/coursesData";

let currentCourseId = courseIdCounter;

export async function GET() {
  return NextResponse.json({ courses }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const { title, description, fileUrl, quizData } = await request.json();
    if (!title || !description || !fileUrl) {
      return NextResponse.json({ error: "Missing course details" }, { status: 400 });
    }
    const newCourse: Course = {
      id: currentCourseId++,
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

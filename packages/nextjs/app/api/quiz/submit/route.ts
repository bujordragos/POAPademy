import { NextResponse } from "next/server";
import { mintCertificate } from "~~/lib/contractService";
import { prisma } from "~~/lib/prisma";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

// Type guard function to validate quiz data
function isQuiz(obj: any): obj is Quiz {
  return (
    obj &&
    typeof obj === "object" &&
    Array.isArray(obj.questions) &&
    obj.questions.every(
      (q: any) =>
        typeof q === "object" &&
        typeof q.id === "number" &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        typeof q.correctAnswer === "string",
    )
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, answers, walletAddress, courseName, courseDescription } = body;

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course || !course.quizData) {
      return NextResponse.json({ success: false, error: "Course or quiz data not found" }, { status: 404 });
    }

    // Parse the quizData from string to object
    let quizData: unknown;
    try {
      // If it's a string, parse it; otherwise use it directly
      quizData = typeof course.quizData === "string" ? JSON.parse(course.quizData) : course.quizData;

      // Validate the parsed data has the right structure
      if (!isQuiz(quizData)) {
        throw new Error("Invalid quiz structure");
      }
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid quiz data format" }, { status: 400 });
    }

    // Now TypeScript knows quizData is a valid Quiz
    // Build a mapping of correct answers from the quiz
    const correctAnswers: Record<number, string> = {};
    quizData.questions.forEach(q => {
      correctAnswers[q.id] = q.correctAnswer;
    });

    let correctCount = 0;
    quizData.questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === correctAnswers[q.id]) {
        correctCount++;
      }
    });

    const score = (correctCount / quizData.questions.length) * 100;

    if (score < 80) {
      return NextResponse.json({ success: false, error: "Quiz score too low to mint POAP", score }, { status: 400 });
    }

    const txHash = await mintCertificate(walletAddress, Number(courseId), courseName, courseDescription);
    return NextResponse.json({ success: true, txHash, score }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing quiz submission:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { checkCertificateExists, mintCertificate } from "~~/lib/contractService";
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

    // Check if the user already has a certificate for this course
    try {
      // We need to modify the mintCertificate function to add this capability
      // For now, we'll use the contract directly to check
      const certificateExists = await checkCertificateExists(walletAddress, Number(courseId));

      if (certificateExists) {
        return NextResponse.json(
          { success: false, error: "You have already completed this course and received a certificate" },
          { status: 409 }, // Conflict status code
        );
      }
    } catch (error) {
      console.error("Error checking certificate existence:", error);
      // Continue with the quiz processing even if the check fails
    }

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
      return NextResponse.json(
        { success: false, error: "Quiz score too low to mint certificate", score },
        { status: 400 },
      );
    }

    try {
      const txHash = await mintCertificate(walletAddress, Number(courseId), courseName, courseDescription);
      return NextResponse.json({ success: true, txHash, score }, { status: 200 });
    } catch (error: any) {
      if (error.message && error.message.includes("already minted")) {
        return NextResponse.json(
          { success: false, error: "You have already completed this course and received a certificate", score },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { success: false, error: `Failed to mint certificate: ${error.message}`, score },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error processing quiz submission:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

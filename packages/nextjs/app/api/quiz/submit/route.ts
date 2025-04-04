import { NextResponse } from "next/server";
import { mintCertificate } from "~~/lib/contractService";
import { prisma } from "~~/lib/prisma";

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

    const quiz = course.quizData;

    const correctAnswers: { [key: number]: string } = {};
    quiz.questions.forEach((q: any) => {
      correctAnswers[q.id] = q.correctAnswer;
    });

    let correctCount = 0;
    quiz.questions.forEach((q: any) => {
      if (answers[q.id] && answers[q.id] === correctAnswers[q.id]) {
        correctCount++;
      }
    });
    const score = (correctCount / quiz.questions.length) * 100;

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

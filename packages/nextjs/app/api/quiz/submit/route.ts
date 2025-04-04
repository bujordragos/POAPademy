import { NextResponse } from "next/server";
import { mintCertificate } from "~~/lib/contractService";
import { Course, courses } from "~~/lib/coursesData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, answers, walletAddress, courseName, courseDescription } = body;

    // Find the course by id
    const course = courses.find((c: Course) => c.id === courseId);
    if (!course || !course.quizData) {
      return NextResponse.json({ success: false, error: "Course or quiz data not found" }, { status: 404 });
    }

    // Parse the stored quiz JSON.
    // Expected structure:
    // { "questions": [ { "id": 1, "question": "...", "options": [...], "correctAnswer": "..." }, ... ] }
    const quiz = JSON.parse(course.quizData);

    // Build a mapping of correct answers from the quiz JSON.
    const correctAnswers: { [key: number]: string } = {};
    quiz.questions.forEach((q: any) => {
      correctAnswers[q.id] = q.correctAnswer;
    });

    // Evaluate the student's answers.
    let correctCount = 0;
    quiz.questions.forEach((q: any) => {
      if (answers[q.id] && answers[q.id] === correctAnswers[q.id]) {
        correctCount++;
      }
    });
    const score = (correctCount / quiz.questions.length) * 100;

    // If the score is below 80%, do not mint the certificate.
    if (score < 80) {
      return NextResponse.json({ success: false, error: "Quiz score too low to mint POAP", score }, { status: 400 });
    }

    // Otherwise, call the smart contract's mint function.
    const txHash = await mintCertificate(walletAddress, courseId, courseName, courseDescription);
    return NextResponse.json({ success: true, txHash, score }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing quiz submission:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

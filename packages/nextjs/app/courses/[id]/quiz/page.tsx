"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData: string;
}

const QuizPage: React.FC = () => {
  const params = useParams();
  const courseId = params.id;
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; score?: number; txHash?: string } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // First, check if we have MetaMask
        if (typeof window === "undefined" || !window.ethereum) {
          setError("MetaMask not available");
          router.push("/login-page");
          return;
        }
        // Get wallet address
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (!accounts || accounts.length === 0) {
          setError("No wallet connected");
          router.push("/login-page");
          return;
        }
        setWalletAddress(accounts[0]);

        // Check if user already has a certificate for this course
        try {
          const certificateResponse = await axios.get(
            `/api/certificate/check?courseId=${courseId}&walletAddress=${accounts[0]}`,
          );

          if (certificateResponse.data.exists) {
            setAlreadyCompleted(true);
          }
        } catch (certErr) {
          console.error("Error checking certificate:", certErr);
          // Continue with loading the quiz even if the certificate check fails
        }

        // Fetch course data
        const response = await axios.get(`/api/courses/${courseId}`);
        const courseData = response.data.course;
        setCourse(courseData);
        // Parse quiz data from the course
        if (courseData.quizData) {
          try {
            const parsedQuiz =
              typeof courseData.quizData === "string"
                ? (JSON.parse(courseData.quizData) as Quiz)
                : (courseData.quizData as Quiz);
            setQuiz(parsedQuiz);
            // Initialize userAnswers with empty values for all questions
            const initialAnswers: Record<number, string> = {};
            parsedQuiz.questions.forEach(q => {
              initialAnswers[q.id] = "";
            });
            setUserAnswers(initialAnswers);
          } catch (e) {
            setError("Failed to parse quiz data");
            console.error("Quiz parsing error:", e);
          }
        } else {
          setError("No quiz found for this course");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let response;

      try {
        // Try to submit the quiz
        response = await axios.post("/api/quiz", {
          courseId,
          answers: userAnswers,
          walletAddress,
          courseName: course?.title || "",
          courseDescription: course?.description || "",
        });

        // If successful, use the response data
        setResult({
          success: response.data.success,
          score: response.data.score,
          txHash: response.data.txHash,
        });
      } catch (axiosErr: any) {
        // If the error is a failed quiz (score too low)
        if (
          axiosErr.response?.status === 400 &&
          axiosErr.response?.data?.score !== undefined &&
          axiosErr.response?.data?.error?.includes("too low")
        ) {
          // Still display the score without showing an error message
          setResult({
            success: false,
            score: axiosErr.response.data.score,
          });
        } else if (axiosErr.response?.status === 409) {
          // The user already has a certificate
          setAlreadyCompleted(true);
          setError("You have already completed this course and received a certificate");
        } else {
          // For any other errors, rethrow to be caught by outer try/catch
          throw axiosErr;
        }
      }
    } catch (err: any) {
      // Handle all other errors
      console.error("Quiz submission error:", err);
      setError(err.response?.data?.error || "Failed to submit quiz");
      setResult({
        success: false,
        score: err.response?.data?.score,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-2">Loading quiz...</p>
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="container mx-auto p-4">
        <div
          className={
            resolvedTheme === "dark"
              ? "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              : "bg-purple-200 border-purple-300 text-purple-900 px-4 py-3 rounded relative mb-4"
          }
        >
          <h2 className="text-xl font-bold mb-2">Course Already Completed!</h2>
          <p>You have already completed this course and received a certificate.</p>
        </div>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white`}
        >
          Back to Course
        </button>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-gray-200 rounded">
          Go Back
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto p-4">
        <div
          className={`px-4 py-3 rounded border relative mb-4 ${
            result.success
              ? resolvedTheme === "dark"
                ? "bg-green-900 border-green-700 text-green-200"
                : "bg-purple-200 border-purple-300 text-purple-900"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          <h2 className="text-xl font-bold mb-2">{result.success ? "Quiz Passed! 🎉" : "Quiz Not Passed"}</h2>
          <p>Your score: {result.score}%</p>
          {result.success && result.txHash && (
            <p className="mt-2">
              POAP minted! Transaction:
              <a
                href={`https://etherscan.io/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline"
              >
                {result.txHash.substring(0, 10)}...
              </a>
            </p>
          )}
          {!result.success && <p className="mt-2">You need at least 80% to pass and receive a POAP.</p>}

          {result.success && (
            <button
              onClick={() => router.push(`/poaps/`)}
              className={
                resolvedTheme === "dark"
                  ? "mt-4 px-4 py-2 bg-[#1F7D53] hover:bg-[#186144] text-white rounded"
                  : "mt-4 px-4 py-2 bg-[#C5BAFF] hover:bg-[#AFA0F5] text-white rounded"
              }
            >
              View Your POAPs
            </button>
          )}
        </div>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white`}
        >
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{course?.title} - Quiz</h1>
      <p className="mb-6">{course?.description}</p>

      <form onSubmit={handleSubmit}>
        {quiz?.questions.map((question, index) => (
          <div key={question.id} className="mb-6 p-4 border rounded">
            <h3 className="font-medium mb-2">
              Question {index + 1}: {question.question}
            </h3>
            <div className="pl-4">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={String.fromCharCode(65 + optIndex)} // A, B, C, D
                      checked={userAnswers[question.id] === String.fromCharCode(65 + optIndex)}
                      onChange={() => handleAnswerChange(question.id, String.fromCharCode(65 + optIndex))}
                      className="mr-2"
                      required
                    />
                    <span>
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </form>
    </div>
  );
};

export default QuizPage;

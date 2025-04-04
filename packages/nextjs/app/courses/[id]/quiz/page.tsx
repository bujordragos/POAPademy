"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
};

type QuizData = {
  questions: QuizQuestion[];
};

type Course = {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData?: string;
};

const QuizPage: React.FC = () => {
  const [userAddress] = useState<string>("0xUserWalletAddress"); // ia adresa walletului
  const [course, setCourse] = useState<Course | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [submitStatus, setSubmitStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const params = useParams();
  const courseIdParam = params.id; // assuming your dynamic route is defined as [id]

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get("/api/courses");
        const courses: Course[] = res.data.courses;
        const found = courses.find(c => c.id === Number(courseIdParam));
        if (found) {
          setCourse(found);
          if (found.quizData) {
            setQuizData(JSON.parse(found.quizData));
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseIdParam]);

  const handleOptionChange = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !quizData) return;
    setSubmitStatus("Submitting quiz...");
    try {
      const res = await axios.post("/api/quiz/submit", {
        courseId: course.id,
        answers,
        walletAddress: userAddress,
        courseName: course.title,
        courseDescription: course.description,
      });
      setSubmitStatus("Quiz submitted successfully. Transaction hash: " + res.data.txHash);
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setSubmitStatus("Quiz submission failed: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading || !course || !quizData) {
    return <div className="p-4">Loading quiz...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz for {course.title}</h1>
      <form onSubmit={handleSubmit}>
        {quizData.questions.map(q => (
          <div key={q.id} className="mb-4">
            <p className="font-semibold">{q.question}</p>
            {q.options.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={option}
                  checked={answers[q.id] === option}
                  onChange={() => handleOptionChange(q.id, option)}
                  className="mr-2"
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Submit Quiz
        </button>
      </form>
      {submitStatus && <p className="mt-4">{submitStatus}</p>}
    </div>
  );
};

export default QuizPage;

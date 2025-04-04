"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";

interface Course {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData: string;
}

const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const courseId = params.id;
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Check authentication
        if (typeof window === "undefined" || !window.ethereum) {
          router.push("/login-page");
          return;
        }

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (!accounts || accounts.length === 0) {
          router.push("/login-page");
          return;
        }

        // Fetch course data
        const response = await axios.get(`/api/courses/${courseId}`);
        setCourse(response.data.course);
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

  const handleStartQuiz = () => {
    router.push(`/courses/${courseId}/quiz`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-2">Loading course...</p>
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || "Course not found"}</span>
        </div>
        <button onClick={() => router.push("/courses")} className="mt-4 px-4 py-2 bg-gray-200 rounded">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
        </div>
        <button
          onClick={handleStartQuiz}
          className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white`}
        >
          Take Quiz
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Course Material</h2>
        {course.fileUrl ? (
          <div className="border p-4 rounded">
            <p className="mb-2">Course material is available for viewing or download:</p>
            <a href={course.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View/Download Material
            </a>
          </div>
        ) : (
          <p>No course materials available.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>
        <p>Complete the quiz with a score of at least 80% to earn your certificate.</p>
        <button
          onClick={handleStartQuiz}
          className={`mt-4 px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white`}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default CourseDetailPage;

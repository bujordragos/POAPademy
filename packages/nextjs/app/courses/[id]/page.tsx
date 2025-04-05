"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";

// Update the Course interface to include the new fields
interface Course {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData: string;
  fileData?: Uint8Array | null; // Optional since it may not be returned in the API
  fileName?: string | null;
  fileType?: string | null;
}

const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const courseId = params.id;
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [walletAddress, setWalletAddress] = useState<string>("");

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
          // Continue loading the course even if certificate check fails
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

  const handleDownload = () => {
    // Open the download endpoint in a new tab
    window.open(`/api/courses/${courseId}/download`, "_blank");
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
          <p className={resolvedTheme === "dark" ? "text-[FFFFFF] mb-4" : "text-[#151926] mb-4"}>
            {course.description}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Course Material</h2>
        {course.fileUrl || course.fileData ? (
          <div className="border p-4 rounded">
            <p className="mb-2">Course material is available for viewing or download:</p>
            <button
              onClick={handleDownload}
              className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53] hover:bg-[#186144]" : "bg-[#C5BAFF] hover:bg-[#AFA0F5]"} text-white`}
            >
              Download Material
            </button>
          </div>
        ) : (
          <p>No course materials available.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>

        {alreadyCompleted ? (
          <div
            className={
              resolvedTheme === "dark"
                ? "bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-4"
                : "bg-purple-200 border-purple-300 text-purple-900 p-4 rounded mb-4"
            }
          >
            <p>You have already completed this course and received a certificate!</p>
            <button
              onClick={() => router.push(`/poaps/`)}
              className={`mt-4 px-4 py-2 rounded ${
                resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"
              } text-white`}
            >
              View Your POAPs
            </button>
          </div>
        ) : (
          <p>Complete the quiz with a score of at least 80% to earn your certificate.</p>
        )}

        <button
          onClick={handleStartQuiz}
          disabled={alreadyCompleted}
          className={`mt-4 px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white ${
            alreadyCompleted ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {alreadyCompleted ? "Already Completed" : "Start Quiz"}
        </button>
      </div>
    </div>
  );
};

export default CourseDetailPage;

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";

interface Course {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData?: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completedCourses, setCompletedCourses] = useState<Record<number, boolean>>({});
  const [walletAddress, setWalletAddress] = useState<string>("");
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/courses");
        setCourses(res.data.courses);

        // After fetching courses, check which ones the user has completed
        if (walletAddress) {
          const completionStatus: Record<number, boolean> = {};

          // Check each course's completion status
          for (const course of res.data.courses) {
            try {
              const certificateResponse = await axios.get(
                `/api/certificate/check?courseId=${course.id}&walletAddress=${walletAddress}`,
              );

              completionStatus[course.id] = certificateResponse.data.exists;
            } catch (err) {
              console.error(`Error checking certificate for course ${course.id}:`, err);
              completionStatus[course.id] = false;
            }
          }

          setCompletedCourses(completionStatus);
        }
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        setError(error.response?.data?.error || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    // Check authentication before fetching courses
    const checkAuth = async () => {
      try {
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

        // Auth checks passed, fetch courses
        fetchCourses();
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/login-page");
      }
    };

    checkAuth();
  }, [router, walletAddress]);

  // Redirect to course upload page
  const handleAddCourse = () => {
    router.push("/add-course");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-2">Loading courses...</p>
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Courses</h1>
        <button
          onClick={handleAddCourse}
          className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white`}
        >
          Add New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl mb-4">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2 truncate">{course.title}</h2>
                <p
                  className={
                    resolvedTheme === "dark" ? "text-[#FFFFFF] mb-4 line-clamp-2" : "text-[#151926] mb-4 line-clamp-2"
                  }
                >
                  {course.description}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <Link href={`/courses/${course.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </Link>

                  {course.quizData &&
                    (completedCourses[course.id] ? (
                      <span
                        className={
                          resolvedTheme === "dark"
                            ? "px-3 py-1 rounded bg-[#1F7D53] text-white font-medium text-sm"
                            : "px-3 py-1 rounded bg-[#C5BAFF] text-white font-medium text-sm"
                        }
                      >
                        Completed ✓
                      </span>
                    ) : (
                      <Link href={`/courses/${course.id}/quiz`}>
                        <span
                          className={`px-3 py-1 rounded ${
                            resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"
                          } text-white font-medium text-sm`}
                        >
                          Start Quiz
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;

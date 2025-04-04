"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

type Course = {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData?: string;
};

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("/api/courses");
        setCourses(res.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-4">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Courses</h1>
      {courses.length === 0 ? (
        <p>No courses available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course.id} className="border p-4 rounded relative">
              {course.quizData && (
                <Link href={`/courses/${course.id}/quiz`}>
                  <button className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded">Take Quiz</button>
                </Link>
              )}
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p>{course.description}</p>
              <p>
                <strong>File URL:</strong>{" "}
                <a
                  href={course.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "green", textDecoration: "underline" }}
                >
                  Click to download
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;

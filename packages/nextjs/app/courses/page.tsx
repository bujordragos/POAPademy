"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

type Course = {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData?: string; // Quiz data stored as a JSON string
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
    return <div>Loading courses...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Courses</h1>
      {courses.length === 0 ? (
        <p>No courses available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course.id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p>{course.description}</p>
              <p>
                File URL:{" "}
                <a href={course.fileUrl} target="_blank" rel="noopener noreferrer">
                  {course.fileUrl}
                </a>
              </p>
              {course.quizData && (
                <div>
                  <h3 className="font-bold mt-2">Quiz Data:</h3>
                  <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{course.quizData}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;

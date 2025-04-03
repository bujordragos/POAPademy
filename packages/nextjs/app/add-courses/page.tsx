"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "next-themes";

const UploadCoursePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quizData, setQuizData] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = "";
    if (file) {
      // For MVP/demo, using an object URL; in production, upload to a storage service.
      fileUrl = URL.createObjectURL(file);
    }
    try {
      const response = await axios.post("/api/courses", {
        title,
        description,
        fileUrl,
        quizData, // quizData is sent for potential use even though the API only stores course details.
      });
      setUploadStatus("Course uploaded successfully!");
      console.log(response.data);
    } catch (error: any) {
      console.error(error);
      setUploadStatus("Error uploading course.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Course & Quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Course Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Course Description</label>
          <textarea
            className="border p-2 w-full"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Upload File (PPT/PDF/DOCX)</label>
          <input type="file" onChange={handleFileChange} accept=".ppt,.pptx,.doc,.docx,.pdf" required />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Quiz Data (JSON Format)</label>
          <textarea
            className="border p-2 w-full"
            value={quizData}
            onChange={e => setQuizData(e.target.value)}
            placeholder='{"1": "A", "2": "B", "3": "C", "4": "D", "5": "A"}'
            required
          ></textarea>
          <p className="text-xs text-gray-500">Enter the quiz questions and correct answers as JSON.</p>
        </div>
        <button
          type="submit"
          className={
            resolvedTheme === "dark" ? "bg-[#1F7D53] text-white px-4 py-2" : "bg-[#C5BAFF] text-white px-4 py-2"
          }
        >
          Upload Course
        </button>
      </form>
      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}
    </div>
  );
};

export default UploadCoursePage;

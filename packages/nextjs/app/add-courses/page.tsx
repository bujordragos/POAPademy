"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const UploadCoursePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { id: 1, question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Authentication check on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check if we're in browser and MetaMask exists
        if (typeof window === "undefined" || !window.ethereum) {
          console.log("MetaMask not available");
          router.push("/login-page");
          return;
        }

        // Get accounts - will trigger MetaMask popup if not connected
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          // If no accounts, user is not connected
          if (!accounts || accounts.length === 0) {
            console.log("No accounts found, redirecting to login");
            router.push("/login-page");
            return;
          }

          // User is authenticated, continue loading the page
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking accounts:", error);
          router.push("/login-page");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/login-page");
      }
    };

    checkAuthentication();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-2">Checking wallet connection...</p>
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: string | string[]) => {
    const newQuestions = [...quizQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...quizQuestions];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    newQuestions[questionIndex].options = newOptions;
    setQuizQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: quizQuestions.length + 1,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (quizQuestions.length > 1) {
      const newQuestions = quizQuestions.filter((_, i) => i !== index);
      // Update IDs to maintain sequence
      const updatedQuestions = newQuestions.map((q, i) => ({ ...q, id: i + 1 }));
      setQuizQuestions(updatedQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = "";
    if (file) {
      fileUrl = URL.createObjectURL(file);
    }

    // Format quiz data properly as required by API
    const quizData: Quiz = {
      questions: quizQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options.filter(opt => opt.trim() !== ""), // Remove empty options
        correctAnswer: q.correctAnswer,
      })),
    };

    try {
      // Send JSON data with properly formatted quiz data
      const response = await axios.post("/api/courses", {
        title,
        description,
        fileUrl,
        quizData: JSON.stringify(quizData),
      });
      setUploadStatus("Course uploaded successfully!");
      console.log(response.data);
    } catch (error: any) {
      console.error(error);
      setUploadStatus(`Error uploading course: ${error.response?.data?.error || error.message}`);
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
            className="border p-2 w-full rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Course Description</label>
          <textarea
            className="border p-2 w-full rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Upload File (PPT/PDF/DOCX)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".ppt,.pptx,.doc,.docx,.pdf"
            className="w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Quiz Questions</label>
          {quizQuestions.map((question, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Question {qIndex + 1}</h3>
                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500">
                  Remove
                </button>
              </div>

              <div className="mb-2">
                <label className="block mb-1 text-sm">Question Text</label>
                <input
                  type="text"
                  className="border p-2 w-full rounded"
                  value={question.question}
                  onChange={e => handleQuestionChange(qIndex, "question", e.target.value)}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 text-sm">Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex mb-1">
                    <span className="mr-2 p-1">{String.fromCharCode(65 + oIndex)}:</span>
                    <input
                      type="text"
                      className="border p-1 flex-grow rounded"
                      value={option}
                      onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block mb-1 text-sm">Correct Answer</label>
                <select
                  className="border p-2 rounded"
                  value={question.correctAnswer}
                  onChange={e => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                  required
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((_, oIndex) => (
                    <option key={oIndex} value={String.fromCharCode(65 + oIndex)}>
                      {String.fromCharCode(65 + oIndex)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="px-3 py-1 bg-gray-200 rounded">
            Add Question
          </button>
        </div>

        <button
          type="submit"
          className={`px-4 py-2 rounded ${resolvedTheme === "dark" ? "bg-[#1F7D53]" : "bg-[#C5BAFF]"} text-white`}
        >
          Upload Course
        </button>
      </form>
      {uploadStatus && (
        <p className={`mt-4 ${uploadStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}>{uploadStatus}</p>
      )}
    </div>
  );
};

export default UploadCoursePage;

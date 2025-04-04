"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";

const UploadCoursePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quizData, setQuizData] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fileUrl = "";
    if (file) {
      fileUrl = URL.createObjectURL(file);
    }
    try {
      // Send JSON data instead of FormData
      const response = await axios.post("/api/courses", {
        title,
        description,
        fileUrl,
        quizData,
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
          <label className="block mb-2">Quiz Data (JSON Format)</label>
          <textarea
            className="border p-2 w-full rounded"
            value={quizData}
            onChange={e => setQuizData(e.target.value)}
            placeholder='{"1": "A", "2": "B", "3": "C", "4": "D", "5": "A"}'
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">Enter the quiz questions and correct answers as JSON.</p>
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

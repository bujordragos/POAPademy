import type { NextApiRequest, NextApiResponse } from "next";

type Course = {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
};

// eslint-disable-next-line prefer-const
let courses: Course[] = [];
let courseIdCounter = 1;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ courses });
  } else if (req.method === "POST") {
    const { title, description, fileUrl } = req.body;
    if (!title || !description || !fileUrl) {
      return res.status(400).json({ error: "Missing course details" });
    }
    const newCourse: Course = {
      id: courseIdCounter++,
      title,
      description,
      fileUrl,
    };
    courses.push(newCourse);
    return res.status(201).json({ course: newCourse });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

// lib/coursesData.ts
export type Course = {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  quizData?: string;
};

export const courses: Course[] = [];
// eslint-disable-next-line prefer-const
export let courseIdCounter = 1;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~~/lib/prisma";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const courseId = params.id;

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course || !course.fileData) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create response with the file data
    const response = new NextResponse(course.fileData);

    // Set content type if available, or use a default
    response.headers.set("Content-Type", course.fileType || "application/octet-stream");

    // Set content disposition to force download
    response.headers.set("Content-Disposition", `attachment; filename="${course.fileName || "course-material.pdf"}"`);

    return response;
  } catch (error: any) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

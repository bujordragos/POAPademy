import { NextRequest, NextResponse } from "next/server";
import { checkCertificateExists } from "~~/lib/contractService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const walletAddress = searchParams.get("walletAddress");

    if (!courseId || !walletAddress) {
      return NextResponse.json({ error: "Missing courseId or walletAddress" }, { status: 400 });
    }

    const exists = await checkCertificateExists(walletAddress, Number(courseId));

    return NextResponse.json({ exists }, { status: 200 });
  } catch (error: any) {
    console.error("Error checking certificate:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

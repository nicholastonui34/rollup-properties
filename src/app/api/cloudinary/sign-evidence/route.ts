import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signUpload, CLOUDINARY_EVIDENCE_FOLDER } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  if (!session?.user || !["VERIFIER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: CLOUDINARY_EVIDENCE_FOLDER, timestamp };

  try {
    const { cloudName, apiKey, signature } = signUpload(params);
    return NextResponse.json({
      cloudName,
      apiKey,
      signature,
      timestamp,
      folder: CLOUDINARY_EVIDENCE_FOLDER,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Image uploads aren't configured yet." },
      { status: 500 }
    );
  }
}

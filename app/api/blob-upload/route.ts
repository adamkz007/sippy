import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const filename = (formData.get("filename") as string) || (file as File | null)?.name
    const contentType = (formData.get("contentType") as string) || (file as File | null)?.type

    if (!file || typeof file === "string" || !filename || !contentType) {
      return NextResponse.json(
        { error: "file, filename and contentType are required" },
        { status: 400 }
      )
    }

    const blob = await put(`uploads/${crypto.randomUUID()}-${filename}`, file as Blob, {
      access: "public",
      contentType,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Blob upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}


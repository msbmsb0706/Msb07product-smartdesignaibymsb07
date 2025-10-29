import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("id")
    const format = searchParams.get("format")

    if (!fileId || !format) {
      return NextResponse.json({ error: "Missing file ID or format" }, { status: 400 })
    }

    // Generate mock file content based on format
    let content: Buffer
    let contentType: string
    let filename: string

    if (format === "stl") {
      // Mock STL file (binary format)
      content = Buffer.from("MOCK_STL_BINARY_DATA")
      contentType = "application/octet-stream"
      filename = `design-${fileId}.stl`
    } else if (format === "obj") {
      // Mock OBJ file (text format)
      content = Buffer.from(
        `# Mock OBJ File\n# Generated: ${new Date().toISOString()}\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3`,
      )
      contentType = "text/plain"
      filename = `design-${fileId}.obj`
    } else if (format === "kicad") {
      // Mock KiCad file
      content = Buffer.from(
        `(kicad_pcb (version 20240108)\n(general (thickness 1.6))\n(layers (F.Cu signal) (B.Cu signal)))\n`,
      )
      contentType = "text/plain"
      filename = `design-${fileId}.kicad_pcb`
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": content.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}

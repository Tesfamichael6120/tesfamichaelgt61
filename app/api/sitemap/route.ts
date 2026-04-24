import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ethiopiaremotetalent.com";

  try {
    const client = await clientPromise;
    const db = client.db("ethiopia-remote-talent");

    const jobs = await db
      .collection("jobs")
      .find({ status: "active" })
      .project({ _id: 1, createdAt: 1 })
      .toArray();

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/jobs", priority: "0.9", changefreq: "hourly" },
      { url: "/companies", priority: "0.7", changefreq: "weekly" },
    ];

    const jobPages = jobs.map((job) => ({
      url: `/jobs/${job._id.toString()}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: job.createdAt?.toISOString().split("T")[0],
    }));

    const allPages = [...staticPages, ...jobPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return new NextResponse("Failed to generate sitemap", { status: 500 });
  }
}

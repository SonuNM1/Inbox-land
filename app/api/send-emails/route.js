import pool from "@/lib/db.js";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { senderName, senderEmail, appPassword, recipients, subject, body } =
    await req.json();

  if (
    !senderName ||
    !senderEmail ||
    !appPassword ||
    !recipients?.length ||
    !subject ||
    !body
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: appPassword },
  });

  const results = [];
  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject,
        text: body,
      });

      // Mark as mailed in DB

      await pool.query("UPDATE clients SET mailed = TRUE WHERE email = $1", [
        email,
      ]);

      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
    }
  }

  // Stamp last_used_at only if at least one email was sent

  const sentCount = results.filter((r) => r.status === "sent").length;
  if (sentCount > 0) {
    await pool.query(
      "UPDATE sender_accounts SET last_used_at = NOW(), mails_sent = mails_sent + $1 WHERE email = $2",
      [sentCount, senderEmail],
    );
  }

  return Response.json({ results });
}

import nodemailer from "nodemailer";

export async function POST(req) {
  const { senderEmail, appPassword, recipients, subject, body } = await req.json();

  if (!senderEmail || !appPassword || !recipients?.length || !subject || !body) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: senderEmail,
      pass: appPassword,
    },
  });

  const results = [];

  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: senderEmail,
        to: email,
        subject,
        text: body,
      });

      results.push({ email, status: "sent" });

    } catch (err) {

      results.push({
        email,
        status: "failed",
        error: err.message,
      });

    }
  }

  return Response.json({ results });
}
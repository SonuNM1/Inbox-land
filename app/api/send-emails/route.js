import nodemailer from "nodemailer";

// Helper to send in batches
async function sendInBatches(transporter, recipients, mailOptions, batchSize = 5, delayMs = 1000) {
  const results = [];
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (email) => {
        try {
          await transporter.sendMail({ ...mailOptions, to: email });
          return { email, status: "sent" };
        } catch (err) {
          return { email, status: "failed", error: err.message };
        }
      })
    );
    results.push(...batchResults);
    // Wait between batches to avoid hitting Gmail rate limit
    if (i + batchSize < recipients.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return results;
}

export async function POST(req) {
  const { senderName, senderEmail, appPassword, recipients, subject, body } =
    await req.json();

  if (!senderName || !senderEmail || !appPassword || !recipients?.length || !subject || !body) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: senderEmail, pass: appPassword },
  });

  const mailOptions = { from: `"${senderName}" <${senderEmail}>`, subject, text: body };

  // Send in batches of 5, with 1 second delay between batches
  const results = await sendInBatches(transporter, recipients, mailOptions, 5, 1000);

  return Response.json({ results });
}
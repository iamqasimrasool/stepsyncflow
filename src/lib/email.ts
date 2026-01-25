import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  SMTP_FROM,
} = process.env;

export function getAppUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function isEmailConfigured() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_FROM);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  const port = Number(SMTP_PORT);
  const secure =
    typeof SMTP_SECURE === "string"
      ? SMTP_SECURE.toLowerCase() === "true"
      : port === 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

export async function sendResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Email is not configured.");
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Reset your StepSync password",
    text: [
      "We received a request to reset your password.",
      `Reset link: ${resetUrl}`,
      "If you did not request this, you can ignore this email.",
    ].join("\n\n"),
  });
}


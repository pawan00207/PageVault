import nodemailer from "nodemailer";

const getTransporter = () => {
  const user = process.env.USER_EMAIL;
  const pass = process.env.USER_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Email credentials are missing. Set USER_EMAIL and USER_APP_PASSWORD.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

const getSubject = (purpose) => {
  if (purpose === "reset_password" || purpose === "forgot-password") return "Your PubliShelf password reset OTP";
  return "Verify your PubliShelf email address";
};

const getContextText = (purpose) => {
  if (purpose === "reset_password" || purpose === "forgot-password") {
    return "You requested a password reset for your PubliShelf account.";
  }
  return "Use this code to finish creating your PubliShelf account.";
};

const buildOtpEmailHtml = ({ name, otp, purpose, expiresInMinutes }) => {
  const safeName = escapeHtml(name || "there");
  const safeOtp = escapeHtml(otp);
  const contextText = escapeHtml(getContextText(purpose));

  return `
    <div style="margin:0;padding:0;background:#f7f4ef;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.12);border:1px solid #eadfce;">
          <div style="background:linear-gradient(135deg,#5b2a86,#1f4a8a);padding:28px 32px;color:#fff;">
            <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.82;">PubliShelf</div>
            <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Verify your email</h1>
          </div>
          <div style="padding:32px;">
            <p style="font-size:18px;line-height:1.6;margin:0 0 16px;">Hello ${safeName},</p>
            <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">${contextText}</p>
            <div style="text-align:center;margin:28px 0;">
              <div style="display:inline-block;padding:18px 28px;border-radius:16px;background:#f3e8ff;border:1px solid #d8b4fe;letter-spacing:0.4em;font-size:30px;font-weight:800;color:#5b2a86;">${safeOtp}</div>
            </div>
            <p style="font-size:15px;line-height:1.7;margin:0 0 10px;">This code is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.</p>
            <p style="font-size:14px;line-height:1.7;margin:0 0 18px;color:#6b7280;">If you did not request this email, you can safely ignore it. Never share this code with anyone.</p>
            <div style="font-size:13px;line-height:1.7;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:18px;">
              Security reminder: PubliShelf will never ask you to send us this code by chat, phone, or email.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const sendOtpEmail = async ({ to, name, otp, purpose = "signup", expiresInMinutes = 10 }) => {
  const transporter = getTransporter();
  const from = process.env.USER_EMAIL || "no-reply@publishelf.local";

  await transporter.sendMail({
    from,
    to,
    subject: getSubject(purpose),
    html: buildOtpEmailHtml({ name, otp, purpose, expiresInMinutes }),
  });
};
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Campus-Mall <noreply@campusmall.com>',
    to,
    subject,
    html,
  });
}

export function sellerApprovalEmail(name: string, approved: boolean, reason?: string) {
  if (approved) {
    return `
      <h2>Congratulations, ${name}!</h2>
      <p>Your seller account on Campus-Mall has been <strong>approved</strong>.</p>
      <p>You can now list products and start selling securely on campus.</p>
      <a href="${process.env.FRONTEND_URL}/seller/dashboard">Go to Seller Dashboard</a>
    `;
  }
  return `
    <h2>Seller Application Update</h2>
    <p>Hi ${name}, unfortunately your seller application was not approved.</p>
    ${reason ? `<p>Reason: ${reason}</p>` : ''}
    <p>Please contact support if you have questions.</p>
  `;
}

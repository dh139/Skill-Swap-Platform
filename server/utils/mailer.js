
import nodemailer from "nodemailer"

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Email HTML Generator
const getStyledEmailHTML = ({ htmlType, senderName, targetName, otp }) => {
  const greetingName = htmlType === "notify" ? targetName : senderName

  let message = ""
  let actionNote = ""

  if (htmlType === "notify") {
    message = `<strong>${senderName}</strong> has sent you a new skill swap request.`
    actionNote = `Please log in to your dashboard to review it.`
  } else if (htmlType === "accepted") {
    message = `<strong>${targetName}</strong> has <strong>accepted</strong> your skill swap request.`
    actionNote = `You can now connect and start swapping skills!`
  } else if (htmlType === "rejected") {
    message = `<strong>${targetName}</strong> has <strong>rejected</strong> your skill swap request.`
    actionNote = `Feel free to explore and send other requests!`
  } else if (htmlType === "otp") {
    message = `Your one-time password (OTP) for resetting your password is <strong>${otp}</strong>.`
    actionNote = `Please enter this OTP in the reset password form. It expires in 5 minutes.`
  }

  return `
    <div style="background-color:#f9f9f9; padding:40px 0; font-family:Arial, sans-serif;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background-color:#000000; padding:24px 32px;">
          <h1 style="color:#ffffff; font-size:22px; margin:0;">Skill Swap Platform</h1>
        </div>
        <div style="padding:32px; color:#333333;">
          <h2 style="font-size:20px; margin-bottom:12px;">Hello ${greetingName},</h2>
          <p style="font-size:16px; line-height:1.6; margin:0 0 16px;">
            ${message}
          </p>
          <p style="font-size:16px; line-height:1.6;">
            ${actionNote}
          </p>
          <div style="margin-top:24px;">
            <a href="http://localhost:5173${htmlType === "otp" ? "/login" : "/dashboard"}" style="display:inline-block; background-color:#000000; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:500;">
              ${htmlType === "otp" ? "Reset Password" : "Go to Dashboard"}
            </a>
          </div>
        </div>
        <div style="background-color:#f2f2f2; padding:16px 32px; text-align:center; color:#777777; font-size:13px;">
          © ${new Date().getFullYear()} Skill Swap Platform. All rights reserved.
        </div>
      </div>
    </div>
  `
}

// Email functions
export const sendSwapNotificationEmail = async ({ to, targetName, senderName }) => {
  const html = getStyledEmailHTML({ htmlType: "notify", senderName, targetName })
  const mailOptions = {
    from: `"Skill Swap Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "You've received a new skill swap request!",
    html,
  }
  return transporter.sendMail(mailOptions)
}

export const sendSwapAcceptedEmail = async ({ to, senderName, targetName }) => {
  const html = getStyledEmailHTML({ htmlType: "accepted", senderName, targetName })
  const mailOptions = {
    from: `"Skill Swap Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your skill swap request was accepted!",
    html,
  }
  return transporter.sendMail(mailOptions)
}

export const sendSwapRejectedEmail = async ({ to, senderName, targetName }) => {
  const html = getStyledEmailHTML({ htmlType: "rejected", senderName, targetName })
  const mailOptions = {
    from: `"Skill Swap Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your skill swap request was rejected",
    html,
  }
  return transporter.sendMail(mailOptions)
}

export const sendOTPEmail = async ({ to, otp, name }) => {
  const html = getStyledEmailHTML({ htmlType: "otp", senderName: name, targetName: name, otp })
  const mailOptions = {
    from: `"Skill Swap Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP for Password Reset",
    html,
  }
  return transporter.sendMail(mailOptions)
}

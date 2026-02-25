const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    to: email,
    subject: "Code de vérification",
    text: `Votre code est : ${code}`,
  });
};

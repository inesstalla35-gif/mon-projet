const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

exports.sendVerificationSMS = async (phone, code) => {
  await client.messages.create({
    body: `Votre code est ${code}`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
};

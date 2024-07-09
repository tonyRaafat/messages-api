import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, content) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text:content.text || null,
    html:content.html || null
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;

//* npm install nodemailer

const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1) Kreiranje na transporter

  // less secure apps - security
  // const transpoter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     user: process.env.EMAIL_ADRESS,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ADRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, succ) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Successfully send email');
    }
  });

  // 2) Gi definirame opciite na emajlot
  const mailOptions = {
    from: 'Semos Academy <semos@academy.mk>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Da go ispratime emaijlot
  // ova kje ni isprati promis
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

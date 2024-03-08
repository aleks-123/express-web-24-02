//! npm install form-data mailgun.js
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: 'ASGASGASGASDFASFGAGSAFGASFAFGASGASGASFASGAGASGASGAS',
});

const sendMailGun = async (options) => {
  const emailData = {
    from: 'Mailgun Sandbox <postmaster@sandbox43c588f5abfa4eb7a9cbc957f503cbb3.mailgun.org>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await mg.message.create(
    'sandbox43c588f5abfa4eb7a9cbc957f503cbb3.mailgun.org',
    emailData
  );
};

module.exports = sendMailGun;

//////////////

// mg.messages
//   .create(sandbox43c588f5abfa4eb7a9cbc957f503cbb3.mailgun.org, {
//     from: 'Mailgun Sandbox <postmaster@sandbox43c588f5abfa4eb7a9cbc957f503cbb3.mailgun.org>',
//     to: ['ace.ki@hotmail.com'],
//     subject: 'Hello',
//     text: 'Testing some Mailgun awesomness!',
//   })
//   .then((msg) => console.log(msg)) // logs response data
//   .catch((err) => console.log(err)); // logs any error`;

//! Ovaa aplikacija sto ja rabotime na chasov da vi funkcionira na site!!!!!!!!!!

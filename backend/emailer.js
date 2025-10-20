const fs = require('fs');
const nodemailer = require('nodemailer');

async function sendEmail(to, filePath) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tvuj-email@gmail.com',
            pass: 'tvoje-heslo'
        }
    });

    await transporter.sendMail({
        from: 'tvuj-email@gmail.com',
        to,
        subject: 'Vygenerovaný dokument',
        text: 'Zde je dokument ze schůzky',
        attachments: [{ filename: 'vystup.txt', path: filePath }]
    });
}

module.exports = { sendEmail };
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: "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"
        }
    })
);

exports.sendmail = (email, subject, html, token, from = '"Autonetics Team" <jagjots28@gmail.com>') => {
   return new Promise((resolve, rejects) => {
       transporter.sendMail({
            to: email,
            from: from,
            subject: subject,
            html: html
        }, (err, enfo) => {
            if(err) rejects(err)
            resolve(enfo)
        })
    })
}
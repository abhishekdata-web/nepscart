const mailer = require("nodemailer");
const { resetPass } = require("./resetPass_template");
require('dotenv').config();

const getEmailData = (to, name, token, template, actionData) => {
    let data = null;

    switch (template) {
        case "reset_password":
            data = {
                from: 'Nepscart <abhishekshrestha533@gmail.com>',
                to,
                subject: `Hey ${name}, reset your password`,
                html: resetPass(actionData)
            }
            break;
        default:
            data;
    }

    return data;
}

const sendEmail = (to, name, token, type, actionData = null) => {
    const smtpTransport = mailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'abhishekshrestha533@gmail.com',
            pass: process.env.EMAIL_PASS
        }
    });

    const mail = getEmailData(to, name, token, type, actionData);

    smtpTransport.sendMail(mail, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log('email sent')
        }
        smtpTransport.close();
    });
}

module.exports = { sendEmail }
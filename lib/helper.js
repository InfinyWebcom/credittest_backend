const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (userData, cb) => {
    var token = jwt.sign({
        email: userData.userData ? userData.userData.email : userData.email,
        _id: userData.userData ? userData.userData._id : userData._id,
        user_type: userData.userData ? userData.userData.user_type : userData.user_type,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 1000),

    }, "credit@#$");
    cb(token)
}

const sendEmail = (data) => {
    let smtpTransport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.mail_username,
            pass: process.env.mail_password
        }
    });

    let mailOptions = {
        to: data.email,
        from: "test@gmail.com",
        subject: data.subject,
        html: data.body
    };

    if (data.attachments) {
        mailOptions.attachments = data.attachments
    }

    if (data.cc && data.cc.length > 0) {
        mailOptions.cc = data.cc;
    }

    smtpTransport.sendMail(mailOptions, function (err) {
        console.log('errInMail', err)
        return true;
    });
}

module.exports = {
    generateToken,
    sendEmail
}
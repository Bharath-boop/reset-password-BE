import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD    
    },
    tls: {
        rejectUnauthorized: false
    }
});

let mail = async (to, id, token) => {
    try {

        let mailContent = await transporter.sendMail({
            from: process.env.EMAIL,
            to: to,
            subject: 'Code to reset password',
            html: `<h1>Your Password Reset</h1>
                <p>Click in below Link & Set the new Passwords</p>
                <a href="http://localhost:5173/restart/${id}/${token}">Click here</a>
          `
        })

        return (mailContent.messageId, " -pleace check your email");
    } catch (error) {
        console.log("err", error.message);
    }
}

export default mail
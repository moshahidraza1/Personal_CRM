import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    }
});

export const sendVerificationEmail = async (email, emailContent) => {
    try{
        const mailOptions={
            from: process.env.EMAIL,
            to: email,
            subject: 'Email Verification',
            html: emailContent
        };
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: info.messageId
        };

    }catch(error){
        console.error("Error sending email: ", error);
        throw new Error("Failed to send email");
    }
};
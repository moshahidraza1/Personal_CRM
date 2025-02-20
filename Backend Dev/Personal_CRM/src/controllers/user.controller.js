import prisma from "../db/db.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/sendEmail.utils.js";
import crypto from "crypto";
import { Script } from "vm";

// generating token
const generateToken = ()=> {return crypto.randomBytes(32).toString('hex')
};
// hashing the generated token
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const options = {
    httpOnly:true,
    secure: true,
    maxAge: 24*60*60*1000
};
    const generateAccessToken = (user)=>{
    return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
},
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)};
// access Token and refresh token

const generateRefreshToken = (user)=>{
    return jwt.sign(
    {
        id: user.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)};

async function generateAccessAndRefreshToken(userId) {

    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: userId
                }
            }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await prisma.user.update({
            where:{
                id:user.id
            },
            data:{
                accessToken,
                refreshToken
            }
        });
        return {accessToken, refreshToken};
    } catch (error) {

        console.error("Token generation error: ", error);

        throw new Error("Failed to generate token");
    }

}


const createUser = async (req,res)=>{
    const {username, firstName, lastName, email, password} = req.body;
    if(![username, firstName, lastName, email, password].every((field)=>field && field.trim()!== "")){
        return res.json({status:400, message:"All fields are required"});
    }
    try {
        // check if user already exists
        const findUser = await prisma.user.findFirst({
            where:{
            OR:[{email},{username}]
            }
        });
        
        if(findUser){
            return res.json({status:400, message:"User already exists"});
        }
        //Generate verification code
        const token = generateToken();
        const verificationCode = hashToken(token);
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data:{
                username,
                firstName,
                lastName,
                email,
                password:hashedPassword,
                verificationCode,
                verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
            }
        });
        // send verification email
        await sendVerificationEmail(email,token);
        const createdUser = await prisma.user.findUnique({
            where:{
                id:newUser.id
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
            }
        });
        if(!createdUser){
            return res.json({status:500, message:"Something went wrong while creating user"});
        }
        return res.json({status:200, message:"User created successfully", data:newUser});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message:"Something went wrong while creating user"});
        
    }
}
// resend email-verification to register
const resendVerificationCode = async(req,res)=>{
    const {email} = req.body;
    try{
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        });
        if(!user){
            return res.json({status:400, message:"User not found"});
        }
        if(user.emailVerified){
            return res.json({
                status:400,
                message:"Email already verified"
            })
        }
        const token = generateToken();
        const verificationCode = hashToken(token);
        await prisma.user.update({
            where:{
                email
            },
            data:{
                verificationCode,
                verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
            }
            
        
        });
        // const resetUrl = `http://localhost:3000/api/v1/user/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(token)}`;
        const emailContent = `
    <html>
        <body>
            <p>Hello,</p>
            <p>Please click the button below to verify your email:</p>
            <p><a href="http://localhost:3000/api/v1/user/verify-email?email=${encodeURIComponent(email)}&verificationCode=${encodeURIComponent(token)}">Verify Email</a></p>
        </body>
    </html>
`;
    await sendVerificationEmail(email,emailContent);
    return res.status(200).json({
        message: "Resend verification mail successfull"
    })


    }catch(error){
        console.error(error);
        res.status(500).json({
            message: "Something went wrong while sending verification email"
        })
    }
};

// verify user email
const verifyEmail = async (req,res)=>{
    const {email, verificationCode} = req.query;

    try{
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        });
        if(!user){
            return res.json({status:400, message:"User not found"});
        }
        if(user.emailVerified){
            return res.json({
                status:400,
                message:"Email already verified"
            })
        }
        const incomingVerificationCode = hashToken(verificationCode);
        if(user.verificationCode !== incomingVerificationCode){
            return res.json({
                status:400,
                message:"Invalid verification code"
            });
        }
        if(user.verificationCodeExpires < new Date()){
            return res.json({
                status:400,
                message:"Verification code expired"
            });
        }
        await prisma.user.update({
            where:{
                email
            },
            data:{
                emailVerified:true,
                verificationCode:null,
                verificationCodeExpires:null
            }
        });

        //TODO: send confirmation email
        return res.json({
            status:200,
            message:"Email verified successfully"
        });
    }catch(error){
        console.error(error);
            return res.status(500).json({message:"Something went wrong while verifying email"});
        }
};

// login user

const loginUser = async (req,res)=>{
    //get user credentials
    const {email,username, password} = req.body;
    // console.log('req.body:', req.body); 
    if(!email && !username){
        return res.json({status:400, message:"Email or username is required"});
    }
    // check if user have correct credentials
    const conditions = [];
    if(email) conditions.push({email});
    if(username) conditions.push({username});
    try{
        const user = await prisma.user.findFirst({
        where:{
            OR:conditions
        }
    })
    if(!user){
       return res.json({status:400, message:"User not found"});
    }
    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
       return res.json({status:400, message:"Invalid password"});
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user.id);

    
    // send secure cookies
    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options).json({ message:"Login successful"});
    } catch (error) {
    console.error(error);
    return res.status(500).json({ message:"Something went wrong while logging in"});
    }
};

// logout user

const logOut = async(req,res)=>{
    try{
        const user = await prisma.user.findUnique({
        where:{
            id:req.id,
        }
    });
    if(!user){
        return req.status(400).message("User not found");
    }
    await prisma.user.update({
        where:{
            id:user.id
        },
        data:{
            refreshToken:null
        }
    })
    return res.status(200).
    clearCookie(accessToken,options)
    .clearCookie(refreshToken,options)
    .json({message:"user logged out"});

    }catch(error){
        return res.json(500,{message: "Something went wrong while logging out"});
    }
};
// update password if user remembers old password
const updatePassword = (async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    const userId = req.user.id;

    try{
        const user = await prisma.user.findUnique({
        where:{
            id: userId,
        }
    });
    if(!user){
        return res.json(401, {
            message: "User not found"
        });
    }
    const matchPassword = await bcrypt.compare(oldPassword, user.password);
    if(!matchPassword){
        return res.json(401).message("Incorrect old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword,10);

    await prisma.user.update({
        where:{
            id: userId
        },
        data:{
            password:hashedPassword
        }
    });
    return res.json(200, {
        message: "Password successfully reset"
    });
    }catch(error){
        return res.status(500).json({
            message: "Failed to reset password"
        });
    }

    
});
//send verification code to reset password
const forgotPassword = async(req,res)=>{
    const {email} = req.body;

    try {
        const user = await prisma.user.findUnique({
            where:{
                email:email
            }
        });
        if(!user){
            return res.status(401).json({
                message:"User not found"
            });
        }
        const resetCode = generateToken();
        const hashedResetCode = hashToken(resetCode);

        await prisma.user.update({
            where:{
                email
            },
            data:{
                passwordResetCode:hashedResetCode,
                passwordResetCodeExpires: new Date(Date.now() + 10*60*1000)
            }
        });

        // TODO: log resetCode for testing
        const resetUrl = `http://localhost:3000/resetpassword?resetCode=${resetCode}&id=${user.id}`
        const emailContent = `
      <p>Hello,</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this reset, please ignore this email.</p>
    `;
        // 
        await sendVerificationEmail(email,emailContent);

        return res.status(200).json({
            message:"Password reset code sent"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Failed to send passwordResetCode"
        });
    }
    
}
// reset password using email verification
const resetPassword = async(req,res)=>{
    const {email,resetCode,newPassword} = req.body;

    try{
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        });
        if(!user){
            return res.status(401).json({
                message:"Invalid request, user cannot be found"
            });
        }
        const matchCode = hashToken(resetCode);
        if(matchCode != user.passwordResetCode){
            return res.status(400).json({
                message:"Invalid reset code"
            });
        }
        if(user.passwordResetCodeExpires < Date.now()){
            return res.status(400).json({
                message:"reset code expired"
            });
        }
        const hashedPassword = bcrypt.hash(newPassword,10);
        await prisma.user.update({
            where:{
                email
            },
            data:{
                password:hashedPassword,
                passwordResetCode:null,
                passwordResetCodeExpires:null
            }
        });
        // TODO: send reset confirmation mail
        return res.status(200).json({
            message:"Password reset successful"
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Failed to reset Password"
        });
    }

};



export {createUser,
    resendVerificationCode,
    verifyEmail,
    loginUser,
    logOut,
    updatePassword,
    forgotPassword,
    resetPassword
};
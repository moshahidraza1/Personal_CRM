import prisma from "../db/db.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/sendEmail.utils.js";

const options = {
    httpOnly:true,
    secure: true,
    maxAge: 24*60*60*1000
};

// access Token and refresh token

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
        const accessToken = jwt.sign({
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
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );
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
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
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
        await sendVerificationEmail(email,verificationCode);
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

// verify user email
const verifyEmail = async (req,res)=>{
    const {email, verificationCode} = req.body;

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
        if(user.verificationCode !== verificationCode){
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


export {createUser,
    verifyEmail,
    loginUser};
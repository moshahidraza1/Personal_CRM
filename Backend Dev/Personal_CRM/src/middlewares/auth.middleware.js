import jwt from "jsonwebtoken";
import prisma from "../db/db.config.js";

export const verifyJWT = async(req,res, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");

        if(!token){
            return res.status(401).json({error:"Unauthorized request"});
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodeToken?.id) {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        const user = await prisma.user.findUnique({
            where:{
            id:decodeToken?.id
            }
        });

        if(!user){
            return res.status(401).json({error:"Invalid Access Token"});
        }

        if(!user.emailVerified){
            return res.status(401).json({error:"Email not verified"},
            {message: "Please verify your email to access this resource"}
            );
        }
        req.user = user;
        next();
    }catch(error){
        console.error(error);
        return res.status(401).json({error:"Invalid Access Token"});
    }
}
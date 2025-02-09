import jwt from "jsonwebtoken";
import prisma from "../db/db.config.js";

export const verifyJWT = async(req,_, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");

        if(!token){
            return res.status(401).json({error:"Unauthorized request"});
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await prisma.user.findUnique(decodeToken?.id);

        if(!user){
            return res.status(401).json({error:"Invalid Access Token"});
        }
        req.user = user;
        next();
    }catch(error){
        console.error(error);
        return res.status(401).json({error:"Invalid Access Token"});
    }
}
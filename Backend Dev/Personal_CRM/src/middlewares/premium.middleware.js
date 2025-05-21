import prisma from "../db/db.config.js";

export const isSubscribed = async(req,res,next)=>{
    const userId = req.user.id;
    const stat = await prisma.subscription.findUnique({
        where:{
            userId
        }
    });
    if(!stat.status ||!["TRIALING","ACTIVE"].includes(stat.status) || stat.currentPeriodEnd<new Date()){
        return res.status(403).json({
            message:"Not a premium user, Subscription required"
        });
    }
    next();
}
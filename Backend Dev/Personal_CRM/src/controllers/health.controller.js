const healthRouter = async(req,res)=>{
    res.status(200).json({status:"ok",timestamp: new Date()});
}

export {healthRouter};
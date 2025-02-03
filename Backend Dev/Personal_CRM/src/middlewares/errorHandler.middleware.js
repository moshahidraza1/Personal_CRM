const errorHandler = (err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong",
        messge: process.env.NODE_ENV === "production"?null:err.messge
    });
};

export default errorHandler;
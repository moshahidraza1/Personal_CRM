import {validationResult} from 'express-validator';

const validateRequest = (validations)=>{
    return async (req,res,next)=>{
        for(let validation of validations){
            await validation.run(req);
        }
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({error:error.array()});
        }
        next();
};
};

export default validateRequest;
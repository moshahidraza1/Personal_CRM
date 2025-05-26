import { createClient } from "redis";
import { randomUUID } from "crypto";

export const redisClient = createClient({
    url:process.env.REDIS_URL || 'redis://localhost:6379'
});



export function slidingWindowRateLimiter({windowMs, max, keyPrefix = 'rl:'}){
    return async(req,res,next) =>{
        try {
            const key = keyPrefix + (req.user?.id || req.ip || 'anonymous');
            const now = Date.now();
            const windowStart = now-windowMs;
    
            // remove older queries outside the window
            await redisClient.zRemRangeByScore(key, 0, windowStart);
    
            // count request in window using zCard || zCount
            const reqCount = await redisClient.zCount(key, windowStart, now);
            
            
            // if reqCount is greater than maximim limit
            if(reqCount>= max){
                return res.status(429).json({
                    message: 'Too many request, Please retry after sometime.'
                });
            }
    
            // add request
            await redisClient.zAdd(key, [{score: now, value: `${now}:${crypto.randomUUID()}`}]);
            
            console.log(` [Rate Limit Status ] Key: ${key}, Count: ${reqCount+1}/${max}, windowMS: ${windowMs}`);

            // auto cleanup
            await redisClient.expire(key, Math.ceil(windowMs/1000));
    
            next();
        } catch (err) {
            console.error('Rate limiter error: ', err);
            return res.status(500).json({
                message: "Internal server error: Rate limiter failed"
            });
        }

    }
}
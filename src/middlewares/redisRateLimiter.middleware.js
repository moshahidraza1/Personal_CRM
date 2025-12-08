import { Redis } from '@upstash/redis'
import { randomUUID } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});



export function slidingWindowRateLimiter({windowMs, max, keyPrefix = 'rl:'}){
    return async(req,res,next) =>{
        try {
            const key = keyPrefix + (req.user?.id || req.ip || 'anonymous');
            const now = Date.now();
            const windowStart = now-windowMs;
            const member = `${now}:${randomUUID()}`; //unique member
            const ttl = Math.ceil(windowMs/1000);
            
            // to execute commands atomically
            const tx = redis.multi();
            // remove old entries
            tx.zremrangebyscore(key,0,windowStart);
            // adding a request
            tx.zadd(key, {score: now, member});
            // current count of requests
            tx.zcard(key);
            // expire keys after the window
            tx.expire(key,ttl);
            // execute transaction
            const results = await tx.exec();
            // current request count returned
            const requestCount = results[2];
            
            // if requestCount is greater than maximim limit
            if(requestCount > max){
                console.log(`[Rate Limit Exceeded]  Key: ${key}, Count: ${requestCount}/${max}`);

                return res.status(429).json({
                    message: 'Too many request, Please retry after sometime.'
                });
            }
            
            console.log(` [Rate Limit Status ] Key: ${key}, Count: ${requestCount+1}/${max}, windowMS: ${windowMs}`);
    
            next();

        } catch (err) {
            console.error('Rate limiter error: ', err);
            return res.status(500).json({
                message: "Internal server error: Rate limiter failed"
            });
        }

    }
}
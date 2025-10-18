import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60000, // 1 minute
    limit: 60, // limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-8', // 使用最新标准的限流头
    legacyHeaders: false, // 禁用旧版的 X-RateLimit-* 头
    message: {
        error: 'You have sent too manay requests in a given amount of time. Please try again later.'
    }
})

export default limiter;
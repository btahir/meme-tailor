import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Allow 5 meme generations per 10 minutes
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  analytics: true,
})

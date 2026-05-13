import rateLimit from 'express-rate-limit';

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP',
      message: 'Please try again after 15 minutes',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for POST/PUT/DELETE routes (data modification)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for write operations
  message: {
    error: 'Too many write requests from this IP',
    message: 'Please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Strict rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);
    res.status(429).json({
      error: 'Too many write requests from this IP',
      message: 'Please try again after 15 minutes',
      retryAfter: '15 minutes'
    });
  }
});

// API key rate limiter (if you implement API keys later)
export const apiKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for authenticated API users
  message: {
    error: 'API rate limit exceeded',
    message: 'Please upgrade your plan or try again later',
    retryAfter: '15 minutes'
  }
});

// Search-specific rate limiter (searches can be expensive)
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    error: 'Too many search requests',
    message: 'Please wait a moment before searching again',
    retryAfter: '1 minute'
  },
  handler: (req, res) => {
    console.log(`🔍 Search rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many search requests',
      message: 'Please wait a moment before searching again',
      retryAfter: '1 minute'
    });
  }
});
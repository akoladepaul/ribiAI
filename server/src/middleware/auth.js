import { verifyToken } from '../utils/jwt.js';

// Reads the httpOnly session cookie. Populates req.user when valid;
// otherwise leaves it undefined so route handlers can decide whether
// the endpoint requires auth or degrades gracefully for guests.
export const attachUser = (req, _res, next) => {
  const token = req.cookies?.zibi_token;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

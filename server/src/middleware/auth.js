import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Requires a valid Bearer token; attaches req.user */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const payload = jwt.verify(token, JWT_SECRET());
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

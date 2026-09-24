import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '30d' });

export const verifyToken = (token) => jwt.verify(token, SECRET);

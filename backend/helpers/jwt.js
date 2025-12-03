import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET_KEY = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
const REFRESH_TOKEN_SECRET_KEY = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET_KEY, { expiresIn: "15m" });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET_KEY, { expiresIn: "5d" });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET_KEY);
}

export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

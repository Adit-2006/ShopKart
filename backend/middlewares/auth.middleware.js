import jwt from 'jsonwebtoken';
import User from '../models/customer.models.js';

const authenticate = async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized, token not provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.secret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized, invalid or expired token" });
  }
};
export default authenticate;
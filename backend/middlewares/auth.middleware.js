import jwt from 'jsonwebtoken';
import User from '../models/customer.models.js';

const authenticate = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({message: "Unauthorized, token not provided."})
  }
  try {
    const decoded = jwt.verify(token, process.env.secret)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({message: "User not found"})
    }
    req.user = user
    next();
  }
  catch (err) {
    return res.status(403).json({message: "Forbidden invalid or expired token"})
  }
 
}
export default authenticate;
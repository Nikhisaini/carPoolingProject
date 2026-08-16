import jwt from "jsonwebtoken";
import User from "../model/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not provided",
      });
    }
    const toekn = authHeader.split(" ")[1];
    const decoded = jwt.verify(toekn, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("roleId", "name");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    console.log("AUTH USER ROLE:", req.user.roleId);
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
export default authMiddleware;

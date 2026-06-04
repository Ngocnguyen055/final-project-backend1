const jwt = require("jsonwebtoken");
require("dotenv").config();



function authMiddleware(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).send("Unauthorized: No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.userId = decoded.userId;
    next();
  } catch (error) {
    return response.status(401).send("Unauthorized: Invalid token");
  }
}

module.exports = { authMiddleware };

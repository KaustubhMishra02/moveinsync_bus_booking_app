const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/utils");

const HttpError = require("../models/http-error");

// module.exports = (req, res, next) => {
//   if (req.method === "OPTIONS") {
//     return next();
//   }
//   try {
//     console.log(req.headers);
//     const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
//     if (!token) {
//       throw new Error("Authentication failed!");
//     }
//     const decodedToken = jwt.verify(token, SECRET_KEY);
//     req.userData = { userId: decodedToken.userId };
//     console.log(decodedToken.userId);
//     next();
//   } catch (err) {
//     const error = new HttpError("Authentication failed22!", 403);
//     return next(error);
//   }
  module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(req.headers);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const token = authHeader.split(' ')[1]; // Extract token part after "Bearer "
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY); // Verify token using your secret key
      req.user = decoded; // Attach decoded user information to the request object
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };


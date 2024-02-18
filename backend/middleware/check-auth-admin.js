const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/utils");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, SECRET_KEY);
    req.userData = { userId: decodedToken.userId,admin: decodedToken.admin};
    if(decodedToken.admin) {
    next();
    }
  } catch (err) {
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};

import jwt from "jsonwebtoken";

export const createJWT = (user_id)=>{
    const token = jwt.sign({ userId: user_id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return token;
};

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({error:"Unauthorized"});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({error:"Unauthorized"});
      }
      req.user = user;
      next();
    });
  };
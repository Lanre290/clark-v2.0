import User from "../Models/User";

const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

const AuthMiddleware ={
    verifyToken: async (req: any, res: any, next: any) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ message: 'Unauthorized access.' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any;
    
        // Attach to request immediately
        req.user = decoded;

        const email = decoded?.email;
        if (!email) throw new Error();

        // Ensure user exists in DB
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(401).json({ message: 'User no longer exists.' });
        }

        next();
      },

      tokenRequired: async (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as any;
      req.user = decoded;

      const email = decoded?.email;
      if (!email) {
        return res.status(401).json({ success: false, error: "Unauthorized access." });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized access." });
      }
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }
  }

  next();
}
}
export default AuthMiddleware;
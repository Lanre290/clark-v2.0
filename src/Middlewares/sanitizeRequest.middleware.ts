import { Request, Response, NextFunction } from "express";

const dangerousKeys = ["__proto__", "prototype", "constructor"];


function stripDangerousKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripDangerousKeys);
  }

  if (typeof obj === "object" && obj !== null) {
    const clean: any = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (dangerousKeys.includes(key)) continue;
      clean[key] = stripDangerousKeys(obj[key]);
    }
    return clean;
  }

  return obj;
}

const sqlInjectionPattern = /('|--|;|\/\*|\*\/|\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|WHERE|OR|AND)\b)/i;

function logSuspiciousInput(val: any): void {
  const check = (input: any): boolean => {
    if (typeof input === "string" && sqlInjectionPattern.test(input)) return true;
    if (Array.isArray(input)) return input.some(check);
    if (typeof input === "object" && input !== null) return Object.values(input).some(check);
    return false;
  };

  if (check(val)) {
    console.warn("🚨 Possible SQL injection pattern detected:", val);
  }
}

// Main middleware
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  if (req.is("multipart/form-data")) return next();

  try {
    if (req.body && typeof req.body === "object") {
      req.body = stripDangerousKeys(req.body);
      logSuspiciousInput(req.body); // passive detection
    }
    next();
  } catch (err) {
    console.error("Sanitization error:", err);
    res.status(500).json({ message: "Invalid request body" });
  }
}

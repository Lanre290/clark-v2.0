import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";
import xss from "xss";

const dangerousKeys = ["__proto__", "prototype", "constructor"];

function sanitizeValue(value: any): any {
  if (typeof value === "string") {
    const clean = xss(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }));
    return clean.trim();
  } else if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  } else if (typeof value === "object" && value !== null) {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj: any): any {
  const sanitizedObj: any = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    if (dangerousKeys.includes(key)) continue;
    sanitizedObj[key] = sanitizeValue(obj[key]);
  }
  return sanitizedObj;
}

function sanitizeRequestBody(req: Request): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
}

const sqlInjectionPattern = /('|--|;|\/\*|\*\/|\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|WHERE|OR|AND)\b)/i;

function detectSQLInjection(req: Request): void {
  const check = (val: any): boolean => {
    if (typeof val === "string" && sqlInjectionPattern.test(val)) return true;
    if (Array.isArray(val)) return val.some(check);
    if (typeof val === "object" && val !== null)
      return Object.values(val).some(check);
    return false;
  };

  if (check(req.body)) {
    console.warn("Possible SQL injection detected:", req.body);
  }
}

export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  // Skip sanitization for multipart/form-data (e.g., file uploads)
  if (req.is("multipart/form-data")) return next();

  try {
    sanitizeRequestBody(req);
    detectSQLInjection(req);
    next(); // only call once
  } catch (err) {
    console.error("Sanitization error:", err);
    res.status(500).json({ message: "Invalid request body" });
  }
}

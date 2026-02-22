import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import { env } from "./env";


/** Consistent error shape used across all limiters. */
const buildMessage = (detail?: string) => ({
  success: false,
  error: detail ?? "Too many requests, please try again later.",
});

/**
 * Key generator for authenticated routes.
 * Uses the user's UUID as the counter key so every cashier on the same
 * network has their own independent limit.
 * Falls back to ipKeyGenerator (the express-rate-limit v8 helper that
 * correctly normalises IPv6 addresses) for any unauthenticated requests.
 */
const perUserKey = (req: Request): string =>
  (req as any).user?.id ?? ipKeyGenerator(req.ip ?? "0.0.0.0");

export const authLimiter = rateLimit({
  windowMs: env.rateLimitAuthWindow * 60 * 1000,
  max: env.rateLimitAuthMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage(
    "Too many authentication attempts. Please wait a moment and try again."
  ),
});

export const posLimiter = rateLimit({
  windowMs: env.rateLimitPosWindow * 60 * 1000,
  max: env.rateLimitPosMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: perUserKey,
  message: buildMessage(
    "POS request limit reached for your account. Please slow down."
  ),
});

export const productSearchLimiter = rateLimit({
  windowMs: env.rateLimitSearchWindow * 60 * 1000,
  max: env.rateLimitSearchMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: perUserKey,
  message: buildMessage("Product search limit reached. Please slow down."),
});

export const publicLimiter = rateLimit({
  windowMs: env.rateLimitPublicWindow * 60 * 1000,
  max: env.rateLimitPublicMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage(),
});

export const rateLimiter = publicLimiter;

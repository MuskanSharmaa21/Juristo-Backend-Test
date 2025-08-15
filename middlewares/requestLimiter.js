import User from "../models/User.js";
import moment from "moment";

// Define usage limits based on subscription plans
const LIMITS = {
  basic: {
    chat: { daily: 10 },
    imageChat: { daily: 5 },
    document: { monthly: 3 },
  },
  super: {
    chat: { daily: 50 },
    imageChat: { daily: 20 },
    document: { monthly: 10 },
  },
  advance: {
    chat: { daily: 200 },
    imageChat: { daily: 50 },
    document: { monthly: 30 },
  },
};

/**
 * Middleware to enforce rate limits and usage quotas
 */
export const requestLimitMiddleware = async (req, res, next) => {
  try {
    const { userId } = req.body || req.params; // Extract userId from body or params
    const endpointType = determineEndpointType(req); // Determine the type of request

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get user's subscription plan (default to 'free' if not set)
    const subscription = user.plan || "basic";
    if (!LIMITS[subscription]) {
      return res.status(400).json({ error: "Invalid subscription plan." });
    }

    // Check and reset counts if necessary
    await resetCountsIfNeeded(user, endpointType);

    // Check if user has exceeded the limit for the endpoint
    const limit = getLimit(subscription, endpointType);
    const currentCount = getCurrentCount(user, endpointType);

    if (currentCount >= limit) {
      return res.status(429).json({
        error: `You have reached the ${endpointType} limit for your ${subscription} plan. Please try again after the reset period.`,
      });
    }

    // Attach user to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Determine the type of endpoint being accessed
 * @param {Object} req - Express request object
 * @returns {string} - Endpoint type (chat, imageChat, document)
 */
const determineEndpointType = (req) => {
  const path = req.path.toLowerCase();
  if (path.includes("process-file") || path.includes("chat")) {
    return "imageChat";
  } else if (path.includes("questions") || path.includes("generate")) {
    return "document";
  } else {
    return "chat";
  }
};

/**
 * Get the limit for the given subscription and endpoint type
 * @param {string} subscription - User's subscription plan
 * @param {string} endpointType - Type of endpoint
 * @returns {number} - Limit for the endpoint
 */
const getLimit = (subscription, endpointType) => {
  const planLimits = LIMITS[subscription][endpointType];
  return planLimits ? planLimits.daily || planLimits.monthly || 0 : 0;
};

/**
 * Get the current count for the given endpoint type
 * @param {Object} user - User document
 * @param {string} endpointType - Type of endpoint
 * @returns {number} - Current count
 */
const getCurrentCount = (user, endpointType) => {
  switch (endpointType) {
    case "chat":
      return user.chatCount || 0;
    case "imageChat":
      return user.imageChatCount || 0;
    case "document":
      return user.draftCount || 0;
    default:
      return 0;
  }
};

/**
 * Reset counts if the reset period has passed
 * @param {Object} user - User document
 * @param {string} endpointType - Type of endpoint
 */
const resetCountsIfNeeded = async (user, endpointType) => {
  const lastReset = moment(user.requestCount.lastReset);
  const now = moment();

  // Determine reset period based on endpoint type
  let shouldReset = false;
  if (endpointType === "document") {
    // Monthly reset for document generation
    if (now.diff(lastReset, "months") >= 1) {
      shouldReset = true;
      user.draftCount = 0;
    }
  } else {
    // Daily reset for chat and imageChat
    if (now.diff(lastReset, "days") >= 1) {
      shouldReset = true;
      user.chatCount = 0;
      user.imageChatCount = 0;
    }
  }

  if (shouldReset) {
    user.requestCount.lastReset = now.toDate();
    await user.save();
  }
};
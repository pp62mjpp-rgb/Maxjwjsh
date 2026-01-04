// functions/api.js

const DEFAULT_RESPONSE_URL = "https://earnlinks.in/MGENo";
const MY_SECRET_PASSWORD = "Mx92gh44kL88pq2x";

// ---------------------------
// SERVER-SIDE STORAGE
// ---------------------------

// Queue of URLs waiting to be consumed
let urlQueue = [];

// Cooldown map: device IP → timestamp of last /go hit
let deviceCooldowns = {};

// Cooldown duration in milliseconds (5 minutes)
const COOLDOWN_MS = 5 * 60 * 1000;

exports.handler = async (event, context) => {
  const path = event.path;
  const queryParams = event.queryStringParameters || {};
  const deviceIP = event.headers["x-forwarded-for"] || event.headers["host"] || "unknown";

  // ---------------------------
  // /api endpoint → add new URL
  // ---------------------------
  if (path.includes("/api")) {
    const apiKey = queryParams.api;
    const targetURL = queryParams.url || "";

    // Only accept requests with correct secret
    if (apiKey === MY_SECRET_PASSWORD && targetURL.trim() !== "") {
      // Add to the queue
      urlQueue.push(targetURL);
    }

    // Always return success (silent)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: "success",
        shortenedUrl: DEFAULT_RESPONSE_URL,
        queueLength: urlQueue.length
      }),
    };
  }

  // ---------------------------
  // /go endpoint → redirect
  // ---------------------------
  if (path.includes("/go")) {
    const now = Date.now();

    // Check cooldown for this device
    const lastAccess = deviceCooldowns[deviceIP] || 0;
    if (now - lastAccess < COOLDOWN_MS) {
      // Still in cooldown → send default URL
      return {
        statusCode: 302,
        headers: {
          Location: DEFAULT_RESPONSE_URL,
          "Cache-Control": "no-cache"
        },
        body: null
      };
    }

    // Update last access
    deviceCooldowns[deviceIP] = now;

    // Get next URL from queue
    let nextURL = urlQueue.shift(); // removes first URL
    if (!nextURL) nextURL = DEFAULT_RESPONSE_URL;

    return {
      statusCode: 302,
      headers: {
        Location: nextURL,
        "Cache-Control": "no-cache"
      },
      body: null
    };
  }

  // ---------------------------
  // Default response
  // ---------------------------
  return { statusCode: 200, body: "System Active" };
};

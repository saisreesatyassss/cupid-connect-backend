// const admin = require("firebase-admin");
// const path = require("path");

// const serviceAccount = require("./config/firebaseAdmin.json");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// module.exports = admin;


const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.resolve(__dirname, "config", "firebaseAdmin.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

let cachedToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
  const currentTime = Math.floor(Date.now() / 1000);

  if (cachedToken && currentTime < tokenExpiry) {
    console.log("✅ Using cached token");
    return cachedToken;
  }

  console.log("🔄 Generating new token...");
  const token = await admin.credential.cert(serviceAccount).getAccessToken();

  cachedToken = token.access_token;
  tokenExpiry = currentTime + token.expires_in;

  return cachedToken;
};

module.exports = { admin, getAccessToken };

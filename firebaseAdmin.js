// // const admin = require("firebase-admin");
// // const path = require("path");

// // const serviceAccount = require("./config/firebaseAdmin.json");

// // if (!admin.apps.length) {
// //   admin.initializeApp({
// //     credential: admin.credential.cert(serviceAccount),
// //   });
// // }

// // module.exports = admin;


// const admin = require("firebase-admin");
// const path = require("path");

// // const serviceAccount = require(path.resolve(__dirname, "config", "firebaseAdmin.json"));
// const firebaseConfig = JSON.parse(
//   process.env.FIREBASE_ADMIN_CONFIG.replace(/\\n/g, '\n')
// );

// if (!admin.apps.length) {
//   admin.initializeApp({
//     // credential: admin.credential.cert(serviceAccount),
//     credential: admin.credential.cert(firebaseConfig)
//   });
// }

// let cachedToken = null;
// let tokenExpiry = 0;

// const getAccessToken = async () => {
//   const currentTime = Math.floor(Date.now() / 1000);

//   if (cachedToken && currentTime < tokenExpiry) {
//     console.log("✅ Using cached token");
//     return cachedToken;
//   }

//   console.log("🔄 Generating new token...");
//   const token = await admin.credential.cert(serviceAccount).getAccessToken();

//   cachedToken = token.access_token;
//   tokenExpiry = currentTime + token.expires_in;

//   return cachedToken;
// };

// module.exports = { admin, getAccessToken };



const admin = require('firebase-admin');
require('dotenv').config();

// Fix for multi-line private_key
const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix here
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
}

let cachedToken = null;
let tokenExpiry = 0;
const getAccessToken = async () => {
  const currentTime = Math.floor(Date.now() / 1000);

  // ✅ Use cached token if it's still valid
  if (cachedToken && currentTime < tokenExpiry) {
    console.log("✅ Using cached token");
    return cachedToken;
  }

  console.log("🔄 Generating new token...");

  try {
    // Generate new token using the same credential used to initialize the app
    const token = await admin.app().options.credential.getAccessToken();
    
    cachedToken = token.access_token;
    tokenExpiry = currentTime + token.expires_in;

    console.log("✅ New token generated");
    return cachedToken;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

module.exports = { admin, getAccessToken };

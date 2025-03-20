// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 8000;


// app.use(cors());

// app.options('*', cors());  
 
// app.use(bodyParser.json({ limit: '50mb' }));  
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
 
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB connection error:', err));

// // Routes
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const teamRoutes = require('./routes/teamRoutes');

 
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/team', teamRoutes);


// app.get('/', (req, res) => {
//   res.send('Server Working');
// });

// // Health Check Endpoint
// app.get('/health', async (req, res) => {
//   try {
//     // Check database connection
//     const dbStatus = mongoose.connection.readyState;
//     const dbState = {
//       0: 'disconnected',
//       1: 'connected',
//       2: 'connecting',
//       3: 'disconnecting',
//     };

//     const healthStatus = {
//       service: 'Cricket API',
//       uptime: process.uptime(), // API uptime in seconds
//       timestamp: new Date(),
//       database: dbState[dbStatus],
//       status: dbStatus === 1 ? 'healthy' : 'unhealthy',
//     };

//     // Return health status
//     const statusCode = dbStatus === 1 ? 200 : 500;
//     res.status(statusCode).json(healthStatus);
//   } catch (error) {
//     console.error('Health check error:', error);
//     res.status(500).json({
//       message: 'Health check failed',
//       error: error.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });



const express = require("express");
const cors = require("cors");
const admin = require("./firebaseAdmin");
const { getAccessToken } = require("./firebaseAdmin");
const axios = require("axios");
const app = express();
const PORT = 8000;
require('dotenv').config();

// Enable CORS (for cross-origin requests)
app.use(cors());
app.use(express.json());


console.log("FIREBASE_ADMIN_CONFIG:", process.env.FIREBASE_ADMIN_CONFIG ? "Loaded" : "Not Loaded");

app.get("/get-token", async (req, res) => {
  try {
    const token = await admin.credential.cert(require("./config/firebaseAdmin.json")).getAccessToken();

    res.json({
      accessToken: token.access_token,
      expiresIn: token.expires_in,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate access token" });
  }
});

app.get('/', (req, res) => {
  res.send('Server Working');
});





app.post("/send-notification", async (req, res) => {
  try {
    const { title, body, token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing FCM token" });
    }

    // Get the cached or new access token
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token,
        notification: {
          title,
          body,
        },
      },
    };

    // Send notification using Axios
    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/cupid-connect-d7fce/messages:send`,
      message,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Bearer token added here
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Notification sent successfully",
      response: response.data,
    });
  } catch (error) {
    console.error("Error sending notification:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send notification" });
  }
});








app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

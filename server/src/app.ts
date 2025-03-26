import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import { initServer, app } from "./server";
import path from "path";
import express from "express";
import fs from 'fs';
import { initializeSocket } from './socket';
import { ENV } from './env/env.config';


const isProduction = ENV.NODE_ENV === 'production';

let server: http.Server | https.Server;

if (isProduction) {
  const options = {
    key: fs.readFileSync('./client-key.pem'),
    cert: fs.readFileSync('./client-cert.pem')
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: ENV.BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


initServer().then(() => {
    app.use(express.static(path.join(__dirname, "../../web-final-project-client/dist")));
    
    initializeSocket(io);
    
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../web-final-project-client/dist/index.html"));
    });
    
    server.listen(ENV.PORT, () => {
        console.log(`✅ ${isProduction ? "HTTPS" : "HTTP"} Server listening on port ${ENV.PORT}`);
    });
  
  }).catch((error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  });


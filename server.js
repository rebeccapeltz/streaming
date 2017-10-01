const express = require("express");
const WebSocket = require('ws');

console.log("hello")
const server = express()
  .use((req, res) => {
    res.sendFile("/Users/peltzr/projects/streaming/index.html")
  })
  .listen(3000, () => {
    console.log(`Listening on ${ 3000 }`)
  });

const wss = new WebSocket.Server({
  server
});



wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);

/*
Server reads stream of filtered twitter data and relays a count, avg and time 
every second to its clients.
*/
'use strict';
const INDEX ="/Users/peltzr/projects/streaming/index.html";
let MAIN = "/Users/peltzr/projects/streaming/main.js";
const PORT = 3000;
const path = require('path');
const express = require("express");
const WebSocket = require('ws');
const moment = require('moment');


console.log(path.join(__dirname,'‌​node_modules'))
const server = express()
.use('/moment',express.static(__dirname + '/node_modules/moment'))
.use('/chart',express.static(__dirname + '/node_modules/chart.js/dist'))
.use('/chart-stream',express.static(__dirname + '/node_modules/chartjs-plugin-streaming/dist'))
.use('/ws',express.static(__dirname + '/node_modules/ws/lib'))
.get('/', function(req, res) {
  res.sendFile(INDEX);
})
.get('/index.html', function(req, res) {
  res.sendFile(INDEX);
})
.get('/main.js', function(req, res) {
  res.sendFile(MAIN);
})
.listen(PORT, () => console.log(`Listening on ${ PORT }`));

process.env.TWITTER_CONSUMER_KEY = "rWSg8E0Hqk8MzytaHJDgCNXRt";
process.env.TWITTER_CONSUMER_SECRET = "BRpKYXu362FOOG6hCoHiQ1qNtiAnJqQTv1uGyNTCuOvUXNQ4xs";
process.env.TWITTER_ACCESS_TOKEN_KEY = "34928160-YPb7tvcnWqz5TLGVN6SPKIbmpUZXOtkBvIyU7D3nU";
process.env.TWITTER_ACCESS_TOKEN_SECRET = "mTTAWKGFNQiMibspDe5rVEWFXDhVHE3JVbpFH1JZ5xRMv";

const Twitter = require('twitter');

let twitClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
let trackOption = 'Trump';


const wss = new WebSocket.Server({
  server
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

function getAvg(prevAvg, x, n)
{
  if (prevAvg === 0) return x;
  return (prevAvg*n + x)/(n+1);
}

let start = Date.now();
let next = start + 1000;
let total = 0;
let avg = 0;
let count = 0;
twitClient.stream('statuses/filter', {
  track: 'Trump'
}, function (stream) {
  stream.on('data', function (event) {
    // console.log(JSON.stringify(event))
    start = Date.now();
    count++;
    if (start > next) {
      wss.clients.forEach((client) => {
        total++;
        avg = getAvg(avg, count, total);
        // client.send(`count:${count} avg:${avg} date:${Date(start).toString()} text:` + (event && encodeURIComponent(event.text)));
        client.send(JSON.stringify({"count":count, "avg":avg, "date": moment(start).format()}));
        count = 0;
        
        console.log(event && event.text);
      });
      next = start + 1000;
    }
  });

  stream.on('error', function (error) {
    console.log("steam error", error);
    throw error;
  });
});

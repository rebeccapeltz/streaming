/*
Server reads stream of filtered twitter data and relays a count, avg and time 
every second to its clients.
*/
'use strict';
const INDEX = "index.html";
let MAIN = "main.js";
const PORT = process.env.PORT || 3000;
const path = require('path');
const express = require("express");
const WebSocket = require('ws');
const moment = require('moment');
var config;
if (!process.env){
  config = require('./config.js');
}



console.log(path.join(__dirname, '‌​node_modules'))
const server = express()
  .use('/moment', express.static(__dirname + '/node_modules/moment'))
  .use('/chart', express.static(__dirname + '/node_modules/chart.js/dist'))
  .use('/chart-stream', express.static(__dirname + '/node_modules/chartjs-plugin-streaming/dist'))
  .use('/ws', express.static(__dirname + '/node_modules/ws/lib'))
  .get('/', function (req, res) {
    res.sendFile(path.join(__dirname,  INDEX));
  })
  .get('/index.html', function (req, res) {
    res.sendFile(path.join(__dirname,  INDEX));
  })
  .get('/main.js', function (req, res) {
    res.sendFile(path.join(__dirname,  MAIN));
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

var consumerKey = process.env.TWITTER_CONSUMER_KEY || config.TWITTER_CONSUMER_KEY;
var consumerSecret = process.env.TWITTER_CONSUMER_SECRET || config.TWITTER_CONSUMER_SECRET;
var accessTokenKey = process.env.TWITTER_ACCESS_TOKEN_KEY || config.TWITTER_ACCESS_TOKEN_KEY;
var accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || config.TWITTER_ACCESS_TOKEN_SECRET;

const Twitter = require('twitter');

let twitClient = new Twitter({
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  access_token_key: accessTokenKey,
  access_token_secret: accessTokenSecret
});
let trackOption = 'Trump';


const wss = new WebSocket.Server({
  server
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

function getAvg(prevAvg, x, n) {
  if (prevAvg === 0) return x;
  return (prevAvg * n + x) / (n + 1);
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
        client.send(JSON.stringify({
          "count": count,
          "avg": avg,
          "date": moment(start).format()
        }));
        count = 0;

        console.log(event && event.text);
      });
      next = start + 1000;
    }
  });

  stream.on('error', function (error) {
    console.log("stream error", error);
    throw error;
  });
});
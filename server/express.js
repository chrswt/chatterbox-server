var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var fs = require('fs');



// Setup
var storagePath = './server/storage.json';
var app = express(); // actually creates HTTP server 
var storage = {"results": []};
var upload = multer(); // for parsing multipart/form-data

// Load stored content into memory
fs.readFile(storagePath, (err, data) => {
  storage = JSON.parse(data.toString());
});

app.use(function(req, res, next) { // passes to all request methods
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Routing
app.get('/classes/messages', function(req, res) { // 'next' parameter is like switch statement
  var status = 200;
  var tempStorage = {};
  tempStorage.results = storage.results.slice();
  if (req.query.order) {
    tempStorage.results.reverse();
  }

  res.setHeader('Last-Modified', (new Date()).toUTCString()); // get 304 without this line
  res.status(status).send(tempStorage); // don't have to stringify?
});

app.post('/classes/messages', function(req, res) {
  var status = 201;

  res.setHeader('Last-Modified', (new Date()).toUTCString()); // get 304 without this line
  var postReq = req.body;
  postReq.createdAt = new Date();
  storage.results.push(postReq);
  fs.writeFile(storagePath, JSON.stringify(storage), (err, data) => {
  });
  res.end();
});

app.listen(process.env.PORT);

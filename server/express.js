var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var mongodb = require('./mongodb');

// Setup
var app = express(); // creates HTTP server 
var upload = multer(); // for parsing multipart/form-data

app.use(function(req, res, next) { // return CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
// for parsing application/x-www-form-urlencoded

app.use(express.static('client'));

// Serve the HTML page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/../client/index.html'));
});

// Routing
app.get('/classes/messages', function(req, res) {
  var status = 200;

  var orderFlag = false;
  if (req.query.order) { // TODO take care of query parameters properly
    orderFlag = true;
  }

  mongodb.getMessages(function(tempStorage) {
    res.setHeader('Last-Modified', (new Date()).toUTCString()); // prevent 304
    res.status(status).send(tempStorage); 
  }, orderFlag);
});

app.post('/classes/messages', function(req, res) {
  var status = 201;

  res.setHeader('Last-Modified', (new Date()).toUTCString());
  var postReq = req.body;
  postReq.createdAt = new Date();
  mongodb.postMessage(postReq);
  res.end(JSON.stringify({}));
});

app.listen(process.env.PORT);

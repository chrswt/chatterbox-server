var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer'); // v1.0.5
var mongodb = require('./mongodb');

// Setup
var app = express(); // actually creates HTTP server 
var upload = multer(); // for parsing multipart/form-data

app.use(function(req, res, next) { // passes to all request methods
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('client'));

// Serve the HTML page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/../client/index.html'));
});

// Routing
app.get('/classes/messages', function(req, res) { // 'next' parameter is like switch statement
  var status = 200;
  var orderFlag = false;
  if (req.query.order) { // TODO take care of query parameters properly
    orderFlag = true;
  }

  mongodb.getMessages(function(tempStorage) {
    res.setHeader('Last-Modified', (new Date()).toUTCString()); // get 304 without this line
    res.status(status).send(tempStorage); // don't have to stringify?
  }, orderFlag);
});

app.post('/classes/messages', function(req, res) {
  var status = 201;

  res.setHeader('Last-Modified', (new Date()).toUTCString()); // get 304 without this line
  var postReq = req.body;
  postReq.createdAt = new Date();
  mongodb.postMessage(postReq);
  res.end(JSON.stringify({}));
});

app.listen(process.env.PORT);

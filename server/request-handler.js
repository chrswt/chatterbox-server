/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var fs = require('fs');
var storage = {"results": []};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var handleGetRequest = function(request, response) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.statusCode = 200;
  response.writeHead(response.statusCode, headers);

  fs.readFile('./storage.json', (err, data) => { // TODO if there is no file, create it dynamically
    if (err) {
      throw err;
    } else {
      storage = JSON.parse(data);
    }
  });
  
  response.end(JSON.stringify(storage));
  // Weird observations
  // 1) response.write has some kind of ending mechanism under certain conditions. No error is thrown in live server integration tests
  // 2) Being inside of fs.readFile callback prevented the response code from being written
};

var handlePostRequest = function(request, response) {

  if (!storage.results) {
    fs.readFile('./storage.json', (err, data) => { // TODO if there is no file, create it dynamically
      if (err) {
        throw err;
      } else {
        storage = JSON.parse(data);
      }
    }); 
  }

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.writeHead(201, headers);

  request.on('data', function(data) {
    storage.results.push(JSON.parse(data));
  });

  fs.writeFile('./storage.json', JSON.stringify(storage), (err, data) => {
    if (err) {
      throw err;
    }
  });

  response.end();
};


module.exports = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  // var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'text/plain';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  
  var url = request.url.split('/').slice(1);
  if (url[0] !== 'classes' || url[1] !== 'messages') {
    response.writeHead(404, headers);
    console.log('Wrong endpoint: ' + request.url);
    response.end(); // End the request
  }

  if (request.method === 'GET') {
    handleGetRequest(request, response);
  } else if (request.method === 'POST') {
    handlePostRequest(request, response);
  }
};

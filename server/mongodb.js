var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://heroku_np1v0g2w:hackreactor1@ds049446.mlab.com:49446/heroku_np1v0g2w';

var postMessage = function(msgObject) {
  MongoClient.connect(url, function(err, db) {
    var messages = db.collection('messages');

    messages.insertOne(msgObject, function(err, result) {
      console.log('Successfully inserted ' + JSON.stringify(result) + ' into the Database.');
    });

    db.close();
  });
};

var getMessages = function(callback, orderFlag) {
  var tempStorage = {"results": []};
  MongoClient.connect(url, function(err, db) {
    var messages = db.collection('messages');
    if (orderFlag) {
      messages.find().sort({ createdAt: -1 }).toArray(function(err, result) { // TODO can also pass in sorting config directly from client
        tempStorage.results = result;
        callback(tempStorage);
      });
    } else {
      messages.find().toArray(function(err, result) { // TODO can also pass in sorting config directly from client
        tempStorage.results = result;
        callback(tempStorage);
      });
    }

    db.close();
  });
};

module.exports.getMessages = getMessages;
module.exports.postMessage = postMessage;
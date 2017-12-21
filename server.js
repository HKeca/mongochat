// Create mongo instance
const mongo = require('mongodb').MongoClient;
// Create socket instance and start listening on port 4000
const io = require('socket.io').listen(4000).sockets;

// Connect to mongodb
mongo.connect('mongodb://127.0.0.1/chat', function(err, db) {
  if (err) {
    throw err;
  }

  console.log("Connected to mongo database");

  // Connect to socket io
  io.on('connection', function(socket) {
    let chat = db.collection('chats');

    // send status
    sendStatus = function(s) {
      socket.emit('status', s);
    }

    // Get chats from mongo db
    chat.find().limit(150).sort({_id: 1}).toArray(function(err, res) {
      if (err) {
        throw err;
      }

      // Emit messages
      socket.emit('messages', res);
    });// End of db query

    socket.on('input', function(data) {
      let name = data.name;
      let message = data.message;

      // Check for name and messages
      if (name === '' || message === '') {
          // Send error status
          sendStatus('Please enter a name and message');
      }
      else {
        // Insert message to db
        chat.insert({name: name, message: message}, function() {
          io.emit('messages', [data]);

          // Send status obj
          sendStatus({
            message: 'Message Sent',
            clear: true
          });
        });
      }
    }); // End of socket input

    // Handle clearing chat
    socket.on('clear', function(data) {
      chat.remove({}, function() {
        // let client know that its cleared
        socket.emit('cleared');
      });
    }); // End of Handle clear
  });
});

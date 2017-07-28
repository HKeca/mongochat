(function() {
  var element = function(id) {
    return document.getElementById(id);
  }

  var status      = element('status');
  var messages    = element('messages');
  var userInput   = element('userinput');
  var username    = element('username');
  var clearBtn    = element('clear');

  // Set default status
  var statusDefault = status.textContent;

  // Set status
  var setStatus = function(s) {
    status.textContent = s;

    if (s !== statusDefault) {
      var delay = setTimeout(function (){
        setStatus(statusDefault);
      }, 2000);
    }
  }

  var socket = io.connect('http://192.168.1.15:4000');

  // Check for connection
  if (socket !== undefined) {
    console.log("connected!");

    // Get response from server
    socket.on('messages', function(data) {
      if (data.length) {
        // Build out messages div
        for (var x = 0; x < data.length; x++) {
            var message = document.createElement('div');
            message.textContent = data[x].name + ": " + data[x].message;
            messages.appendChild(message);
        }
      }
    });// End of messages listen

    socket.on('status', function(data) {
      // Get status
      setStatus((typeof data === 'object') ? data.message : data);

      // If the input should clear
      if (data.clear === true) {
        userInput.value = "";
      }
    });// End of status listen

    userInput.addEventListener('keydown', function(event) {
        if (event.which === 13 && event.shiftKey == false) {
          // Emit to server
          socket.emit('input', {
            name: username.value,
            message: userInput.value
          });

          event.preventDefault();
        }
    }); // end of event listener

    // Detect button click
    clearBtn.addEventListener('click', function() {
      socket.emit('clear');
    });

    // Clear Messages
    socket.on('cleared', function() {
      setStatus('Messages Cleared');
      messages.textContent = "";
    })
  }
})();

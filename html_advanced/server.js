// SSL Certificates
var fs = require('fs');

var options = {key:  fs.readFileSync('../certs/privatekey.pem').toString(),
			   cert: fs.readFileSync('../certs/certificate.pem').toString(),
			   ca:   [fs.readFileSync('../certs/certrequest.csr').toString()]}

// P2P Stuff
var server = require('https').createServer(options).listen(8001);
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({server: server})

// Maximum number of connection to manage simultaneously before start clossing
var MAX_SOCKETS = 1024

//Array to store connections
wss.sockets = []

wss.on('connection', function(socket)
{
    socket._emit = function()
    {
        var args = Array.prototype.slice.call(arguments, 0);

        socket.send(JSON.stringify(args), function(error)
        {
            if(error)
                console.log(error);
        });
    }

    // Message received
    socket.onmessage = function(message)
    {
        var args = JSON.parse(message.data)

        var eventName = args[0]
        var socketId  = args[1]

        var soc = wss.sockets[socketId]
        if(soc)
        {
            args[1] = socket.id

            soc._emit.apply(soc, args);
        }
        else
        {
            socket._emit(eventName+'.error', socketId);
            console.warn(eventName+': '+socket.id+' -> '+socketId);
        }
    }

    socket.onclose = function()
    {
        wss.sockets.splice(wss.sockets.IndexOf(socket), 1)
    }

    // Close the oldest socket if we are managing too much (we earn memory,
    // peer doesn't have to manage too much open connections and increage arity
    // of the network forcing new peers to use other ones)
    if(wss.sockets.length >= MAX_SOCKETS)
        wss.sockets[0].close()

    // Start managing the new socket
    socket.id = id()
    wss.sockets.push(socket)

    socket._emit('sessionId', socket.id)
    console.log("Connected socket.id: "+socket.id)
})

// generate a 4 digit hex code randomly
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// make a REALLY COMPLICATED AND RANDOM id, kudos to dennis
function id() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
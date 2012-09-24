function Protocol_init(transport, onsuccess)
{
    transport.onopen = function()
    {
	    var protocol = {}

        EventTarget.call(protocol)

        // Compose and send message
	    protocol.emit = function()
	    {
	        var args = Array.prototype.slice.call(arguments, 0);

	        transport.send(JSON.stringify(args), function(error)
	        {
	            if(error)
	                console.warning(error);
	        });
	    }

	    // Message received
	    transport.onmessage = function(message)
	    {
	        console.log("protocol.onmessage = '"+message.data+"'")

            message = JSON.parse(message.data)
            var event = {'type': message[0], 'data': message.slice(1)}

            protocol.dispatchEvent(event)
	    }

	    if(onsuccess)
	        onsuccess(protocol);
    }
}
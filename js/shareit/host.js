// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536

// Holds the STUN server to use for PeerConnections.
var STUN_SERVER = "STUN stun.l.google.com:19302";


function Host(db, signaling)
{
    EventTarget.call(this)

    var self = this

	this._transferbegin = function(file)
	{
	    // Get the channel of one of the peers that have the file from its hash.
	    // Since the hash and the tracker system are currently not implemented we'll
	    // get just the channel of the peer where we got the file that we added
	    // ad-hoc before
	    function getChannel(file)
	    {
	        return file.channel
	    }

	    // Calc number of necesary chunks to download
	    var chunks = file.size/chunksize;
	    if(chunks % 1 != 0)
	        chunks = Math.floor(chunks) + 1;

	    // Add a blob container and a bitmap to our file stub
	    file.blob = new Blob([''], {"type": file.type})
	    file.bitmap = Bitmap(chunks)

	    // Insert new "file" inside IndexedDB
	    db.sharepoints_add(file,
	    function()
	    {
	        self.dispatchEvent({type:"transfer.begin", data:file})
	        console.log("Transfer begin: '"+file.name+"' = "+JSON.stringify(file))

	        // Demand data from the begining of the file
	        getChannel(file).emit('transfer.query', file.name,
	                                                getRandom(file.bitmap))
	    },
	    function(errorCode)
	    {
	        console.error("Transfer begin: '"+file.name+"' is already in database.")
	    })
	}

    this._peers = {}

    function processOffer(pc, sdp, socketId)
    {
        pc.setRemoteDescription(pc.SDP_OFFER, new SessionDescription(sdp));

        // Send answer
        var answer = pc.createAnswer(pc.remoteDescription.toSdp());

        signaling.emit("answer", socketId, answer.toSdp());

        pc.setLocalDescription(pc.SDP_ANSWER, answer);
    }

    function createPeerConnection()
    {
        var pc = new PeerConnection(STUN_SERVER, function(){});
        this._peers[uid] = pc

        return pc
    }

    function initDataChannel(pc, channel)
    {
        Transport_init(channel, function(channel)
        {
            pc._channel = channel

            Transport_Peer_init(channel, db, host)

            if(onsuccess)
                onsuccess(channel)
        })
    }

    signaling.addEventListener('connectTo', function(socketId, sdp)
    {
        // Search the peer between the list of currently connected peers
        var pc = host._peers[uid]

        // Peer is not connected, create a new channel
        if(!pc)
        {
            pc = createPeerConnection();
            pc.ondatachannel = function(event)
            {
                initDataChannel(pc, event.channel)
            }
        }

    processOffer(pc, sdp, socketId)
    })

    signaling.addEventListener('offer', function(socketId, sdp)
    {
        // Search the peer between the list of currently connected peers
        var pc = host._peers[socketId];

        processOffer(pc, sdp, socketId)
    })

    signaling.addEventListener('answer', function(socketId, sdp)
    {
        // Search the peer between the list of currently connected peers
        var pc = host._peers[socketId];

        pc.setRemoteDescription(pc.SDP_ANSWER, new SessionDescription(sdp));
    })

	this.connectTo = function(uid, onsuccess, onerror)
	{
	    // Search the peer between the list of currently connected peers
	    var peer = this._peers[uid]

        // Peer is not connected, create a new channel
	    if(!peer)
	    {
		    // Create PeerConnection
		    var pc = createPeerConnection();
			    pc.open = function()
			    {
			        initDataChannel(pc, pc.createDataChannel())
		        }
                pc.onerror = function()
                {
                    if(onerror)
                        onerror()
                }

            // Send offer to new PeerConnection
            var offer = pc.createOffer();

            signaling.emit("connectTo", uid, offer.toSdp());

            pc.setLocalDescription(pc.SDP_OFFER, offer);
        }

        // Peer is connected and we have defined an 'onsucess' callback
        else if(onsuccess)
            onsuccess(peer._channel)
	}
}
function load()
{
    // Init database
    DB_init(function(db)
    {
        // Init user interface
        var ui = new UI(db)

        // Init hasher
        var hasher = new Hasher(db)
            hasher.onhashed = function(fileentry)
            {
                db.files_put(fileentry)

	            db.files_getAll(null, function(files)
	            {
	                ui.update_fileslist_sharing(files)
	            })
            }

        ui.setHasher(hasher, db)

        // Init PeersManager
        var peersManager = new PeersManager(db)

        ui.setPeersManager(peersManager, db)

        // Show files being shared on Sharing tab
        db.files_getAll(null, function(filelist)
        {
            ui.update_fileslist_sharing(filelist)
        })

        // Create signaling connection
        var UUIDv4 = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}

//        Signaling_SIP({'outbound_proxy_set': 'ws://tryit.jssip.net:10080',
//        Signaling_SIP({'outbound_proxy_set': 'ws://192.168.1.33:10080',
//                       'uri':                UUIDv4()+'@192.168.1.33'},
        Signaling_XMPP({'httpbase': 'https://dukgo.com',

                        // Connection mandatory parameters
                        'domain': '',
                        'username': UUIDv4(),
                        'resource': '',
                        'password': '',

                        // Connection optional parameters
                        'register': true,
//                        'host': '',
//                        'port': 80,
//                        'secure': true,
//                        'authhost': true,
//                        'authtype': true
                        },
        function(signaling)
        {
            signaling.onoffer = function(socketId, sdp)
            {
                // Search the peer between the list of currently connected peers
                var pc = peersManager.getPeer(socketId)

                // Peer is not connected, create a new channel
                if(!pc)
                    pc = peersManager.createPeer(socketId);

                // Process offer
                pc.setRemoteDescription(new RTCSessionDescription({sdp: sdp,
                                                                   type: 'offer'}));

                // Send answer
                pc.createAnswer(function(answer)
                {
                    signaling.emit("answer", socketId, answer.sdp)

                    pc.setLocalDescription(new RTCSessionDescription({sdp: answer.sdp,
                                                                      type: 'answer'}))
                });
            }

            signaling.onanswer = function(socketId, sdp)
            {
                // Search the peer on the list of currently connected peers
                var pc = peersManager.getPeer(socketId)
                if(pc)
                    pc.setRemoteDescription(new RTCSessionDescription({sdp: sdp,
                                                                       type: 'answer'}))
                else
                    console.error("[signaling.answer] PeerConnection '" + socketId +
                                  "' not found");
            }

//            // Restart downloads
//            db.files_getAll(null, function(filelist)
//            {
//                for(var i=0, fileentry; fileentry=filelist[i]; i++)
//                    if(fileentry.bitmap)
//                    {
//                        var channel = peersManager.getChannel(fileentry)
//                        channel.emit('transfer.query', fileentry.hash,
//                                                       getRandom(fileentry.bitmap))
//                    }
//            })

            peersManager.setSignaling(signaling)

            ui.setSignaling(signaling)
        })
    })
}


window.addEventListener("DOMContentLoaded", function()
//window.addEventListener("load", function()
{
	var cm = new CompatibilityManager()

	// DataChannel polyfill
    switch(DCPF_install("wss://datachannel-polyfill.nodejitsu.com"))
    {
		case "old browser":
			cm.addError("DataChannel", "Your browser doesn't support PeerConnection"+
									   " so ShareIt! can't work.")
	        break

		case "polyfill":
	        cm.addWarning("DataChannel", "Your browser doesn't support DataChannels"+
	        						  	 " natively, so file transfers performance "+
	        						  	 "would be affected or not work at all.")
    }

	// Filereader support (be able to host files from the filesystem)
	if(typeof FileReader == "undefined")
		cm.addWarning("FileReader", "Your browser doesn't support FileReader "+
									"so it can't work as a host.")

    // Check for IndexedDB support and if it store File objects
	testIDBBlobSupport(function(supported)
	{
	    if(!supported)
	    {
	    	cm.addWarning("IndexedDB", "Your browser doesn't support storing "+
	    							   "File or Blob objects. Data will not "+
	    							   "persists between each time you run the"+
	    							   " webapp.")

	       IdbJS_install();
	    }


		// Show alert if browser requeriments are not meet
	    cm.show()

	    // Start loading the webapp
		load()
	})
})

function load()
{
    // Init database
    DB_init(function(db)
    {
        // Init PeersManager
        var peersManager = new PeersManager(db)

        // Init hasher
        var hasher = new Hasher(db, policy)
            hasher.onhashed  = function(fileentry)
            {
                // Notify the other peers about the new hashed file
                peersManager._send_file_added(fileentry)
            }
            hasher.ondeleted = function(fileentry)
            {
                // Notify the other peers about the deleted file
                peersManager._send_file_deleted(fileentry)
            }

        // Init handshake manager
        var handshake = new HandshakeManager('../../json/handshake.json')
            handshake.onoffer = function(uid, sdp)
            {
                var pc = peersManager.onoffer(uid, sdp, function(uid, event)
                {
                    console.error("Error creating DataChannel with peer "+uid);
                    console.error(event);
                })

                // Send answer
                pc.createAnswer(function(answer)
                {
                    handshake.sendAnswer(uid, answer.sdp)

                    pc.setLocalDescription(new RTCSessionDescription({sdp:  answer.sdp,
                                                                      type: 'answer'}))
                });
            }
            handshake.onanswer = function(uid, sdp)
            {
                peersManager.onanswer(uid, sdp, function(uid)
                {
                    console.error("[handshake.answer] PeerConnection '" + uid +
                                  "' not found");
                })
            }
            handshake.onsynapse = function(uid)
            {
                peersManager.connectTo(uid, function(channel)
                {
                    handshake.pending_synapses--

                    if(handshake.pending_synapses == 0)
                       handshake.close()
                },
                function(uid, peer, channel)
                {
                    console.error(uid, peer, channel)
                })
            }
            handshake.onerror = function()
            {
                if(!peersManager.numPeers())
                {
                    console.warn("You are not connected to any peer")
                    alert("You are not connected to any peer")
                }
            }
//            handshake.onopen = function()
//            {
//                // Restart downloads
//                db.files_getAll(null, function(filelist)
//                {
//                    if(filelist.length)
//                        policy(function()
//                        {
//                            for(var i=0, fileentry; fileentry=filelist[i]; i++)
//                                if(fileentry.bitmap)
//                                    peersManager.transfer_query(fileentry)
//                        })
//                })
//            }

        peersManager.setHandshake(handshake)

        // Init user interface
        var ui = new UI(db)
            ui.setHasher(hasher)
            ui.setPeersManager(peersManager)
            ui.setHandshake(handshake)
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
function load()
{
    // Init database
    DB_init(function(db)
    {
        // Init user interface
        var ui = new UI(db)

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

//        Signaling_Original('ws://localhost:8001',
//        Signaling_Original('wss://shareit.nodejitsu.com', function(signaling)
//        Signaling_SIP('ws://tryit.jssip.net:10080', function(signaling)
        Signaling_SIP('ws://localhost:5080', function(signaling)
        {
            var peersManager = new PeersManager(signaling, db)

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

            ui.setPeersManager(peersManager, db)

            db.files_getAll(null, function(filelist)
            {
                ui.update_fileslist_sharing(filelist)

//                // Restart downloads
//                for(var i=0, fileentry; fileentry=filelist[i]; i++)
//                    if(fileentry.bitmap)
//                    {
//                        var channel = peersManager.getChannel(fileentry)
//                        channel.emit('transfer.query', fileentry.hash,
//                                                       getRandom(fileentry.bitmap))
//                    }
            })

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

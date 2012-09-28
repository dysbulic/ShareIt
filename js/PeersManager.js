function PeersManager()
{
    var peers = {}

    this.connectTo = function(uid, onsuccess, onerror)
    {
        // Search the peer between the list of currently connected peers
        var peer = peers[uid]

        // Peer is not connected, create a new channel
        if(!peer)
        {
            // Create PeerConnection
            var pc = _createPeerConnection();
                pc.open = function()
                {
                    _initDataChannel(pc, pc.createDataChannel())
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

    this.getPeer(socketId)
    {
        return peers[socketId]
    }
}
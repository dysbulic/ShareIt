# ShareIt! - Pure Javascript Peer to Peer filesharing

Jesús Leganés Combarro "Piranna" - [piranna@gmail.com]

Based on code from Rich Jones - rich@[gun.io](http://gun.io)

ShareIt! is a "Peer to Peer" filesharing system written in pure Javascript and
based on the [DirtyShare](https://github.com/Miserlou/DirtyShare)
proof-of-concept by Rich Jones.

This project is also candidate for the [Universitary Free Software Championship]
(http://www.concursosoftwarelibre.org/1213/).

If you will fork the project (and more if you want to do modifications) please
send me an email to let me know :-)

## About

File transfers in ShareIt! happen between peers transfered directly thanks to
WebRTC PeerConnection [DataChannels]
(http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcdatachannel) or on old
browsers through a [DataChannel polyfill]
(https://github.com/piranna/DataChannel-polyfill). This makes it perfect for
anonymity.

Let's make a purely browser based, ad-free, Free and Open Source private and
anonymous distributed filesharing system!

## Mailing List

If you'd like to discuss P2P web applications further, send an email to 

> webp2p@librelist.com

and you'll be part of the discussion mailing list! ([Archives here]
(http://librelist.com/browser/webp2p/)).

## How to test it

The webapp is designed to be fully client side, so files can be served by any
static web server or web hosting. If you have Python installed they can be
served directly from the project folder using

> python -m SimpleHTTPServer 8000

so the webapp will be available on [localhost:8000](http://localhost:8000). You
can also host it on [DropBox](https://www.dropbox.com/help/201/en) if desired.
It is currently publicly hosted on

* [5Apps]  (https://5apps.com/demos/piranna/shareit)
* [DropBox](https://dl-web.dropbox.com/spa/je1wmwnmw0lbae2/ShareIt!/index.html)
* [GitHub] (http://piranna.github.com/ShareIt)

The peer connections are managed by an external signaling channel. Currently is
using [SimpleSignaling](https://github.com/piranna/SimpleSignaling) and a test
server hosted on Nodejitsu, but it's being researched to use some more standard
signaling protocols like SIP or XMPP in an anonimous way so could be droped this
single-point-of-failure.

Regarding to the browser, it's recomended to use a high edge one. Test are being
done on Chromium v24 at this moment. Because the IndexedDB is common accesed by
all the browser tabs, to test it locally on the same machine instead of with two
computers/browsers/virtual machines you can do it with Firefox launching two
instances each one with it's own profile. You can be able to do it with
'firefox -P -no-remote' to show the Firefox ProfileManager and force to create a
new full instance instead of open a new browser on the current running up.

## TODO

* Send as little data as possible.
* Find the optimal size for chunking. Currently set at 64Kb - this is arbitrary.
* Security, of any kind.
* Drag and drop of files, so my roommate shuts up about it.

## License

All this code is under the Affero GNU General Public License. Regarding to the
core of the application at js/webp2p (that I'll distribute as an independent
library/framework some date in the future) I am willing to relicense it under
the BSD/MIT/Apache license, I simply ask that you email me and tell me why. I'll
almost certainly agree.

Patches graciously accepted!

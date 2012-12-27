# ShareIt! - Pure Javascript Peer to Peer filesharing

# How to collaborate

The code is splited in several folders in a highly agressive hierarchical way.
This is done to easily identify the purposse of each file in a similar way
namespaces is done in other languages (maybe it would be a good idea to use
_real_ namespaces?). Also, (almost) each folder has an index.js file inspired by
the ones from Node.js modules or Python packages (__init__.py). Use them as
entry point when starting to read the code.

The first file that you should start reading and where "all the magin begins" is
js/index.js, that manages to do the compatibility checks and initializes the
webp2p library. For the html files, the entry point is index.html on the source
root, that does some javascript tricks to detect the current platform and makes
a redirection the platform specific index.html file.

The purpose of each folder is:

* css: styles common to all platforms and for the filemanagers
* daemon: headless client developed on Node.js (work in progress)
* doc: random documentation files, both of ShareIt! arquitecture and externals
* html_basic: basic interface to transfer files (deprecated)
* js: ShareIt! common Javascript files
* js/webp2p: ShareIt! core and implementation of the webp2p protocol.
             This eventually will become an independent project in the future.
* json: configuration files in JSON format (currently only handshake servers)
* platform: platform specific files. Each subfolder holds one of them and has a
            similar folders hierarchy that the project root.
* test images: images and files used for testing and demostration purposes.
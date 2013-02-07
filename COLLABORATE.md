# ShareIt! - Pure Javascript Peer to Peer filesharing

## How to collaborate

The code is splited in several folders in a highly agressive hierarchical way.
This is done to easily identify the purposse of each file in a similar way
namespaces is done in other languages (maybe it would be a good idea to use
_real_ namespaces?). Also, (almost) each folder has an index.js file inspired by
the ones from Node.js modules or Python packages (__init__.py). Use them as
entry point when starting to read the code.

The first file that you should start reading and where "all the magic begins" is
js/index.js, that manages to do the compatibility checks and initializes the
webp2p library. For the html files, the entry point is index.html on the source
root, that does some javascript tricks to detect the current platform and makes
a redirection the platform specific index.html file.


## Folders hierarchy

The purpose of each folder is:

* css: styles common to all platforms and from external libraries (filemanagers)
* daemon: headless client developed on Node.js (work in progress).
* doc: random documentation files, both of ShareIt! arquitecture and externals.
* html_basic: basic interface to transfer files (deprecated).
* images: images used on the application.
* js: ShareIt! common Javascript files
* js/polyfills: shims to add compatibility with old browsers. This folder should
                be remoded in the future.
* js/ui: user interface widgets code.
* js/webp2p: ShareIt! core and implementation of the webp2p protocol.
             This eventually will become an independent project in the future.
* json: configuration files in JSON format (currently only handshake servers)
* lib: local copies of external libraries, required by FirefoxOS policies and
       also to make AppCache to work correctly
* test images: images and files used for testing and demostration purposes.


## Code style

The code style is event and callbacks oriented, and developed in a way to use
closures extensively to reduce the necesity to check flags and global variables
to the minimum necesary. Also, this would lead to only enable some methods and
attributes when they make sense to be available to being used, reducing the
memory footprint both for don't create useless objects and also being garbage
collected faster because having less references to them.

The styleguide is based and inspired on the BSD C code style and Python PEP8
instead of more traditionals Kernigan & Richie C style or Closure style to
increase readibility giving more vertical whitespace, although maintaining some
good Javascript idioms. This rules includes:

* open blocks on new line (also for objects and lists)
* using two spaces for indentation
* no space between function name and parenthesis (this include 'if' and 'for'
  statements)
* lines should not be longer than 80 characters. Period.
* no empty line at end of document
* no lines with only spaces or tabs
* no spaces of tabs at the end of a line
* all functions, classes and events will be commented in JsDoc, with no space
  between the JsDoc and its element
* at least one empty line between fragments of code with different purposses,
  also inside a function

External libs and polyfills are not required to follow this styleguide.

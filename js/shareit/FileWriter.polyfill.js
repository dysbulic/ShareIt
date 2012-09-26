// FileWriter polyfill based on code from idb.filesystem.js by Eric Bidelman

/**
 * Interface to writing a Blob/File.
 *
 * Modeled from:
 * dev.w3.org/2009/dap/file-system/file-writer.html#the-filewriter-interface
 *
 * @param {FileEntry} fileEntry The FileEntry associated with this writer.
 * @constructor
 */
function FileWriter(fileEntry)
{
  var position_ = 0;
  var length_ = 0;
  var fileEntry_ = fileEntry;

  this.__defineGetter__('position', function()
  {
    return position_;
  });

  this.__defineGetter__('length', function()
  {
    return length_;
  });

  this.write = function(blob)
  {
    if(!blob)
      throw Error('Expected blob argument to write.');

    // Set the blob we're writing on this file entry so we can recall it later.
    fileEntry_.file_.blob_ = blob;

    // Call onwritestart if it was defined.
    if(this.onwritestart)
      this.onwritestart();

    // TODO: not handling onprogress, onwrite, onabort. Throw an error if
    // they're defined.

    var self = this;
    idb_.put(fileEntry_, function(entry)
    {
      if(self.onwriteend)
      {
        // Set writer.position == write.length.
        position_ = entry.file_.size;
        length_ = position_;
        self.onwriteend();
      }
    }, this.onerror);
  };
}

FileWriter.prototype =
{
  seek: function(offset)
  {
    this.position_ = offset

    if(this.position_ > this.length_)
      this.position_ = this.length_
    else if(this.position_ < 0)
      this.position_ += this.length_

    if(this.position_ < 0)
      this.position_ = 0
  },
  truncate: function(size)
  {
    var blob;

    if(size < this.length_)
      blob = this.fileEntry_.file_.blob_.slice(size)
    else
      blob = new Blob([this.fileEntry_.file_.blob_,
                       ArrayBuffer(size - this.length_)])

    this.write(blob)
  }
}
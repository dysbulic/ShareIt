If a file is smaller than the lenght of the hash, it's content is used directly
as it for identification purposses. This has the advantage that the content of
the file can be fetched directly from the hash field so it's not required to do
a new request over the network to achieve it.

bencoding for JS (node.js)
====

This is a small library to encode and decode bencoded (bittorrent) 
Encoding is as follows:

    var benc  = require("bencode"),
        exmp = {}
 
    exmp.bla = "blup"
    exmp.foo = "bar"
    exmp.one = 1
    exmp.woah = {}
    exmp.woah.arr = []
    exmp.woah.arr.push(1)
    exmp.woah.arr.push(2)
    exmp.woah.arr.push(3)
    exmp.str = new Buffer("Buffers work too")
 
    var bencBuffer = benc.encode(exmp) i
 
    // d3:bla4:blup3:foo3:bar3:onei1e4:woahd3:arr \
    // li1ei2ei3eee3:str16:Buffers work tooe


Decoding will work in progressively, e.g. if you're receiving partial
bencoded strings on the network:

    var benc = require("bencode"),
        buf  = null
 
    decoder = new bencode.decoder()
    while (buf = receiveData()) {
      decoder.decode(buf)
    }
    
    log(decoder.result())


Or "all in one"

    var benc = require("bencode"),
        buf  = getBuffer(),
        dec  = benc.decode(buf)
 
    log(dec.bla)


There are some subtleties concerning bencoded strings. These are
decoded as Buffer objects because they are just strings of raw bytes
and as such would wreak havoc with multi byte strings in javascript.

The exception to this is strings that appear as keys in bencoded
dicts. These are decoded as Javascript Strings, as they should always
be strings of (ascii) characters and if they weren't decoded as JS
Strings, dict's would map to Javascript objects with properties.


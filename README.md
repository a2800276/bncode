[![build status](https://secure.travis-ci.org/a2800276/bncode.png)](http://travis-ci.org/a2800276/bncode)
[![JSR](https://jsr.io/badges/@a2800276/bncode)](https://jsr.io/@a2800276/bncode)
[![JSR Score](https://jsr.io/badges/@a2800276/bncode/score)](https://jsr.io/@a2800276/bncode)

# bncode

A BitTorrent bencoding and decoding library for Node.js, Deno, and Bun.

Bencoding is the encoding format used by BitTorrent, specified in [BEP
3](http://www.bittorrent.org/beps/bep_0003.html).

## Features

-  Works in Node.js, Deno, and Bun
-  TypeScript definitions included
-  Zero dependencies
-  Single file implementation

## Installation

```bash
npm install bncode
```

## Usage

```javascript
import { encode, decode } from 'bncode'

const exmp = {
  bla: 'blup',
  foo: 'bar',
  one: 1,
  woah: {
    arr: [1, 2, 3]
  },
  str: Buffer.from('Buffers work too')
}

const bencBuffer = encode(exmp)

// d3:bla4:blup3:foo3:bar3:onei1e4:woahd3:arr \
// li1ei2ei3eee3:str16:Buffers work tooe
```

## Decoding

Decoding works progressively, e.g., if you're receiving partial
bencoded strings on the network:

```javascript
const bncode = require('bncode')
let buf = null

const decoder = new bncode.decoder()
while (buf = receiveData()) {
  decoder.decode(buf)
}

console.log(decoder.result())
```

Or "all in one":

```javascript
const bncode = require('bncode')
const buf = getBuffer()
const dec = bncode.decode(buf)

console.log(dec.bla)
```

### String Handling

There are some subtleties concerning bencoded strings. These are
decoded as Buffer objects because they are just strings of raw bytes
and as such would wreak havoc with multi-byte strings in JavaScript.

The exception to this is strings appearing as keys in bencoded
dictionaries. These are decoded as JavaScript Strings, as they should always
be strings of (ASCII) characters. If they weren't decoded as JS
Strings, dictionaries couldn't be mapped to JavaScript objects.

## Mapping bencoding to JavaScript

     +----------------------------------------------------+
     |                |                                   |
     |  Bencoded      |    JavaScript                     |
     |====================================================|
     |  Strings       |    Node Buffers, unless they are  |
     |                |    dictionary keys, in which case |
     |                |    they become JavaScript Strings |
     |----------------+-----------------------------------|
     |  Integers      |    Number                         |
     |----------------+-----------------------------------|
     |  Lists         |    Array                          |
     |----------------+-----------------------------------|
     |  Dictionaries  |    Object                         |
     |                |                                   |
     +----------------------------------------------------+

## Mapping JavaScript to bencoding

The code makes a best effort to encode JavaScript to bencoding. If you stick to basic 
types (Arrays, Objects with String keys and basic values, Strings, Buffers and Numbers) 
you shouldn't encounter surprises. Expect surprises (mainly not being able to round-trip 
encode/decode) if you encode fancy data types.

## Stream API

A transform stream is also available:

```javascript
const bncode = require('bncode')
const fs = require('fs')

fs.createReadStream('file.torrent')
  .pipe(new bncode.Stream())
  .on('data', (data) => {
    console.log(data)
  })
```

## API

### `bncode.encode(obj)`

Encodes a JavaScript object into a bencoded Buffer.

### `bncode.decode(buffer, [encoding])`

Decodes a bencoded buffer into a JavaScript object.

### `new bncode.decoder()`

Creates a progressive decoder that can handle partial data.

### `new bncode.Stream([options])`

Creates a transform stream for decoding bencoded data.

## Author

bncode was written by Tim Becker (tim.becker@kuriositaet.de). I can be reached via 
email or (preferably) submit a bug to the GitHub repository.

## Thanks

* Roly Fentanes (fent) for bug reports
* Clark Fischer (clarkf)
* The fine folks at Travis
* Patrick Williams
* Feross Aboukhadijeh

## License

MIT, see `LICENSE`

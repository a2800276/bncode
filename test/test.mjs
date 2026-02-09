import * as benc from '../bncode.js'
import { readFileSync, readFile, createReadStream } from 'node:fs'

let tests = 0
let failures = 0

export function report () {
  const perc_failed = (failures/tests)*100
  log ("#tests: "+tests+" failures: "+failures+" ("+perc_failed.toFixed(2)+"%)")
}
export function log(msg) {
  console.log(msg)
//  process.stdout.flush()
}

export function assert(msg, should, is) {
  ++tests
  if (! (should === is) ) {
    log(msg+" failed: should be: >"+should+"< is >"+ is + "<");
    ++failures
    return false
  }
  return true
}

export function assert_obj(msg, should, is) {
  ++tests
  const s = JSON.stringify
  should = should.toString()
  is = is.toString()
  if (! (should === is) ) {
    log(msg+" failed: should be: >"+should+"< is >"+ is + "<");
//    log (s(should))
//    log (s(is))
    ++failures
    return false
  }
  return true
}

export function assert_buf(msg, should, is) {
  if (typeof(should) === "string" && is instanceof Buffer) {
    assert(msg, should, is.toString())
  } else {
    if (Buffer.isBuffer(should) && Buffer.isBuffer(is) ){
      if (should.length != is.length) {
        return assert(msg, should, is)
      }
      for (var i=0; i!=should.length; ++i) {
        if (is[i] != should[i]) {
          return assert(msg, should, is)
        }
      }
      return true
    }
    assert(msg, should, is)
  }
}

export function assert_no_throw(msg, f) {
  ++tests
  try {
    f()
  } catch (e) {
    log (msg + " failed, caught: "+e)
    ++failures
    return false
  }
  return true
}

/**********************************************************************
*  Encoding tests.
***********************************************************************/

export function docs () {
  let exmp = {}

  exmp.bla = "blup"
  exmp.foo = "bar"
  exmp.one = 1
  exmp.woah = {}
  exmp.woah.arr = []
  exmp.woah.arr.push(1)
  exmp.woah.arr.push(2)
  exmp.woah.arr.push(3)
  exmp.str = Buffer.from("Buffers work too")

  const bencBuffer = benc.encode(exmp)
  
  return assert("src comment doc example", 
                "d3:bla4:blup3:foo3:bar3:onei1e3:str16:Buffers work too4:woahd3:arrli1ei2ei3eeee",
                bencBuffer.toString())
}

export function str_e () {
  let ret = true
  ret &= assert('str1', '4:1234', benc.encode('1234').toString() )
  ret &= assert('str2', '8:unicöde', benc.encode('unicöde').toString() )
  ret &= assert('str3', '0:', benc.encode('').toString() ) // empty strings? not sure here

  //log("assert('str1', '"+benc.encode('').toString()+"', benc.encode('').toString() )")
  //log("assert('str2', '"+benc.encode('unicöde').toString()+"', benc.encode('unicöde') )")
//  log("assert('str1', "+benc.encode('1234').toString()+", benc.encode('1234') )")
//  log(Bencode(1234).toString())
//  log(Bencode(-1234).toString())
//  log(Bencode([1,2,3,4]).toString())
//  log(Bencode({1:2, 3:4}).toString())
  return ret 
}

export function num_e() {
  const ret=true
  assert('num1', 'i1234e', benc.encode(1234).toString() )
  assert('num2', 'i-1234e', benc.encode(-1234).toString() )
  assert('num3', 'i0e', benc.encode(0).toString() )
    
//  log("assert('num1', '"+benc.encode(1234).toString()+"', benc.encode(1234) )")
//  log("assert('num2', '"+benc.encode(-1234).toString()+"', benc.encode(-1234) )")
//  log("assert('num3', '"+benc.encode(0).toString()+"', benc.encode(-1234) )")
}

export function list_e() {
  assert('list1', 'le', benc.encode([]).toString() )
  assert('list2', 'li1ee', benc.encode([1]).toString() )
  assert('list3', 'li1ei2ei3e4:foure', benc.encode([1,2,3,'four']).toString() )
  
  //log("assert('list1', '"+benc.encode([]).toString()+"', benc.encode([]).toString() )")
  //log("assert('list2', '"+benc.encode([1]).toString()+"', benc.encode([1]).toString() )")
  //log("assert('list3', '"+benc.encode([1,2,3,"four"]).toString()+"', benc.encode([1,2,3,'four']).toString() )")
 
}
export function dict_e() {
  assert('dict1', 'de', benc.encode({}).toString() )
  assert('dict2', 'd3:bla4:blube', benc.encode({'bla':'blub'}).toString() )
  assert('dict3', 'd3:bla4:blub4:blubi4ee', benc.encode({'bla':'blub', 'blub':4}).toString() )
  
  // keys are typically enumerated in the order of creation (in JS), but should be enumerated
  // alphabetically in bencoding ...
  const dict = {}
      dict["c"] = 1
      dict["b"] = "1"
      dict["a"] = 1
  assert('dict4', 'd1:ai1e1:b1:11:ci1ee',benc.encode(dict).toString());

  //log("assert('dict1', '"+benc.encode({}).toString()+"', benc.encode({}).toString() )")
  //log("assert('dict2', '"+benc.encode({"bla":"blub"}).toString()+"', benc.encode({'bla':'blub'}).toString() )")
  //log("assert('dict3', '"+benc.encode({"bla":"blub", "blub":4}).toString()+"', benc.encode({'bla':'blub', 'blub':4}).toString() )")
 
}


/**********************************************************************
*  Decoding tests.
***********************************************************************/

export function docs_d () {
  let exmp  = {},
      exmp2 = benc.decode(Buffer.from("d3:bla4:blup3:foo3:bar3:onei1e4:woahd3:arrli1ei2ei3eee3:str16:Buffers work tooe"))

  exmp.bla = "blup"
  exmp.foo = "bar"
  exmp.one = 1
  exmp.woah = {}
  exmp.woah.arr = []
  exmp.woah.arr.push(1)
  exmp.woah.arr.push(2)
  exmp.woah.arr.push(3)
  exmp.str = "Buffers work too" // ha, but no decoding!

  
  for (var p in exmp) {
    if ( "woah" === p ) {
      const arr  = exmp.woah.arr,
          arr2 = exmp2.woah.arr

      assert("nested arr len", arr.length, arr2.length)
      for (var j in arr) {
        assert("nested arr len", arr[j], arr2[j])
        
      }
      continue
    }
    assert_buf("doc example (decode) : "+p, exmp[p], exmp2[p])
  }

}

export function str_d () {
  let ret = true
  ret &= assert('str_d1', '1234',    benc.decode(Buffer.from('4:1234')).toString() )
  ret &= assert('str_d2', 'unicöde', benc.decode(Buffer.from('8:unicöde')).toString() )
  ret &= assert('str_d3', '',        benc.decode(Buffer.from('0:')).toString() )

  ret &= assert('str_d4', '1234',    benc.decode('4:1234').toString() )
  ret &= assert('str_d5', 'unicöde', benc.decode('8:unicöde').toString() )
  ret &= assert('str_d6', '',        benc.decode('0:').toString() )

  ret &= assert('str_dr7', 8,        benc.decode('8:12312312').length )
  return ret 
}

export function num_d() {
  const ret=true
  assert('num_d1',  1234,  benc.decode(Buffer.from('i1234e')) )
  assert('num_d2', -1234,  benc.decode(Buffer.from('i-1234e')) )
  assert('num_d3',     0,  benc.decode(Buffer.from('i0e')) )

  assert('num_d4',  1234,  benc.decode('i1234e') )
  assert('num_d5', -1234,  benc.decode('i-1234e') )
  assert('num_d6',     0,  benc.decode('i0e') )


  let caught = false
  try {
    benc.decode(Buffer.from('i1-1e')) 
  } catch (e) {
    assert("illegal num", 'not part of int at:2', e.message)
    caught = true
  }
  assert ("exception not raised", true, caught)
    
}

export function list_d() {
  assert_obj('list_d1', [], benc.decode(Buffer.from("le")) )
  assert_obj('list_d2', [1], benc.decode(Buffer.from('li1ee')) )
  assert_obj('list_d3', [1,2,3,Buffer.from('four')], benc.decode(Buffer.from("li1ei2ei3e4:foure")) )
  
 
  assert_obj('list_d4', [], benc.decode("le") )
  assert_obj('list_d5', [1], benc.decode('li1ee') )
  assert_obj('list_d6', [1,2,3,Buffer.from('four')], benc.decode("li1ei2ei3e4:foure") )

}
export function dict_d() {
  assert_obj('dict_d1', {},             benc.decode(Buffer.from("de")) )
  assert_obj('dict_d2', {"bla":Buffer.from('blub')}, 
                                        benc.decode(Buffer.from("d3:bla4:blube")) )
  assert_obj('dict_d3', {"bla": Buffer.from('blub'), "blub":4}, 
                                        benc.decode(Buffer.from("d3:bla4:blub4:blubi4ee")) )


  assert_obj('dict_d4', {},             benc.decode("de") )
  assert_obj('dict_d5', {"bla":Buffer.from('blub')}, 
                                        benc.decode("d3:bla4:blube") )
  assert_obj('dict_d6', {"bla": Buffer.from('blub'), "blub":4}, 
                                        benc.decode("d3:bla4:blub4:blubi4ee") )
 
}
export function assert_err(msg, err_msg, func) {
  let caught = false
  try {
    func()
  } catch (e) {
    assert(msg, err_msg, e.message)
    caught = true
  }
  assert(msg + " : no exception!", true, caught)
}

export function errors () {
  assert_err("err1", 'not in consistent state. More bytes coming?', function() {
    benc.decode("d8:aaaaaaaa6:bbbbbb")
  })
  assert_err("err2", 'not in consistent state. More bytes coming?', function() {
    benc.decode("lllee")
  })
  assert_err("err3", 'not in consistent state. More bytes coming?', function() {
    benc.decode("d4:this4:that4:listle")
  })
  assert_err("err4", 'end with no beginning: 6', function() {
    benc.decode("llleeee")
  })
}

export function file () {  
  let de = new benc.decoder()
  
  readFile("test/bloeh.torrent", function (err, data) {
    if (err) throw err;
    de.decode(data)
    const result = de.result()[0]
    assert_buf("created by", "Transmission/2.33 (12565)" , result["created by"])
    assert("creation date", 1312820612 , result["creation date"])
    assert_buf("encoding", "UTF-8" , result["encoding"])
    assert("info.files0.length", 17, result.info.files[0].length)
    assert_buf("info.files0.path0", Buffer.from("blöh.test", "UTF-8"), result.info.files[0].path[0])
    assert("info.files.length", 1, result.info.files.length)
    assert("info.piece length", 32768, result.info["piece length"])
    assert_buf("info.pieces", Buffer.from( [0xa6, 0x1a, 0x21, 0x38, 0xa2, 0x37, 0xc8, 0xd8, 0x99, 0x71, 0x0e, 0xbe, 0x91, 0x7f, 0xcf, 0xa3, 0x79, 0x12, 0x1b, 0x21] ), result.info.pieces)
  })
}

export function file_readStream (filename) {

  const rs = createReadStream(filename);

  const stream = new benc.Stream();
  rs.pipe(stream);

  stream.on('error', function(err) {
    throw err
  })

  stream.on('data', function(data) {
  })
}

export function file_bug() {
  let de = new benc.decoder()

  const file = 'test/test.torrent'
  
  function file_bug2(data) {
    const data2 = readFileSync(file, 'binary')

    benc.decode(data2, "binary")
    de.decode(data2, "binary")
    
  }

  readFile(file, function(err, data) {
    de.decode(data)
    
    file_bug2(data) 
  })
}

export function list_0() {
  const data = 'li0ee';
  const decoded = benc.decode(data);
  assert_obj("List with 0", [0], decoded);
}

// https://github.com/a2800276/bncode/issues/16
export function issue_16() {
  Array.prototype.monkey_see_monkeypath = "bananas" 
  const arr = [1,2,3,4]
  let obj = {
    one : 1,
    two : 2,
    tri : 3
  }
  assert_no_throw("Issue 16", function() {
    const encoded = benc.encode(obj)
  })
}

// https://github.com/a2800276/bncode/issues/19
export function issue_19() {
  // Dictionary keys must be sorted by raw byte values, not UTF-16
  // Create two strings where UTF-16 order differs from UTF-8 byte order
  const A = String.fromCodePoint(0xFF61) // UTF-8: EF BD A1
  const B = String.fromCodePoint(0x10002) // UTF-8: F0 90 80 82
  
  // Correct order by bytes: A comes before B
  // (0xEF < 0xF0 in first byte)
  const bufA = Buffer.from(A)
  const bufB = Buffer.from(B)
  const byteOrderCorrect = Buffer.compare(bufA, bufB) < 0 // true: A < B
  
  // JS default sort would give wrong order: [B, A]
  const jsSort = [A, B].sort()
  const jsSortWrong = jsSort[0] === B // true: JS sorts B before A
  
  // Verify the issue exists and our understanding is correct
  assert("Issue 19: byte order differs from UTF-16", true, byteOrderCorrect)
  assert("Issue 19: JS sort gives wrong order", true, jsSortWrong)
  
  // Now test that bencode encodes in correct byte order
  const testObj = {}
  testObj[B] = 'value2'
  testObj[A] = 'value1'
  
  const encoded = benc.encode(testObj)
  const decoded = benc.decode(encoded)
  const decodedKeys = Object.keys(decoded)
  
  // First key in bencode should be A (smaller byte value)
  assert_buf("Issue 19: first key should be A", bufA, Buffer.from(decodedKeys[0]))
  assert_buf("Issue 19: second key should be B", bufB, Buffer.from(decodedKeys[1]))
}

docs()
str_e()
num_e()
list_e()
dict_e()
docs_d()
str_d()
num_d()
list_d()
errors()
file()
file_bug()
list_0()
//file_readStream("test/bloeh.torrent");
//console.log("here")
file_readStream("test/chipcheezum.torrent");
file_readStream("test/videos.torrent");
issue_16()
issue_19()

report()
if (failures > 0) {
  process.exit(1)
}

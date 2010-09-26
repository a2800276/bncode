
var benc = require('../bencode.js'),
    hexy = require('hexy')


function log(msg) {
  console.log(msg)
  process.stdout.flush()
}

function assert(msg, should, is) {
  if (! (should === is) ) {
    log(msg+" failed: should be:"+should+" is "+ is);
    return false
  }
  return true
}

function docs () {
  var exmp = {}

  exmp.bla = "blup"
  exmp.foo = "bar"
  exmp.one = 1
  exmp.woah = {}
  exmp.woah.arr = []
  exmp.woah.arr.push(1)
  exmp.woah.arr.push(2)
  exmp.woah.arr.push(3)
  exmp.str = new Buffer("Buffers work too")

  var bencBuffer = benc.encode(exmp)
  
  return assert("src comment doc example", 
                "d3:bla4:blup3:foo3:bar3:onei1e4:woahd3:arrli1ei2ei3eee3:str16:Buffers work tooe",
                bencBuffer.toString())
}

function stre () {
  var ret = true
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

function nume() {
  var ret=true
  assert('num1', 'i1234e', benc.encode(1234).toString() )
  assert('num2', 'i-1234e', benc.encode(-1234).toString() )
  assert('num3', 'i0e', benc.encode(0).toString() )
    
//  log("assert('num1', '"+benc.encode(1234).toString()+"', benc.encode(1234) )")
//  log("assert('num2', '"+benc.encode(-1234).toString()+"', benc.encode(-1234) )")
//  log("assert('num3', '"+benc.encode(0).toString()+"', benc.encode(-1234) )")
}

function liste() {
  assert('list1', 'le', benc.encode([]).toString() )
  assert('list2', 'li1ee', benc.encode([1]).toString() )
  assert('list3', 'li1ei2ei3e4:foure', benc.encode([1,2,3,'four']).toString() )
  
  //log("assert('list1', '"+benc.encode([]).toString()+"', benc.encode([]).toString() )")
  //log("assert('list2', '"+benc.encode([1]).toString()+"', benc.encode([1]).toString() )")
  //log("assert('list3', '"+benc.encode([1,2,3,"four"]).toString()+"', benc.encode([1,2,3,'four']).toString() )")
 
}
function dicte() {
  assert('dict1', 'de', benc.encode({}).toString() )
  assert('dict2', 'd3:bla4:blube', benc.encode({'bla':'blub'}).toString() )
  assert('dict3', 'd3:bla4:blub4:blubi4ee', benc.encode({'bla':'blub', 'blub':4}).toString() )

  //log("assert('dict1', '"+benc.encode({}).toString()+"', benc.encode({}).toString() )")
  //log("assert('dict2', '"+benc.encode({"bla":"blub"}).toString()+"', benc.encode({'bla':'blub'}).toString() )")
  //log("assert('dict3', '"+benc.encode({"bla":"blub", "blub":4}).toString()+"', benc.encode({'bla':'blub', 'blub':4}).toString() )")
 
}

docs()
stre()
nume()
liste()
dicte()



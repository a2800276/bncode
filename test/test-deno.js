// Deno test file
import { encode, decode, decoder as Bdecode } from '../bncode.js'
import { Buffer } from 'node:buffer'
import { assertEquals, assert as denoAssert } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("Deno: Basic encode/decode", () => {
  const obj = {
    bla: "blup",
    foo: "bar",
    one: 1
  }
  
  const encoded = encode(obj)
  denoAssert(Buffer.isBuffer(encoded), "encode returns Buffer")
  
  const decoded = decode(encoded)
  assertEquals(decoded.bla.toString(), "blup")
  assertEquals(decoded.one, 1)
})

Deno.test("Deno: Issue #19 - byte order sorting", () => {
  const A = String.fromCodePoint(0xFF61)
  const B = String.fromCodePoint(0x10002)
  
  const testObj = {}
  testObj[B] = 'value2'
  testObj[A] = 'value1'
  
  const encoded = encode(testObj)
  const decoded = decode(encoded)
  const decodedKeys = Object.keys(decoded)
  
  const bufA = Buffer.from(A)
  const bufB = Buffer.from(B)
  
  // First key should be A (smaller byte value)
  assertEquals(Buffer.from(decodedKeys[0]).toString('hex'), bufA.toString('hex'))
  assertEquals(Buffer.from(decodedKeys[1]).toString('hex'), bufB.toString('hex'))
})

Deno.test("Deno: Decoder class", () => {
  const dec = new Bdecode()
  dec.decode('i42e')
  const result = dec.result()
  assertEquals(result[0], 42)
})

Deno.test("Deno: Complex structures", () => {
  const data = {
    list: [1, 2, 3],
    nested: {
      a: "test"
    }
  }
  
  const encoded = encode(data)
  const decoded = decode(encoded)
  
  assertEquals(decoded.list.length, 3)
  assertEquals(decoded.list[1], 2)
  assertEquals(decoded.nested.a.toString(), "test")
})

Deno.test("Deno: Buffers", () => {
  const buf = Buffer.from("test data")
  const encoded = encode(buf)
  const decoded = decode(encoded)
  
  assertEquals(decoded.toString(), "test data")
})

Deno.test("Deno: Numbers", () => {
  assertEquals(decode(encode(0)), 0)
  assertEquals(decode(encode(42)), 42)
  assertEquals(decode(encode(-1234)), -1234)
})

Deno.test("Deno: Strings", () => {
  const str = "Hello, Deno!"
  const encoded = encode(str)
  const decoded = decode(encoded)
  assertEquals(decoded.toString(), str)
})

Deno.test("Deno: Empty structures", () => {
  assertEquals(Object.keys(decode(encode({}))).length, 0)
  assertEquals(decode(encode([])).length, 0)
})

console.log('✅ All Deno tests passed!')

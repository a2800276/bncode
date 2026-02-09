// Type definitions for bncode
// Project: https://github.com/a2800276/bncode
// Definitions by: bncode contributors

/// <reference types="node" />

import { Transform, TransformOptions } from 'stream';

/**
 * Encodes a JavaScript value into bencoded format.
 * @param obj - The value to encode (string, number, Buffer, Array, or Object)
 * @returns A Buffer containing the bencoded data
 */
export function encode(obj: string | number | Buffer | any[] | object): Buffer;

/**
 * Decodes a bencoded buffer into a JavaScript value.
 * @param buffer - The bencoded data to decode
 * @param encoding - Optional encoding for string conversion
 * @returns The decoded JavaScript value
 */
export function decode(buffer: Buffer | string, encoding?: BufferEncoding): any;

/**
 * Progressive decoder for handling partial bencoded data.
 */
export class decoder {
  /**
   * Creates a new decoder instance.
   */
  constructor();
  
  /**
   * Decodes a chunk of bencoded data.
   * @param buffer - The data chunk to decode
   * @param encoding - Optional encoding for string conversion
   */
  decode(buffer: Buffer | string, encoding?: BufferEncoding): void;
  
  /**
   * Returns the decoded result.
   * @returns An array containing the decoded values
   * @throws Error if the decoder is not in a consistent state
   */
  result(): any[];
}

/**
 * Transform stream for decoding bencoded data.
 */
export class Stream extends Transform {
  /**
   * Creates a new transform stream for decoding bencoded data.
   * @param options - Optional stream options
   */
  constructor(options?: TransformOptions);
}

const { Decoder } = require('ebml')
const b4a = require('b4a')
const { Duplex } = require('streamx')

module.exports = class WebmClusterStream extends Duplex {
  constructor () {
    super()

    this.decoder = new Decoder()
    this.buffer = []
    this.byteOffset = 0
    this._ondrain = null

    this.decoder.on('data', this._ondecode.bind(this))
    this.decoder.on('end', this._onend.bind(this))
    this.decoder.on('error', this.destroy.bind(this))
    this.decoder.on('drain', this._continueWrite.bind(this))
  }

  _onend () {
    if (this.buffer.length === 0) return
    const chunk = this._combine()
    this.push(chunk)
    this.push(null)
  }

  _ondecode (data) {
    if (data[0] === 'start' && data[1].name === 'Cluster') {
      const chunk = this._combine()
      const rel = data[1].start - this.byteOffset
      const prev = chunk.subarray(0, rel)
      this.buffer.push(chunk.subarray(rel))
      this.byteOffset += rel
      if (this.push(prev) === false) this.decoder.pause()
    }
  }

  _read (cb) {
    this.decoder.resume()
    this._continueWrite()
    cb(null)
  }

  _write (data, cb) {
    this.buffer.push(data)

    if (this.decoder.write(data) === false) {
      this._ondrain = cb
      return
    }

    cb(null)
  }

  _predestroy () {
    this._continueWrite()
  }

  _continueWrite () {
    const cb = this._ondrain
    if (cb === null) return
    this._ondrain = null
    cb(null)
  }

  _final (cb) {
    this.decoder.end()
    cb(null)
  }

  _combine () {
    const buffer = this.buffer
    this.buffer = []
    const chunk = buffer.length === 1 ? buffer[0] : b4a.concat(buffer)
    return chunk
  }
}

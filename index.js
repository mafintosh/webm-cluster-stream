var ebml = require('ebml')
var through = require('through2')

module.exports = createStream

function createStream () {
  var enc = new ebml.Encoder()
  var dec = new ebml.Decoder()
  var bufs = []

  enc.on('data', function (data) {
    bufs.push(data)
  })

  dec.on('data', function (data) {
    if (data[0] === 'start' && data[1].name === 'Cluster') {
      stream.push(Buffer.concat(bufs))
      bufs = []
    }

    enc.write(data)
  })

  var stream = through(write, end)
  return stream

  function write (data, _, cb) {
    dec.write(data)
    cb(null)
  }

  function end (cb) {
    dec.end()
    enc.end()
    stream.push(Buffer.concat(bufs))
    bufs = []
    cb(null)
  }
}

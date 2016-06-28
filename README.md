# webm-cluster-stream

Transform stream that splits a webm stream into a header buffer and cluster buffers.
Useful if you have a webm live stream and wants to make it seekable. See the [webm spec](http://www.webmproject.org) for more info

```
npm install webm-cluster-stream
```

## Usage

``` js
var clusters = require('webm-cluster-stream')
var fs = require('fs')

var cl = clusters()

cl.once('data', function (header) {
  // first buffer is header
  console.log('header:', header)
  cl.on('data', function (cluster) {
    // next buffers are "Cluster" objects
    console.log('cluster:', cluster)
  })
})

fs.createReadStream('movie.webm').pipe(cl)
```

## License

MIT

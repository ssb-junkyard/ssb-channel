# SSB Channel

open channels for rpc between secure scuttlebot nodes

example:

```js
var muxrpc     = require('muxrpc')
var Serializer = require('pull-serializer')
var auth       = require('ssb-domain-auth')
var chan       = require('ssb-channel')

var ssb        = muxrpc(ssbManifest, false, serialize)()
var localhost  = chan.connect(ssb, 'localhost')

localhost.on('connect', function() {
  // authenticate the connection
  auth.getToken('localhost', function(err, token) {
    if (err) return localhost.close(), console.error('Token fetch failed', err)
    ssb.auth(token, function(err) {
      if (err) return localhost.close(), console.error('Auth failed', err)

      // get session info
      ssb.whoami(function(err, user) {
        console.log(user)
      })
    })
  })
})

localhost.on('error', function(err) {
  // attempt a reconnect
  console.log('Connection Error', err)
  localhost.reset()
})

localhost.on('reconnecting', function(err) {
  console.log('Attempting Reconnect')
})

function serialize (stream) {
  return Serializer(stream, JSON, {split: '\n\n'})
}

var ssbManifest = {
  // this is just subset of the ssb api
  auth: 'async',
  whoami: 'async'
}
```

api:

```js
var chan = require('ssb-channel')

// create a new channel and connect to the address
var mychan = chan.connect(muxRpcAPI, address, optOnConnectCB)

// connect to a new address
mychan.connect(address, optOnConnectCB)

// drop connection
mychan.close(optOnCloseCB)

// drop connection (if present) and reconnect
// - wait is optional, defaults to 10s (10000 ms)
mychan.reconnect({ wait: 10*1000 }, optOnConnectCB)

// events
mychan.on('connect', cb)
mychan.on('reconnect', cb)
mychan.on('error', cb) // emitted on close
```
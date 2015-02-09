var pull = require('pull-stream')
var ws   = require('pull-ws-server')
var EventEmitter = require('events').EventEmitter
var address = require('ssb-address')

exports.connect = function (rpcapi, addr, cb) {
  var chan = new EventEmitter()

  chan.connect = function(addr, cb) {
    addr = address(addr)
    if (chan.wsStream) {
      this.wsStream.socket.close()
      chan.emit('reconnecting')
    }

    chan.addr = addr
    chan.wsStream = ws.connect(addr)
    chan.rpcStream = rpcapi.createStream()
    pull(chan.wsStream, chan.rpcStream, chan.wsStream)

    chan.wsStream.socket.onopen = function() {
      chan.emit('connect')
      cb && cb()
    }

    chan.wsStream.socket.onclose = function() {
      chan.rpcStream.close(function(){})
      chan.emit('error', new Error('Close'))
    }
  }

  chan.close = function(cb) {
    this.wsStream.socket.close()
    this.rpcStream.close(cb || function(){})
  }

  chan.reconnect = function(opts) {
    opts = opts || {}
    chan.close(function() {
      if (opts.wait)
        setTimeout(chan.connect.bind(chan, chan.addr), opts.wait)
      else
        chan.connect(chan.addr)
    })
  }

  chan.connect(addr, cb)
  return chan
}
import PubSub from './pubsub.js'
import uuid from './uuid.js'
var socketOpen = false
var socketMsgQueue = []
var cbStack = []

wx.connectSocket({
  url: 'ws://127.0.0.1:9999'
})

wx.onSocketOpen(function(res) {
  socketOpen = true
  for (var i = 0; i < socketMsgQueue.length; i++){
     sendMessage(socketMsgQueue[i])
  }
  socketMsgQueue = []
})

wx.onSocketMessage(function({data}) {
  if(data) {
      let res = JSON.parse(data);
      console.log(res)
      res.message && PubSub.publish(res.message, res.data)
  }
})

const sendMessage = (data) => {
    let msg = JSON.stringify(data);
    if (socketOpen) {
        wx.sendSocketMessage({
            data: msg
        })
    } else {
        socketMsgQueue.push(msg)
    }
}

const onMessage = (message, cb) => {
    PubSub.subscribe(message, cb)
}

export {
    sendMessage,
    onMessage
}
const WebSocket = require('ws')
const PubSub = require('pubsub-js')

var gameData = {
  'INITROOM': {
    1: [[2,3], [3,4]],
    2: [[4, 5], [5,6]]
  }
};

const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port: 9999
})


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    handleMessage(message, ws)
  });
});

const handleMessage = (msg) => {
  return (ws) => {
    var res = JSON.parse(msg);

    switch(res.message) {
      case "LISTROOMS":
        ws.send(JSON.stringify({
          message: "LISTROOMS",
          data: gameData
        }));
        break;
      case "JOINROOM":
        ws.send(JSON.stringify(
          message
        ))
    }
  }
}

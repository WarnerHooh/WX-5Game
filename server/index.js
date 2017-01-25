const WebSocket = require('ws')
const PubSub = require('pubsub-js')

var gameData = {
  'INITROOM': {
    1: {
      player: "Warner",
      trajectory: [[2,3], [3,4]]
    },
    2: {
      player: "Hooh",
      trajectory: [[4, 5], [5,6]]
    }
  },
  'aaa': {
    1: {
      player: "Warner",
      trajectory: []
    }
  }
};

const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port: 9999
})


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    handleMessage(message)(ws)
  });
});

const handleMessage = (msg) => {
  console.log(msg);

  return (ws) => {
    var res = JSON.parse(msg);

    switch(res.message) {
      case "LISTROOMS":
        var data = {};
        Object.keys(gameData).forEach((key) => {
          Object.assign(data, {[key]: Object.keys(gameData[key]).map((i) => (gameData[key][i].player))})
        });

        ws.send(JSON.stringify({
          message: "LISTROOMS",
          data
        }));
        break;

      case "ROOMDETAIL":
        ws.send(JSON.stringify({
          message: "ROOMDETAIL",
          data: gameData[res.data.roomId]
        }))
        break;

      case "TOUCH":
        var { roomId, player, coordinate } = res.data
        gameData[roomId][player].trajectory.push([coordinate.x, coordinate.y])
        break;
    }
  }
}

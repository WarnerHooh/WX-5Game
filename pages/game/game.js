// pages/game/game.js
import { onMessage, sendMessage } from '../../utils/ws.js'
import { uuid } from '../../utils/uuid.js'
let app = getApp();

Page({
  data:{
    player: 1
  },
  ctx: null,
  onLoad:function({roomid}){
    let that = this;
    this.setData({
      roomId: roomid
    })

    app.getSystemInfo(function(systemInfo){
      //更新数据
      that.setData({
        systemInfo: systemInfo
      })
    })
    onMessage("ROOMDETAIL", function(message, data) {
      console.log(data)
      that.setData({
        playerData: data
      })
      // console.log(that.data.boxArray)

    });

    sendMessage({
      message: "ROOMDETAIL",
      data: {
        roomId: roomid
      }
    })
  },
  onReady:function(){
    let that = this;
    const DENSITY = 10;
    let { windowWidth, windowHeight } = this.data.systemInfo;
    let ctx = this.ctx = wx.createCanvasContext("5Game");
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('red');
    
    let boxWidth = Math.floor(windowWidth / 10) * 10,
        left = (windowWidth - boxWidth) / 2,
        pieceSize = boxWidth/DENSITY,
        verticalRepeating = Math.floor(windowHeight / pieceSize),
        boxHeight =  verticalRepeating * pieceSize,
        top = (windowHeight - boxHeight) / 2;

    let boxArray = new Array(verticalRepeating+1).fill(null).map(() => (new Array(DENSITY+1).fill(0)));

    this.setData({
      boxWidth, boxHeight, left, top, pieceSize, boxArray
    });

    for(let i=0; i<DENSITY+1; i++) {
      let distance = pieceSize * i + left;
      ctx.moveTo(distance, top);
      ctx.lineTo(distance, windowHeight - top);
    }

    for(let i=0; i<verticalRepeating+1; i++) {
      let distance = pieceSize * i + top;
      ctx.moveTo(left, distance);
      ctx.lineTo(boxWidth + left, distance);
    }
    ctx.stroke()
    ctx.draw();

    let { playerData } = this.data;
    console.log(playerData)
    if(playerData) {
      Object.keys(playerData).forEach((key) => {
        playerData[key]['trajectory'].forEach((data) => {
          that.doPlay({x: data[0], y: data[1], player: key})
        })
      })
    }
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  doPlay: function({x, y, player}) {
    let ctx = this.ctx;
    let { boxArray, left, top, pieceSize } = this.data;

    let cX = x * pieceSize + left,
        cY = y * pieceSize + top;

    if(boxArray[y][x] === 0) {
      ctx.setStrokeStyle('black');
      ctx.setFillStyle(player == 1 ? 'white' : 'black');
      ctx.beginPath();
      ctx.arc(cX, cY, 10, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.draw(true);

      boxArray[y][x] = player;
    }

    this.checkResult({x, y});
  },
  onTouch: function(e) {
    if(this.data.rs) return;

    let {x, y} = e.touches[0];

    // compute the circle
    let { left, top, pieceSize, player, roomId } = this.data;

    let xIndex = Math.round((x-left)/pieceSize),
        yIndex = Math.round((y-top)/pieceSize);

    this.doPlay({x: xIndex, y: yIndex, player});
    sendMessage({
      message: "TOUCH",
      data: {
        roomId, player, coordinate: {x: xIndex, y: yIndex}
      }
    })
    this.setData({
      player: player == 1 ? 2 : 1
    })
  },

  showResult: function(rs) {
    wx.showToast({
      title: rs ? 'You Win' : 'You Lose',
      icon: 'success',
      duration: 2000
    })

    this.setData({ rs });
  },

  checkResult: function({x, y}) {
    let that = this;
    let { boxArray, rs } = this.data;
    let value = boxArray[y][x];

    _checkWin([1, 0]);
    _checkWin([0, 1]);
    _checkWin([1, 1]);

    function _checkWin([switchX, switchY]) {
      if(rs !== undefined) return;

      let x1 = x, y1 = y, count = 1;

      while(true) {
        if(count >= 5) {
          that.showResult(true);
          break;
        }

        x1 += switchX;
        y1 -= switchY;

        if(boxArray[y1][x1] == value) {
          count ++;

        } else {
          let x2 = x, y2 = y;

          while(true) {
            if(count >= 5) {
              that.showResult(true);
              break;
            }

            x2 -= switchX;
            y2 += switchY;

            if(boxArray[y2][x2] == value) {
              count ++;

            } else {
              break;
            }
          }
          break;
        }
      }

    }
  }
})
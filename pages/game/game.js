// pages/game/game.js
import { sendMessage } from '../../utils/ws.js'
import { uuid } from '../../utils/uuid.js'
let app = getApp();

Page({
  data:{
    player: 1,
    rs: false
  },
  ctx: null,
  onLoad:function(options){
    let that = this;
    // 页面初始化 options为页面跳转所带来的参数
    app.getSystemInfo(function(systemInfo){
      //更新数据
      that.setData({
        systemInfo: systemInfo
      })
    })

    // sendMessage({
    //   JOINGAME: uuid.v4()
    // })
  },
  onReady:function(){
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

    let boxArrayAsRow = new Array(verticalRepeating+1).fill(null).map(() => (new Array(DENSITY+1).fill(0))),
        boxArrayAsCol = new Array(DENSITY+1).fill(null).map(() => (new Array(verticalRepeating+1).fill(0)));

    this.setData({
      boxWidth, boxHeight, left, top, pieceSize, boxArrayAsRow, boxArrayAsCol
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
  onTouch: function(e) {
    if(this.data.rs) return;

    let {x, y} = e.touches[0];
    let ctx = this.ctx;

    // compute the circle
    let { player, boxWidth, boxHeight, left, top, pieceSize, boxArrayAsRow, boxArrayAsCol } = this.data;

    let xIndex = Math.round((x-left)/pieceSize),
        yIndex = Math.round((y-top)/pieceSize),
        cX = xIndex * pieceSize + left,
        cY = yIndex * pieceSize + top;

    // console.log(boxArrayAsRow)
    // console.log(yIndex)
    // console.log(xIndex)
    if(boxArrayAsRow[yIndex][xIndex] === 0) {
      ctx.setStrokeStyle('black');
      ctx.setFillStyle(player === 1 ? 'white' : 'black');
      ctx.beginPath();
      ctx.arc(cX, cY, 10, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.draw(true);

      boxArrayAsRow[yIndex][xIndex] = player;
      boxArrayAsCol[xIndex][yIndex] = player;

      this.setData({ player: player === 1 ? 2 : 1 });
      // sendMessage({x, y})
    }

    this.checkResult();
  },
  checkResult: function() {
    let that = this;
    let { boxArrayAsRow, boxArrayAsCol } = this.data;
    let rs = false;

    function _celebrate() {
      wx.showToast({
        title: 'You Win',
        icon: 'success',
        duration: 2000
      })

      that.setData({
        rs: true
      });
    }

    function _checkStraight(arr) {
      if(rs) return;

      for(let i=0; i<arr.length; i++) {
        let tempStr = arr[i].join("");
        if(tempStr.indexOf("11111") > -1 || tempStr.indexOf("22222") > -1) {
          _celebrate();
          rs = true;
          break;
        }
      }
    }

    function _checkOblique(arr) {
      if(rs) return;

      for(let i=4; i<arr.length; i++) {
        let tempArr = [], tempStr;
        for(let j=0; j<=i; j++) {
          tempArr.push(arr[i-j][j]);
        }
        tempStr = tempArr.join("");
        if(tempStr.indexOf("11111") > -1 || tempStr.indexOf("22222") > -1) {
          _celebrate();
          rs = true;
          break;
        }
      }

      if(rs) return;
      for(let i=1; i<arr[0].length; i++) {
        let tempArr = [], tempStr;
        for(let j=arr.length-1; j>arr[0].length-1-i; j--) {
          // tempArr.push(arr[j][arr.length-j-1+i]);
          // console.log(arr.length-j+","+j)
          tempArr.push(arr[j][arr.length-j])
        }
        tempStr = tempArr.join("");
        // console.log(tempArr)
        
        if(tempStr.indexOf("11111") > -1 || tempStr.indexOf("22222") > -1) {
          _celebrate();
          rs = true;
          break;
        }
      }
    }

    _checkStraight(boxArrayAsRow);
    _checkStraight(boxArrayAsCol);
    _checkOblique(boxArrayAsRow);
  }
})
// pages/rooms/rooms.js
import { sendMessage, onMessage } from '../../utils/ws.js'

Page({
  data:{},
  onLoad:function(options){
    let that = this;
    sendMessage({ message: "LISTROOMS" });

    onMessage("LISTROOMS", function(message, data) {
      that.setData({
        rooms: Object.keys(data).map((key) => ({key, value: data[key]}))
      })
    });

    // console.log(that.data['rooms'])
  },
  onReady:function(){
    // 页面渲染完成
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
  joinRoom: function(e) {
    let roomId = e.currentTarget.dataset.roomid;
    wx.navigateTo({
      url: `../game/game?roomid=${roomId}`
    })
  }
})
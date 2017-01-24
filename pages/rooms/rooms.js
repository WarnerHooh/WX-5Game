// pages/rooms/rooms.js
import { sendMessage, onMessage } from '../../utils/ws.js'

Page({
  data:{},
  onLoad:function(options){
    onMessage("LISTROOMS", function(message, data) {
      console.log(data);
    });
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
  onPress: function() {
    sendMessage({
      message: "LISTROOMS"
    });
  }
})
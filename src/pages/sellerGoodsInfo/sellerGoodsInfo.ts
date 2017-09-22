import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams,ModalController,ActionSheetController} from 'ionic-angular';
import { ViewImgPage } from '../viewImg/viewImg';
import { HomePage } from '../home/home';
import { BuyGoodsPage } from '../buyGoods/buyGoods';

declare var wx;

@Component({
  selector: 'page-sellerGoodsInfo',
  templateUrl: 'sellerGoodsInfo.html'
})
export class SellerGoodsInfoPage {

    shopData:any;
    inviteCode:string;
    goodsInfo;
    pet:string = "info";
    goodsId:string;
    showtype:string;
    msg:string;
    GoodDetails=[];//商品详情
    wxSingle:any;
    goodsImages:any;
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        private navParams: NavParams,
        public modalCtrl: ModalController,
        public actionSheetCtrl : ActionSheetController
    ) {
        if(this.commonService.user.id==null||this.commonService.user.id=='' ){
            this.loadUserData();
        }
    }

    /*页面事件*/
    ionViewWillEnter(){
        this.sharesign();


        this.goodsId = this.navParams.get("goodsId");
        if(this.goodsId==null || this.goodsId==''){
            this.goodsId = this.commonService.goodsID;
        }

        this.showtype =this.navParams.get("showtype");
        this.loadGoodsInfo();
        this.loadGoodsImages();
        this.getDeailts(this.goodsId);
    }

    //获取商品详情
    getDeailts(gid){
        this.commonService.httpPost({
            url:this.commonService.baseApiUrl+'/mall/goods/detaillist',
            data:{
                goodsId:gid
            }
        }).then(data=>{
             if(data.code==200){
                this.GoodDetails=data.result;
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
        });
    }

    /*查询商品信息*/
    sharesign(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/share/sharesign',
            data:{
                url:window.location.href
            }
        }).then(data=>{
            if(data.code=='200'){
                console.log(JSON.stringify(data.result));
                this.wxSingle = data.result;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.result.appId, // 必填，公众号的唯一标识
                    timestamp: data.result.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.result.nonceStr, // 必填，生成签名的随机串
                    signature: data.result.signature,// 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline','chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                this.checkJsApi();
                if(this.goodsInfo!=null){
                    this.initShare(this.goodsInfo);
                }
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*检查微信接口是否正常*/
    checkJsApi(){
        wx.ready(function(){
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            wx.checkJsApi({
                jsApiList:  ['onMenuShareAppMessage','onMenuShareTimeline','chooseWXPay'] , // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function(res) {

                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            });
        });
    }


    goToHomePage(){
        this.navCtrl.pop();
    }
    showImg(path){
        let modal = this.modalCtrl.create(ViewImgPage, {imgStr:path});
        modal.present();
    }

    loadUserData(){
      this.commonService.httpGet({
          url:this.commonService.baseUrl+'/user/login/getUser',
          data:{token:this.commonService.token}
      }).then(data=>{
          if(data.code=='200'){
                this.commonService.user = data.result;
          }else{
                this.commonService.alert("系统提示",data.msg);
          }
      });
    }

    // /*查询商品信息*/
    // loadGoodsInfo(){
    //     this.commonService.httpGet({
    //         url:this.commonService.baseUrl+'/m/share/goodsInfo',
    //         data:{
    //             goodsId:this.goodsId
    //         }
    //     }).then(data=>{
    //         if(data.code=='200'){
    //             this.msg = '1';
    //             this.goodsInfo = data.result;
    //             this.initShare(this.goodsInfo);
    //         }else{
    //             this.msg = '0';
    //             this.commonService.alert("系统提示",data.msg);
    //         }
    //     });
    // }

    /*查询商品信息*/
    loadGoodsInfo(){
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/goods/info',
            data:{
                goodsId:this.goodsId
            }
        }).then(data=>{
            if(data.code=='200'){
              this.msg = '1';
              this.goodsInfo = data.result;
              this.initShare(this.goodsInfo);
            }else{
                this.msg = '0';
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*查询商品图片*/
    loadGoodsImages(){
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/icons',
            data:{
                id:this.goodsId,
                type:4
            }
        }).then(data=>{
            if(data.code=='200'){
                this.goodsImages = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    initShare(item){
        wx.onMenuShareAppMessage({//分享到微信朋友
             title: item.name, // 分享标题
             link: this.commonService.baseUrl+'/user/transition?index=3&goodsId='+item.id+
             '&uid='+this.commonService.user.uid+'&storeId='+item.storeId+'&shareUserId='+this.commonService.user.id,  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
             imgUrl: item.icon, // 分享图标
             type: 'link', // 分享类型,music、video或link，不填默认为link
             dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
             desc: item.detail, // 分享描述
             trigger: function (res) {

             },
             complete: function (res) {

             },
             success: function () {
                 // 用户确认分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享成功');
             },
             cancel: function () {
                 // 用户取消分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享失败');
             }
        });

        wx.onMenuShareTimeline({//分享到微信朋友圈
             title: item.name, // 分享标题
             link: this.commonService.baseUrl+'/user/transition?index=3&goodsId='+item.id+
             '&uid='+this.commonService.user.uid+'&storeId='+item.storeId+'&shareUserId='+this.commonService.user.id, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
             imgUrl: item.icon, // 分享图标
             trigger: function (res) {

             },
             complete: function (res) {

             },
             success: function () {
                 // 用户确认分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享成功');
             },
             cancel: function () {
                 // 用户取消分享后执行的回调函数
                 this.commonService.alert("系统提示",'分享失败');
             }
        });
    }

    /*我要购买*/
    gotobuyGoods(id,score,event,num){
        event.stopPropagation();
        this.navCtrl.push(BuyGoodsPage,{goodsId:id,type:'1001',scorebuy:score,orderNo:'',num:num});
    }

    /*进入店铺*/
    gotoShop(id){
        let inviteCode = sessionStorage.getItem(id);
        this.navCtrl.push(HomePage,{id:id,inviteCode:inviteCode});
    }
}

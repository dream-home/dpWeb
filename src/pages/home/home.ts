import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,ActionSheetController,ModalController,NavParams } from 'ionic-angular';
import { SellerGoodsInfoPage } from '../sellerGoodsInfo/sellerGoodsInfo';
import { ViewImgPage } from '../viewImg/viewImg';
import { BuyGoodsPage } from '../buyGoods/buyGoods';
declare var wx;
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    pet:string = "all";
    shopData:any;
    items:any;
    icons:any;
    inviteCode:string;
    showCodePanel:boolean = false;
    showScroll:boolean=true;
    pageNo:number;
    msg:string;
    wxSingle:any;
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        public actionSheetCtrl: ActionSheetController,
        public modalCtrl: ModalController,
        private navParams: NavParams
    ) {
        this.inviteCode = navParams.get("inviteCode");

        commonService.pageBack = true;
    }

    /*页面事件*/
    ionViewWillEnter(){
        this.pageNo = 1;
        this.loadData(false);
        this.loadShopImages();
        this.sharesign();
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
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
    showImg(path){
        let modal = this.modalCtrl.create(ViewImgPage, {imgStr:path});
        modal.present();
    }

    loadData(showMsg){
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/info',
            data:{
                storeId:this.commonService.shopID
            }
        }).then(data=>{
            if(data.code==200){
                if(this.commonService.user.id==null||this.commonService.user.id=='' ){

                    if(this.commonService.token!=null && this.commonService.token!=''){
                        this.loadUserData();
                    }
                }
                this.loadGoodsLis();
                this.shopData = data.result;

                this.showCodePanel = false;
                this.msg = '1';
                sessionStorage.setItem(this.commonService.shopID,this.inviteCode);
            }else if(data.code == 3){
                this.msg = '1';
                if(showMsg){
                    this.commonService.toast(data.msg);
                }
                this.showCodePanel =true;
            }else{
                this.msg = '0';
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }
    /*查询店铺图片*/
    loadShopImages(){
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/icons',
            data:{
                id:this.commonService.shopID,
                type:3
            }
        }).then(data=>{
            if(data.code=='200'){
                this.icons = data.result;
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
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    loadGoodsLis(){
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/goods/page',
            data:{
              storeId:this.commonService.shopID,
              pageNo:this.pageNo,
              pageSize:this.commonService.pageSize
            }
        }).then(data=>{
            if(data.code==200){
                this.items = data.result != null ? data.result.rows : null;

            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*商品详情*/
    showGoodsInfo(id){
        this.navCtrl.push(SellerGoodsInfoPage,{goodsId:id});
    }

    /*我要购买*/
    gotobuyGoods(id,score,event,num){
        event.stopPropagation();
        this.navCtrl.push(BuyGoodsPage,{goodsId:id,type:'1001',scorebuy:score,orderNo:'',num:num});
    }

    doInfinite(infiniteScroll) {
        this.pageNo++;
        this.commonService.httpLoad({
            url:this.commonService.baseUrl+'/share/goodList',
            data:{
                storeId:this.commonService.shopID,
                pageNo:this.pageNo,
                pageSize:this.commonService.pageSize
            }
        }).then(data=>{
            infiniteScroll.complete();
            if(data.code==200){
                let tdata = data.result.rows;
                this.showScroll =(eval(tdata).length==this.commonService.pageSize);
                for(var o in tdata){
                    this.items.push(tdata[o]);
                }
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

}

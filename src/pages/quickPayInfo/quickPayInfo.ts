import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { PaySuccessPage } from '../paySuccess/paySuccess';
declare var jQuery:any;

@Component({
    selector: 'page-quickPayInfo',
    templateUrl: 'quickPayInfo.html'
})
export class QuickPayInfoPage {

    payType:string = '1';
    tranType:string;
    score:string;
    orderNo:string;
    payTime:string;
    userId:string;
    returnUrl:string;
    orderTitle:string;
    flag:string = '';
    datas;
    storeUserId:string;

    /*新的支付*/
    payData:string;
    payUrl:string;
    // alipay:string = 'http://120.76.43.39:8090/pay/payAlipaySDK/paymentMoney';
    alipay:string = 'http://doupaimall.com/pay/payAlipaySDK/paymentMoney';

    shopId:string;
    /*用于全局保存用户在购物车里面的信息*/
    myShopGoodData = {
        storeId:'',
        myShopGoods:[]
    };
    /*购物车里面的商品数组*/
    myShopGoods:any = [];
    constructor(
      public navCtrl: NavController,
      public alertCtrl: AlertController,
      public plt: Platform,
      private commonService: CommonService,
      private navParams: NavParams
    ){
        this.score = navParams.get('payScore');
        this.tranType = navParams.get('tranType');
        this.storeUserId = navParams.get('storeUserId');
        this.payData = navParams.get('payData');
        this.payUrl = navParams.get('payUrl');
    }

    /*页面事件*/
    ionViewWillEnter(){
        //this.score = sessionStorage.getItem("payMoney");
        this.flag = sessionStorage.getItem("flag");
        this.shopId = this.navParams.get("storeId");
        let data = sessionStorage.getItem(this.shopId);
        if(this.shopId != '' && this.shopId !=null){
            if(data != null && data != '' && data != 'null'){
                //console.log("data"+data);
                this.myShopGoodData = JSON.parse(data);
                if(this.myShopGoodData!=null){
                    this.myShopGoods = this.myShopGoodData.myShopGoods;
                }
            }
        }
        this.loadData();
    }

    //提交表单
    openPay(){
          if(this.flag == '1'){
            //   alert("支付宝调起支付:"+this.alipay+"?tradeNo="+this.orderNo+"&tranType="+this.tranType+"&payAmount="+this.score+"&orderTitle="+this.orderTitle+"&userId="+this.userId+"&returnUrl="+this.returnUrl+"&token="+encodeURIComponent(this.commonService.token));
              if (this.plt.is('ios')) {
                //This will only print when on iOS
                window.open(this.alipay+"?tradeNo="+this.orderNo+"&tranType="+this.tranType+"&payAmount="+this.score+"&orderTitle="+this.orderTitle+"&userId="+this.userId+"&returnUrl="+this.returnUrl+"&token="+encodeURIComponent(this.commonService.token),"_self");
                sessionStorage.setItem("flag","2");
                this.showConfirm();
              }else if(this.plt.is('android')){

                window.open(this.alipay+"?tradeNo="+this.orderNo+"&tranType="+this.tranType+"&payAmount="+this.score+"&orderTitle="+this.orderTitle+"&userId="+this.userId+"&returnUrl="+this.returnUrl+"&token="+encodeURIComponent(this.commonService.token),"_blank");
                sessionStorage.setItem("flag","2");
                this.showConfirm();
              }else{
                //this.commonService.alert("系统提示","该操作系统暂时不支持充值");
                window.open(this.alipay+"?tradeNo="+this.orderNo+"&tranType="+this.tranType+"&payAmount="+this.score+"&orderTitle="+this.orderTitle+"&userId="+this.userId+"&returnUrl="+this.returnUrl+"&token="+encodeURIComponent(this.commonService.token),"_blank");
                sessionStorage.setItem("flag","2");
                this.showConfirm();
              }
        }else{
            this.navCtrl.pop();
        }

    }



    showConfirm() {
      let confirm = this.alertCtrl.create({
        title: '支付提醒',
        message: '是否充值成功?',
        enableBackdropDismiss:false,
        buttons: [
          {
            text: '支付失败',
            handler: () => {
              this.aliCallBack();
            }
          },
          {
            text: '支付成功',
            handler: () => {
                this.aliCallBack();
            }
          }
        ]
      });
      confirm.present();
    }
    aliCallBack(){
        // alert("支付二次回调地址 "+this.commonService.baseApiUrl+'/wallet/query/storealipayscanorderbyaliapay'+"  orderNo "+this.orderNo);
        this.commonService.httpPost({
            url:this.commonService.baseApiUrl+'/wallet/query/storealipayscanorderbyaliapay',
            data:{
                orderNo:this.orderNo
            }
        }).then(data=>{
            if(data.code==200){
                if(this.tranType == '50'){
                    this.navCtrl.push(PaySuccessPage,{payScore:this.score});
                    sessionStorage.setItem("backPage",'1');
                }else{
                    sessionStorage.setItem("backPage",'1');
                    this.navCtrl.pop();
                }
            }else{
                this.commonService.alert("系统提示","支付失败");
                this.navCtrl.pop();
            }
        });

    }
    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    /*加载我的消费记录*/
    loadData(){
      if(this.tranType == '2'){
        this.commonService.httpPost({
            url:this.commonService.baseApiUrl+this.payUrl,
            data:this.payData
        }).then(data=>{
            if(data.code=='200'){
                this.orderNo = data.result.orderNo;
                // alert("ali"+this.orderNo);
                this.userId = '';
                this.returnUrl = data.result.returnUrl;
                // this.returnUrl = this.commonService.baseApiUrl + '/wallet/storeAlipayByAlipay/callback';
                //this.zhifubaoUrl = "http://domain.com/CallBack/return_url.jsp";
                this.orderTitle = "扫码支付";
                this.tranType = "50";
                this.payTime = data.result.payTime;
                this.openPay();
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });

        }
    }

}

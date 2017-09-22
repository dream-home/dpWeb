import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams} from 'ionic-angular';
import { QuickPayInfoPage } from '../quickPayInfo/quickPayInfo';
import { PaySuccessPage } from '../paySuccess/paySuccess';
import { ServiceAgreementPage } from '../serviceAgreement/serviceAgreement';
import { AlertController } from 'ionic-angular';

var payMentPage: any;
declare var wx;
@Component({
    selector: 'page-payMent',
    templateUrl: 'payMent.html'
})
export class PayMentPage {
    showPayType:string='5';
    paymentAmount:number;
    isShowPayPw:boolean = false;
    myScore:number;
    myEP:number;
    orderNo:string;
    payTime:string;
    payPwd:string='';
    storeId:string;
    storeUserID:string;
    shopData:any;
    checkStatus:boolean = true;
    wxSingle:any;
    constructor(
        private navCtrl: NavController,
        private commonService: CommonService,
        private navParams: NavParams,
        public alertCtrl: AlertController
    ) {
        payMentPage = this;
        // if(this.isWeCat()){
        //     this.showPayType='5';
        // }else{
        //     this.showPayType='4';
        // }
        this.sharesign();
    }

    isWeCat(){
        // var ua = window.navigator.userAgent.toLowerCase();
        // console.log(ua)
        // if(ua.indexOf('micromessenger') > 0 ){
        //     return true;
        // }else{
        //     return false;
        // }
    }

    /*页面事件*/
    ionViewWillEnter(){
        //this.commonService.baseUrl
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/info',
            data:{
                storeId:this.commonService.shopID
            }
        }).then(data=>{
            if(data.code==200){
                this.shopData = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    check(status){
        if(status == 0){
            this.checkStatus = true;
        }else{
            this.checkStatus = false;
        }
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    ServiceAgreementPage(){
        this.navCtrl.push(ServiceAgreementPage);
    }

    payFor(){
        if(!this.validator()){
            return;
        }
        var con;
        if(this.isShowPayPw == false){
            let confirm = this.alertCtrl.create({
              title: '温馨提醒',
              message: '付款后，资金将直接进入商家账户，如果需要退款、退货请与商家联系，斗拍不介入交易纠纷处理',
              enableBackdropDismiss:false,
              buttons: [
                {
                  text: '确定',
                  handler: () => {
                    if(this.showPayType=='3'){
                        this.isShowPayPw=true;
                    }else{
                        this.getPay();
                    }
                  }
                },
                {
                  text: '取消',
                  handler: () => {
                      con = false;
                  }
                }
              ]
            });
            confirm.present();
        }else{
            con=true;
        }
        if(con==true){
            this.getPay();
        }else{

        }
    }

    getPay(){
        if(this.showPayType=='4'){//支付宝支付
          sessionStorage.setItem("flag","1");
          this.navCtrl.push(QuickPayInfoPage,{tranType:'2',payData:{
              codeType:'2',
              payPwd:this.payPwd,
              score:this.paymentAmount,
              source:this.showPayType,
              storeUserId:this.commonService.storeUserID
          },payUrl:'/wallet/storeBuildPayOrder',payScore:this.paymentAmount});
        }else if(this.showPayType=='3' || this.showPayType=='5'){
            this.commonService.httpPost({
                url:this.commonService.baseApiUrl+"/wallet/storeBuildPayOrder",
                data:{
                    codeType:2,
                    payPwd:this.payPwd,
                    score:this.paymentAmount,
                    source:this.showPayType,
                    storeUserId:this.commonService.storeUserID
                }
            }).then(data=>{
                if(data.code==200){
                    if(this.showPayType == '5'){//微信
                        this.orderNo = data.result.orderNo;
                        wx.chooseWXPay({
                            appId:data.result.generate.appid,     //公众号名称，由商户传入
                            timestamp: data.result.generate.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                            nonceStr: data.result.generate.noncestr, // 支付签名随机串，不长于 32 位
                            package: data.result.generate.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                            signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                            paySign: data.result.generate.sign, // 支付签名
                            success: function(res) {
                                // 支付成功后的回调函数
                                if (res.errMsg == "chooseWXPay:ok") {
                                    //支付成功
                                    payMentPage.gotoPayCompletedPage();
                                } else {
                                    this.commonService.toast(res.errMsg);
                                }
                            },
                            cancel: function(res) {
                                //支付取消
                                this.commonService.toast('支付取消');
                            }
                        });
                    }
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            });
        }
    }

    gotoPayCompletedPage(){
        var temnum =0 ;
        let interval = setInterval(()=>{
            this.commonService.httpPost({
                url:this.commonService.baseApiUrl+'/wallet/query/storewxscanorder',
                data:{
                    orderNo:this.orderNo
                }
            }).then(data=>{
                if(data.code==200){
                    clearInterval(interval);//移除对象
                    this.navCtrl.push(PaySuccessPage,{payScore:this.paymentAmount});
                }else{
                    this.commonService.alert("系统提示",data.msg);
                }
            });
            temnum =temnum+1;
            if(temnum==3){
                clearInterval(interval);//移除对象
            }
        },2000);

    }
    /*取消支付*/
    cancel(){
        this.isShowPayPw = false;
    }

    /*数据验证*/
    validator(){
        if(this.paymentAmount == null){
            this.commonService.toast("付款金额不能为空");
            return false;
        }
        if(this.paymentAmount < 1){
            this.commonService.toast("付款金额不能小于1");
            return false;
        }
        if(this.paymentAmount > 99999){
            this.commonService.toast("付款金额不能超过99999");
            return false;
        }
        if(!(/^[0-9]+(\.[0-9]{0,2})?$/).test(this.paymentAmount+'')){
            this.commonService.toast("付款金额输入有误(小数点只保留两位)");
            return false;
        }
        return true;
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


}

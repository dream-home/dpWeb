import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';
import { Area } from '../../app/app.data';
import { PayCompletedPage } from '../payCompleted/payCompleted';
import { QuickPayInfoPage } from '../quickPayInfo/quickPayInfo';
var buyGoodsPage: any;
declare var wx;
@Component({
    selector: 'page-buyGoods',
    templateUrl: 'buyGoods.html',
    providers:[Area]
})
export class BuyGoodsPage {

    goodsInfo: any;
    payPwd:string;
    toUrl:string;
    payType:string = "2";
    shareUserId:string;
    payTime:string;

    scorebuy:number;
    goodId:string;
    type:string;
    orderNo:string;
    num:number;

    isShowPayPw:boolean = false;
    userData={
        name:'',
        phone:'',
        addr:'',
        province: '',
        city: '',
        county: ''
    };
    provinces:any[];
    citys:any[];
    countys:any[];
    province:string="110000";
    city:string="110100";
    county:string="110101";
    isDisable:boolean=false;
    wxSingle:any;
    constructor(
        public navCtrl: NavController,
        private commonService: CommonService,
        private navParams: NavParams,
        public area:Area
    ) {
        buyGoodsPage = this;
        this.goodId = navParams.get('goodsId');

        this.scorebuy = navParams.get('scorebuy');
        this.type = navParams.get('type');
        this.orderNo = navParams.get('orderNo');
        this.num = navParams.get('num');
        this.loadData();

        this.userData.phone = commonService.user.phone;
        this.userData.name = commonService.user.userName;

        this.provinces = area.areaColumns[0].options;

        if(commonService.user.userAddress != null && commonService.user.userAddress.addr != null){
            this.userData.addr = commonService.user.userAddress.addr;
        }

        if(commonService.user.userAddress != null && commonService.user.userAddress.province != null && commonService.user.userAddress.province != ''){
            this.userData.province = commonService.user.userAddress.province;
            this.province = this.area.findIdByProvince(commonService.user.userAddress.province);
            this.selectProvi({text:commonService.user.userAddress.province});
        }else{
            this.selectProvi({text:'北京市'});
        }

        if(commonService.user.userAddress != null && commonService.user.userAddress.city != null && commonService.user.userAddress.city != ''){
            this.userData.city = commonService.user.userAddress.city;
            this.city = this.area.findIdByCity(commonService.user.userAddress.city);
            this.selectCity({text:commonService.user.userAddress.city});
        }

        if(commonService.user.userAddress != null && commonService.user.userAddress.county != null && commonService.user.userAddress.county != ''){
            this.userData.county = commonService.user.userAddress.county;
            this.county = this.area.findIdByArea(commonService.user.userAddress.county);
        }
    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    numRemove(){
        if(this.num == 1 || this.num < 1){
            this.commonService.toast("商品数量不能小于1");
        }else{
            this.num = this.num - 1;
        }
    }

    numAdd(){
        this.num = this.num + 1;
    }

    /*加载数据*/
    loadData(){

        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/share/goodsInfo',
            data:{
                goodsId: this.goodId
            }
        }).then(data=>{
            if(data.code=='200'){
                this.goodsInfo = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });

    }

    buildPayOrder(){
        let tempAddr="";
        if(this.userData.province != null && this.userData.province != ''){
            tempAddr +=this.userData.province;
        }
        if(this.userData.city != null && this.userData.city != ''){
            tempAddr +=this.userData.city;
        }
        if(this.userData.county != null && this.userData.county != ''){
            tempAddr +=this.userData.county;
        }
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/share/goods/purchase',
            data:{
                addr:tempAddr+this.userData.addr,
                goodsId:this.goodId,
                num:this.num,
                payType:this.payType,
                phone:this.userData.phone,
                shareUserId:this.commonService.shareUserID,
                userName:this.userData.name
            }
        }).then(data=>{
            if(data.code==200){
                if(this.payType=='2'){
                    this.orderNo = data.result.orderNo;
                    wx.chooseWXPay({
                        appId:data.result.appid,     //公众号名称，由商户传入
                        timestamp: data.result.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                        nonceStr: data.result.noncestr, // 支付签名随机串，不长于 32 位
                        package: data.result.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                        signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                        paySign: data.result.sign, // 支付签名
                        success: function(res) {
                            // 支付成功后的回调函数
                            if (res.errMsg == "chooseWXPay:ok") {
                                //支付成功
                                buyGoodsPage.commonService.toast("支付成功");
                                buyGoodsPage.gotoPayCompletedPage();
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

    changeType(pType){
        this.payType = pType;
    }

    gotoPayCompletedPage(){
        var temnum =0 ;
        let interval = setInterval(()=>{
            this.commonService.httpPost({
                url:this.commonService.baseUrl+'/wallet/query/wxh5order',
                data:{
                    orderNo:this.orderNo
                }
            }).then(data=>{
                if(data.code==200){
                    clearInterval(interval);//移除对象
                    this.navCtrl.push(PayCompletedPage,{scorebuy:this.scorebuy,num:this.num,orderNo:this.orderNo});
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
    submitData(){
        if(this.payType == '2'){
            this.buildPayOrder();
        }else if(this.payType == '1'){
            let tempAddr="";
            if(this.userData.province != null && this.userData.province != ''){
                tempAddr +=this.userData.province;
            }
            if(this.userData.city != null && this.userData.city != ''){
                tempAddr +=this.userData.city;
            }
            if(this.userData.county != null && this.userData.county != ''){
                tempAddr +=this.userData.county;
            }
            sessionStorage.setItem("flag","1");
            this.navCtrl.push(QuickPayInfoPage,{addr:tempAddr+this.userData.addr,goodsId:this.goodId,phone:this.userData.phone,shareUserId:this.commonService.shareUserID,userName:this.userData.name,score:this.scorebuy});
        }
    }

    buyGoods(){
        if(this.validator()){
            this.isShowPayPw = true;
        }
    }

    validator(){
        if(this.num==null || this.num==0 || this.num<0){
            this.commonService.toast("商品数量不能小于1");
            return false;
        }
        if(this.userData.name==null || this.userData.name==''){
            this.commonService.toast("联系人不能为空");
            return false;
        }
        if(!(/^1[34578]\d{9}$/.test(this.userData.phone))){
            this.commonService.toast("联系电话输入有误，请重填");
            return false;
        }
        if(this.userData.addr==null || this.userData.addr==''){
            this.commonService.toast("具体地址不能为空");
            return false;
        }
        return true;
    }

    selectProvi(itm){
        this.citys = this.area.findCityLisByPid(this.province);
        this.city = this.citys[0].value;
        this.selectCity({text:this.citys[0].text});
        this.userData.province = itm.text;
    }

    selectCity(itm){
        this.countys = this.area.findAreaLisByPid(this.city);
        this.county = this.countys[0].value;
        this.selectCounty({text:this.countys[0].text});
        this.userData.city = itm.text;
    }

    selectCounty(itm){
        this.userData.county = itm.text;
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

import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-payCompleted',
  templateUrl: 'payCompleted.html'
})
export class PayCompletedPage {

    orderNo:string;
    orderInfo;
    scoreBuy:number;
    num:number;
    constructor(
        public navCtrl: NavController,
        public commonService: CommonService,
        private navParams: NavParams
    ) {
        this.orderNo = navParams.get("orderNo");
        this.scoreBuy = navParams.get("scorebuy");
        this.num = navParams.get("num");
        this.loadData();
        this.weCatCallback(this.orderNo);
    }

    loadData(){
        this.commonService.httpGet({
            url:this.commonService.baseUrl+'/share/order/info',
            data:{
              orderNo:this.orderNo
            }
        }).then(data=>{
            if(data.code=='200'){
                  this.orderInfo = data.result;
            }else{
                  this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*微信回调*/
    weCatCallback(IorderNo){
        this.commonService.httpPost({
            url:this.commonService.baseUrl+'/wallet/query/wxh5order',
            data:{
                orderNo:IorderNo
            }
        }).then(data=>{
            if(data.code==200){

            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });
    }

    /*页面事件*/
    ionViewWillEnter(){

    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    gotoHomePage(){
        this.navCtrl.push(HomePage);
    }
}

import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'page-paySuccess',
    templateUrl: 'paySuccess.html'
})
export class PaySuccessPage {
    // baseUrl: string = "http://120.76.43.39:8090";
    osType:number;
    downloadUrl:any;
    payScore:string;
    shopData:any;
    constructor(
        private navCtrl: NavController,
        private commonService: CommonService,
        private navParams: NavParams,
        public plt: Platform
    ) {
        this.payScore = navParams.get('payScore');
        this.commonService.httpGet({
            url:this.commonService.baseApiUrl+'/mall/store/info',
            data:{
                inviteCode:'',
                storeId:this.commonService.shopID
            }
        }).then(data=>{
            if(data.code==200){
                this.shopData = data.result;
            }else{
                this.commonService.alert("系统提示",data.msg);
            }
        });

        if (this.plt.is('ios')) {
            // This will only print when on iOS
            this.osType=1;
        }else{
            this.osType=0;
        }
        // this.loadData();
    }

    /*页面事件*/
    ionViewWillEnter(){

    }

    /*返回上一页*/
    goToBackPage(){
        this.navCtrl.pop();
    }

    // loadData(){
    //     this.commonService.httpGet({
    //         url:this.baseUrl+'/system/update',
    //         data:{
    //             osType:this.osType
    //         }
    //     }).then(data=>{
    //         if(data.code==200){
    //             this.downloadUrl = data.result;
    //         }else{
    //             this.commonService.alert("系统提示",data.msg);
    //         }
    //     });
    // }
}

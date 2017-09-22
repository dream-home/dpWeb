import { Component } from '@angular/core';
import { CommonService } from '../../app/app.base';
import { NavController,NavParams } from 'ionic-angular';

@Component({
  selector: 'page-promptWechat',
  templateUrl: 'promptWechat.html'
})
export class PromptWechatPage {


    constructor(
        public navCtrl: NavController,
        public commonService: CommonService,
        private navParams: NavParams
    ) {

    }

    /*页面事件*/
    ionViewWillEnter(){

    }
}

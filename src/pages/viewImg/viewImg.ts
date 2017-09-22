import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'page-viewImg',
    templateUrl: 'viewImg.html'
})
export class ViewImgPage {
    path:string;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController
    ){
        this.path = params.get("imgStr");
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}

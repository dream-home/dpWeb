import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SellerGoodsInfoPage } from '../pages/sellerGoodsInfo/sellerGoodsInfo';
import { HomePage } from '../pages/home/home';
import { CommonService } from '../app/app.base';
import { PromptWechatPage } from '../pages/promptWechat/promptWechat';
import { PayMentPage } from '../pages/payMent/payMent';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,commonService: CommonService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      statusBar.styleDefault();
      splashScreen.hide();

      function getUrl(name) {
          var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
          var r = window.location.search.substr(1).match(reg);
          if (r != null){
            return r[2];
          }
          return null;
      }
      commonService.token = getUrl("token");
      commonService.shopID = getUrl("storeId");
      commonService.goodsID = getUrl("goodsId");
      commonService.shareUserID = getUrl("shareUserID");
      commonService.storeUserID = getUrl("storeUserId");
      commonService.pageIndex = getUrl("index");
      commonService.Uid = getUrl("uid");
      var myUrl = getUrl("index");
      commonService.pageIndex = myUrl;
      switch(myUrl){
        case '1':
          this.rootPage = PromptWechatPage;
          break;
        case '2':
          this.rootPage = HomePage;
          commonService.pageBack = false;
          break;
        case '3':
          this.rootPage = SellerGoodsInfoPage;
          commonService.pageBack = false;
          break;
        case '4':
          this.rootPage = PayMentPage;
          commonService.pageBack = false;
          break;
      }

    });
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CommonService } from './app.base';
import { SellerGoodsInfoPage } from '../pages/sellerGoodsInfo/sellerGoodsInfo';
import { ViewImgPage } from '../pages/viewImg/viewImg';
import { BuyGoodsPage } from '../pages/buyGoods/buyGoods';
import { PayCompletedPage } from '../pages/payCompleted/payCompleted';
import { PromptWechatPage } from '../pages/promptWechat/promptWechat';
import { QuickPayInfoPage } from '../pages/quickPayInfo/quickPayInfo';
import { PayMentPage } from '../pages/payMent/payMent';
import { PaySuccessPage } from '../pages/paySuccess/paySuccess';
import { ServiceAgreementPage } from '../pages/serviceAgreement/serviceAgreement';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SellerGoodsInfoPage,
    ViewImgPage,
    BuyGoodsPage,
    PayCompletedPage,
    PromptWechatPage,
    QuickPayInfoPage,
    PayMentPage,
    PaySuccessPage,
    ServiceAgreementPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp,{
          backButtonText: '',
          iconMode: 'ios',
          modalEnter: 'modal-slide-in',
          modalLeave: 'modal-slide-out',
          tabsPlacement: 'bottom',
          pageTransition: 'ios',
          mode: 'ios',
          tabsHideOnSubPages:true
      })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SellerGoodsInfoPage,
    ViewImgPage,
    BuyGoodsPage,
    PayCompletedPage,
    PromptWechatPage,
    QuickPayInfoPage,
    PayMentPage,
    PaySuccessPage,
    ServiceAgreementPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CommonService
  ]
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FlutterwaveModule } from "flutterwave-angular-v3"
import { Angular4PaystackModule } from 'angular4-paystack';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { Toast } from '@awesome-cordova-plugins/toast/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterOutlet } from '@angular/router';
import { NgImageSliderModule } from 'ng-image-slider';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FlutterwaveModule,
    BrowserAnimationsModule,
    ToastModule,
    DynamicDialogModule,
    DialogModule,
    // AngularFireModule.initializeApp(environment.firebaseConfig),
    // AngularFireAuthModule,
    // AngularFireStorageModule,
    // AngularFireDatabaseModule
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    Angular4PaystackModule.forRoot('pk_test_xxxxxxxxxxxxxxxxxxxxxxxx'),
    //  provideAnalytics(() => getAnalytics()),
    NgImageSliderModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    GeolocationService,
    Geolocation,
    Camera,
    SplashScreen,
    Toast,
    StatusBar,
    SocialSharing,
    File,
    AndroidPermissions,
    RouterOutlet,
    AndroidFullScreen,
    ImagePicker,
    MessageService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

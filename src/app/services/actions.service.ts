import { Injectable, NgZone } from '@angular/core';
import { ToastController, LoadingController, AlertController, PopoverController, ModalController, NavController, NavParams, MenuController, Platform} from '@ionic/angular';
import Axios from 'axios-observable';
import { Subject } from 'rxjs';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { Geolocation, GeolocationOptions } from '@awesome-cordova-plugins/geolocation/ngx';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
declare var require: any;
declare var faceLandmarksDetection;
import { Location } from '@angular/common';
import { FireServiceService } from '../services/fire-service.service';
import { Loader } from '@googlemaps/js-api-loader';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { ImageviewPage } from '../modals/imageview/imageview.page';
import { Toast } from '@awesome-cordova-plugins/toast/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import html2canvas from "html2canvas";
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { DomSanitizer} from '@angular/platform-browser';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { ImagePicker,ImagePickerOptions } from '@awesome-cordova-plugins/image-picker/ngx';
import {ConfirmationService,MessageService} from 'primeng/api';
import { Keyboard } from '@capacitor/keyboard';
@Injectable({
  providedIn: 'root'
})
export class ActionsService {

  data: any = {};
  loader;

  constructor(
    public toastController: ToastController,
    public loadingController: LoadingController,
    public alert: AlertController,
    public popover: PopoverController,
    public modal: ModalController,
    private menu: MenuController,
    public nav: NavController,
    public plat: Platform,
    public geo: GeolocationService,
    public geoloc: Geolocation,
    public camera: Camera,
    public _location: Location,
    public fire: FireServiceService,
    public splash: SplashScreen,
    public toast: Toast,
    public status: StatusBar,
    public social: SocialSharing,
    public file: File,
    public permission: AndroidPermissions,
    public _sanitizer: DomSanitizer,
    public fullscreen:AndroidFullScreen,
    public zone:NgZone,
    public imagepick:ImagePicker,
    public msg:MessageService
  ) {
    //configure each url here
    this.data['subject'] = new Subject<any>();
    this.data['dialogue']={};
    //get the base url from the settings
    this.getPublished().subscribe(res => {
      this.data['events'] = res;
      switch (this.data.events.event_name) {
        case 'settings':
          this.data['url1'] = this.data.events.data[0].base || '';
          this.data['map_api'] = this.data.events.data[0].map_key || '';
          this.data['libraries'] = this.data.events.data[0].libraries || '';
          this.data['smsApi'] = this.data.events.data[0].smsKey || '';
          this.data['smsUrl'] = this.data.events.data[0].smsUrl || '';
          this.data['f_key'] = this.data.events.data[0].f_key || '';
          this.data['p_key'] = this.data.events.data[0].p_key || '';
          this.data['percentage'] = this.data.events.data[0].percentage || '';
          this.data['config'] = {
            smsHeader: {
              'Content-Type': 'application/json',
              'Authorization': this.data['smsApi'],
              Accept: 'application/json',
            },
            header: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            }
          }
          break;
      }

    })
  }

  gofullscreen=()=>{
    this.fullscreen.isImmersiveModeSupported()?this.fullscreen.immersiveMode():'';
  }
  exitfullscreen=()=>{
    this.fullscreen.showSystemUI();
    this.fullscreen.showUnderStatusBar();
    this.startStatusBar();
  }
  hideSplash = () => {
    this.splash.hide();
  }

  startStatusBar = () => {
    this.status.styleDefault();
    this.status.styleBlackOpaque();
   this.status.overlaysWebView(false);
  this.status.backgroundColorByHexString("#FF7F50");
  }


  //show keyboard here
  keyboardCtrl=(action:string)=>{
switch (action) {
  case 'show':
    Keyboard.show();
    break;
    case 'hide':
      Keyboard.addListener('keyboardWillShow', info => {
       // console.log(info)
       Keyboard.hide();
      });
      break;
      case 'remove':
        Keyboard.removeAllListeners();
  default:
    break;
}
  }

  backer=()=>{
    this.data['backer']=this.plat.backButton.subscribeWithPriority(10, (processNextHandler) => {
      if (this._location.isCurrentPathEqualTo('/home')) {
        // if (!this.routerOutlet.canGoBack()) {
        //exit app
        navigator['app'].exitApp();
      } else {
       // this._location.back();
       this.nav.pop();
        // const url=this.routerOutlet.getLastUrl();
        // this.navigate('back',url)
      }
    });
  }

  //load google map here
  loadMap() {

    return new Promise((resolve, reject) => {
      //first get the instance of user's latitude and lng
      this.getLocation().then((res: any) => {
        let loader = new Loader({
          apiKey: this.data.map_api,
          version: "weekly",
          libraries: this.data.libraries
        });
        const mapOptions = {
          center: { lat: res.lat, lng: res.lng },
          zoom: 15
        }
        let data = {
          loader: loader,
          options: mapOptions
        }
        resolve(data)
      }).catch(err => {
        reject(err)
      })

    })
  }

  //load google map here
  loadMapAddress(res) {
    return new Promise((resolve, reject) => {
      let loader = new Loader({
        apiKey: this.data.map_api,
        version: "weekly",
        libraries: this.data.libraries
      });
      const mapOptions = {
        center: { lat: res.lat, lng: res.lng },
        zoom: 15
      }
      const data = {
        loader: loader,
        options: mapOptions
      }
      resolve(data)
    })
  }

  //configure url parameter here
  checkFullURL = (action: string) => {
    return new Promise((resolve, reject) => {
      if (action.indexOf('http://') > -1 || action.indexOf('https://') > -1) {
        resolve(action);
      }
      //set headers here
      //first fetch the assigned route in firebase endpoints
      this.data['sub'] = this.fire.getSingle('endpoints', action).subscribe(res => {
        if (res == undefined) {
          this.data.sub.unsubscribe();
          reject('error');
        }
        else {
          this.data.sub.unsubscribe();
          resolve(this.data.url1 + res.route);
        }
      }, err => {
        this.data.sub.unsubscribe();
        reject('error');
      })
    })
  }

  //get request
  async get(action: string, data = {}) {
    return new Promise((resolve, reject) => {
      this.checkFullURL(action).then(res => {
        this.data['url'] = res;
        Axios.request({
          method: 'GET',
          timeout: 6000,
          url: this.data['url'],
          //  headers: this.config.headers,
          params: data,
        }).subscribe(res => {
          resolve(res);
        }, err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

  //make post request here
  async  post(action: string, data = {}) {
    return new Promise((resolve, reject) => {
      this.checkFullURL(action).then(res => {
        this.data['url'] = res;
        Axios.request({
          method: 'POST',
          timeout: 15000,
          url: this.data.url,
          headers: this.data.config.header,
          data: data
        }).subscribe(res => {
          resolve(res);
        }, err => {
          reject(err)
        })
      }).catch(err => {
        reject(err);
      })
    })
  }

  //make post request here
  postSms = async (action: string, data = {}) => {
    return new Promise((resolve, reject) => {
      Axios.request({
        method: 'POST',
        timeout: 6000,
        url: action,
        headers: this.data.config.smsHeader,
        data: data
      }).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err)
      })
    })
  }

  //control application events here, this is for publishing
  publishData(data: any) {
    this.data.subject.next(data);
  }

  //retriev
  getPublished(): Subject<any> {
    return this.data.subject;
  }

  //control menu here

  openMenu(id) {
    this.menu.open(id);

  }
  closeMenu(id) {
    this.menu.close(id);
    this.menu.enable(true, id)
  }
  enableMenu(id) {
    this.menu.enable(true, id)
    this.menu.swipeGesture(true, id);
  }
  disableMenu(id) {
    this.menu.enable(false, id);
    this.menu.swipeGesture(false, id);
  }
  closeAllMenu() {
    this.menu.getMenus().then((res: any) => {
      if (res.length != 0) {
        res.forEach((res: any) => {
          this.menu.close(res.menuId);
        })
      }
    });
  }
  async Toast(params, pos) {
    if (this.plat.is("android") || this.plat.is("ios") || this.plat.is("cordova") || this.plat.is("capacitor")) {
      this.data['toast'] = this.toast.show(params, '3000', pos);
      this.data.toast.subscribe((resp: any) => {
        return resp;
      });
      setTimeout(() => {
        this.data.toast.unsubscribe();
      }, 3000);
    }
    else {
      const toast = await this.toastController.create({
        message: params,
        duration: 2000,
        position: pos,
        cssClass: 'toast'
      });
      return toast.present();
    }
  }

  //loading controller here
  async Load(params) {
    this.data['isLoading'] = true;
    return await this.loadingController.create({
      message: params,
      spinner: 'dots',
      cssClass: 'loader'
    }).then(a => {
      a.present().then(() => {
        //console.log('loading presented');
        if (!this.data.isLoading) {
          a.dismiss().then(() => { });
        }
      });
    });
  }

  async LoadStop() {
    this.data.isLoading = false;
    return await this.loadingController.dismiss().then(() => '');
  }

  //control alert pops here
  async alerter(header, message) {
    // const alert = await this.alert.create({
    //   header: header,
    //   message: message,
    //   mode: 'md',
    //   translucent: true,
    //   animated: true,
    //   buttons: [
    //     {
    //       text: 'Ok',
    //       cssClass: 'alert_button_class',
    //       handler: () => {
    //         //  console.log('Confirm Ok');
    //       }
    //     }
    //   ],
    //   cssClass: 'alert_class'
    // })
    // return await alert.present();
    this.data['dialogue']={};
    this.data.dialogue.visible=true;
    this.data.dialogue.body=message;
    this.data.dialogue.header=header;
  }

  toaster=(sev:any,mes:any,sum:any='')=>{
    this.msg.add({severity:sev, detail:mes, summary:sum})
  } 

  async alertBig(props: any = {}) {
    const alert = await this.alert.create({
      header: props.header,
      message: props.message,
      mode: 'md',
      translucent: true,
      animated: true,
      buttons: props.buttons || [],
      inputs: props.inputs || [],
      cssClass: props.cssClass || ''
    })
    return await alert.present();
  }

  //use this to control popovers
  async pop(ev: any, props: {}, component) {
    const popover = await this.popover.create({
      component: component,
      cssClass: 'pop-class',
      event: ev,
      translucent: true,
      showBackdrop: true,
      componentProps: props,
      animated: true,

    });
    await popover.present();
    return await popover.onWillDismiss();
  }

  //modal controller here
  async modalCreate(component, props: {}, style: any = "", opts: any = '') {
    const modals = await this.modal.create({
      component: component,
      cssClass: style,
      showBackdrop: true,
      componentProps: props,
      animated: true,
      swipeToClose: true,
      ...opts
    });
    await modals.present();
    const resp = await modals.onWillDismiss();
    this.publishData({
      event_name: 'modal_resp',
      data: resp.data
    });

    return resp;
  }

  //navigation here
  navigate = async (type: any, url) => {
    switch (type) {
      case 'forward':
        this.closeAllMenu();
        return this.nav.navigateForward(url);
        break;

      case 'back':
        this.closeAllMenu();
        return this.nav.navigateBack(url);
        break;

      case 'root':
        this.closeAllMenu();
        return this.nav.navigateRoot(url);
        break;
    }
  }

  //save files here
  saveItem(item) {
    this.data['item'] = item;
    return "succces";
  }

  getItem() {
    return this.data.item;
  }


  //use this to process single image pick here (non native)
  processSingleImage = async ($event, type: any = '') => {
    return new Promise((resolve, reject) => {
      let file = (type == '') ? $event.target.files[0] : $event;
      console.warn(file)
        const data = new FileReader();
        data.readAsDataURL(file);
        data.onload = (dataReader) => {
          this.zone.run(()=>{
            console.warn('Zone called')
          this.data['formData'] = dataReader;
          let image_data = (this.data.formData.target.result.substr(0, 22) === "data:image/png;base64,") ? this.data.formData.target.result.replace("data:image/png;base64,", "") : this.data.formData.target.result.replace("data:image/jpeg;base64,", "");
          resolve(image_data);
        })
        }
    })
  }

  //native image selector
  getPicture=(no:number)=>{
    return new Promise((resolve,reject)=>{
      const options:ImagePickerOptions={
        maximumImagesCount:no,
        outputType:1
      };
      this.imagepick.getPictures(options).then((res:any)=>{
      //resolve data for processing
      resolve(res);
      }).catch((err)=>{
        reject(err);
      })
    })
  }

  //function to calculate distance between two coordinates
  calcCrow = (lat1, lon1, lat2, lon2) => {
    return new Promise((resolve, reject) => {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515; //meters
      dist = dist * 1.609344
      // if (unit=="N") { dist = dist * 0.8684 }
      resolve(Math.round(dist));
    })
  }

  getLocation() {
    return new Promise((resolve, reject) => {
      let options: GeolocationOptions = {
        enableHighAccuracy: true,
      }
      this.geoloc.getCurrentPosition(options).then(res => {
        let resp = {
          lat: res.coords.latitude,
          lng: res.coords.longitude
        }
        resolve(resp)
      })
    });
  }


  formatDate(value: any) {
    //create a temp one for the case of 
    return format(parseISO(value), 'MMM dd yyyy')
  }


  // formatDateAlt(value:any){
  //   const data=new Date(value);
  //   const date=data.getMonth()+1+":"+data.getDay():
  // }

  formatTime(value: any) {
    return format(parseISO(value), 'HH:mm');
  }

  generateId() {
    return uuidv4();
  }


  takePicture(quality: number, type, direction: number, others: any = '') {
    const options: CameraOptions = {
      quality: quality,
      destinationType: this.camera.DestinationType[type],
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: 1,
      correctOrientation: true,
      ...others
    }

    return new Promise((resolve, reject) => {
      this.camera.getPicture(options).then((imageData) => {
        resolve(imageData);
      }, (err) => {
        console.log(err)
        reject(err)
      });
    })
  }

  //detect face
  async detectFace(imgs) {
    // Load the MediaPipe Facemesh package.
    const model = await faceLandmarksDetection
      .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { maxFaces: 1 });
    const detectorConfig = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      // or 'base/node_modules/@mediapipe/face_mesh' in npm.
    };
    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
    // array of detected faces from the MediaPipe graph. If passing in a video
    // stream, a single prediction per frame will be returned.
    try {
      const predictions = await model.estimateFaces({
        input: imgs,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: false
      });
      if (predictions.length > 0) {
        if (predictions[0].faceInViewConfidence === 1) {
          //proceed
          return ('success');
        }
        else {
          return ('partial')
          //return an error to snap picutre again

        }
      }
      else {
        //return an error to retake pcture here
        return ('nil');
      }
    }
    catch (err) {
      return (err)
    }

  }

  //check for network
  checkonline = () => {
    let check = navigator.onLine
    return check;
  }

  calcTotal = (res) => {
    return new Promise((resolve, reject) => {
      resolve(res.reduce((accumulator, item) => accumulator + parseInt(item.amount), 0))
    })
  }

  getDate = () => {
    const d = new Date();
    return d.toDateString();
  }
  getTime = () => {
    const d = new Date();
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  }
  getDateDiff = (dt1, dt2) => {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return (Math.round(diff));
  }

  preview = (item, name) => {
    let data = {
      images: item,
      name: name
    }
    this.saveItem(data);
    this.modalCreate(ImageviewPage, {}, 'search-modal').then(() => {

    });
  }

  ids = (id) => {
    return document.getElementById(id);
  }

  convertPage = (type: any = 'jpg', id) => {
    return new Promise((resolve, reject) => {
      html2canvas(this.ids(id)).then().then((res) => {
        resolve(res);
      }).catch(err => {
        console.log(err);
        reject(err)
      })
    });
  }

  share = (res) => {
    return new Promise((resolve, reject) => {
      this.social.share(res).then(() => {
        resolve('shared');
      })
    });
  }

  shareFile = (name, directory, message, subject) => {
    return new Promise((resolve, reject) => {
      this.social.share(message, subject, this.file.dataDirectory + directory + '/' + name, name).then(() => {
        resolve('shared');
      })
    });
  }

  //use this to write screenshots to file system here
  save = (base64) => {
    return new Promise((resolve, reject) => {
      const uuid = 'img' + (new Date().getTime()).toString(16);
      let realData = base64.split(",")[1];
      this.b64toBlob(realData, "image/jpeg").then((blob: Blob) => {
        //check if directory exists here and save, if not, create another one
        this.file.checkDir(this.file.dataDirectory, 'suitemonger').then((res) => {
          //write
          //check permission
          this.permission.checkPermission(this.permission.PERMISSION.WRITE_EXTERNAL_STORAGE).then(()=>{
            //permission exists
            this.file.writeFile(this.file.dataDirectory + 'suitemonger/', uuid + '.jpg', blob).then((res) => {
              resolve(uuid+'.jpg');
            }).catch((err) => {
              this.Toast('Sorry error occured while trying saving file', 'top');
              console.log('Saving problem',err)
              reject(err);
            });
          }).catch(()=>{
            //request
            this.permission.requestPermissions([
              this.permission.PERMISSION.READ_EXTERNAL_STORAGE, 
              this.permission.PERMISSION.WRITE_EXTERNAL_STORAGE
          ]).then(()=>{
            this.file.writeFile(this.file.dataDirectory + 'suitemonger/', uuid + '.jpg', blob).then((res) => {
              resolve(uuid+'.jpg');
            }).catch((err) => {
              this.Toast('Sorry error occured while trying saving file', 'top');
              console.log('Saving problem',err)
              reject(err);
            });
          })
          })
        }).catch(() => {
          this.permission.checkPermission(this.permission.PERMISSION.WRITE_EXTERNAL_STORAGE).then(()=>{
            this.file.createDir(this.file.dataDirectory,'suitemonger',false).then(()=>{
              //if it creates directory, save the file there
              this.file.writeFile(this.file.dataDirectory + 'suitemonger/', uuid + '.jpg', blob).then((res) => {
                resolve(uuid+'.jpg');
              }).catch((err) => {
                this.Toast('Sorry error occured while saving file', 'top');
                console.log('Saving problem2',JSON.stringify(err))
                reject(err);
              });
            }).catch((err)=>{
              this.Toast('Error creating directory','botttom');
              console.log('Directory problem2',JSON.stringify(err))
              reject(err)
            });
          }).catch(()=>{
            this.file.createDir(this.file.dataDirectory,'suitemonger',false).then(()=>{
              //if it creates directory, save the file there
              this.file.writeFile(this.file.dataDirectory + 'suitemonger/', uuid + '.jpg', blob).then((res) => {
                resolve(uuid+ '.jpg');
              }).catch((err) => {
                this.Toast('Sorry error occured while saving file', 'top');
                console.log('Saving problem2',JSON.stringify(err))
                reject(err);
              });
            }).catch((err)=>{
              this.Toast('Error creating directory','botttom');
              console.log('Directory problem2',JSON.stringify(err))
              reject(err)
            });
          })
        })
      })
    })
  }


  b64toBlob = (b64Data, contentType) => {
    return new Promise((resolve, reject) => {
      contentType = contentType || '';
      let sliceSize = 512;
      let byteCharacters = atob(b64Data);
      let byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      let blob = new Blob(byteArrays, { type: contentType });
      resolve(blob);
    });
  }
}

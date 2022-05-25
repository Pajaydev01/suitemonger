import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController, PopoverController, ModalController, NavController, NavParams, MenuController, Platform } from '@ionic/angular';
import Axios from 'axios-observable';
import { Subject } from 'rxjs';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { Geolocation, GeolocationOptions } from '@awesome-cordova-plugins/geolocation/ngx';
import { format, parseISO, getDate, getMonth, getYear } from 'date-fns';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
declare var require: any;
declare var faceLandmarksDetection;
import { Location } from '@angular/common';


@Injectable({
  providedIn: 'root'
})

export class ActionsService {

  data: any = {};

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
  ) {
    //configure each url here
    this.data['subject'] = new Subject<any>();

    //get the base url from the settings
    this.getPublished().subscribe(res => {
      this.data['events'] = res;
      switch (this.data.events.event_name) {
        case 'settings':
          this.data['url1'] = this.data.events.data[0].base;
          break;
      }
    })

    this.data['config'] = {
      smsHeader: {
        'Content-Type': 'application/json',
        'Authorization': 'App f754e6ffbfedb8f5679cebee89bb11bd-80d4259b-c25b-4a6e-bf0b-3604ad328f29',
        Accept: 'application/json',
      },
      header: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    }
  }

  //configure url parameter here
  checkFullURL = (action: string) => {
    if (action.indexOf('http://') > -1 || action.indexOf('https://') > -1) {
      return action;
    }

    //set headers here
    return this.data.url1 + action;
  }

  //get request
  get = (action: string, data = {}) => {
    return (Axios.request({
      method: 'GET',
      timeout: 6000,
      url: this.checkFullURL(action),
      //  headers: this.config.headers,
      params: data,
    })
    )
  }

  //make post request here
  post = async (action: string, data = {}) => {
    return new Promise((resolve, reject) => {
      Axios.request({
        method: 'POST',
        timeout: 15000,
        url: this.checkFullURL(action),
        headers: this.data.config.header,
        data: data
      }).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err)
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

  async Toast(params, pos) {
    const toast = await this.toastController.create({
      message: params,
      duration: 2000,
      position: pos,
      cssClass: 'toast'
    });
    return toast.present();
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
    const alert = await this.alert.create({
      header: header,
      message: message,
      mode: 'md',
      translucent: true,
      animated: true,
      buttons: [
        {
          text: 'Ok',
          cssClass: 'alert_button_class',
          handler: () => {
            //  console.log('Confirm Ok');
          }
        }
      ],
      cssClass: 'alert_class'
    })
    return await alert.present();
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
        return this.nav.navigateForward(url);
        break;

      case 'back':
        return this.nav.navigateBack(url);
        break;

      case 'root':
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
      const data = new FileReader();
      data.readAsDataURL(file);
      data.onload = (dataReader) => {
        this.data['formData'] = dataReader;
        let image_data = (this.data.formData.target.result.substr(0, 22) === "data:image/png;base64,") ? this.data.formData.target.result.replace("data:image/png;base64,", "") : this.data.formData.target.result.replace("data:image/jpeg;base64,", "");
        resolve(image_data);
      }
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
        this.data['location'] = {
          lat: res.coords.latitude,
          lng: res.coords.longitude
        }
        resolve(this.data.location)
      })
    });
  }


  formatDate(value: any) {
    return format(parseISO(value), 'MMM dd yyyy')
  }

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
}

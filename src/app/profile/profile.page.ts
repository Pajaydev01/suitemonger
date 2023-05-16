import { Component, OnInit } from '@angular/core';
import { FireServiceService } from '../services/fire-service.service';
import { ActionsService } from '../services/actions.service';
import { VerifyPage } from '../modals/verify/verify.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  data: any = {};

  constructor(
    public action: ActionsService,
    public fire: FireServiceService
  ) {
    this.data['backup_avatar'] = '../../assets/icon/person-circle-outline.svg';
    this.data['user'] = {}
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getUser();
    this.check_status();
  }

  getUser() {
    this.data['user'] = JSON.parse(localStorage.getItem('user_data'));
    this.data.user['avatar_link'] = (this.data.user.avatar_link === undefined) ? this.data.backup_avatar : this.data.user.avatar_link;
  }

  //check the remaining document to upload and load the respective data
  checkVerify() {
    if (this.data.verify === undefined) {
      this.openVerify(0);
    }
    else {
      switch (Object.keys(this.data.verify).length) {
        case 1:
          //means only selfie is verified, open modal for mobile verification
          this.openVerify(1);
          break;

        case 2:
          //means phone number verification is in progress, opem verification modal
          this.openVerify(2);
          break;

        case 3:
          //means phone number is saved, open nationa id number taker
          this.openVerify(3);
          break;

        case 4:
          //means national id number is entered, proceed to take the picture of the national id
          this.openVerify(4);
          break;
      }
    }
  }

  //open verification modal here
  async openVerify(num: any = '') {
    switch (num) {
      case '':
        this.checkVerify();
        break;

      case 0:
        this.action.modalCreate(
          VerifyPage,
          {
            type: 'selfie'
          },
          '',
          {
            breakpoints: [0, 0.2, 0.5, 1],
            initialBreakpoint: 0.5,

          }).then(res => {
            (res.data == undefined) ? '' : this.saveData(res.data)
          })
        break;

      case 1:
        this.action.modalCreate(
          VerifyPage,
          {
            type: 'phone'
          },
          'search-modal',
          {

          }
        ).then(res => {
          (res.data == undefined) ? '' : this.saveData(res.data)
        })
        break;

      case 2:
        this.action.modalCreate(
          VerifyPage,
          {
            type: 'v_sms'
          },
          'search-modal',
          {

          }
        ).then(res => {
          (res.data == undefined) ? '' : this.saveData(res.data)
        })
        break;

      case 3:
        this.action.modalCreate(
          VerifyPage,
          {
            type: 'id_num'
          },
          'search-modal',
          {
          }
        ).then(res => {
          (res.data == undefined) ? '' : this.saveData(res.data)
        })
        break;

      case 4:
        this.action.modalCreate(
          VerifyPage,
          {
            type: 'id_snap'
          },
          '',
          {
            breakpoints: [0, 0.2, 0.5, 1],
            initialBreakpoint: 1,
          }).then(res => {
            (res.data == undefined) ? '' : this.saveData(res.data)
          })
        break;
    }
  }

  //check for profile datas
  saveData(data) {
    switch (data.data.type) {
      case 'selfie':
        this.data['verify'] = {};
        this.data['verify']['selfie'] = data.data.data;
        this.checkVerify()
        break;

      case 'phone':
        this.data['verify']['phone'] = data.data.data;
        this.checkVerify()
        break;

      case 'id_no':
        this.data['verify']['national_id_number'] = data.data.data;
        this.checkVerify()
        break;

      case 'id_snap':
        this.data['verify']['id_snap'] = data.data.data;
        //documentation is complete, proceed to first upload all the pictures to the php database, after then submit the returned url and other details to firebase database and mark verification as in progress
        this.saveVerify();
        break;

      case 'verify_phone':
        this.data['verify']['phone_ver'] = data.data.data;
        this.checkVerify()
        break;
    }
  }

  saveVerify = () => {
    let props = {
      header: 'Proceed',
      message: 'Your documentation is complete, kindly proceed to submit for review',
      cssClass: 'big-alert',
      buttons: [
        {
          text: 'Not now',
          role: 'cancel',
          cssClass: 'primary',
          handler: () => {
          }
        },
        {
          text: 'Proceed',
          role: 'proceed',
          cssClass: 'primary',
          handler: () => {
            this.saveAll();
          }
        }]
    }
    this.action.alertBig(props);
  }

  saveAll = () => {
    //procced to verification modal here
    this.action.Load('Please wait while we submit your data...');
    let body = {
      user: this.data.user.id,
      selfie: this.data.verify.selfie,
      national_id: this.data['verify']['id_snap']
    }
    //upload to the external server here and collect links back
    this.action.post('upload-one', body).then(res => {
      this.data['r'] = res;
      if (this.data.r.data.message === 'success') {
        this.insertData();
      }
    }).catch(err => {
      this.action.LoadStop();
      this.action.alerter('Error', err);
    })
  }

  insertData = async () => {
    let selfie_url = this.data.r.data.selfie_url;
    let id_url = this.data.r.data.id_url;
    //proceed to save in firebase
    let data = {
      national_id: true,
      national_id_number: this.data.verify.national_id_number,
      national_id_url: id_url,
      phone: this.data.verify.phone_ver,
      phone_verify: true,
      selfie: true,
      selfie_url: selfie_url,
      user: this.data.user.id,
      verified: 1
    }
    if (this.action.checkonline()) {
      try {
        await this.fire.save(data, 'verification/' + data.user);
        //send mail to admin to to notify user submission of data
        let body = {
          address: 'suitemonger@gmail.com',
          message: '<div><strong>Hello Admin</strong><br><p>A user has submitted their details for verification, kindly login to the panel and proceed to verify the documents submitted by the user.</p>',
          subject: 'User verification notification'
        }
        this.action.post('sendmail', body).then(res => {
          this.data['res'] = res;
          if (this.data.res.data.status == 0) {
            //send notificayion to users on verification status
            var val = Math.floor(1000 + Math.random() * 90000);
            let body = {
              from: 'Suitemonger Verification',
              id: this.data.user.id,
              message: '<div>Hello <strong>' + this.data.user.firstname + ' ' + this.data.user.othername + '</strong><br> Your verification documents has been recieved and currently been accessed by the admin, once it is complete, you will be notified<br>Thank you for choosing SuiteMonger',
              'note-id': val,
              read: false,
              date: this.action.getDate(),
              time: this.action.getTime(),
            }
            this.fire.save(body, 'notification/' + val);
            this.action.LoadStop();
            this.action.Toast('Your data is saved and waiting for verification, you will be notified  upon verification', 'top');
            this.data.stat = 1;
          }
          else {
            this.action.LoadStop();
            this.action.Toast('Your data is saved and waiting for verification, you will be notified  upon verification', 'top');
            this.action.alerter('Error', 'Sorry, we encountered an error notifying admin of your subbmision, but you will be auto verified in a moment');
            this.data.stat = 1;
          }
        }).catch(err => {
          //mailer failed, proceed anways
          console.log('Mailer failed', err)
          this.action.LoadStop();
          this.action.Toast('Your data is saved and waiting for verification, you will be notified  upon verification', 'top');
          this.action.alerter('Error', 'Sorry, we encountered an error notifying admin of your subbmision, but you will be auto verified in a moment');
          this.data.stat = 1;
          this.action.LoadStop();
        })
      }
      catch (e) {
        this.action.LoadStop();
        this.action.alerter('Error', 'Sorry an error occured, please try again');
      }
    }
    else {
      this.action.LoadStop();
      this.action.alerter('Error', 'A network error occured, please check try again');
    }
  }

  //for checking profile verification status
  check_status = () => {
    this.data['loading'] = true;
    
    this.fire.queryData('verification', 'user', this.data.user.id).then(res => {
      if (res.empty) {
        this.data['isVerified'] = false;
        this.data.loading = false;
        this.data['stat'] = 0;
        this.popVerify();
      }
      else {
        res.forEach(res => {
          this.data.loading = false;
          let data = res.data();
          this.data['stat'] = data.verified;
          this.data['stat']==0?this.popVerify():'';
        })
      }
    })
  }

  ///handle the different verified status here
  setStat = (stat) => {
    switch (stat) {
      case 0:
        return 'Unverified'
        break;

      case 1:
        return 'In progress'
        break;

      case 2:
        return 'Verified'
        break;
    }
  }

  popVerify=()=>{
    let props = {
      header: 'Hello ' + this.data.user.firstname,
      message: 'Kindly proceed to verify your account by taking time to complete this few minutes verification process. <br> <strong>Note</strong> that without a verified account, you cannot make bookings on our platform, thanks',
      cssClass: 'big-alert',
      buttons: [
        {
          text: 'Not now',
          role: 'cancel',
          cssClass: 'primary',
          handler: () => {

          }
        },
        {
          text: 'Proceed',
          role: 'proceed',
          cssClass: 'primary',
          handler: () => {
            //procced to verification modal here
            this.checkVerify()
          }
        }]
    }
    this.action.alertBig(props);
  }

  pickSingleImage = () => {
  // this.action.ids('image').click();
   this.action.imagepick.hasReadPermission().then((res:boolean)=>{
    if(!res){
      this.action.imagepick.requestReadPermission().then((res:any)=>{
        this.pick();
      })
    }
    else{
      this.pick();
    }
   })
  // console.log(this.action.ids('image'))
  }

  pick=()=>{
 this.action.getPicture(1).then((res:any)=>{
  //process the data returned here
  res=='' || res==undefined || res==null?'':this.add_image(res);
 })
  }

  add_image = (ev) => {
    //prepare image to be uploaded
    const parent=this;
      let props = {
        header: 'Confirm',
        message: 'Proceed to upload image?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'big-alert',
            handler: () => {
             
            }
          },
          {
            text: 'Proceed',
            role: 'proceed',
            cssClass: 'primary',
            handler: () => {
              //procced tp upload here
              this.action.Load('Uploading image, please wait');
              const metadata = {
                contentType: 'image/jpeg',
              };
              var n = Date.now();
              //first delete the existing file
              (this.data.user.path === undefined) ? '' : this.fire.delFile(this.data.user.path);
              this.fire.uploadFile(ev, metadata, n).then(res => {
                this.fire.getUrl(res.ref).then(res => {
                  this.action.LoadStop();
                  this.update(res, n, 'dp')
                  //save the res into the user data and update
                }).catch(err => {
                  this.action.LoadStop();
                  this.action.alerter('Err', err)
                })
              }).catch(res => {
                this.action.LoadStop();
                this.action.alerter('Error', res)
              })
            }
          }]
      }
      this.action.alertBig(props);
  }

  update = (res: any = '', n: any = '', type) => {
    this.action.Load('Updating record...');
    let path = 'uploads/' + n;
    let data = (type == 'dp') ? {
      avatar_link: res,
      path: path
    } : this.data.user;
    //  console.log(data)
    //update the user
    this.fire.updateNote(this.data.user.id, data, 'users').then(res => {
      if (type == 'dp') {
        this.data.user.avatar_link = data.avatar_link;
        this.data.user['path'] = path;
      }
      localStorage.setItem('user_data', JSON.stringify(this.data.user));
      this.getUser();
      this.action.LoadStop().catch(err => '')
      this.action.Toast('Updated', 'top');
    }).catch(err => {
      this.action.LoadStop()
      this.action.alerter('Error', err)
    })
  }
}

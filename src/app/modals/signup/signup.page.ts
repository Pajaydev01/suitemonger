import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActionsService } from '../../services/actions.service';
import { LoginPage } from '../../modals/login/login.page';
import { FireServiceService } from '../../services/fire-service.service';

declare var require;
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  data: any = {};


  constructor(
    public action: ActionsService,
    public modal: ModalController,
    public fire: FireServiceService
  ) {
    this.data['user'] = { firstname: '', othername: '', email: '', phone: '', pass1: '', password: '' };
  }

  ngOnInit() {
  }

  close = () => {
    this.modal.dismiss();
  }

  submit = async () => {
    let sha1 = require('js-sha1');
    let { data } = this;
    let user = data.user;
    if (user.firstname === "" || user.othername === "" || user.email === "" || user.phone === "" || user.pass1 === "" || user.password === "") {
      this.action.Toast('Kindly fill all fields','top');
    }
    else {
      if (user.password !== user.pass1 || user.password !== user.pass1) {
        this.action.Toast('Kindly check to ensure that you entered a matching password','top');
      }
      else {
        this.data['loading']=true;
        user.password = sha1(user.password);
        delete user.pass1;
        //submit the data
       // this.action.Load('Signing up, please wait...');
        //first check if the user name, phone or email exists
        Promise.all([this.fire.queryData('users', 'email', user.email), this.fire.queryData('users', 'phone', parseInt(user.phone))]).then(res => {
          let filter = (res.some(res => res.empty === false))
          if (!filter) {
            //proceed to upload data  here
            this.uploadAll(user);
          }
          else {
            this.data['loading']=false;
            this.action.Toast('Sorry, the entered phone number or mail exists','top')
            //this.action.LoadStop();
          }
        }).catch(err => {
         // this.action.LoadStop();
         this.data['loading']=false;
          this.action.alerter('Error', err);
        })

      }
    }
  }

  uploadAll = async (user) => {
    if (this.action.checkonline()) {
      try {
        user['id'] = this.action.generateId();
        let saver = await this.fire.save(user, 'users/' + user.id);
        this.data['message'] = 'Welcome onboard ' + user.firstname + ' ' + user.othername + ' <br> Thank you very much for joining our platform, here is what you can do with on Suitemonger: <br> <li> You get to see hotels and appartment close to you</li> <li> You can book any hotel or appatment of your own choice directly from our platfrom</li>  <li> You get amazing bonuses and discount</li> <li> You have your own wallet</li> <br><strong>Please note:</strong><br>Without complete verification, you cannot proceed to make full use of our platform, so to do this, simple login, open the side menu in your home page and go to your profile';

        let body = {
          from: 'Suitemonger Welcome',
          id: user.id,
          message: this.data['message'],
          'note-id': user.id,
          read: false,
          date: this.action.getDate(),
          time: this.action.getTime(),
        }
        if (this.fire.save(body, 'notification/' + user.id)) {
          //request should be made to external server to send a welcoming mail to user
          let body = {
            address: user.email,
            message: this.data['message'],
            subject: 'Welcome on board'
          }
          this.action.post('sendmail', body).then(res => {
            this.data['res'] = res;
            if (this.data.res.data.status == 0) {
              //success, approve
              localStorage.setItem('user_data', JSON.stringify(user));
              // this.action.LoadStop();
              this.data['loading']=false;
              this.modal.dismiss({ data: true });
            }
            else {
            //  this.action.LoadStop();
            this.data['loading']=false;
              this.action.Toast(this.data.res.data.status,'bottom');
             // console.log(this.data.res.data.message)
            }
          }).catch(err => {
            //mailer failed, proceed anways
            //console.log('Mailer failed', err)
            localStorage.setItem('user_data', JSON.stringify(user));
            this.data['loading']=false;
            //this.action.LoadStop();
            this.modal.dismiss({ data: true });
          })
        }
        else {
         // this.action.LoadStop();
         this.data['loading']=false;
          this.action.alerter('Error', 'Sorry an error occured');
         // console.log('notification error')
        }
      }
      catch (e) {
        //this.action.LoadStop();
        this.data['loading']=false;
        this.action.alerter('Error', e);
      }
    }
    else {
   //   this.action.LoadStop();
   this.data['loading']=false;
      this.action.toaster('error', 'Seems there is an issue with your network, please check and try again');
    }
  }

  login = () => {
    this.modal.dismiss();
    this.action.modalCreate(LoginPage, {});
  }
}

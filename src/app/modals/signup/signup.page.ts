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

  submit = () => {
    let sha1 = require('js-sha1');
    let { data } = this;
    let user = data.user;
    if (user.firstname === "" || user.othername === "" || user.email === "" || user.phone === "" || user.pass1 === "" || user.password === "") {
      this.action.Toast('Kindly fill all fields', 'top');
    }
    else {
      if (user.password !== user.pass1 || user.password !== user.pass1) {
        this.action.Toast('Kindly check to ensure that you entered a matching password', 'bottom');
      }
      else {
        user.password = sha1(user.password);
        delete user.pass1;
        //submit the data
        this.action.Load('Signing up, please wait...');
        //first check if the user name, phone or email exists
        Promise.all([this.fire.queryData('users', 'email', user.email), this.fire.queryData('users', 'phone', parseInt(user.phone))]).then(res => {
          let filter = (res.some(res => res.empty === false))
          if (!filter) {
            //generate an id for the user
            user['id'] = this.action.generateId();
            //proceed to upload data  here
            if (this.fire.save(user, 'users/' + user.id)) {
              localStorage.setItem('user_data', JSON.stringify(user));
              this.action.LoadStop();
              this.modal.dismiss({ data: true });
            }
            else {
              this.action.LoadStop();
              this.action.alerter('Error', 'Sorry an error occured while saving');
            }
          }
          else {
            this.action.alerter('Error', 'Sorry, the entered phone number or mail exists')
            this.action.LoadStop();
          }
        })

      }
    }
  }

  login = () => {
    this.modal.dismiss();
    this.action.modalCreate(LoginPage, {});
  }
}

import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { SignupPage } from '../../modals/signup/signup.page';
import { FireServiceService } from '../../services/fire-service.service';
declare var require;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  data: any = {};

  constructor(
    public action: ActionsService,
    public fire: FireServiceService
  ) {
    this.data['user'] = { user: '', password: '' }
  }

  ngOnInit() {
  }

  close = () => {
    this.action.modal.dismiss();
  }

  signup = () => {
    this.action.modal.dismiss();
    this.action.modalCreate(SignupPage, {});
  }

  //signing
  submit = () => {
    let { data } = this;
    let user = data.user;
    let sha1 = require('js-sha1');

    if (user.user === "" || user.password === "") {
      this.action.Toast('Kindly fill fields', 'top');
    }
    else {
      this.data['loading']=true;
     // this.action.Load('Login you in....');
      //first check if the user exists or not
      const q = this.fire.queryData('users', 'email', user.user).then(res => {
        if (res.empty) {
          this.data['loading']=false;
          this.action.LoadStop();
          this.action.Toast('The email or phone number not registered','top');
        }
        else {
          //get the password from the field and check
          res.forEach(resp => {
            this.data['loading']=false;
            this.data['spass'] = resp.data().password;
            if (this.data.spass !== sha1(user.password)) {
              //this.action.LoadStop();
             // this.action.alerter('Failed', 'Incorrect password');
             this.action.Toast('Incorrect password','top')
            }
            else {
              this.action.LoadStop();
              //save data
              localStorage.setItem('user_data', JSON.stringify(resp.data()));
              this.action.modal.dismiss({ data: true });
            }
          })
        }
      }).catch(err => {
        this.data['loading']=false;
        this.action.LoadStop();
        this.action.Toast('An error occured, please try again','bottom');
      })

    }
  }

}

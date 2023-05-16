import { Component, OnInit, Input } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { FireServiceService } from '../../services/fire-service.service';


@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})
export class VerifyPage implements OnInit {
  @Input() type: string;
  data: any = {};
  constructor(
    private action: ActionsService,
    public fire: FireServiceService
  ) { }

  ngOnInit() {
  }

  takeSelfie() {
    this.action.takePicture(20, 'DATA_URL', 2).then(res => {
      this.data['img'] = document.getElementById('img');
      //remove all childres
      this.data['base64'] = res;
      this.data.img.src = 'data:image/png;base64,' + this.data.base64;

      //now to do the facial tensor flow check
      this.action.Load('Please wait while analyzing your selfie');
      this.action.detectFace(this.data.img).then(res => {
        switch (res) {
          case 'success':
            this.action.LoadStop();
            this.action.Toast('Great job!, Selfie verification succesful', 'top');
            this.action.modal.dismiss({
              data: {
                type: 'selfie',
                data: this.data.base64
              }
            });
            break;

          case 'partial':
            this.action.LoadStop();
            this.action.alerter('Error', 'Kindly ensure your face is well positioned for proper identification');
            break;

          case 'nil':
            this.action.LoadStop();
            this.action.alerter('Error', 'No face was detected, please take another shot');

        }
      }).catch(err => {
        this.action.LoadStop();
        this.action.alerter('Error', err);
      })
    })
  }

  v_phone() {
    //phone number verification here
    if (this.data.phone === null) {
      this.action.Toast('Kindly enter your phone number to proceed', 'bottom');
    }
    else {
      this.action.Load('Please wait...');
      //generate random numbers
      var val = Math.floor(1000 + Math.random() * 9000);
      let user = JSON.parse(localStorage.getItem('user_data'));

      //save the number in db
      this.fire.updateNote(user.id, {
        code: val,
      }, 'users').then(res => {
        let phone;
        let no = this.data.phone.toString();
        switch (no.charAt(0)) {
          case "0":
            phone = '234' + no.substr(1);
            break;

          case "+":
            phone = no.substr(1);
            break;

          default:
            phone = '234' + no;
        }

        //send sms
        let body = {
          "from": "Suitemonger",
          "to": phone,
          "text": 'You verification code is ' + val
        }

        this.action.postSms(this.action.data.smsUrl, body).then(res => {
          this.action.LoadStop();
          this.action.modal.dismiss({
            data: {
              type: 'verify_phone',
              data: this.data.phone
            }
          })
        }).catch(err => {
          this.action.LoadStop();
          this.action.alerter("Error", err);
        })
      })
    }
  }

  verify() {
    let user = JSON.parse(localStorage.getItem('user_data'));
    if (this.data.sms === null) {
      this.action.Toast('Please enter your code to proceed', 'top');
    }
    else {
      this.action.Load('Verifying, please wait...');
      let subscribe = this.fire.getSingle('users', user.id).subscribe(res => {
        if (res.code == this.data.sms) {
          this.action.LoadStop();
          this.action.Toast('Phone number successfully verified', 'top')
          this.action.modal.dismiss({
            data: {
              type: 'phone',
              data: this.data.sms
            }
          });
          subscribe.unsubscribe();
        }
        else {
          this.action.LoadStop();
          this.action.alerter('Error verifying', 'The code provided is wrong, please try again');
          subscribe.unsubscribe();
        }
      })
    }
  }

  save_id() {
    if (this.data.id === null) {
      this.action.Toast('Please enter your id', 'top');
    }
    else {
      this.action.modal.dismiss({
        data: {
          type: 'id_no',
          data: this.data.id
        }
      });
    }
  }


  takePass() {
    this.action.takePicture(30, 'DATA_URL', 1).then(res => {
      //  this.data['img'] = document.getElementById('img2');
      //remove all childres
      this.data['base64'] = res;
      //    this.data.img.src = 'data:image/png;base64,' + this.data.base64;

      this.action.modal.dismiss({
        data: {
          type: 'id_snap',
          data: this.data['base64']
        }
      });
    }).catch(err => {
      this.action.alerter('Error', err);
    })
  }
}

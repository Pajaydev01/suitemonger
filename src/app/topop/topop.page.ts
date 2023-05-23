import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../services/actions.service'
import { FireServiceService } from '../services/fire-service.service';
import { Flutterwave, InlinePaymentOptions, PaymentSuccessResponse } from "flutterwave-angular-v3"
//import { PaystackOptions } from 'angular4-paystack';
@Component({
  selector: 'app-topop',
  templateUrl: './topop.page.html',
  styleUrls: ['./topop.page.scss'],
})
export class TopopPage implements OnInit {
  data: any = {};
  // option: PaystackOptions = {
  //   amount: 1000,
  //   email: 'holl@gmail.com',
  //   // ref: `${Math.ceil(Math.random() * 10e10)}`
  //   ref: this.action.generateId(),
  //   key: this.action.data.p_key,
  // }
  constructor(
    private provider: FireServiceService,
    public action: ActionsService,
    public flutterwave: Flutterwave
  ) {
  }

  ngOnInit() {
  }

  processPay = () => {
    (this.action.getItem() == 'rave') ? this.add() : this.initiate()
  }

  //process payment for flutterwavehere
  add() {
    if (this.data.amount === undefined || this.data.amount == '0') {
      this.action.Toast('Please enter a valid amount', 'top');
    }
    else {
      this.data['loading'] = true;
      const user = JSON.parse(localStorage.getItem('user_data'));
      //console.log(user);
      const paymentData: InlinePaymentOptions = {
        public_key: this.action.data.f_key,
        tx_ref: this.action.generateId(),
        amount: this.data.amount,
        currency: 'NGN',
        payment_options: 'card,ussd',
        redirect_url: '',
        //  meta: this.meta,
        customer: {
          email: user.email,
          phone_number: user.phone,
          name: user.firstname + ' ' + user.othername
        },
        customizations: {
          title: "Wallet recharge",
          description: "Walllet recharge",
          // logo: "https://poncube.com/assets/images/favy.jpg",
        },
        callback: this.makePaymentCallback,
        onclose: this.closedPaymentModal,
        callbackContext: this
      }

      this.flutterwave.inlinePay(paymentData)
    }
  }

  //process payment for paystack here
  initiate() {
    // if (this.data.amount === undefined || this.data.amount == '0') {
    //   this.action.Toast('Please enter a valid amount', 'top');
    // }
    // else {
    //   const user = JSON.parse(localStorage.getItem('user_data'));
    //   this.option.amount = this.data.amount * 100
    //   this.option.email = user.email
    //   this.data['process'] = true
    // }
  }



  paymentInit(ev) {
  }


  makePaymentCallback(response: PaymentSuccessResponse): void {
    let parent = this;
    if (response.status === 'successful') {
      const user = JSON.parse(localStorage.getItem('user_data'));
      parent.paymentDone(response.transaction_id);
      //save transaction to transaction table
    }
    else {
      console.log('error');
      parent.action.alerter('Error', 'There was an error processing your payment, please try again');
    }
  }

  closedPaymentModal() {
    let parent = this;
    parent.data.loading = false;
    parent.action.Toast('Payment session closed', 'top')
  }

  paymentDone = (ref) => {
    this.data.loading = true;
    let party = (this.action.getItem() == 'rave') ? 'Flutterwave' : 'Paystack';
    const user = JSON.parse(localStorage.getItem('user_data'));
    let body = {
      amount: this.data.amount,
      date: this.action.getDate(),
      time: this.action.getTime(),
      remark: 'Wallet recharge via third party: ' + party,
      t_id: (this.action.getItem() == 'rave') ? ref : ref.reference,
      user: user.id
    }

    this.provider.save(body, 'transaction/' + body.t_id).then(res => {
      this.data.loading = false;
      this.action.navigate('forward', '/wallet');
      this.action.alerter('Success', 'Wallet recharge was successful!');
    })
  }

}

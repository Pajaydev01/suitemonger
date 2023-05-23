import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { FireServiceService } from '../services/fire-service.service';
import { SliderServiceService } from '../services/slider-service.service';
import { IonContent } from '@ionic/angular';
import { LoginPage } from '../modals/login/login.page';
import { HostPage } from '../modals/host/host.page';
import { ReviewonePage } from '../modals/reviewone/reviewone.page';
import { MinimapPage } from '../modals/minimap/minimap.page';
import { CheckoutPage } from '../modals/checkout/checkout.page';
import { RecieptPage } from '../modals/reciept/reciept.page';
import { NgImageSliderComponent } from 'ng-image-slider';
import { da } from 'date-fns/locale';

@Component({
  selector: 'app-house',
  templateUrl: './house.page.html',
  styleUrls: ['./house.page.scss'],
})
export class HousePage implements OnInit {
  data: any = {};
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('nav') imgs: NgImageSliderComponent;
  constructor(
    public action: ActionsService,
    private fire: FireServiceService,
    public slider: SliderServiceService,

  ) {
    this.data['loading'] = true;
    this.data['today'] = new Date().toISOString();
    this.data['comply'] = false;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.action.gofullscreen();
    //use the given id here to find the data
    let input;
    (this.action.getItem()==undefined)?this.action.navigate('forward','/home'):input=this.action.getItem();
    (input.load) ? this.loadHouse(input.item) : this.loadData(input.item);

    //use the back button to listen for when the video is on vuew and close
   this.data['backer']= this.action.plat.backButton.subscribeWithPriority(5,()=>{
    if(this.data.active){
      this.imgs.close();
      this.data.active=false;
      this.data.backer.unsubscribe();
    }
   })
  }

  suber=()=>{
    //subscribe to the back button again and set data to active
    this.data.active=true;
    this.data['backer']= this.action.plat.backButton.subscribeWithPriority(5,()=>{
      if(this.data.active){
        this.imgs.close();
        this.data.active=false;
        this.data.backer.unsubscribe();
      }
     })
  }

  ionViewDidLeave() {
    this.data.getter.unsubscribe();
    this.action.exitfullscreen();
    this.action.keyboardCtrl('remove')
  }
  loadHouse = (id) => {
    if (typeof id == 'string') {
      this.data['getter'] = this.fire.getSingle('houses', id).subscribe(res => {
        if (res.length < 0) {
          this.data['loading'] = false;
          this.action.alerter('Error', 'Sorry a network error occured, please try again');
        }
        else {
          this.data.loading = false;
          this.data['result'] = res
          this.data['house_id'] = res.id
          this.data['user'] = [];
          //the array to use for the new slider
          this.data['res']=[];
          this.data.result.images.forEach((res:any) => {
            const img={
              image:res,
              thumbImage:res
            }
            //push the created image array
            this.data.res.push(img);
          });

          //check and pass video too to the array of objects
  if(this.data.result.video){
    const video={
      video:this.data.result.video,
      posterImage:this.data.result.images[0]
    }
    this.data.res.unshift(video);
  }
        }
      }, err => {
        this.data.loading = false;
        this.action.alerter('Error', err)
      });
    }
    else {
      //use the data directly from search cos it's coming without an id

      this.data['result'] = id;
      this.data['house_id'] = id.id
      this.data['user'] = [];
      this.data.loading = false;
    }
  }

  loadData = (item) => {
    //first load the house item
    this.data['getter'] = this.fire.getSingle('houses', item.id).subscribe(res => {
      if (res.length < 0) {
        this.data['loading'] = false;
        this.action.alerter('Error', 'Sorry a network error occured, please try again');
      }
      else {
        this.data.loading = false;
        this.data['result'] = res;
        this.data['user'] = [];
        this.data['user']['counter'] = item.counter;
        this.data['user']['suiteCount'] = item.suiteCount;
        this.data['user']['prices'] = item.prices;
        this.data['user']['total'] = item.total;
        this.data['dateTime'] = '';
        this.data['user']['day'] = item.day;
        this.data['user']['time'] = item.time;
        this.data['count'] = item.index;
        this.data['days'] = this.data.user.prices[0].charge_per;
         //the array to use for the new slider
         this.data['res']=[];
         this.data.result.images.forEach((res:any) => {
           const img={
             image:res,
             thumbImage:res
           }
           //push the created image array
           this.data.res.push(img);
         });

         //check and pass video too to the array of objects
 if(this.data.result.video){
   const video={
     video:this.data.result.video
   }
   this.data.res.unshift(video);
 }
        //scroll all contents down
        this.content.scrollToBottom(2000);
      }
    }, err => {
      this.data.loading = false;
      this.action.alerter('Error', err)
    })
  }

  editCount = (sign) => {
    //to edit number of days to book here
    switch (sign) {
      case '+':
        //this is the selected number of days
        this.data['user'].counter = (parseInt(this.data['user'].counter) + parseInt(this.data.days));
        let sub = ((this.data.user.prices[0].price) / (this.data.days));
        this.calcPrice(sub)
        break;

      case '-':
        if (parseInt(this.data['user'].counter) == parseInt(this.data.days)) {
          this.action.Toast('Sorry, you cannot set below the minimum spaces listed', 'bottom');
        }
        else {
          //this is the selected number of days
          this.data['user'].counter = (this.data['user'].counter - this.data.days);
          let subb = ((this.data.user.prices[0].price) / (this.data.days));
          this.calcPrice(subb)
        }
        break;
    }
  }

  editSuite(sign) {
    //to dit number of suites booked here
    switch (sign) {
      case '+':
        let res = ((this.data.user.prices[0].spaces) - (this.data.user.prices[0].occupied));
        if (parseInt(this.data['user'].suiteCount) == res) {
          this.action.Toast('Sorry, you cannnot select beyond the available space', 'top');
        }
        else {
          //this is the selected number of spaces
          this.data['user'].suiteCount++;
          let sub = ((this.data.user.prices[0].price) / (this.data.days));
          this.calcPrice(sub)
        }
        break;

      case '-':
        if (this.data['user'].suiteCount === 1) {
          this.action.Toast('Sorry, you must book at least a space', 'bottom');
        }
        else {
          //this is the selected number of spaces
          this.data['user'].suiteCount--;
          let sub = ((this.data.user.prices[0].price) / (this.data.days));
          this.calcPrice(sub)
        }
        break;
    }
  }

  calcPrice(sub) {
    //usong this to get the final calculation of suites booked
    let presub = sub * this.data['user'].counter;
    //this is the total money to be charged
    this.data['user']['total'] = presub * this.data['user'].suiteCount;
  }

  price = (item, i) => {
    this.data['count'] = i;
    this.data['user']['prices'] = [];
    this.data['user']['counter'] = 0;
    this.data['user']['total'] = 0;
    this.data['user']['suiteCount'] = 1;
    this.data.user.prices.push(item);
    this.data['user']['counter'] = this.data.user.prices[0].charge_per;
    this.data['days'] = this.data.user.prices[0].charge_per;
    let sub = ((this.data.user.prices[0].price) / (this.data.days));
    this.data['user']['total'] = sub * this.data.user.counter
    this.content.scrollToBottom(2000);
  }

  //use this for data time modal
  confirm = (ev) => {
    const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const day=new Date(this.data.dateTemp);

    const date=months[day.getMonth()]+" "+ day.getDate()+" "+day.getFullYear().toString();

    const time=day.getHours()+":"+day.getMinutes();

    this.data['dateTime'] = this.data.dateTemp;
    //this.data.user['day'] = this.action.formatDate(this.data.dateTemp);
    this.data.user['day']=date;
    //this.data.user['time'] = this.action.formatTime(this.data.dateTemp);
    this.data.user['time']=time;
    this.action.keyboardCtrl('remove');
  }

  //proceed with thier bookings here and first lload a confirm component
  proceed_book = () => {
    if (this.data.result.rules != undefined && this.data.comply) {
      this.run();
    }
    else if (this.data.result.rules == undefined) {
      this.run();
    }
    else {
      this.action.Toast('Kindly read the house rules and comply to proceed', 'bottom');
    }
  }

  run = () => {
    // used for test bed for reciept generation

    // const save = {
    //   data: {
    //   //  booking_id: this.data.user['booking_id'],
    //     total: this.data.user.total,
    //     grand: this.data.grand_total,
    //     data: this.data.user,
    //     currency: this.data.result.currency,
    //     details: this.data.result
    //   }
    // };
    // this.action.modalCreate(RecieptPage, save, 'reciept-modal');

    let service_charges = this.data.user.total * (this.action.data['percentage'] / 100);
    let total = service_charges + this.data.user.total;
    this.data['grand_total'] = total;
    
    const save = {
      service_charge: service_charges,
      total: this.data.user.total,
      grand: this.data.grand_total,
      data: this.data.user,
      currency: this.data.result.currency
    };
    this.action.saveItem(save);
    this.action.modalCreate(CheckoutPage, {}, '', {
      breakpoints: [0, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      initialBreakpoint: 0.9,
    }).then((res: any) => {
      if (res.data != undefined) {
        (res.data.con) ? this.book() : '';
      }
    })
  };

  //save bookings here
  saveBooking = () => {
    if (localStorage.getItem('user_data') !== null) {
      this.data.user['id'] = this.data.result.id;
      this.data.user['company'] = this.data.result.company;
      this.data.user['currency'] = this.data.result.currency;
      this.data.user['name'] = this.data.result.name;
      this.data.user['index'] = this.data.count;
      let saved = JSON.parse(localStorage.getItem('bookings')) || [];
      if (saved.length > 0) {
        let check = saved.some(res => res.id === this.data.user.id);
        if (check) {
          this.action.Toast('You have this item saved in your bookings already', 'top');
        }
        else {
          //save it
          let data = {
            ...this.data.user
          }
          saved.push(data);
          localStorage.setItem('bookings', JSON.stringify(saved));
          this.action.Toast('Item saved', 'top');
        }
      }
      else {
        saved = [];
        let data = {
          ...this.data.user
        }
        saved.push(data);
        localStorage.setItem('bookings', JSON.stringify(saved));
        this.action.Toast('Item saved', 'top');
      }
    }
    else {
      this.action.Toast('Kindly login to save your item', 'bottom');
      let props = {}
      this.action.modalCreate(LoginPage, props);
    }
  }

  //process booking
  book = async () => {
    //first check if user is logged in
    if (localStorage.getItem('user_data') !== null) {
      //next check if user is verified or not
      this.action.Load('Processing your request, please wait...');
      this.data['user_data'] = JSON.parse(localStorage.getItem('user_data'));
      this.fire.queryData('verification', 'user', this.data['user_data'].id).then(res => {
        if (res.empty) {
          this.action.LoadStop();
          this.action.alerter('Verification Error', 'Dear ' + this.data.user_data.firstname + ' It appears that you are yet to submit your documents for verification, kindly proceed to the homepage, use the side menu and go to your profile to start your verification process');
        }
        else {
          //check if it is in progress or not
          res.forEach(res => {
            this.data.loading = false;
            let data = res.data();
            if (data.verified == 0) {
              this.action.LoadStop();
              this.action.alerter('Verification Error', 'Dear ' + this.data.user_data.firstname + ' It appears that you are yet to submit your documents for verification, kindly proceed to the homepage, use the side menu and go to your profile to start your verification process');
            }
            else if (data.verified == 1) {
              this.action.LoadStop();
              this.action.alerter('Verification in progress', '<strong>Dear ' + this.data.user_data.firstname + '</strong><br>Your verification is in progress.<br> Please note that you cannot proceed to make bookings without being verified.<br> Your documents has been recieved and currently undergoing checks, kindly hold on as you will be notified when the outcome of the checks are ready.<br>  <strong>Thank you for using SuiteMonger</strong>');
            }
            else if (data.verified == 2) {
              //proceed to check the user balance here
              this.fire.queryData('transaction', 'user', this.data['user_data'].id).then(res => {
                if (res.empty) {
                  this.action.LoadStop();
                  this.action.alerter('Insufficient funds', 'Sorry, you do not have money in your wallet to carry on with this booking, kindly save this booking, recharge your wallet and go to my bookings to continue this transaction');
                }
                else {
                  let data = [];
                  res.forEach(res => {
                    data.push(res.data());
                  })
                  //calculate the user total and check if the balance is enough
                  this.action.calcTotal(data).then(bal => {
                    //check if balance is greater than the booking tota, then proceed, if not, revoke
                    if (bal >= this.data.grand_total) {
                      //proceed to save the bookings
                      this.data.user['id'] = this.data.result.id;
                      this.data.user['company'] = this.data.result.company;
                      this.data.user['currency'] = this.data.result.currency;
                      this.data.user['name'] = this.data.result.name;
                      this.data.user['index'] = this.data.count;
                      this.data.user['user'] = this.data['user_data'].id;
                      this.data.user['status'] = 0;
                      (this.data.result.rules == undefined) ? '' : this.data.user['rules'] = this.data.result.rules;
                      //create a unique booking id
                      let booking_id = this.action.generateId();
                      this.data.user['booking_id'] = booking_id;
                      let needed=this.data.user;
                      let dataN = { ...this.data.user }
                      if (this.fire.save(dataN, 'bookings/' + this.data.user['booking_id'])) {
                        //reduce the suite count from the number of  suite available
                        let data = this.data.result.prices;
                        let current = data[this.data.count];
                        //add the selected to the current available
                        current['occupied'] = current['occupied'] + this.data['user']['suiteCount'];
                        //save this up
                        let saver = {
                          prices: data
                        };
                        if (this.fire.updateNote(this.data.result.id, saver, 'houses')) {
                          //create a transaction instance and save to transaction table
                          let body = {
                            amount: -this.data.grand_total,
                            date: this.action.getDate(),
                            remark: 'Wallet debit for house booking',
                            t_id: window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now(),
                            time: this.action.getTime(),
                            user: this.data['user_data'].id
                          }
                          //save it up
                          if (this.fire.save(body, 'transaction/' + this.action.generateId())) {
                            //send mail to the user, send mail to seller and send mail to admin
                            //send notification to the user
                            var val = Math.floor(1000 + Math.random() * 90000);
                            let note = {
                              from: 'SuiteMonger Booking',
                              id: this.data['user_data'].id,
                              message: '<div><strong>Hello ' + this.data['user_data'].firstname + '</strong><br><p>Your booking with the id: <br><strong> ' + this.data.user['booking_id'] + '</strong> <br>was successful<br> A total amount of <strong>' + this.data.grand_total + '</strong> was charged for this transaction<br>This transaction will be reversed if the owner or provider of the booked apartment or hotel revokes this booking or you do so yourself, kindly proceed to log in to your account on your mobile application to monitor or revoke your booking before the booking day<br><strong>Thank you for using Suitemonger</strong></p>',
                              'note-id': val,
                              read: false,
                              date: this.action.getDate(),
                              time: this.action.getTime(),
                            }
                            this.fire.save(note, 'notification/' + val);
                            let body = {
                              address: this.data['user_data'].email,
                              message: '<div><strong>Hello ' + this.data['user_data'].firstname + '</strong><br><p>Your booking with the id: <strong> ' + this.data.user['booking_id'] + '</strong> was successful<br> A total amount of <strong>' + this.data.grand_total + '</strong> was charged for this transaction<br>This transaction will be reversed if the owner or provider of the booked apartment or hotel revokes this booking or you do so yourself, kindly proceed to log in to your account on your mobile application to monitor or revoke your booking before the booking day<br><strong>Thank you for using Suitemonger</strong></p>',
                              subject: 'Booking ' + this.data.user['booking_id']
                            }
                            this.action.post('sendmail', body).then(res => {

                              this.data['res'] = res;
                              if (this.data.res.data.status == 0) {
                                //mail the owner
                                //first fetch the house house owner
                                let sub = this.fire.getSingle('company', this.data['result'].company).subscribe(res => {
                                  let mail_2 = res.email;
                                  let body = {
                                    address: mail_2,
                                    message: '<div><strong>Hello</strong><br><p>You have client with booking with the id: <strong> ' + booking_id + '</strong><br>This transaction will be reversed if the owner or provider of the booked apartment or hotel revokes this booking, kindly proceed to log in to your account to monitor or revoke this booking before the booking day<br><strong>Thank you for using Suitemonger</strong></p>',
                                    subject: 'Booking ' + booking_id
                                  }
                                  this.action.post('sendmail', body).then(res => {
                                    this.data['res'] = res;
                                    if (this.data.res.data.status == 0) {
                                      //mail the admin
                                      let body = {
                                        address: 'suitemonger@gmail.com',
                                        message: '<div><strong>Hello Admin</strong><br><p>A booking with the id: <strong> ' + booking_id + '</strong> just occured, kindly login to the admin panel to check the details of this transaction</p>',
                                        subject: 'Booking ' + booking_id
                                      }
                                      this.action.post('sendmail', body).then((res: any) => {
                                        if (res.data.status == 0) {
                                          //all transaction was succesful, return succesa
                                          this.action.LoadStop();
                                          this.action.Toast('Your booking is succesful, please scroll to bookings to check and monitor  your bookings', 'top');
                                          //load the reciept modal here and allow them to save the screenshot to save
                                          const save = {
                                            data: {
                                              booking_id: booking_id,
                                              total: needed.total,
                                              grand: this.data.grand_total,
                                              data: needed,
                                              currency: this.data.result.currency,
                                              details: this.data.result
                                            }
                                          };
                                          this.action.modalCreate(RecieptPage, save, 'reciept-modal');
                                          this.action.navigate('root','/bookings')
                                        }
                                        else {
                                          this.action.LoadStop();
                                          this.action.alerter('Error', this.data.res.message);
                                        }
                                      }).catch(err => {
                                        this.action.LoadStop();
                                        this.action.alerter('Error1', err);
                                      })
                                    }
                                    else {
                                      this.action.LoadStop();
                                      this.action.alerter('Error2', this.data.res.message)
                                    }
                                  }).catch(err => {
                                    this.action.LoadStop();
                                    this.action.alerter('Error3', err);
                                  })
                                  sub.unsubscribe();
                                }, err => {
                                  this.action.LoadStop();
                                  this.action.alerter('Error4', err)
                                })
                              }
                              else {
                                this.action.LoadStop();
                                this.action.alerter('Error5', this.data.res.message);
                              }
                            }).catch(err => {
                              this.action.LoadStop();
                              this.action.alerter('Error6', err);
                            })
                          }
                          else {
                            //error
                            this.action.LoadStop();
                            this.action.alerter('Error', 'Sorry an error occured, please try again');
                          }
                        }
                        else {
                          //error
                          this.action.LoadStop();
                          this.action.alerter('Error', 'Sorry an error occured, please try again');
                        }
                      }
                      else {
                        //error
                        this.action.LoadStop();
                        this.action.alerter('Error', 'Sorry an error occured, please try again');
                      }
                    }
                    else {
                      this.action.LoadStop();
                      this.action.alerter('Insufficient funds!', 'Sorry you do not enough balance to make this booking, kindly proceed to add more funds to wallet and try again');
                    }
                  })

                }
              })
            }
          })
        }
      })
    }
    else {
      this.action.Toast('Kindly login to proceed to book your appartment, thanks', 'bottom');
      let props = {}
      this.action.modalCreate(LoginPage, props);
    }
  }

  showHost = (item) => {
    this.action.saveItem(item)
    this.action.modalCreate(HostPage, {}, '', {
      breakpoints: [0, 0.2, 0.5, 0.9, 1],
      initialBreakpoint: 0.9,
    });
  }
  defaultImg = (item, i) => {
    let img = "../assets/icon/user.png";
    this.data.result.review[i]['icon'] = img;
  }

  review = (item) => {
    this.action.saveItem(item);
    this.action.modalCreate(ReviewonePage, {}, 'search-modal');
  }
  openMap = () => {
    const data = {
      lat: this.data.result.lat,
      lng: this.data.result.long
    };
    this.action.saveItem(data);
    this.action.modalCreate(MinimapPage, {}, 'search-modal');
  }
}

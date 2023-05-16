import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { FireServiceService } from '../services/fire-service.service';
import { SliderServiceService } from '../services/slider-service.service';
import { IonContent } from '@ionic/angular';
import { LoginPage } from '../modals/login/login.page';
import { ReviewPage } from '../modals/review/review.page';

@Component({
  selector: 'app-booked',
  templateUrl: './booked.page.html',
  styleUrls: ['./booked.page.scss'],
})
export class BookedPage implements OnInit {
  data: any = {};
  @ViewChild(IonContent) content: IonContent;

  constructor(
    private action: ActionsService,
    private fire: FireServiceService,
    public slider: SliderServiceService

  ) {
    this.data['loading'] = true;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //use the given id here to find the data

    this.loadData(this.action.getItem());
  }

  loadData = (item) => {
    //load up data from the item first
    this.data['result'] = item;
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
    this.fetchHouse(item.id);
  }

  fetchHouse = (id) => {
    //then fetch the remaining details from the db
    this.data['sub1'] = this.fire.getSingle('houses', id).subscribe((res: any) => {
      if(res==undefined || res==null){
        this.action.alerter('Error', 'This property might have been removed or suspended, please contact the admin');
        //rectify all data to null
        this.data={};
        this.data['loading'] = true;
      }
      else{
      if (res.length < 0) {
        this.data['loading'] = false;
        this.action.alerter('Error', 'Sorry a network error occured, please try again');
      }
      else {
        //scroll all contents down
        this.data.loading = false;
        this.data['result2'] = res;
        this.content.scrollToBottom(2000);
        this.checkLike()
      }
    }
    }, err => {
      this.data.loading = false;
      this.action.alerter('Error', err)
    })
  }

  checkLike = () => {
    let user = JSON.parse(localStorage.getItem('user_data'));
    let likers = this.data.result2.likers || [];
    if (likers.length == 0) {
      this.data.liked = false;
    }
    else {
      let check = likers.some((res: any) => res.id == user.id);
      this.data.liked = check;
    }
  }
  ionViewWillLeave() {
    this.data.sub1.unsubscribe();
  }

  cancel_book = () => {
    //first  check for the date diffence in hours, 24 hrs, rmv percentage, higher than 24, process request, 0 or less, do not initiate.
    let timediff = this.action.getDateDiff(new Date(this.action.getDate()), new Date(this.data.result.day));
    if (this.data.result.prices[0].cancellation != undefined) {
      if (timediff >= 48) {
        //process request
        const props = {
          header: 'Confirm',
          message: 'Kindly note that according to booking cancellation policy from the owners of this property, you will be refunded:' + this.data.result.prices[0].cancellation[0]['48>'] + '% of the total payment excluding service charges',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'primary',
              handler: () => { }
            },
            {
              text: 'Proceed',
              role: 'proceed',
              cssClass: 'primary',
              handler: () => {
                //procced to cancel request here
                this.loadReason('norm');
              }
            }
          ]
        }
        this.action.alertBig(props)
      }
      else if (timediff >= 24 && timediff < 48) {
        //initiate complaint and deduct percentage
        const props = {
          header: 'Confirm',
          message: 'Kindly note that according to booking cancellation policy from the owners of this property, you will be refunded:' + this.data.result.prices[0].cancellation[0]['24>'] + '% of the total payment excluding service charges',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'primary',
              handler: () => { }
            },
            {
              text: 'Proceed',
              role: 'proceed',
              cssClass: 'primary',
              handler: () => {
                //procced to load reason parameter here
                this.loadReason('norm');
              }
            }
          ]
        }
        this.action.alertBig(props)
      }
      else if (timediff < 24) {
        //initiate complaint and deduct percentage
        const props = {
          header: 'Confirm',
          message: 'Kindly note that according to booking cancellation policy from the owners of this property, you will be refunded:' + this.data.result.prices[0].cancellation[0]['<24'] + '% of the total payment excluding service charges',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'primary',
              handler: () => { }
            },
            {
              text: 'Proceed',
              role: 'proceed',
              cssClass: 'primary',
              handler: () => {
                //procced to load reason parameter here
                this.loadReason('norm');
              }
            }
          ]
        }
        this.action.alertBig(props)
      }
    }
    else {
      this.loadReason('norm');
    }
  }

  loadReason = (type) => {
    const props = {
      header: 'Kindly state the reason for cancelling this booking to proceed, thanks',
      inputs: [
        {
          type: 'textarea',
          name: 'reason',
          placeholder: 'Reason'
        }
      ]
      ,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary',
          handler: () => { }
        },
        {
          text: 'Proceed',
          role: 'proceed',
          cssClass: 'primary',
          handler: (data) => {
            //procced to load reason parameter here
            if (data.reason == '') {
              this.action.Toast('Please fill in the details to proceed', 'top');
              return false;
            }
            else {
              this.action.Load('Processing your request, please wait..');
              this.initiateCancel(type, data.reason);
            }
          }
        }
      ]
    }
    this.action.alertBig(props)
  }

  initiateCancel = (type, reason) => {
    let user = JSON.parse(localStorage.getItem('user_data'));
    switch (type) {
      case 'norm':
        //first mark the booking to 4 and save add reason to the array;
        let body = {
          status: 3,
          reason: reason
        }
        this.fire.updateNote(this.data.result.booking_id, body, 'bookings').then((res: any) => {
          let total;
          const timediff = this.action.getDateDiff(new Date(this.action.getDate()), new Date(this.data.result.day));
          if (this.data.result.prices[0].cancellation != undefined) {
            if (timediff >= 48) {
              //remove % off of the transaction total and insert back into the transaction table against the user issuing a refund
              let percent = (this.data.result.prices[0].cancellation[0]['48>'] / 100) * this.data.user.total;
              //remove the percent from the total;
              total = percent;
            }
            else if (timediff >= 24 && timediff < 48) {
              //remove % off of the transaction total and insert back into the transaction table against the user issuing a refund
              let percent = (this.data.result.prices[0].cancellation[0]['24>'] / 100) * this.data.user.total;
              //remove the percent from the total;
              total = percent;
            }
            else if (timediff < 24) {
              //remove % off of the transaction total and insert back into the transaction table against the user issuing a refund
              let percent = (this.data.result.prices[0].cancellation[0]['<24'] / 100) * this.data.user.total;
              //remove the percent from the total;
              total = percent;
            }
          }
          else {
            total = this.data.user.total
          }

          let body = {
            amount: total,
            date: this.action.getDate(),
            remark: 'Wallet refund for booking cancellation',
            t_id: window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now(),
            time: this.action.getTime(),
            user: user.id
          }
          if (this.fire.save(body, 'transaction/' + this.action.generateId())) {
            let data = this.data.result2.prices;
            let current = data[this.data.result.index];
            //remove the selected from the suitecount
            current['occupied'] = current['occupied'] - this.data.result.suiteCount;
            //save
            let saver = {
              prices: data
            }
            if (this.fire.updateNote(this.data.result.id, saver, 'houses')) {
              //send the user a notification
              var val = Math.floor(1000 + Math.random() * 90000);
              let note = {
                from: 'SuiteMonger Booking',
                id: user.id,
                message: '<div><strong>Hello ' + user.firstname + '</strong><br><p>Your booking cancellation request with the id: <br><strong> ' + this.data.result.booking_id + '</strong> <br>was successful<br> A total amount of <strong>' + total + '</strong> was succesfully returned to your wallet<br><strong>Thank you for using Suitemonger</strong></p>',
                'note-id': val,
                read: false,
                date: this.action.getDate(),
                time: this.action.getTime(),
              }
              if (this.fire.save(note, 'notification/' + val)) {
                let body = {
                  address: user.email,
                  message: '<div><strong>Hello ' + user.firstname + '</strong><br><p>Your booking cancellation request with the id: <br><strong> ' + this.data.result.booking_id + '</strong> <br>was successful<br> A total amount of <strong>' + total + '</strong> was succesfully returned to your wallet<br><strong>Thank you for using Suitemonger</strong></p>',
                  subject: 'Booking ' + this.data.result.booking_id
                }
                this.action.post('sendmail', body).then((res: any) => {
                  if (res.data.status == 0) {
                    //mail the vendor
                    let sub = this.fire.getSingle('company', this.data.result.company).subscribe((res: any) => {
                      let address = res.email;
                      let body = {
                        address: address,
                        message: '<div><strong>Hello</strong><br><p>The booking with id: <strong> ' + this.data.result.booking_id + '</strong><br>Was successfully cancelled by the user as it is outside the range of penalty, no chargers were added to your earnings <br><strong>Thank you for using Suitemonger</strong></p>',
                        subject: 'Booking ' + this.data.result.booking_id
                      }
                      this.action.post('sendmail', body).then((res: any) => {
                        if (res.data.status == 0) {
                          //mail admin on the cancellation notification
                          sub.unsubscribe();
                          let body = {
                            address: 'suitemonger@gmail.com',
                            message: '<div><strong>Hello Admin</strong><br><p>A booking with the id: <strong> ' + this.data.result.booking_id + '</strong> was terminated by the user, kindly login to the admin panel to check the details of this transaction</p>',
                            subject: 'Booking ' + this.data.result.booking_id
                          }
                          this.action.post('sendmail', body).then((res: any) => {
                            if (res.data.status == 0) {
                              //all transaction was succesful, return succesa
                              this.action.LoadStop();
                              this.action.Toast('Your cancellation request was successful', top);
                              this.action.navigate('forward', '/bookings');
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
                          sub.unsubscribe();
                          this.action.LoadStop();
                          this.action.alerter('error', 'Sorry, an error occured');
                        }
                      }).catch(err => {
                        sub.unsubscribe();
                        this.action.LoadStop();
                        this.action.alerter('error', err);
                      })
                    })
                  }
                  else {
                    this.action.LoadStop();
                    this.action.alerter('error', 'Sorry, an error occured');
                  }
                }).catch(err => {
                  this.action.LoadStop();
                  this.action.alerter('error', err);
                })
              }
              else {
                this.action.LoadStop();
                this.action.alerter('error', 'Sorry, an error occured');
              }

            } else {
              this.action.LoadStop();
              this.action.alerter('Error', 'Sorry, an error occured');
            }
          }
          else {
            this.action.LoadStop();
            this.action.alerter('error', 'Sorry, an error occured');
          }
        }).catch(err => {
          this.action.LoadStop();
          this.action.alerter('Error', err)
        })
        break;

      case 'rev':
        //first mark the booking to 4 and save add reason to the array;
        let data = {
          status: 4,
          reason: reason
        }
        this.fire.updateNote(this.data.result.booking_id, data, 'bookings').then((res: any) => {
          //notify user
          var val = Math.floor(1000 + Math.random() * 90000);
          let note = {
            from: 'SuiteMonger Booking',
            id: user.id,
            message: '<div><strong>Hello ' + user.firstname + '</strong><br><p>Your booking cancellation request with the id: <br><strong> ' + this.data.result.booking_id + '</strong> <br>is in review<br> you will be notified once it this request is approved<br><strong>Thank you for using Suitemonger</strong></p>',
            'note-id': val,
            read: false
          }
          if (this.fire.save(note, 'notification/' + val)) {
            //mail admin
            let body = {
              address: 'suitemonger@gmail.com',
              message: '<div><strong>Hello Admin</strong><br><p>A booking termination request  with the id: <strong> ' + this.data.result.booking_id + '</strong> was initiated, kindly login to the admin panel to approve this request</p>',
              subject: 'Booking ' + this.data.result.booking_id
            }
            this.action.post('sendmail', body).then((res: any) => {
              if (res.data.status == 0) {
                this.action.LoadStop();
                this.action.Toast('Your cancellation request was succefull, will be approved  by the admin', 'top');
                this.action.navigate('forward', '/bookings');
              }
              else {
                this.action.LoadStop();
                this.action.alerter('Error', 'Sorry, an error occured');
              }
            }).catch(err => {
              this.action.LoadStop();
              this.action.alerter('Error', err)
            })
          }
          else {
            this.action.LoadStop();
            this.action.alerter('Error', 'Sorry, an error occured');
          }
        }).catch(err => {
          this.action.LoadStop();
          this.action.alerter('Error', err)
        })
        break;
    }
  }

  //working on likes and reviews here
  favorite = () => {
    let user = JSON.parse(localStorage.getItem('user_data'));
    let likes = this.data.result2.likes || 0;
    let likers = this.data.result2.likers || [];
    let details = {
      id: user.id,
    };
    likers.push(details);
    likes++;
    //update the like
    let body = {
      likes: parseInt(likes),
      likers: likers
    }
    //update
    this.fire.updateNote(this.data.result2.id, body, 'houses').then((res: any) => {
      //
    })
  }

  //to unlike
  unlike = () => {
    //first load pop to procee
    const props = {
      message: "Kindly drop a review to indicate the reason why you want to unlike this item",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary',
          handler: () => { }
        },
        {
          text: 'Proceed',
          role: '',
          cssClass: 'primary',
          handler: () => {
            this.review('unlike');
          }
        }
      ]
    }
    this.action.alertBig(props);
  }

  //review
  review(type: any = '') {
    //load the review modal
    this.action.modalCreate(ReviewPage, {}, '', {
      breakpoints: [0.3, 0.4, 0.6, 0.7],
      initialBreakpoint: 0.6,
    }).then((resp: any) => {
      if (resp.data == undefined) {

      }
      else {
        this.action.Load('Submitting review, please wait..');
        let user = JSON.parse(localStorage.getItem('user_data'));
        //check of  type is empty
        if (type !== '') {
          //remove the like
          let likes = this.data.result2.likes;
          likes--;
          let likers = this.data.result2.likers.filter((res: any) => res.id != user.id);
          let body = {
            likers: likers,
            likes: likes
          }
          this.fire.updateNote(this.data.result2.id, body, 'houses').then(() => {
            let reviews = this.data.result2.review || [];
            if (reviews.length == 0) {
              let rev = {
                name: user.firstname + ' ' + user.othername,
                id: user.id,
                icon: user.avatar_link,
                feel: resp.data.data.feel,
                comment: resp.data.data.comment
              }
              reviews.push(rev);
              let body = {
                review: reviews
              }
              this.fire.updateNote(this.data.result2.id, body, 'houses').then((resp: any) => {
                this.action.LoadStop();
                this.action.Toast('Review saved', 'top');
              })
            }
            else {
              let revy = reviews.filter((resp) => resp.id != user.id);
              let rev = {
                name: user.firstname + ' ' + user.othername,
                id: user.id,
                icon: user.avatar_link,
                feel: resp.data.data.feel,
                comment: resp.data.data.comment
              }
              revy.push(rev);
              let body = {
                review: revy
              }
              this.fire.updateNote(this.data.result2.id, body, 'houses').then((resp: any) => {
                this.action.LoadStop();
                this.action.Toast('Review saved', 'top');
              })
            }
          }).catch((err: any) => {
            this.action.LoadStop();
            this.action.alerter('Error', err)
          })
        }
        else {
          let reviews = this.data.result2.review || [];
          if (reviews.length == 0) {
            let rev = {
              name: user.firstname + ' ' + user.othername,
              id: user.id,
              icon: user.avatar_link,
              feel: resp.data.data.feel,
              comment: resp.data.data.comment
            }
            reviews.push(rev);
            let body = {
              review: reviews
            }
            this.fire.updateNote(this.data.result2.id, body, 'houses').then((resp: any) => {
              this.action.LoadStop();
              this.action.Toast('Review saved', 'top');
            })
          }
          else {
            let revy = reviews.filter((resp) => resp.id != user.id);
            let rev = {
              name: user.firstname + ' ' + user.othername,
              id: user.id,
              icon: user.avatar_link,
              feel: resp.data.data.feel,
              comment: resp.data.data.comment
            }
            revy.push(rev);
            let body = {
              review: revy
            }
            this.fire.updateNote(this.data.result2.id, body, 'houses').then((resp: any) => {
              this.action.LoadStop();
              this.action.Toast('Review saved', 'top');
            })
          }
        }
      }
    })
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { IonSegment } from '@ionic/angular';
import { FireServiceService } from '../services/fire-service.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  @ViewChild('segment') segment: IonSegment;
  data: any = {};
  constructor(
    private action: ActionsService,
    public fire: FireServiceService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.segmentChanged();
  }

  loadDefault = () => {
    this.data['loading'] = true;
    this.data['empty'] = false;
    this.data['result'] = [];
    let booking = JSON.parse(localStorage.getItem('bookings')) || [];
    (booking.length <= 0) ? this.data['empty'] = true : this.data['result'] = booking;
    this.data['current'] = this.segment.value;
    this.data.loading = false;
  }

  delete = (item) => {
    this.data.result = this.data.result.filter(res => res.name !== item.name && res.company !== item.company);
    localStorage.setItem('bookings', JSON.stringify(this.data.result));
  }

  view = (item) => {
    if (this.segment.value == 'saved') {
      let data = {
        load: false,
        item: item
      }
      this.action.saveItem(data);
      this.action.navigate('forward', '/house')
    }
    else {
      this.action.saveItem(item);
      this.action.navigate('forward', '/booked')
    }
  }

  //handle segment changes here
  segmentChanged = () => {
    if (this.segment.value == 'saved') {
      this.loadDefault();
    }
    else {
      this.data['loading'] = true;
      this.data['current'] = this.segment.value;
      this.data['result'] = [];
      const user = JSON.parse(localStorage.getItem('user_data'));
      this.fire.queryData('bookings', 'user', user.id, 'id',
        'desc').then(res => {
          if (res.empty) {
            this.data['loading'] = false;
            this.data['empty'] = true;
          }
          else {
            //load out the data saved in bookings by thisuser and filter by the status
            let results = [];
            res.forEach(res => {
              results.push(res.data());
            })
            //now filter the data
            this.data['result'] = results.filter(res => res.status == this.segment.value);

            this.data.loading = false;
            this.data.empty = false;

          }
        })
    }
  }

  process = (value) => {
    switch (value) {
      case '0':
        return 'pending booked';
        break;

      case '1':
        return 'active';
        break;

      case '2':
        return 'completed';
        break;

      case 'saved':
        return 'saved';
        break;

      case '3':
        return 'cancelled'
        break;
    }
  }

}

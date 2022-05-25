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
    this.loadDefault()
  }

  loadDefault = () => {
    this.data['loading'] = true;
    this.data['empty'] = false;
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
    let data = {
      load: false,
      item: item
    }
    this.action.saveItem(data);
    this.action.navigate('forward', '/house')
  }

  //handle segment changes here
  segmentChanged = (ev) => {
    if (ev.target.value == 'saved') {
      this.loadDefault();
    }
    else {
      this.data['loading'] = true;
      this.data['current'] = this.segment.value;
      this.data['result'] = [];
      const user = JSON.parse(localStorage.getItem('user_data'));
      Promise.all([this.fire.queryData('bookings', 'id', user.id), this.fire.queryData('bookings', 'status', ev.target.value)]).then(res => {
        let filter = (res.some(res => res.empty === true));
        if (filter) {
          this.data['loading'] = false;
          this.data['empty'] = true;
        }
        else {
          //load out the data saved in bookings by thisuser and filter by the status
          let results = [];
          res[0].forEach(res => {
            results.push(res.data());
          })
          //now filter the data
          this.data['result'] = results.filter(res => res.status == ev.target.value);
          console.log(this.data.result)

        }
      })
    }
  }
}

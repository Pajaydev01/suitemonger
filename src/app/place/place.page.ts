import { Component, OnInit } from '@angular/core';
import { FireServiceService } from '../services/fire-service.service';
import { ActionsService } from '../services/actions.service'

@Component({
  selector: 'app-place',
  templateUrl: './place.page.html',
  styleUrls: ['./place.page.scss'],
})
export class PlacePage implements OnInit {
  data: any = {};
  constructor(
    private provider: FireServiceService,
    public action: ActionsService,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //first get all the houses
    (this.action.getItem().lat == undefined || this.action.getItem().lat == null) ? this.action.navigate('back', '/map') : '';
    this.getHouses();
  }

  ionViewWillLeave() {
    this.data.sub.unsubscribe();
  }

  getHouses = () => {
    this.data['loading'] = true;
    this.data['sub'] = this.provider.getAll('houses').subscribe(res => {
      this.data['res'] = res;
      if (this.data.res.length !== 0) {
        (this.data['settings'] == undefined) ? this.data['settings'] = JSON.parse(localStorage.getItem('settings')) : '';
        //check that the settings is intact
        this.data['house'] = [];
        //check for houses that are not on suspension here
        let house = this.data.res.filter(res => res.status == 1);
        this.data['house'] = this.data['house'].concat(house)
        //do the calculations here
        this.calcDist();
      }
      else {
        this.data.loading = false;
        this.data.err = true;
        this.action.alerter('Error', 'Sorry, A network error occured');
      }
    }, err => {
      this.data.loading = false;
      this.data.err = true;
      this.action.alerter('Error', err);
    });
  }

  //do distance calculation for houses and hotels near users here
  calcDist = async () => {
    let saved = this.action.getItem();
    await this.data.house.forEach((res, index) => {
      this.action.calcCrow(saved.lat, saved.lng, res.lat, res.long).then(resp => {
        this.data.house[index]['distance'] = resp;
      }).catch(err => {
        this.action.alerter('Error', err)
      })
    })
    //loop through the houses and filter for both appartment  to know if they have any data then enable or disble the view ALL meny
    this.data['result'] = this.data.house.filter(res => res.distance < this.data.settings[0].distance) || false;
    this.data.loading = false;
  }

  goHouse = (item) => {
    let data = {
      load: true,
      item: item.id
    }
    this.action.saveItem(data);
    this.action.navigate('forward', '/house')
  }
}

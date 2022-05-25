import { Component } from '@angular/core';
import { FireServiceService } from '../services/fire-service.service';
import { ActionsService } from '../services/actions.service'
import { ListPage } from '../popovers/list/list.page';
import { DpcheckPage } from '../popovers/dpcheck/dpcheck.page';
import { SliderServiceService } from '../services/slider-service.service'
import { SignupPage } from '../modals/signup/signup.page';
import { LoginPage } from '../modals/login/login.page';
import { SearchPage } from '../modals/search/search.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  data: any = {};

  constructor(
    private provider: FireServiceService,
    public action: ActionsService,
    public slide: SliderServiceService,
  ) {
    this.data['slides'] = [
      {
        image: '../../assets/images/pexels-photo-572937.jpeg',
        text: 'House Rent',
        button: true,
        line: true,
        bText: 'Sign up',
        short: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam'
      },
      {
        image: '../../assets/images/branches-environment-grass-1067333.jpg',
        text: 'Join the train',
        line: true,
        button: false,
        short: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam'
      },
      {
        image: '../../assets/images/crp.jpg',
        line: true,
        text: 'Easy steps',
        button: true,
        bText: 'Register Now',
        short: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam'
      }];
    //subscribe to the modal events
    action.getPublished().subscribe(res => {
      this.data['events'] = res;
      switch (this.data.events.event_name) {
        case 'modal_resp':
          this.getUser();
          break;
        case 'logout':
          this.getUser();
          break;
        case 'settings':
          this.data['settings'] = this.data.events.data;
          break;
      }
    })
    this.data['backup_avatar'] = '../../assets/icon/person-circle-outline.svg';
  }

  //for loading first set of data
  loader = () => {
    this.data['loading'] = true;
    this.data['err'] = false;
    this.provider.getAll('categories').subscribe(res => {
      this.data['res'] = res;
      if (this.data.res.length !== 0) {
        this.data['categories'] = this.data.res;
        //make another request for the houses here
        this.getHouses();
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


    //check if platform is ready and initiate geolocation
    this.action.plat.ready().then(res => {
      if (this.action.plat.is('android')) {
        this.getNativeLoc();
      }
      else {
      }
    })
  }

  //go to category page here
  goCart = (data) => {
    this.action.saveItem(data);
    this.action.navigate('forward', '/category')
  }

  //using this to get current possition at intervals
  getNativeLoc = () => {
    this.action.geoloc.watchPosition().subscribe(res => {
      this.data['position'] = res;
      this.data['latitude'] = this.data.position.coords.latitude,
        this.data['longitude'] = this.data.position.coords.longitude
      this.data['locationReady'] = true;
      if (this.data.success) {
        this.calcDist();
      }
    }, err => {
      this.action.alerter('Location Error', err)
    })
  }


  getHouses = () => {
    this.provider.getAll('houses').subscribe(res => {
      this.data['res'] = res;
      if (this.data.res.length !== 0) {
        (this.data['settings'] == undefined) ? this.data['settings'] = JSON.parse(localStorage.getItem('settings')) : '';
        //check that the settings is intact
        this.data['house'] = [];
        this.data.loading = false;
        this.data['success'] = true;
        this.data['house'] = this.data['house'].concat(this.data.res)
        this.data.err = false;
        //do something for the favorite check here
        let favorites = this.data.house.filter(res => res.likes > 10);
        (favorites.length < 4) ? '' : favorites.length = 4;
        this.data['favorite'] = favorites;
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
    if (this.data.locationReady) {
      await this.data.house.forEach((res, index) => {
        this.action.calcCrow(this.data.latitude, this.data.longitude, res.lat, res.long).then(resp => {
          this.data.house[index]['distance'] = resp;
        }).catch(err => {
          this.action.alerter('Error', err)
        })
      })
      //loop through the houses and filter for both appartment  to know if they have any data then enable or disble the view ALL meny
      this.data['hotel'] = this.data.house.some(res => res.category === 20 && res.distance < this.data.settings[0].distance) || false;

      this.data['appartment'] = this.data.house.some(res => res.category === 2 && res.distance < this.data.settings[0].distance) || false;

    }
    else {
      setTimeout(() => {
        this.calcDist();
      }, 3000)
    }
  }

  //for loading loading modal
  signup() {
    let props = {}
    this.action.modalCreate(SignupPage, props);
  }
  //sign in
  login() {
    let props = {}
    this.action.modalCreate(LoginPage, props);
  }

  ionViewWillEnter() {
    this.getUser();
  }
  ngOnInit() {
    this.loader();
  }

  getUser() {
    (localStorage.getItem('user_data') === null) ? this.data['active'] = false : this.data['active'] = true;
    if (this.data.active) {
      this.data['user'] = JSON.parse(localStorage.getItem('user_data'));
      this.data.user['avatar_link'] = (this.data.user.avatar_link === undefined) ? this.data.backup_avatar : this.data.user.avatar_link;
    }
    else {
      this.action.disableMenu('first');
    }
  }

  openMenu(id) {
    this.action.enableMenu(id);
    this.action.openMenu(id);
  }

  logout() {
    localStorage.clear();
    //publish a logout event
    this.action.disableMenu('first');
    this.action.closeMenu('first');
    this.action.publishData({ event_name: 'logout', data: true })
  }

  search = () => {
    //create search element here
    let props = {
      //we need the categories here
      categories: this.data.categories
    }
    this.action.modalCreate(SearchPage, props, 'search-modal');
  }
  house = (item) => {
    let data = {
      load: true,
      item: item.id
    }
    this.action.saveItem(data);
    this.action.navigate('forward', '/house')
  }
}

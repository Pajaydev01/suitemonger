import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-minimap',
  templateUrl: './minimap.page.html',
  styleUrls: ['./minimap.page.scss'],
})
export class MinimapPage implements OnInit {
  data: any = {};
  constructor(
    private action: ActionsService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadMap();
  }

  loadMap = () => {
    let data = this.action.getItem();
    this.action.loadMapAddress(data).then((res: any) => {
      res.loader.load().then((google) => {
        //draw the map and drop the user pin, the listen to where they center to set the new coordinates;
        const map = new google.maps.Map(document.getElementById('map'), res.options);
        const marker = new google.maps.Marker({
          position: res.options.center,
          draggable: false,
          animation: google.maps.Animation.DROP,
          map,
          title: "Click to zoom",
        });
      })
        .catch(e => {
          // do something
          this.action.Toast('Sorry, an error occured', 'bottom')
          console.log('error', e);
        });
    }).catch(err => {
      console.log(err)
    })
  }
}

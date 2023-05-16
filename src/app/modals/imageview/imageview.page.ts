import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { SliderServiceService } from '../../services/slider-service.service'
@Component({
  selector: 'app-imageview',
  templateUrl: './imageview.page.html',
  styleUrls: ['./imageview.page.scss'],
})
export class ImageviewPage implements OnInit {
  data: any = {};
  constructor(
    private action: ActionsService,
    private slide: SliderServiceService
  ) { }

  ngOnInit() {
    //first retrieve retrieve the data sent
    this.data['items'] = this.action.getItem();
    //not to worry, data sent are always in array
  }

  ionViewWillEnter() {
  }

}

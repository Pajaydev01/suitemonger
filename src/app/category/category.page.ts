import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { FireServiceService } from '../services/fire-service.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {
  data: any = {};
  constructor(
    private action: ActionsService,
    private fire: FireServiceService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  this.action.getItem().id!=undefined?this.load(this.action.getItem()):this.action.navigate('back','/home')
  }

  load=(input)=>{
    this.data['name'] = input.name;
    this.data['loading'] = true;
    //search them out and output them
    this.fire.queryData('houses', 'category', parseInt(input.id)).then(res => {
      let results = [];
      res.forEach(res => {
        results.push(res.data());
      });
      //filter suspended houses away
      let resp = results.filter(res => res.status == 1);
      this.data['result'] = resp;
      this.data.loading = false;
    }).catch(err => {
      this.data.loading = false;
      this.data['error'] = true;
      this.action.alerter('Error', err);
    })
  };

  goHouse(item) {
    let data = {
      load: true,
      item: item.id
    }
    this.action.saveItem(data);
    this.action.navigate('forward', '/house')
  }
}

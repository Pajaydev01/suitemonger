import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { FireServiceService } from '../services/fire-service.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  data: any = {};

  constructor(
    public action: ActionsService,
    private provider: FireServiceService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //differentiate, if the type is houses or category
    let inputs = this.action.getItem();
    this.data['loading'] = true;
    this.data['input'] = inputs.search.input;
    this.data['type'] = inputs.type;
    if (inputs.type === "houses") {
      //search through houses directly from the de
      this.provider.queryData('houses', 'category', parseInt(inputs.search.category)).then(res => {
        let result = [];
        res.forEach(doc => {
          result.push(doc.data());
        })
        //remove suspended houses and filter the search here and proceed
        let resp = result.filter(res => res.status == 1);
        this.data.result = resp.filter(res => res.name.toLowerCase().includes(inputs.search.input.toLowerCase()));
        this.data.loading = false;
        this.data['isHouse'] = true;

      })
    }
    else {
      //type is category, do a direct filter
      this.data.loading = false;
      this.data['isCat'] = true;
      this.data['result'] = inputs.categories.filter(res => res.name.toLowerCase().includes(inputs.search.input.toLowerCase()));

    }
  }

  //go to category page here
  goCart = (data) => {
    this.action.saveItem(data);
    this.action.navigate('forward', '/category')
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

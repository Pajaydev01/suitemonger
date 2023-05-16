import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  @Input() categories: any;
  @Input() houses: any;
  data: any = {};

  constructor(
    private modal: ModalController,
    public action: ActionsService,
  ) {
    this.data['search'] = { input: '', category: '' }
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.data['categories'] = this.categories;
    this.data['all'] = [...this.categories, ...this.houses];
  }

  close() {
    this.modal.dismiss()
  }
  choose = (cat) => {
    this.data['selected'] = true;
    this.data['type'] = cat;
    (cat == 'all') ? this.action.modal.getTop().then((res) => { res.cssClass = 'search-modal2' }) : this.action.modal.getTop().then((res) => { res.cssClass = 'search-modal' });
  }

  filter = (ev) => {
    this.data['result'] = [];
    this.data.all.find((res: any) => {
      if (res.name.toLowerCase().includes(this.data.search.input2.toLowerCase())) {
        this.data.result.push(res);
      }
    });
  }

  proceed = () => {
    let { data } = this;
    const search = data.search;
    if (this.data.type === 'houses') {
      if (search.input === "" || search.category === "") {
        this.action.Toast('Please, select a category and enter a search query to proceed', 'bottom');
      }
      else {
        //close modal and send inputs down to the next page
        this.action.saveItem(data);
        this.modal.dismiss();
        this.action.navigate('forward', '/searchPage');
      }
    }
    else {
      if (search.input === "") {
        this.action.Toast('Please, select a category and enter a search query to proceed', 'bottom');
      }
      else {
        //close modal and send inputs down to the next page
        this.action.saveItem(data);
        this.modal.dismiss();
        this.action.navigate('forward', '/searchPage');
      }
    }
  }

  view = (data) => {
    if (data.prices === undefined) {
      //its a category type, load the category
      this.action.modal.dismiss();
      this.action.saveItem(data);
      this.action.navigate('forward', '/category');
    }
    else {
      //go to the house
      let items = {
        load: true,
        item: data.id
      }
      this.action.modal.dismiss();
      this.action.saveItem(items);
      this.action.navigate('forward', '/house')
    }
  }
}

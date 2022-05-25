import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  @Input() categories: any;
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
  }

  close() {
    this.modal.dismiss()
  }
  choose = (cat) => {
    this.data['selected'] = true;
    this.data['type'] = cat
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
}

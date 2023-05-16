import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { FireServiceService } from '../services/fire-service.service';
import { NotificationPages } from '../modals/notification/notification.page';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  data: any = {}
  constructor(
    private action: ActionsService,
    private provider: FireServiceService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getNotification()
  }

  getNotification = () => {
    this.data['loading'] = true;
    this.data['user'] = JSON.parse(localStorage.getItem('user_data'));
    this.provider.queryData('notification', 'id', this.data.user.id).then(res => {
      if (res.empty) {
        this.data['notify'] = false;
      }
      else {
        let data = [];
        this.data['result'] = {};
        res.forEach(res => {
          data.push(res.data())
        })
        let resp = data.filter(res => res.read == false);
        this.data['result']['unread'] = resp;
        this.data['result']['read'] = data.filter(res => res.read == true);
        this.data['count'] = resp.length;
        this.data['loading'] = false;
      }
    }).catch(err => {
      this.action.alerter('Error', err)
    })
  }

  view = (item, type) => {
    this.action.saveItem(item);
    this.action.modalCreate(NotificationPages, {}, 'search-modal', '').then(res => {
      //mark notification as read here and reload page
      if (type == 'unread') {
        this.data['loading'] = true;
        this.provider.updateNote(item['note-id'], { read: true }, 'notification').then(res => {
          this.getNotification();
        }).catch(err => {
          this.data.loading = false;
          this.action.alerter('Error', err)
        })
      }
    })
  }

  delete = (item) => {
    this.data.loading = true;
    this.provider.deleteNote(item['note-id'], 'notification').then(res => {
      this.getNotification();
    }).catch(err => {
      this.data.loading = false;
      this.action.alerter('Error', err)
    })
  }
}

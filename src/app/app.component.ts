import { Component } from '@angular/core';
import { FireServiceService } from './services/fire-service.service';
import { ActionsService } from './services/actions.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  data: any = {}
  constructor(
    private fire: FireServiceService,
    public action: ActionsService,
  ) {
   // this.action.splash.show();
    this.action.plat.ready().then(res => {
      //subscribe to back button
      this.action.backer();
      
      //hide splash scree
      this.action.hideSplash();
      this.action.startStatusBar();
      //fetch the settings here and save to localstorage as settings
      let settings = this.fire.getAll('settings').subscribe(res => {
        //for every changes observed, broadcast in the channel
        this.data['settings'] = res;
        this.action.publishData({
          event_name: 'settings',
          data: this.data.settings
        })
        localStorage.setItem('settings', JSON.stringify(this.data.settings))
      });
    });
  }
}

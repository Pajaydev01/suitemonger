import { Component, OnInit, Input } from '@angular/core';
import { ActionsService } from '../../services/actions.service'
@Component({
  selector: 'app-reciept',
  templateUrl: './reciept.page.html',
  styleUrls: ['./reciept.page.scss'],
})
export class RecieptPage implements OnInit {
  @Input() data: any;
  datas: any = {}
  constructor(
    private action: ActionsService
  ) {
    this.datas['loading'] = false
  }

  ngOnInit() {
  }

  ionViewWillEnter() {

  }
  save =async (id) => {
    this.datas.loading = true;
     this.action.convertPage('jpg', id).then((res:any) => {
      this.action.save(res.toDataURL("image/jpg")).then((uuid) => {
        this.action.shareFile(uuid, 'suitemonger', 'Booking reciept', 'Reciept').then((res) => {
          this.datas.loading = false;
          this.action.modal.dismiss();
          this.action.navigate('forward', '/bookings');
        }).catch((err) => {
          this.action.Toast('An error occured sharing', 'bottom');
          this.datas.loading = false;
          this.action.modal.dismiss();
          this.action.navigate('forward', '/bookings');
        })
      }).catch((err) => {
        this.action.Toast('Unable to save file', 'bottom');
        this.datas.loading = false;
        this.action.modal.dismiss();
        this.action.navigate('forward', '/bookings');
      })
    })
  }
}

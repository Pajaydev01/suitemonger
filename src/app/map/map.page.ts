import { Component, OnInit } from '@angular/core';
import { FireServiceService } from '../services/fire-service.service';
import { ActionsService } from '../services/actions.service'
import { PlaceSearchPage } from '../modals/place-search/place-search.page';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  data: any = {};
  constructor(
    private provider: FireServiceService,
    public action: ActionsService,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadMapNorm()
    this.loadSearch();
  }
  loadMapNorm() {
    this.action.loadMap().then((res: any) => {

      res.loader.load().then((google) => {
        //draw the map and drop the user pin, the listen to where they center to set the new coordinates;
        const map = new google.maps.Map(document.getElementById('map'), res.options);
        const marker = new google.maps.Marker({
          position: res.options.center,
          draggable: true,
          animation: google.maps.Animation.DROP,
          map,
          title: "Click to zoom",
        });
        // Create an info window to share between markers.
        const infoWindow = new google.maps.InfoWindow();
        //listen to drag event of the marker
        marker.addListener("drag", () => {

          //save the new coordinates and prompt to proceed
          this.data['lat'] = marker.getPosition().lat();
          this.data['lng'] = marker.getPosition().lng();
        });

        marker.
          map.addListener("center_changed", () => {
            // 3 seconds after the center of the map has changed, pan back to the
            // marker.
            window.setTimeout(() => {
              map.panTo(marker.getPosition() as google.maps.LatLng);
            }, 3000);
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


  //load the search place for address here
  loadSearch() {
    this.action.modalCreate(PlaceSearchPage, {}, 'search-modal', { backdropDismiss: false }).then(res => {
      if (res.data == undefined) {

      }
      else {
        //load the the marker with the said location
        const request = {
          query: res.data.data,
          fields: ["name", "geometry"],
        };
        // make request to draw another map
        this.action.loadMap().then((res: any) => {

          res.loader.load().then((google) => {
            //draw the map and drop the user pin, the listen to where they center to set the new coordinates;
            const map = new google.maps.Map(document.getElementById('map'), res.options);
            let service = new google.maps.places.PlacesService(map);


            service.findPlaceFromQuery(
              request,
              (
                results: google.maps.places.PlaceResult[] | null,
                status: google.maps.places.PlacesServiceStatus
              ) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  for (let i = 0; i < results.length; i++) {
                    this.createMarker(results[i], map, google);
                  }

                  map.setCenter(results[0].geometry!.location!);
                }
              }
            );
          })
            .catch(e => {
              // do something
              console.log(e)
            });
        }).catch(err => {
          console.log(err)
        })
      }
    });
  }

  createMarker(place: google.maps.places.PlaceResult, map, google) {
    if (!place.geometry || !place.geometry.location) return;
    let infowindow = new google.maps.InfoWindow();
    const marker = new google.maps.Marker({
      map,
      position: place.geometry.location,
      draggable: true,
      animation: google.maps.Animation.DROP
    });
    this.data['lat'] = marker.getPosition().lat();
    this.data['lng'] = marker.getPosition().lng();
    google.maps.event.addListener(marker, "drag", () => {
      this.data['lat'] = marker.getPosition().lat();
      this.data['lng'] = marker.getPosition().lng();
      infowindow.setContent(place.name || "");
      infowindow.open(map);
    });
  }


  //proceed to the page to load houses according to their selected coordinated here
  proceed = () => {
    let data = {
      lat: this.data.lat,
      lng: this.data.lng
    }
    this.action.saveItem(data);
    this.action.navigate('forward', '/place');
  }

}

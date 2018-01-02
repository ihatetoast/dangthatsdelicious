import axios from 'axios';
import { $ } from './bling';
//in layout.pug, there's already the google maps api loaded on
//function that takes a map and has some default lat long. see notes below

const mapOptions = {
  //atx
  center: { lat: 30.2, lng: -97.7},
  zoom: 10
}
function loadPlaces(map, lat = 30.2, lng = -97.7) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      if(!places.length){
        alert("No places found")
        return;
      }
      //create bounds to center the cluster of markers
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map(place => {
        //array destructuring (es6)
        const [placeLng, placeLat] = place.location.coordinates;
        // console.log(placeLng, placeLat);
        const position = { lat: placeLat, lng: placeLng};
        bounds.extend(position);
        const marker = new google.maps.Marker({ map, position });
        
        //attach place data to marker
        marker.place = place;
        return marker
      });
      //whensomeone clicks on the marker, show deets
      //addListener is google maps for add event listener
      markers.forEach(marker => marker.addListener('click', function(){
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        // infoWindow.setContent(this.place.name);
        infoWindow.setContent(html)
        infoWindow.open(map, this)
        // console.log(this.place);
      }));
      // zoom to fit the markers
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds)
    });
}
function makeMap(mapDiv){
  if(!mapDiv) return;
  // console.log(mapDiv);
  //make map and store in var
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map)
  const input = $('[name="geolocate"')
  // console.log(input);
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () =>{
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng())
  })
}

export default makeMap;

//see javascript30 for dynamically choosing geolocation
//navigator.geolocation.getCurrentPosition ... day 21


function autocomplete(input, latInput, lngInput) {
  console.log(input, latInput, lngInput);
  if(!input)return;
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    // console.log(place);
    //autopopulate the lng lat
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  //if enter hit, don't submit form
  input.on('keydown', (e) =>{
    if(e.keyCode === 13) e.preventDefault()
  });
}

export default autocomplete;
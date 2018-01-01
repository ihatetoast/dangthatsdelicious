import axios from 'axios';
//sanitize data 
import dompurify from 'dompurify';

//search results part
function searchResultsHTML(stores){
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
  //join because map returns an array
}


//typeahead part
function typeAhead(search){
  
  //if no search, just return
  if(!search) return;
  //need the input for the search field
  const searchInput = search.querySelector('input[name="search"]');
  //and the results div:
  const searchResults = search.querySelector('.search__results');
  // listen for input event (rmember that .on is from bling to mimic jquery)
  searchInput.on('input', function(){
    // if no value in search, hide the search results and return or if someone has backspaced to beginning
    if(!this.value){
      searchResults.style.display = 'none';
      return;
    }
    //show search results
    searchResults.style.display = 'block';
    // searchResults.innerHTML = ''
    //use axios to hit the api endpoint
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if(res.data.length){
        //use fcn from above and pass res.data
        //sanitize so noone can insert js scripts into our code
        searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
        }
        //tell them there are no results 
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found</div>`)
      })
      .catch(err => {
        console.error(err)
      });
  });
//handle keyboard inputs such as arrows up and down
  searchInput.on('keyup', (e) =>{
    // console.log(e.keyCode);
    //resulted in up is 38 and down is 40 enter is 13
    //if not pressing p down enter, who cares
    if(![38, 40, 13].includes(e.keyCode)){
      return;
    }
    // console.log("do something");
    //dealing with arrow down going to the first one when at the last and adding a class to the current line the arrow is on
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if(e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    }
    else if(e.keyCode === 40) {
      next = items[0]
    }
    else if(e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length-1];
    }
    else if(e.keyCode === 38) {
      next = items[items.length-1];
    }
    else if(e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if(current){
      current.classList.remove(activeClass)
    }
    next.classList.add(activeClass);
  })
};
export default typeAhead;
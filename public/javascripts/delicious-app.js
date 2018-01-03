import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import makeMap from './modules/map';
import typeAhead from './modules/typeAhead';
import autocomplete from './modules/autocomplete';
import ajaxHeart from './modules/heart';

//$ below is not es6. it's above and from bling.
//becomes pretend jquery
autocomplete( $('#address'), $('#lat'), $('#lng'))
typeAhead($('.search'))

makeMap( $('#map') )

//bling doc sel all
const heartForms = $$('form.heart')

// console.log(heartForms);
heartForms.on('submit', ajaxHeart)

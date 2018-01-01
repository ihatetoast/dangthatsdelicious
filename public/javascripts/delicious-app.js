import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import typeAhead from './modules/typeAhead';
import autocomplete from './modules/autocomplete';
//$ below is not es6. it's above and from bling.
//becomes pretend jquery
autocomplete( $('#address'), $('#lat'), $('#lng'))
typeAhead($('.search'))
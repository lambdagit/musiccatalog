"use strict";

const config = require('../config')
const Models = new (require('../models'))(config.dbase);

(async function(force){
await Models.getModel('track').sync({force:force});
await Models.getModel('catalog').sync({force:force});
await Models.getModel('user').sync({force:force});
console.log('sync done');
})(true)

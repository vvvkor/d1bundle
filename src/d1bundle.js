var d1 = require('d1css');
var d1calendar = require('d1calendar');
var d1dialog = require('d1dialog');
var d1edit = require('d1edit');
var d1gallery = require('d1gallery');
var d1lookup = require('d1lookup');
var d1tablex = require('d1tablex');
var d1valid = require('d1valid');


d1.load(function(){
  d1.init();
  d1dialog.init();
  d1gallery.init();
  d1calendar.init();
  d1lookup.init();
  d1edit.init();
  d1tablex.init();
  d1valid.init();
});

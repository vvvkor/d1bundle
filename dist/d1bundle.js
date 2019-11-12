(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*! d1calendar https://github.com/vvvkor/d1calendar */
/* Replacement of standard HTML inputs: date, datetime-local */

//[type="date|datetime-local"](.datetime).calendar[min][max][data-def]
if(typeof module !== "undefined") var d1 = require('d1css');
(function(){
var main = new(function() {

  "use strict";
  
  this.name = 'calendar';
  
  this.opt = {
    cBtn: 'pad c hover',
    dateFormat: 'd', //y=Y-m-d, d=d.m.Y, m=m/d Y
    hashCancel: '#cancel',
    hashNow: '#now',
    icons: ['date', 'now', 'delete'],//[['svg-date', '&darr;'], ['svg-ok', '&bull;'], ['svg-delete', '&times;']],
    idPicker: 'pick-date',
    minWidth: 801,
    qsCalendar: 'input.calendar',
    showModal: 0,
    sizeLimit: 801,
    stepMinutes: 1
  };

  this.win = null;

  this.init = function(opt) {
    var i;
    for(i in opt) this.opt[i] = opt[i];

    if(window.innerWidth < this.opt.minWidth) return;
    this.win = d1.ins('div', '', {id: this.opt.idPicker, className: 'hide'});
    this.win.style.whiteSpace = 'nowrap';
    d1.b('',[this.win],'click',function(n,e){ e.stopPropagation(); });
    this.toggle(0);
    //document.querySelector('body').appendChild(this.win);
    
    var t = document.querySelectorAll(this.opt.qsCalendar);
    for (var i = 0; i < t.length; i++){
      this.preparePick(t[i]);
      //t[i].addEventListener('focus', this.openDialog.bind(this, t[i], null), false);
      t[i].addEventListener('click', this.openDialog.bind(this, t[i], null), false);
      //t[i].addEventListener('blur', this.validate.bind(this, t[i], 0), false);
      t[i].addEventListener('input', this.validate.bind(this, t[i], 0), false);
    }
    d1.b('', [window], 'keydown', this.key.bind(this)); 
  }
  
  this.toggle = function(on, n){
    if(n){
      var m;
      if(Math.min(window.innerWidth, window.innerHeight) < this.opt.sizeLimit) m = 1;
      else{
        m = n.getAttribute('data-modal');
        m = m ? parseInt(m,10) : this.opt.showModal;
      }
      if(on){
        this.win.className = m ? 'dlg hide pad' : 'toggle pad';
        (m ? document.body : n.thePop).appendChild(this.win);
      }
    }
    d1.setState(this.win, on);
  }
  
  this.preparePick = function(n){
    n.vTime = (n.type == 'datetime-local' || n.classList.contains('datetime'));
    n.type = 'text';
    n.autocomplete = 'off';
    if(n.value) n.value = this.fmt(this.parse(n.value), 0, n.vTime);
    var pop = d1.ins('div','',{className:'pop wide l'}, n, -1); //''
    pop.style.verticalAlign = 'bottom';
    //pop.appendChild(n);
    n.thePop = pop;
    var ico = [];
    var ic = d1.ins('span', '', {}, n, 1);//icons container
    for(var i in this.opt.icons){
      d1.ins('', ' ', {}, ic);
      var ii = ic.appendChild(d1.i(this.opt.icons[i]));
      ii.style.cursor = 'pointer';
      ico.push(ii);
    }
    if(ico[0]) ico[0].addEventListener('click', this.openDialog.bind(this, n, null), false);
    if(ico[1]) ico[1].addEventListener('click', this.closeDialog.bind(this, n, true, null, null), false);
    if(ico[2]) ico[2].addEventListener('click', this.closeDialog.bind(this, n, '', null, null), false);
  }
  
  this.switchMonth = function(n, y, m, d, ch, ci, e){
    e.preventDefault();
    var h = ch ? parseInt(ch.textContent, 10) : 0;
    var i = ci ? parseInt(ci.textContent, 10) : 0;
    this.openDialog(n, new Date(y, m, d, h, i), e);
  }
  
  this.openDialog = function(n, d, e){
    e.stopPropagation();
    //n.parentNode.insertBefore(this.win, n.nextSibling);
    //n.parentNode.appendChild(this.win);
    this.toggle(1, n);
    this.build(n, d || n.value);
  }

  this.closeDialog = function(n, d, h, m, e){
    e.preventDefault();
    e.stopPropagation();
    if(n){
      this.setValue(n, d, h, m);
      n.focus();
    }
    this.toggle(0);
  }
  
  this.setValue = function(n, d, h, m){
    if(d !== null){
      n.value = (d===true) ? this.fmt(0, 0, n.vTime) : d;
      if(!(d===true && n.vTime) && h && m) n.value += ' ' + this.n(h.textContent) + ':' + this.n(m.textContent);
      this.validate(n, 0);
    }
  }
  
  this.n = function(v, l){
    return ('000'+v).substr(-(l || 2));
  }
  
  this.getLimit = function(n, a, t){
    var r = n.getAttribute(a);
    return r ? this.fmt(this.parse(r), 0, t, 'y') : (a == 'max' ? '9999' : '0000');
  }
  
  this.errLimits = function(n){
    var min = this.getLimit(n, 'min', n.vTime);
    var max = this.getLimit(n, 'max', n.vTime);
    var v = this.fmt(this.parse(n.value), 0, n.vTime, 'y');
    return (min && v<min) || (max && v>max) ? min + ' .. ' + max : '';
  }
  
  this.validate = function(n, re){
    n.setCustomValidity((re || n.value=='') ? '' : this.errLimits(n));
    n.checkValidity();
    n.reportValidity();
  }
  
  this.build = function(n, x){
    while(this.win.firstChild) this.win.removeChild(this.win.firstChild);
    if (typeof x === 'string') x = this.parse(x || n.getAttribute('data-def'));
    var min = this.getLimit(n, 'min', 0);
    var max = this.getLimit(n, 'max', 0);
    //time
    var ch = null;
    var ci = null;
    if(n.vTime){
        var p2 = d1.ins('p', '', {className: 'c'});
        var ph = this.btn('#prev-hour', d1.i('prev'), p2);
        var ch = d1.ins('span', this.n(x.getHours()), {className: 'pad'}, p2);
        var nh = this.btn('#next-hour', d1.i('next'), p2);
        d1.ins('span', ':', {className: 'pad'}, p2);
        var pi = this.btn('#prev-min', d1.i('prev'), p2);
        var ci = d1.ins('span', this.n(x.getMinutes()), {className: 'pad'}, p2);
        var ni = this.btn('#next-min', d1.i('next'), p2);
        ph.addEventListener('click', this.setTime.bind(this, n, ch, ci, -1, 'h'), false);
        nh.addEventListener('click', this.setTime.bind(this, n, ch, ci, +1, 'h'), false);
        pi.addEventListener('click', this.setTime.bind(this, n, ch, ci, -this.opt.stepMinutes, 'i'), false);
        ni.addEventListener('click', this.setTime.bind(this, n, ch, ci, +this.opt.stepMinutes, 'i'), false);
    }
   //buttons
    var y = x.getFullYear();
    var m = x.getMonth();
    var d = x.getDate();
    //var my = x.toString().split(/\s+/);
    //my = my[1] + ' ' + my[3];
    var my = this.n(m+1) + '.' + y;
    var p1 = d1.ins('p', '', {className: 'c'}, this.win);
    var now = this.btn(this.opt.hashNow, d1.i('now'), p1);
    var py = this.btn('#prev-year', d1.i('prev2'), p1);
    var pm = this.btn('#prev-month', d1.i('prev'), p1);
    var cur = d1.ins('span', my, {className: 'pad'}, p1);
    var nm = this.btn('#next-month', d1.i('next'), p1);
    var ny = this.btn('#next-year', d1.i('next2'), p1);
    var close = this.btn(this.opt.hashCancel, d1.i('close'), p1);
    d1.ins('hr', '', {}, this.win);
    now.addEventListener('click', this.closeDialog.bind(this, n, true, ch, ci), false);
    close.addEventListener('click', this.closeDialog.bind(this, n, null, null, null), false);
    py.addEventListener('click', this.switchMonth.bind(this, n, y-1, m, d, ch, ci), false);
    ny.addEventListener('click', this.switchMonth.bind(this, n, y+1, m, d, ch, ci), false);
    pm.addEventListener('click', this.switchMonth.bind(this, n, y, m-1, d, ch, ci), false);
    nm.addEventListener('click', this.switchMonth.bind(this, n, y, m+1, d, ch, ci), false);
    //dates
    var days = (new Date(y, m+1, 0)).getDate();//days in month
    var skip = ((new Date(y, m, 1)).getDay() + 6) % 7;//skip weekdays
    var max = Math.ceil((skip + days) / 7) * 7 - skip;
    var c, v, vv, sel, today, off, wd;
    var cd = this.fmt(new Date());
    var xd = this.fmt(x);
    var row;
    for(var i=-skip+1; i<=max; i++){
      wd = ((skip+i-1)%7)+1;
      if(wd == 1) row = d1.ins('div', '', {className:'row'}, this.win);
      if(i<1 || i>days) c = d1.ins('a', '', {className: 'pad c center'}, row);
      else{
        v = this.fmt(x, i);
        vv = this.fmt(x, i, 0, 'y');
        sel = (v == xd);
        today = false;//(v == cd);
        off = (min && vv<min) || (max && vv>max);
        c = d1.ins('a', i, {className: 'pad c center ' + (sel ? 'bg-w ' : '') + (today ? 'bg-y ' : '') + (off ? 'text-n ' : 'hover ') + (wd>5 ? 'text-e ' : '')}, row);
        if(!off){
          c.href = '#' + i;
          c.addEventListener('click', this.closeDialog.bind(this, n, v, ch, ci), false);
        }
      }
    }
    if(n.vTime){
      d1.ins('hr', '', {}, this.win);
      this.win.appendChild(p2);
    }
  }
  
  this.setTime = function(n, ch, ci, step, item, e){
    var max = (item == 'h') ? 24 : 60;
    var m = (item == 'h') ? ch : ci;
    e.preventDefault();
    //var v = (parseInt(n.textContent, 10) + step + max) % max;
    var v = parseInt(m.textContent, 10);
    var x = v % Math.abs(step);
    v += x ? (step>0 ? step-x : -x) : max+step;
    m.textContent = this.n(v % max);
    this.setValue(n, this.fmt(this.parse(n.value)), ch, ci);
  }

  this.parse = function(d){
    if(!d) d = '';
    var mode = d.indexOf('/')!=-1 ? 'm' : (d.indexOf('.')!=-1 ? 'd' : 'y');
    var seq = (mode=='m') ? [2, 0, 1] : (mode=='d' ? [2, 1, 0] : [0, 1, 2]);
    d = d.split(/\D/);
    while(d.length<6) d.push(d.length==2 ? 1 : 0);
    d = new Date(parseInt(d[seq[0]], 10), parseInt(d[seq[1]]-1, 10), parseInt(d[seq[2]], 10), parseInt(d[3], 10), parseInt(d[4], 10), parseInt(d[5], 10));
    if(!d.getFullYear()) d = new Date();
    return d;
  }
  
  this.fmt = function(x, i, t, f){
    if(!x) x = new Date();
    if(i) x = new Date(x.getFullYear(), x.getMonth(), i);
    var d = this.n(x.getDate());
    var m = this.n(x.getMonth()+1);
    var y = x.getFullYear();
    if(!f) f = this.opt.dateFormat;
    return (f=='m' ? m + '/' + d + ' ' + y : (f=='d' ? d + '.' + m + '.' + y : y + '-' + m + '-' + d))
      + (t ? ' '+this.n(x.getHours())+':'+this.n(x.getMinutes()) : '');
  }
  
  this.btn = function(h, s, p){
    return d1.ins('a', s, {href: h, className: this.opt.cBtn}, p);
  }
  
   this.key = function(n, e) {
     if (e.keyCode==27) if (d1.getState(this.win)) this.toggle(0);
  } 

  d1.plug(this);

})();

  if(typeof module !== "undefined") module.exports = main;
  else if(window) d1calendar = main;
})();
},{"d1css":2}],2:[function(require,module,exports){
/*! d1css v1.2.71 https://github.com/vvvkor/d1 */
/* Enhancements for d1css microframework */

(function(window, document, Element) {
  
  "use strict";

  
  //check single instance
  if (window && window.d1) {
    console.log("d1 already included");
  }
  else {

// begin module

var main = new(function() {

  "use strict";

  this.name = 'd1';
  
  this.opt = {
    cAct: 'act',
    cAlert: 'alert',
    cClose: 'close',
    cDialog: 'dialog',
    cGallery: 'gal',
    cHide: 'hide',
    cIcon: 'icon',
    cTabs: 'tabs',
    hashCancel: '#cancel',
    //internal
    cToggle: 'toggle',
    cJsControl: 'js-control',
    cJsHide: 'js-hide',
    cHashed: 'js-hashed',
    attrStr: 'data-str',
    minDesktop: 880,
    qsEsc: ".pop>div.toggle, .nav.toggle ul",//, .dlg, .full
    qsMem: ".mem, ul.tabs.mem+div>div, ul.mem ul[id]",
    qsRehash: "",
    //secondary
    qsJsShow: '.js-control:not(.js-hide)'
  };
  
  this.str = {
    cancel: 'Cancel',
    ok: 'OK',
    //input validation localization
    /*
    valueMissing: '- Please fill out this field.',
    typeMismatch: '- Please enter a valid %type%.',
    tooLong: '- Please shorten this text to %maxlength% characters or less.',
    tooShort: '- Please lengthen this text to %minlength% characters or more.',
    patternMismatch: '- Please match the requested format.',
    rangeUnderflow: '- Value must be greater then or equal to %min%.',
    rangeOverflow: '- Value must be less then or equal to %max%.',
    stepMismatch: '- Please enter a valid value. Value step is %step%.',
    badInput: '- Please enter a valid %type%!',
    //customError: '',
    */
    //icons
    _close: '&#x2715;',//'&times;',
    _delete: '&#x2715;',
    _edit: '&rarr;',
    _now: '&#x2713;',//'&bull;',
    _date: '#', //'&#x274f;',//'&darr;',
    _prev: '&lsaquo;',
    _next: '&rsaquo;',
    _prev2: '&laquo;',
    _next2: '&raquo;'
  };
  
  this.ico = {};
  
  this.noMem = 0;
  
  this.plugins = [];
  
  //common

  this.loadAll = function(cfg){
    this.load(this, cfg);
  }
  
  this.load = function(obj, cfg) {
    if (!obj) obj = this;
    this.b("", [document], "DOMContentLoaded", typeof obj === "function" ? obj : obj.init.bind(obj, cfg));
  }
 
  this.init = function(cfg) {
    if(!cfg){
      cfg = document.body.getAttribute('data-d1');
      if(cfg) cfg = JSON.parse(cfg);
    }
    var i;
    if(cfg){
      var opt = cfg.opt || cfg;
      for (i in opt) this.opt[i] = opt[i];
      for (i in cfg.str) this.str[i] = cfg.str[i];
      for (i in cfg.ico) this.ico[i] = cfg.ico[i];
    }
    this.opt.qsJsShow = '.' + this.opt.cJsControl + ':not(.' + this.opt.cJsHide + ')';
    
    if (location.hash == "#disable-js") return;
    if (window && !Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector; //ie9+
    this.getStrings();
    this.refresh();
    this.initPlugins(cfg ? cfg.plug : {});
  }
  
  this.plug = function(p) {
    this.plugins.push(p);
  }
  
  this.initPlugins = function(opts){
    for (var i in this.plugins) this.plugins[i].init(opts ? opts[this.plugins[i].name] : {});
  }
  
  this.q = function(s, i, n) {
    if (!s || s.match(/\.\d|[?&]/)) return i === undefined ? [] : null;
    var f = (i === 0) ? "querySelector" : "querySelectorAll";
    var a = (n || document)[f](s);
    if (i) a = a[i < 0 ? a.length + i : i];
    return a;
  }

  this.b = function(n, sel, type, fn) {
    var a = (typeof sel === "string") ? (n || document).querySelectorAll(sel) : sel;
    if (a.length) [].forEach.call(a, this.handle.bind(this, type, fn));
  }

  this.handle = function(type, fn, n) {
    type
      ? n.addEventListener(type, fn.bind(this, n), false)
      : fn.call(this, n);
  }

  this.ancestor = function(q, n) {
    //return n.parentNode.closest(q); //-ie
    do{
      if (n.matches && n.matches(q)) return n;
    } while (n = n.parentNode);
  }

  //basic

  this.showDialog = function(t, ask, enter, def) {
    t = t.replace(/<.*?>/g, '');
    if (!ask) return alert(t);
    else if (!enter) {
      if (confirm(t)) ask();
    }
    else{
      var v = prompt(t, def);
      if (v!==null) ask(v);
    }
  }
  
  this.openDialog = function(n, e) {
    return this.dialog(n, e);
  }
  
  this.dialog = function(n, e) {
    if (n.form && !n.form.checkValidity()) return;
    
    var p = n.getAttribute("data-prompt") || '';
    var t = n.getAttribute("data-caption") || n.title || p || '!'
    var h = false;
    var a = ((n.getAttribute("href") || "").substr(0, 1) == "#") ? {} : {_confirm: 1};
    if (n.classList.contains(this.opt.cAlert)) {
      alert(t);
      h = n.href || false;
    }
    else if (p) {
      var x = prompt(t, this.get(n.href, p) || "");
      if (x != null) {
        a[p] = x;
        h = this.arg(n.href, a);
      }
    }
    else {
      if (confirm(t)) h = n.form ? true : this.arg(n.href, a);//optional
    }
    if (h!==true) {
      e.preventDefault();
      e.stopPropagation();
      if (h) location.href = h;
    }
  }

  this.checkBoxes = function(b) {
    this.b(b.form, "input[type='checkbox'][class~='" + b.getAttribute('data-group') + "']", "", function(n, e) {
      n.checked = b.checked;
    })
  }
  
  this.alignCells = function(n) {
    var m = n.className.match(/\b[lcr]\d\d?\b/g);
    if (m) {
      for (var i = 0; i < m.length; i++) {
        this.b(n, "tr>*:nth-child(" + m[i].substr(1) + ")", "", function(c, e) {
          c.classList.add(m[i].substr(0, 1));
        });
      }
    }
  }

  this.gotoPrev = function(n, e) {
    if (!e || (e.clientX + e.clientY > 0 && e.clientX < n.clientWidth / 3)) {
      var p = n.previousElementSibling || this.q("a[id]", -1, n.parentNode);
      if (p.id) {
        location.hash = "#" + p.id;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }

  //toggle
  
  this.setToggle = function(n) {
    n.classList.add(this.opt.cToggle);
  }
  
  this.setState = function(n, on) {
    n.classList.add(this.opt.cJsControl);
    n.classList[on ? "remove" : "add"](this.opt.cJsHide);
  }
  
  this.getState = function(n) {
    return !n.classList.contains(n.classList.contains(this.opt.cJsControl) ? this.opt.cJsHide : this.opt.cHide);
  }
  
  this.toggle = function(n) {
    d1.setState(n, !d1.getState(n));
  }
  
  this.targetState = function(n, e, on) {
    if (e && on === undefined) {
      if (n.matches("ul." + this.opt.cTabs + "+div>div")) on = true; //tabs: on
      else on = !this.getState(n); //toggle
    }
    return on;
  }

  this.toggleClass = function(n, e) {
    var box = (n.type == 'checkbox');
    if (e && !box) e.preventDefault();
    var q = n.getAttribute("data-nodes") || n.hash;
    var c = n.getAttribute("data-class");
    var on = box ? n.checked : n.classList.contains(this.opt.cAct);
    if(e && !box) on = !on;
    if (c) this.b("", q, "", this.setClass.bind(this, n, c, on, e));
  }
  
  this.setClass = function(a, c, on, e, n){
    n.classList[on ? "add" : "remove"](c);
    a.classList[on ? "add" : "remove"](this.opt.cAct);
  }

  //n = #hash|link|target
  this.handleState = function(n, e, on) {
    if (on===undefined && n.hasAttribute("data-class")) return this.toggleClass(n, e);
    if (n && (n.hash || !n.tagName)) n = this.q(n.hash || n, 0); //target
    if (n && n.matches("." + this.opt.cToggle + "[id]")) {
      on = this.targetState(n, e, on);
      if (on) this.hideSiblings(n);//before setState!
      this.setState(n, on);
      this.updateLinks(on, n);
      if (!this.noMem) {
        this.store(n, on); //mem
        //hash change
        if (e && e.type=="click") {
          e.preventDefault();
          if (this.opt.qsRehash && n.matches(this.opt.qsRehash)) {
            if (on) this.addHistory("#" + n.id);
            else location.hash = this.opt.hashCancel;
          }
        }
      }
    }
  }

  this.show = function(n) {
    this.handleState(n, null, true);
  }

  this.hide = function(n) {
    this.handleState(n, null, false);
  }
  
  this.hideSiblings = function(n) {
    var p = n.parentNode;
    if (p.matches("ul.accordion li")) {
      this.b(p.parentNode, "ul", "", this.hide);
    }
    else if (p.matches("ul." + this.opt.cTabs + "+div")) {
      this.b(p, [].slice.call(p.children), "", this.hide);
    }
  }

  this.updateLinks = function(on, n, hash) {
    var id  = (typeof n === "string") ? n : n.id;
    if(hash) this.b("", "." + this.opt.cHashed, "", function(m) {
      m.classList.remove(this.opt.cHashed);
      m.classList.remove(this.opt.cAct);
    });
    if (id) this.b("", "a[href='#" + id + "']", "", function(m) {
      m.classList[on ? "add" : "remove"](this.opt.cAct);
      if(hash) m.classList[on ? "add" : "remove"](this.opt.cHashed);
    });
  }

  this.addHistory = function(h) {
    history.pushState({}, "", h);
    history.pushState({}, "", h);
    history.go(-1);
  }

  this.store = function(n, on) {
    if (n && n.id && localStorage && n.matches(this.opt.qsMem)) {
      //localStorage[on ? "setItem" : "removeItem"]("vis#" + n.id, 1); //store only shown
      localStorage.setItem("vis#" + n.id, on ? 1 : 0); //also store hidden
    }
  }
  
  this.restore = function(n, e) {
    this.noMem = 1;
    //hilite first tab
    this.b(n, "ul." + this.opt.cTabs + ">li:first-child>a", "", this.show);
    //restore from mem
    if (localStorage) {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        //if (k.substr(0, 4) == "vis#") this.show(k.substr(3)); //restore only shown
        if (k.substr(0, 4) == "vis#") {
          var d = this.q(k.substr(3), 0);
          if (d && d.matches(this.opt.qsMem)) this.handleState(d, null, localStorage.getItem(k)==1); //also restore hidden
        }
      }
    }
    this.noMem = 0;
  }

  //esc

  this.esc = function(n, e) {
    if (e && e.keyCode==90 && e.ctrlKey) localStorage.clear(); //ctrl+z
    if (!e || e.keyCode == 27 || e.button === 0) {
      //escape or click - check ancestor
      this.b("", this.opt.qsEsc, "", e ? this.checkHide.bind(this, e.keyCode ? null : e.target) : this.hide);
      //if(n && n.hash==this.opt.hashCancel) this.hide(this.ancestor(this.opt.qsEsc, n));
      if (location.hash.length > 0) {
        var d = this.q(location.hash, 0);
        if (!e || e.keyCode == 27 || (document.body.contains(e.target) && !this.ancestor(location.hash, e.target))) location.hash = this.opt.hashCancel;
      }
    }
  }
  
  this.checkHide = function(t, n) {
    if (n.matches(this.opt.qsJsShow)) {
      var a = t ? (this.ancestor('a',t) || t) : null;
      if (t ? (!n.parentNode.contains(t) && a.hash != '#'+n.id) : !this.q(this.opt.qsJsShow, 0, n)) this.hide(n);
    }
  }

  this.onHash = function() {
    if (location.hash) {
      this.show(location.hash);
      this.updateLinks(1, location.hash.substr(1), 1);
      var d = this.q(location.hash+' [name]', 0);
      if (d) d.focus();
    }
  }
  
  this.onResize = function() {
    var m = (window.innerWidth <= this.opt.minDesktop);
    m
      ? this.b('', '[data-class-mobile]', '', function(n){ n.className = n.getAttribute('data-class-mobile'); })
      : this.b('', '[data-class-desktop]', '', function(n){ n.className = n.getAttribute('data-class-desktop'); });
  }
  
  this.setValue = function(n, e) {
    e.preventDefault();
    var d = this.q(n.hash, 0);
    if (d) {
      d.value = n.getAttribute('data-value');
      this.esc();
    }
  }

  this.prepareColor = function(n, e) {
    var m = document.createElement("input");
    m.type = "text";
    m.value = n.value;
    m.size = 7;
    m.className = 'color';
    n.parentNode.insertBefore(m, n);
    n.parentNode.insertBefore(document.createTextNode(" "), n);
    this.b("", [n, m], "input", function(x, e){ (x==n ? m : n).value = x.value; });
  }
  
  //ajax
  
  this.getAjax = function(n, e) {
    e.preventDefault();
    var qs = n.getAttribute("data-target");
    this.ajax(n.getAttribute("href"), qs=='#' ? true : this.q(qs,0));
  }
  
  this.ajax = function(url, n, callback) {
    if (typeof n === "string" && n) n = document.querySelector(n);
    var req = new XMLHttpRequest();
    if (n || callback) req.addEventListener("load", this.recv.bind(this, req, n, callback));
    req.open("GET", url);
    req.send();
  }
  
  this.recv = function(req, n, callback, e) {
    if (req.status == "200") {
      if (n===true){
        this.showDialog(req.responseText);
      }
      else if (n) {
        n.innerHTML = req.responseText;
        var dlg = this.ancestor(".dlg, .full", n);
        if (dlg && dlg.id) location.hash = "#" + dlg.id;
      }
      if (callback) callback(req, n, e); // JSON.parse(req.responseText)
    }
    else console.error("XHTTP request failed", req);
  }
  
  //url
  
  this.get = function(h, p) {
    var v = false;
    if (p) {
      var re = new RegExp('([?&]' + p + '=)([^&]*)');
      var m = h.match(re);
      if (m) v = decodeURIComponent(m[2]).replace(/\+/, ' ');
    }
    return v;
  }
  
  this.arg = function(u, a) {
    var i = 0, h = '', k, s, re, m;
    m = u.match(/#.*$/);
    if (m) {
      h = m[0];
      u = u.substr(0, u.length - m[0].length);
    }
    for (k in a) {
      re = new RegExp('([?&]' + k + '=)([^&]*)');
      m = u.match(re);
      if (m) u = u.replace(re, '$1' + a[k]);
      else {
        s = (!i && u.indexOf('?')==-1) ? '?' : '&';
        u += s + k + '=' + encodeURIComponent(a[k]);
      }
      i++;
    }
    return u + h;
  }
  
  //insert
  
  //after: 0 = appendChild, 1 = siblingAfter
  this.ins = function(tag, t, attrs, n, after) {
    var c = document.createElement(tag || 'span');
    if (t && t.tagName) c.appendChild(t);
    else if (t) c.innerHTML = t; //c.appendChild(document.createTextNode(t||''));
    if (attrs) {
      for (var i in attrs) {
        if(i.match(/-/)) c.setAttribute(i.replace(/^-/, ''), attrs[i]);
        else c[i] = attrs[i];
      }
    }
    return n
      ? (after
        ? n.parentNode.insertBefore(c, after<0 ? n : n.nextSibling)
        : (after===false ? n.insertBefore(c, n.firstChild) : n.appendChild(c))
        )
      : c;
  }

  this.svg = function(i, c, alt) {
    if (!document.getElementById(i)) return this.ins('span', alt, {className: c || ''});
    return this.ins('span', '<svg class="' + this.opt.cIcon + ' ' + (c || '') + '" width="24" height="24"><use xlink:href="#' + i + '"></use></svg>');
  }
  
  this.i = function(s, c) {
    return this.svg(this.ico[s] || '', c || '', this.s('_' + s) );
  }
  
  //localization

  this.getStrings = function() {
    var d = document.querySelector('[' + this.opt.attrStr + ']');
    if (d) {
      var s = JSON.parse(d.getAttribute(this.opt.attrStr));
      for (var i in s) this.str[i] = s[i];
    }
  }

  this.s = function(s, def) {
    return this.str[s] || (def===undefined ? s : def);
  }

  //run

  this.refresh = function(n) {
    //set js
    if (!n) this.b("", "body", "", function(n) { n.classList.add("js"); });

    //a.dialog[href]([title]|[data-caption])[data-prompt], a.alert, input.dialog
    this.b(n, "." + this.opt.cAlert + ", ." + this.opt.cDialog, "click", this.openDialog);
    //check all checkbox [data-group] to [class]
    this.b(n, "input[data-group]", "click", this.checkBoxes);
    //table cells align
    this.b(n, "table[class]", "", this.alignCells);
    //gallery back
    this.b(n, "." + this.opt.cGallery + " a[id]", "click", this.gotoPrev);
    
    //prepere nav & tabs
    this.b(n, "ul." + this.opt.cToggle + " ul[id], ul." + this.opt.cToggle + "." + this.opt.cTabs +"+div>div[id]", "", this.setToggle);//,.dlg,.full
    //prepare togglers
    this.b(n, "." + this.opt.cToggle + "[id]", "", this.setState);
    //prepare tabs, mem
    this.restore();
    //prepare hash
    //if (location.hash) this.show(location.hash);
    this.onResize();
    this.onHash();
    //toggle visiblity or class
    this.b(n, "[data-class]", "", this.handleState);
    this.b(n, "a[href^='#'], [data-class]", "click", this.handleState);
    //set input value
    this.b(n, "a[href^='#'][data-value]", "click", this.setValue);
    //color input
    this.b(n, "input[type='color']", "", this.prepareColor);
    //escape closes targeted elements
    if (!n) this.b("", [window], "keydown", this.esc);
    //close on click out
    if (!n) this.b("", "html, a[href='" + this.opt.hashCancel + "']", "click", this.esc);//mousedown
    //[data-target]
    this.b("", "a[data-target]", "click", this.getAjax);
    //focus dialog
    this.b("", [window], "hashchange", this.onHash);
    //resize
    this.b("", [window], "resize", this.onResize);
  }

})();


// end module
// var isNode    = (typeof module !== 'undefined' && this.module !== module); // use module or global
// var isBrowser = (typeof window !== 'undefined' && this.window === this);

    if (typeof module !== "undefined") {
      //console.log("npm require d1", module);
      module.exports = main;
    }
    else if (window) {
      //console.log("browser include d1");
      window.d1 = main;
    }
  }

})(window, document, Element);
},{}],3:[function(require,module,exports){
/*! d1dialog https://github.com/vvvkor/d1dialog */
/* Replacement of standard Javascript dialogs: alert, confirm, prompt */

//a.alert([title]|[data-caption])
//a.dialog[href]([title]|[data-caption])[data-prompt][data-src][data-ok][data-cancel][data-reverse]
if(typeof module !== "undefined") var d1 = require('d1css');
(function(){
var main = new(function() {

  "use strict";
  
  this.name = 'dialog';
  
  this.opt = {
    argConfirm: '_confirm',
    ccDialog: 'dlg pad c',
    hashCancel: '#cancel',
    hashOk: '#ok',
    idPrefix: 'dlg'
  };

  this.win = null;
  this.seq = 0;

  this.init = function(opt) {
    var i;
    for(i in opt) this.opt[i] = opt[i];
    
    this.win = d1.ins('div', '', {
      id: this.opt.idPrefix + '0',
      className: this.opt.ccDialog + ' ' + d1.opt.cHide
    }, document.querySelector('body'));
    
    //override
    d1.dialog = this.dialog.bind(this);
    d1.showDialog = this.showDialog.bind(this);
  }

  this.dialog = function(n, e) {
    if(n.classList.contains(d1.opt.cAlert)) return this.alert(n, e);
    e.stopPropagation();
    if (n.form && !n.form.checkValidity()) return;

    if (n.vHref === undefined) n.vHref = n.getAttribute('href') || '';
    var h = n.vHref;
    var v = n.getAttribute('data-src');
    if (v) {
      v = document.querySelector(v);
      if (v) v = v.value;
    }
    var p = n.getAttribute('data-prompt') || '';
    var t = n.getAttribute('data-caption') || n.title || p || '!';
    var def = p ? d1.get(h, p) : '';
    //dialog
    var modal = !this.isDialogShown() && (!p || v === null || v === '');
    if (modal) {
      this.showDialog(t, 1, p, def, n);
      e.preventDefault();
    }
    else {
      var u = {};
      if (p) u[p] = v || n.vValue || '';
      if (this.opt.argConfirm && h.substr(0,1) != '#') u[this.opt.argConfirm] = 1; //h = d1.arg(h, {this.opt.argConfirm: 1});
      h = d1.arg(h, u);
      if (n.tagName == 'A') n.href = h;
    }
  }
  
  this.alert = function(n, e) {
    if (!this.isDialogShown()) {
      this.showDialog(n.getAttribute('data-caption') || n.title || '!', 0, 0, '', n);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  this.showDialog = function(t, ask, enter, def, n) {
    while (this.win.firstChild) this.win.removeChild(this.win.firstChild);
    this.seq++;
    if(location.hash == '#' + this.opt.idPrefix + this.seq) this.seq++;
    this.win.id = this.opt.idPrefix + this.seq;
    var x = d1.ins('a', d1.i('close'), {href:this.opt.hashCancel, className:d1.opt.cClose+' pad'}, this.win);
    var tag = t.indexOf('>')==-1 ? 'p' : 'div';
    d1.ins(tag, t, {className: enter ? 'l' : ''}, this.win);
    var inp = null;
    if(enter) {
      var p2 = d1.ins('p', '', {className: 'l'}, this.win);
      var inp = d1.ins('input', '', {type: 'text', value: def}, p2);
    }
    var p3 = d1.ins('p', '', {}, this.win);
    var warn = (t.substr(0,1)==' ') ? 1 : (n ? (n.className.match(/-[we]\b/) || d1.q('.bg-e,.bg-w,.text-e,.text-w',0,n)) : '');
    var reverse = n ? n.getAttribute('data-reverse') : 0;
    var cMain = 'btn pad ' + (warn ? 'bg-e' : 'bg-y');
    var cSec = 'btn pad bg-n';
    var ok = d1.ins('a', (n ? n.getAttribute('data-ok') : '') || d1.s('ok'), {href: this.opt.hashOk, className: reverse ? cSec : cMain}, p3);
    if (ask) {
      var no = d1.ins('a', (n ? n.getAttribute('data-cancel') : '') || d1.s('cancel'), {href: this.opt.hashCancel, className: reverse ? cMain : cSec}, ok, reverse ? -1 : 1);
      d1.ins('', ' ', {}, no, reverse ? 1 : -1);
    }
    if(inp) inp.addEventListener('keypress', this.dialogConfirm.bind(this, n, inp, ask), false);
    ok.addEventListener('click', this.dialogConfirm.bind(this, n, inp, ask), false);
    location.hash = '#' + this.win.id;
    if(inp) inp.select();
    else if(this.win.scrollHeight <= this.win.clientHeight) (reverse && no ? no : ok).focus();
  }
  
  this.dialogConfirm = function(n, inp, ask, e) {
    if(e.type == 'click' || e.keyCode == 13){
      e.preventDefault();
      e.stopPropagation();
      if (inp && n) n.vValue = inp.value;
      if(typeof ask === 'function'){
        d1.esc();
        ask(inp ? inp.value : null);
      }
      else{
        if(n) n.click()
        if(!n || n.target) d1.esc();
      }
      //var evt = new MouseEvent('click');
      //n.dispatchEvent(evt);
      //location.hash = this.opt.hashOk;
    }
  }
  
  this.isDialogShown = function() {
    //return document.querySelector('#' + this.win.id + ':target');
    return (location.hash == '#' + this.win.id);
  }
  
  d1.plug(this);

})();

  if(typeof module !== "undefined") module.exports = main;
  else if(window) d1dialog = main;
})();
},{"d1css":2}],4:[function(require,module,exports){
/*! d1edit https://github.com/vvvkor/d1edit */
/* Lightweight WYSIWYG text editor */

//textarea.edit[data-wys=""|"1"][data-tools], textarea.adjust
if(typeof module !== "undefined") var d1 = require('d1css');
(function () {
var main = new(function () {

  "use strict";

  this.name = 'edit';
  
  this.opt = {
    qsAdjust: 'textarea.adjust',
    qsEdit: 'textarea.edit',
    height: 30,//em
    tools: '/*@xbi_.#123p|c,s^vdqf~T(=)j+-'
  };
  
  this.btn = {
    '/': ['src', '', '/', 'Source'],
    '*': ['insertimage', '~', '*', 'Image'],
    '@': ['createlink', '~', '@', 'Link'],
    'x': ['unlink', '', '&times;', 'Unlink'],
    'b': ['bold', '', '<b>B</b>', 'Bold'],
    'i': ['italic', '', '<i>I</i>', 'Italic'],
    '_': ['removeformat', '', '_', 'Unformat'],
    '.': ['insertUnorderedList', '', '&bull;', 'List'],
    '#': ['insertOrderedList', '', '#', 'Ordered'],
    '1': ['formatblock', '<h1>', 'H1', 'Head 1'],
    '2': ['formatblock', '<h2>', 'H2', 'Head 2'],
    '3': ['formatblock', '<h3>', 'H3', 'Head 3'],
    'p': ['formatblock', '<p>', '&sect;', 'Paragraph'],
    '|': ['tools', '', '&hellip;', 'Tools'],
    //more
    //inline
    'c': ['inserthtml', '<code>^</code>', '{}', 'Code'],
    ',': ['inserthtml', '<abbr title="~">^</abbr>', 'A.B.', 'Abbreviation'],
    's': ['strikeThrough', '', '<s>S</s>', 'Strike through'],
    '^': ['subscript','','a<sub>x</sub>','Subscript'],
    'v': ['superscript','','a<sup>x</sup>','Superscript'],
    //block
    'd': ['formatblock', '<div>', 'D', 'Div'],
    'q': ['formatblock', '<blockquote>', '&#8220;', 'Block quote'],
    'f': ['formatblock', '<pre>', '[]', 'Preformatted'],
    '~': ['inserthorizontalrule', '', '&minus;', 'Horizontal ruler'],
    'T': ['inserthtml', '<table><tr><th>#<th>#<tr><td>-<td>-</table>', 'T', 'Table'],
    //more
    '(': ['justifyLeft', '', '&lt;', 'Justify left'],
    '=': ['justifyCenter', '', '=', 'Justify center'],
    ')': ['justifyRight', '', '&gt;', 'Justify right'],
    'j': ['justifyFull', '', '&equiv;', 'Justify full'],
    '+': ['indent', '', '&raquo;', 'Increase indent'],
    '-': ['outdent', '', '&laquo;', 'Decrease indent']
    /*
    'u': ['underline', '', 'U', 'Underline'],
    'C': ['foreColor','~','TC','Text color','#c00'],
    'h': ['hiliteColor','~','HC','Hilite color','#ff0'],
    'B': ['backColor','~','BC','Back color','#eee'],
    'S': ['fontSize','~','FS','Font size',4],
    'F': ['fontName','~','FN','Font name','serif'],
    'L': ['inserthtml','<div class="pad bg left">^</div>','FL','Float left'],
    'R': ['inserthtml','<div class="pad bg right">^</div>','FR','Float right']
    */
  };

  this.init = function (opt) {
    var i;
    for (i in opt) this.opt[i] = opt[i];
    d1.b('', this.opt.qsEdit, '', this.prepare.bind(this));
    d1.b('', this.opt.qsAdjust, '', this.setStyle.bind(this));
    d1.b('', this.opt.qsAdjust, '', this.adjust.bind(this));
    d1.b('', this.opt.qsAdjust, 'input', this.adjust.bind(this));
    d1.b('', this.opt.qsAdjust, 'mouseup', this.resized.bind(this));
    d1.b('', [window], 'resize', d1.b.bind(d1, '', this.opt.qsAdjust, '', this.adjust.bind(this)));
  }

  this.prepare = function (n) {
    if(!n.theWys){
      var m = d1.ins('nav', '', {className: 'bg'}, /*d*/ n, -1);
      var mm = d1.ins('div');
      var zc = d1.ins('div', '', {className:'js-subinput'}, n, 1)
      var z = d1.ins('div', '', {className: d1.opt.cHide + ' bord pad'}, zc);
      z.setAttribute('contenteditable', true);
      z.theArea = n;
      z.theNav = m;
      n.theWys = z;
      if(n.id) {
        z.id = 'lookup-' + n.id;
        d1.b('', '[for="' + n.id + '"]', 'click', function(lbl, e) { if(d1.getState(z)) z.focus(); });
      }
      d1.setState(mm, 0)
      var t = (n.getAttribute('data-tools') || this.opt.tools).split('');
      var to = m, a, b;
      for (var i in t) {
        b = this.btn[t[i]];
        a = d1.ins('a', b[2], {href: '#cmd-' + b[0]/*i*/, title: b[3], className: 'pad hover'}, to);
        if(b[0] == 'tools') to = mm;
        a.onclick = this.cmd.bind(this, z, b, a);
      }
      m.appendChild(mm);
      //d1.b(m, 'a', 'click', this.cmd.bind(this, z));
      n.className += ' bord pad';
      n.style.width = '100%';
      this.setStyle(n);
      this.setStyle(z);
      var l = d1.ancestor('label', n) || n;
      d1.b('', [z], 'blur', this.up.bind(this, 0));
      d1.b('', [z], 'input', this.up.bind(this, 0));//for validation
      //d1.b('', [n], 'input', this.adjust.bind(this));
    }
    this.up(1, n.theWys);
    this.modeAuto(n);
  }
  
  this.modeAuto = function(n){
    var t = (n.getAttribute('data-tools') || this.opt.tools).split('');
    var wys = n.getAttribute('data-wys');
    if(wys===null) wys = (t.indexOf('/')==-1) || (n.value.match(/(>|&\w+;)/) && !n.value.match(/<script/i));
    this.mode(n.theWys, wys);
  }

  this.cmd = function (z, b, n, e) {
    if(e) e.preventDefault();
    //var b = this.btn[n.hash.substr(4)];
    if (b[0] == 'src') this.mode(z, !d1.getState(z), 1);
    else if (b[0] == 'tools'){
      var mm = d1.q('div', 0, n.parentNode);
      if(mm) d1.toggle(mm);
    }
    else {
      var arg = b[1];
      if (arg.match(/~/)) {
        var q = prompt(b[3], b[4] || '');
        arg = q === null ? q : arg.replace(/~/, q);
        if (arg && arg.match(/@/)) arg = 'mailto:' + arg;
      }
      if (arg) arg = arg.replace('^', document.getSelection());
      z.focus();
      if (arg !== null) document.execCommand(b[0], false, arg);
      if (b[2] == '*') {
        this.up(0, z);
        this.up(1, z);
      }
    }
  }

  this.up = function (w, z) {
    if (w) z.innerHTML = z.theArea.value;
    else z.theArea.value = z.innerHTML.
      replace(/(\shref=")!/ig, ' target="_blank"$1').
      replace(/(\ssrc="[^"]+#[a-z]*)(\d+%?)"/ig, ' width="$2"$1"');
      //.replace(/(\ssrc="[^"]+)#([lrc])"/ig,' class="$2"$1"');
    if(!w && (typeof(Event) === 'function')) z.theArea.dispatchEvent(new Event('input'));//-ie
  }

  this.mode = function (z, w) {
    d1.setState(z, w);
    d1.setState(z.theArea, !w);
    if(!w){
      if(z.style.height) z.theArea.style.height = z.style.height;
      else this.adjust(z.theArea);
    }
    this.up(w, z);
    d1.b(z.theNav, 'a', '', function (n) {
      if(n.hash != '#cmd-src') d1.setState(n, w);
    });
    z.theArea.theManual = 0;
    z.theArea.style.width = '100%';
  }

  this.setStyle = function(n){
    //n.style.resize = 'vertical'; //both
    n.style.overflow = 'auto';
    n.style.minHeight = '3em';
    n.style.maxHeight = '80vh';//n.type ? '80vh' : this.opt.height + 'em';
    this.storeSize(n);
  }
  
  this.storeSize = function(n){
    n.theH = n.clientHeight;
    n.theW = n.clientWidth;
  }
  
  this.resized = function(n){
    if(n.theH !== n.clientHeight || n.theW !== n.clientWidth) n.theManual = 1;
  }
  
  this.adjust = function(n){
    if(n.theManual) return;
    //1. jumps
    //n.style.height = 'auto';
    //n.style.height = (24 + n.scrollHeight) + 'px';
    //2. not exact
    //n.style.height = (1.5 * (2 + Math.max(n.value.length/50, (n.value.match(/\n/g) || []).length))) + 'em';
    //3. better
    var a = n.value.split(/\n/)
      .map(function(v){ return Math.ceil(10 * (1 + v.length) / (n.clientWidth || 500)); })
      .reduce(function(v, r){ return r + v; });
    n.style.height = Math.min(1.5 * (2 + a), parseFloat(this.opt.height)) + 'em';
    this.storeSize(n);
  }

  d1.plug(this);

})();

  if (typeof module !== "undefined") module.exports = main;
  else if (window) d1edit = main;
})();
},{"d1css":2}],5:[function(require,module,exports){
/*! d1gallery https://github.com/vvvkor/d1gallery */
/* Lighweight image gallery */

//.gallery a.pic
if(typeof module !== "undefined") var d1 = require('d1css');
(function () {
var main = new(function () {

  "use strict";

  this.name = 'gallery';
  
  this.opt = {
    hashCancel: '#cancel',
    idPrefix: 'pic',
    num: true,
    qsGallery: '.gallery',
    qsLinks: 'a.pic'
  };
  
  this.seq = 0;
  
  this.init = function (opt) {
    var i;
    for (i in opt) this.opt[i] = opt[i];
    d1.b('', this.opt.qsGallery, '', this.prepare.bind(this));
    d1.b('', [window], 'keydown', this.key.bind(this));
    d1.b('', [window], 'hashchange', this.loadTarget.bind(this));
    if(location.hash) this.loadTarget();
  }
  
  this.loadTarget = function() {
    var n = d1.q(location.hash, 0);
    if(n) {
      this.loadImg(n);
      this.loadImg(d1.q(n.hash, 0));
    }
  }
  
  this.loadImg = function(n){
    if(n && n.vImg){
      n.style.backgroundImage = 'url("' + n.vImg + '")';
      n.vImg = '';
    }
  }
  
  this.prepare = function (n) {
    var g = d1.ins('div', '', {className: d1.opt.cGallery});
    var a = n.querySelectorAll(this.opt.qsLinks);
    var z = a.length;
    for(var i=0; i<z; i++) if(!a[i].vDone) {
      this.seq++;
      var p = d1.ins('a', '', {
          id: this.opt.idPrefix + this.seq,
          href: '#' + this.opt.idPrefix + (this.seq + 1 - (i==z-1 ? z : 0))
          }, g);
      //p.style.setProperty('--img', 'url("' + a[i].getAttribute('href') + '")');
      //p.style.backgroundImage = 'url("' + a[i].getAttribute('href') + '")';//preload all
      p.vLink = a[i].getAttribute('href');//real link
      p.vImg = a[i].getAttribute('href');//preload prev & next
      p.setAttribute('data-info', (this.opt.num ? (i+1)+'/'+z+(a[i].title ? ' - ' : '') : '') + (a[i].title || ''));
      a[i].href = '#' + p.id;
      a[i].vDone = 1;
    }
    d1.ins('a', d1.i('close'), {href: this.opt.hashCancel, className: d1.opt.cClose}, g);
    d1.b(g, 'a[id]', 'click', d1.gotoPrev);
    document.querySelector('body').appendChild(g);
  }

   this.key = function(n, e) {
    if(location.hash) {
      var a = document.getElementById(location.hash.substr(1));
      if(a && a.hash){
        var k = e.keyCode;
        if (k==37 || k==38) d1.gotoPrev(a);
        else if (k==39 || k==40) location.hash = a.hash;//a.click();
        else if(k==8 && a.vLink) location.href = a.vLink;
      }
    }
  }

  d1.plug(this);

})();

  if (typeof module !== "undefined") module.exports = main;
  else if (window) d1gallery = main;
})();
},{"d1css":2}],6:[function(require,module,exports){
/*! d1lookup https://github.com/vvvkor/d1lookup */
/* Autocomplete lookups with data from XHTTP request */

//a.lookup[data-table]
if(typeof module !== "undefined") var d1 = require('d1css');
(function(){
main = new(function() {

  "use strict";

  this.name = 'lookup';

  this.opt = {
    attrLabel: 'data-label',
    attrLookup: 'data-lookup',
    attrUrl: 'data-url',
    attrGoto: 'data-goto',
    cacheLimit: 0,
    icon: 'edit',
    idList: 'lookup-list',
    max: 10,
    wait: 300
  };
  
  this.seq = 0;
  this.win = null;
  this.inPop = 0;

  this.init = function(opt) {
    var i;
    for(i in opt) this.opt[i] = opt[i];
    this.win = d1.ins('div', '', {id: this.opt.idList, className: 'toggle'});
    d1.setState(this.win, 0);
    document.querySelector('body').appendChild(this.win);

    var t = document.querySelectorAll('[' + this.opt.attrLookup + ']');
    for (i = 0; i < t.length; i++) this.prepare(t[i]);
    d1.b('','[data-chain]','change',this.updateChain.bind(this));
    d1.b('','[data-chain]','',this.updateChain.bind(this));   }

  this.prepare = function(n) {
    var pop = d1.ins('div','',{className:'pop'});
    n.parentNode.insertBefore(pop, n);
    if(!this.inPop) pop.style.verticalAlign = 'bottom';
    n.thePop = pop;
    n.classList.add('bg-n');
    n.classList.add('hide');
    //n.type = 'hidden';
    n.vLabel = n.getAttribute(this.opt.attrLabel) || n.value || '';//@@
    var mc = this.inPop ? pop : d1.ins('span', '', {className:'js-subinput'}, n, 1);
    var m = d1.ins('input', '', {type: 'text', value: n.vLabel, className:'input-lookup'}, mc);
    m.name = 'lookup-' + n.name;
    //m.required = n.required;
    //n.required = false;
    if(n.id) {
      m.id = 'lookup-' + n.id;
      if(n.title) m.title = n.title;
      d1.b('', '[for="' + n.id + '"]', '', function(lbl, e) { lbl.htmlFor = m.id; });
    }
    if(n.placeholder) m.placeholder = n.placeholder;
    m.autocomplete = 'off';
    var i = null;
    if(n.getAttribute(this.opt.attrUrl)){
      i = d1.ins('a', d1.i(this.opt.icon), {}, mc, 1);
      i.style.cursor = 'pointer';
      d1.ins('', ' ', {}, mc, 1);
    }
    this.setHandlers(n, m, i);
  }
  
  this.setHandlers = function(n, m, i) {
    n.vCap = m;
    m.addEventListener('input', this.planFind.bind(this, n, 0), false);
    m.addEventListener('keydown', this.key.bind(this, n), false);
    if(i) i.addEventListener('click', this.go.bind(this, n), false);
  }
  
  this.planFind = function(n, now){
    if(n.vCap.value===''){
      this.fix(n, '', '');
    }
    else{
      this.seq++;
      n.vSeq = this.seq;
      if(n.vWait) clearTimeout(n.vWait);
      if(n.vCache && n.vCache[n.vCap.value]) this.openList(n, n.vCache[n.vCap.value]);
      else n.vWait = setTimeout(this.find.bind(this, n), now ? 0 : this.opt.wait);
    }
  }
  
  this.find = function(n){
    var u = n.getAttribute(this.opt.attrLookup);
    u = d1.arg(u, {
        //value: n.vCap.value,
        seq: this.seq,
        time: (new Date()).getTime()
    }).replace(/\{q\}/, n.vCap.value);
    n.vCur = null;
    d1.ajax(u, null, this.list.bind(this, n.vCap.value, this.seq, n));
  }
  
  this.list = function(u, seq, n, req, nn, e){
    var d = JSON.parse(req.responseText);
    if(seq==n.vSeq) this.openList(n, d.data, e);
    //console.log(seq==n.vSeq ? 'use' : 'skip', seq, n.vSeq);
    this.store(n, u, d);
  }

  this.openList = function(n, d, e){
    if(e) e.stopPropagation();
    this.closeList();
    var pop = n.thePop;
    pop.appendChild(this.win);//.pop
    d1.setState(this.win, 1);
    //this.win.style.top = (this.inPop ? (n.vCap.offsetTop + n.vCap.offsetHeight) : pop.offsetHeight) + 'px';
    //this.win.style.left = '0';
    this.build(n, d);
  }
  
  this.closeList = function(){
    d1.setState(this.win, 0);
  }
  
  this.build = function(n, d){
    while(this.win.firstChild) this.win.removeChild(this.win.firstChild);
    var ul = d1.ins('ul', '', {className: 'nav let'}, this.win);
    var w, a, j = 0;
    var go = n.getAttribute(this.opt.attrGoto);
    for(var i in d){
      w = d1.ins('li', '', {}, ul);
      a = d1.ins('a', '', {href: go ? go.replace(/\{id\}/, d[i].id) : '#' + d[i].id, className: '-pad -hover'}, w);
      d1.ins('span', d[i].nm, {}, a);
      if(d[i].info){
        d1.ins('br', '', {}, a);
        d1.ins('small', d[i].info, {className: 'text-n'}, a);
      }
      if(!go) a.addEventListener('click', this.choose.bind(this, n, a), false);
      j++;
      if(j >= this.opt.max) break;
    }
    if(ul.firstChild) this.hilite(n, ul.firstChild.firstChild);
  }
  
  this.hilite = function(n, a){
    if(n.vCur) n.vCur.classList.remove(d1.opt.cAct);
    a.classList.add(d1.opt.cAct);
    n.vCur = a;
  }
  
  this.hiliteNext = function(n, prev){
    if(n.vCur) {
      var a = n.vCur.parentNode[prev ? 'previousSibling' : 'nextSibling'];
      if(!a) a = n.vCur.parentNode.parentNode[prev ? 'lastChild' : 'firstChild'];
      a = a.firstChild;
      this.hilite(n, a);
    }
  }
  
  this.choose = function(n, a, e){
    if(e) e.preventDefault();
    n.vCur = a;
    this.fix(n, a.hash.substr(1), a.firstChild.textContent);
  }
  
  this.fix = function(n, v, c){
    n.vCur = null;
    n.vSeq = 0;
    if(n.vWait) clearTimeout(n.vWait);
    n.value = v;
    n.vLabel = n.vCap.value = c;
    if(typeof(Event) === 'function') n.dispatchEvent(new Event('input'));//-ie
    this.closeList();
  }
  
  this.key = function(n, e){
    if(e.keyCode == 27) this.fix(n, n.value, n.vLabel);
    else if(e.keyCode == 40 && !d1.getState(this.win)) this.planFind(n, 1);
    else if(e.keyCode == 38 || e.keyCode == 40) this.hiliteNext(n, e.keyCode == 38);
    //else if(e.keyCode == 13) this.choose(n, n.vCur);
    else if(e.keyCode == 13 && n.vCur){
      if(d1.getState(this.win)) e.preventDefault();
      n.vCur.click();
    }
  }
  
  this.go = function(n, e){
    e.preventDefault();
    var u = n.getAttribute(this.opt.attrUrl);
    if(n.value.length>0 && u) location.href = u.replace(/\{id\}/, n.value);
  }

  // update chain
  
  this.updateChain = function(n,e){
    var m = d1.q(n.getAttribute('data-chain'),0);
    if(m){
      if(!n.value) this.setOptions(m,[]);
      else{
        var u = m.getAttribute('data-filter').replace(/\{q\}/,n.value);
        if(m.vCache && m.vCache[u]) this.setOptions(m,m.vCache[u]);
        else d1.ajax(u,m,this.onChainData.bind(this,u));
      }
    }
  }
  
  this.onChainData = function(u,req,n,e){
    var d = JSON.parse(req.responseText);
    this.setOptions(n,d.data);
    this.store(n, u, d);
  }

  this.setOptions = function(n,a){
    while(n.firstChild) n.removeChild(n.firstChild);
    var z = n.getAttribute('data-placeholder') || '';
    if(!a || a.length==0 || z) d1.ins('option',z||'-',{value:''},n);
    if(a) for(var i=0;i<a.length;i++) d1.ins('option',a[i].nm,{value:a[i].id},n);
  }
  
  this.store = function(n,u,d){
    var c = n.getAttribute('data-cache');
    if(c===undefined) c = this.opt.cacheLimit;
    c = parseInt(c, 10);
    if(c){
      if(!n.vCache || Object.keys(n.vCache).length>=c) n.vCache = {};
      if(d) n.vCache[u] = d.data;
    }
  }
  
  d1.plug(this);

})();

  if(typeof module !== "undefined") module.exports = main;
  else if(window) d1lookup = main;
})();
},{"d1css":2}],7:[function(require,module,exports){
/*! d1tablex https://github.com/vvvkor/d1tablex */
/* Filter and sort HTML table */

//table.sort[data-filter][data-filter-report][data-case][data-filter-cols]
if(typeof module !== "undefined") var d1 = require('d1css');
(function(){
main = new(function() {

  "use strict";

  this.name = 'tablex';
  this.lang = '';
  this.skipComma = 0;
  
  this.opt = {
    attrFilter: 'data-filter',
    cFilter: 'bg-w', // filter-on - non-empty filter field
    cScan: 'text-i', // col-scan - searchable columns' header (used if "data-filter-cols" is set)
    cShow: '', // row-show - matching row
    cHide: 'hide', // row-hide - non-matching row (if not set the "display:none" is used)
    cSort: '', // col-sort - sortable column's header
    cAsc:  'bg-y', // col-asc - !non-empty! - header of currently sorted column (ascending)
    cDesc: 'bg-w', // col-desc - header of currently sorted column (descending)
    qsSort: 'table.sort',
    wait: 200
  };

  this.init = function(opt) {
    var i;
    for(i in opt) this.opt[i] = opt[i];
    this.lang = document.documentElement.getAttribute('lang') || 'en';
    this.skipComma = (this.lang=='en');
    var t = document.querySelectorAll(this.opt.qsSort + ', table[' + this.opt.attrFilter + ']');
    //t.forEach(this.prepare.bind(this));
    for (i = 0; i < t.length; i++) this.prepare(t[i]);
  }

  this.prepare = function(n) {
    var i, j, start = 0;
    var tb = n.querySelector('tbody');
    var rh = n.querySelector('thead tr');
    if (!rh) {
      rh = tb.rows[0];
      start = 1;
    }
    if (!rh || !tb || !tb.rows || tb.rows.length < 2) return;
    var a = [];
    var h = [];
    for (j = 0; j < rh.cells.length; j++) {
      h[j] = rh.cells[j];
      //if (this.opt.cSort && this.isSortable(rh.cells[j])) h[j].classList.add(this.opt.cSort);
    }
    //var inp = d1.ins('input','',{type:'search',size:4},rh.cells[0]);
    n.vCase = (n.getAttribute('data-case') !== null);
    var fq = n.getAttribute(this.opt.attrFilter);
    n.vInp = fq
      ? document.querySelector(fq)
      : n.querySelector('[name="_q"]');
    if (n.vInp) {
      //n.vInp.onsearch = n.vInp.onkeyup = this.doFilter.bind(this,n);
      if(!n.vInp.vListen) n.vInp.addEventListener('input', this.doFilter.bind(this, n), false);
      n.vInp.vListen = 1;
      this.doFilter(n);
    }
    for (i = start; i < tb.rows.length; i++) {
      var c = tb.rows[i].cells;
      var row = [];
      for (j = 0; j < c.length; j++) row[j] = this.val(c[j], n.vCase);
      a.push({
        d: row,
        n: tb.rows[i]
      }); //data,row_node
    }
    n.vData = a;
    n.vHead = h;
    if (n.classList.contains('sort')) {
      for (j = 0; j < h.length; j++)
        if (this.isSortable(h[j])) {
          if (this.opt.cSort) h[j].classList.add(this.opt.cSort);
          //h[j].onclick = this.doSort.bind(this,n,h[j]);
          if(!h[j].vListen) h[j].addEventListener('click', this.doSort.bind(this, n, h[j]), false);
          h[j].vListen = 1;
        }
    }
  }

  this.doFilter = function(t, e) {
    if (t.vPrev !== t.vInp.value || !e) {
      t.vPrev = t.vInp.value;
      if (this.opt.cFilter) t.vInp.classList[t.vPrev.length > 0 ? 'add' : 'remove'](this.opt.cFilter);
      clearTimeout(t.vTimeout);
      t.vTimeout = setTimeout(this.filter.bind(this, t, t.vInp.value), this.opt.wait);
    }
  }

  this.doSort = function(t, th, e) {
    if (e.target.closest
      ? (!e.target.closest('a,input,select,label'))
      : (' A INPUT SELECT LABEL ').indexOf(' ' + e.target.tagName + ' ') == -1)
    {
      //e.preventDefault();
      this.sort(t, th.cellIndex);
    }
  }

  this.isSortable = function(th) {
    //return this.val(th).length > 0;
    return !th.hasAttribute('data-unsort');
  }

  this.val = function(s, cs) {
    var r = s.tagName ? s.innerHTML : '' + s;
    r = r.
    replace(/<!--.*?-->/g, '').
    replace(/<.*?>/g, '').
    replace(/&nbsp;/gi, ' ').
    replace(/^\s+/, '').
    replace(/\s+$/, '');
    if (!cs) r = r.toLowerCase();
    return r;
  }

  this.filter = function(n, q) {
    var cnt = 0;
    var i, j, data, s, hide;
    if (!n.vCols) {
      n.vCols = n.getAttribute('data-filter-cols');
      n.vCols = n.vCols ? n.vCols.split(/\D+/) : false;
      if (n.vCols && this.opt.cScan)
        for (i = 0; i < n.vCols.length; i++) {
          if (n.vHead[n.vCols[i]]) n.vHead[n.vCols[i]].classList.add(this.opt.cScan);
        }
    }
    for (i = 0; i < n.vData.length; i++) {
      hide = 0;
      if (q !== '') {
        if (n.vCols.length > 0) {
          data = [];
          for (j = 0; j < n.vCols.length; j++) data.push(n.vData[i].d[n.vCols[j]]);
        } else data = n.vData[i].d;
        s = '|' + data.join('|') + '|';
        hide = !this.matches(s, q, n.vCase);
      }
      if(this.opt.cHide) n.vData[i].n.classList[hide ? 'add' : 'remove'](this.opt.cHide);
      else n.vData[i].n.style.display = hide ? 'none' : '';
      if(this.opt.cShow) n.vData[i].n.classList[hide ? 'remove' : 'add'](this.opt.cShow);
      if (!hide) cnt++;
    }
    if (n.vInp) {
      n.vInp.title = cnt + '/' + n.vData.length;
      var rep = n.getAttribute('data-filter-report');
      if (rep) rep = document.querySelector(rep);
      if (rep) rep.textContent = n.vInp.title;
    }
  }

  this.matches = function(s, q, cs) {
    if (q.substr(0, 1) == '=') return s.indexOf('|' + q.substr(1).toLowerCase() + '|') != -1;
    else if (q.indexOf('*') != -1) {
      q = '\\|' + q.replace(/\*/g, '.*') + '\\|';
      return (new RegExp(q, cs ? '' : 'i')).test(s);
    } else return s.indexOf(cs ? q : q.toLowerCase()) != -1;
  }

  this.sort = function(n, col, desc) {
    if (desc === undefined) desc = (this.opt.cAsc && n.vHead[col].classList.contains(this.opt.cAsc));
    n.vData.sort(this.cmp.bind(this, col));
    if (desc) n.vData.reverse();
    for (var j = 0; j < n.vHead.length; j++) this.mark(n.vHead[j], j == col ? (desc ? -1 : 1) : 0);
    this.build(n);
  }

  this.build = function(n) {
    var tb = n.querySelector('tbody');
    for (var i = 0; i < n.vData.length; i++) {
      tb.appendChild(n.vData[i].n);
    }
  }

  this.mark = function(h, d) {
    if (this.opt.cAsc) h.classList[d > 0 ? 'add' : 'remove'](this.opt.cAsc);
    if (this.opt.cDesc) h.classList[d < 0 ? 'add' : 'remove'](this.opt.cDesc);
  }

  this.cmp = function(by, a, b) {
    a = a.d[by];
    b = b.d[by];
    //date?
    var mode = 'd';
    var aa = this.dt(a);
    var bb = this.dt(b);
    if (isNaN(aa) || isNaN(bb)) {
      //size?
      mode = 'b';
      aa = this.sz(a);
      bb = this.sz(b);
    }
    if (isNaN(aa) || isNaN(bb)) {
      //interval?
      mode = 'i';
      aa = this.interval(a);
      bb = this.interval(b);
    }
    if (isNaN(aa) || isNaN(bb)) {
      //number?
      mode = 'n';
      aa = this.nr(a);
      bb = this.nr(b);
    }
    if (isNaN(aa) || isNaN(bb)) {
      //string
      mode = 's';
      aa = a;
      bb = b;
    }
    //console.log('['+mode+'] A '+a+' = '+aa+' == '+(new Date(aa))+'; B '+b+' = '+bb+' == '+(new Date(bb)));
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
  }
  
  this.nr = function(s){
    //use Number instead of parseFloat for more strictness
    s = this.skipComma
      ? s.replace(/(\$|\,|\s)/g, '')
      : s.replace(/(\$|\s)/g, '').replace(',', '.');
    return parseFloat(s);
  }

  this.dt = function(s) {
    var m = s.match(/^(\d+)(\D)(\d+)\D(\d+)(\D(\d+))?(\D(\d+))?(\D(\d+))?(\D(\d+))?$/);
    if (m) {
      var x;
      if (m[2] == '.') x = [4, 3, 1]; //d.m.Y
      else if (m[2] == '/') x = [4, 1, 3]; //m/d Y
      else x = [1, 3, 4]; //Y-m-d
      var d = new Date(m[x[0]], m[x[1]] - 1, m[x[2]], m[6] || 0, m[8] || 0, m[10] || 0, m[12] || 0);
      return d ? d.getTime() : NaN;
    }
    return NaN;
  }

  this.interval = function(s) {
    var x = {
      msec: .001,
      ms: .001,
      s: 1,
      mi: 60,
      sec: 1,
      min: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      m: 2592000,
      y: 31536000
    };
    var m = s.match(/^(\d+)\s*(y|m|w|d|h|min|mi|sec|s|ms|msec)$/i);
    if (m && x[m[2]]) return m[1] * x[m[2]];
    return NaN;
  }

  this.sz = function(s) {
    var x = {
      b: 1,
      kb: 1024,
      mb: 1048576,
      gb: 1073741824,
      tb: 1099511627776,
      pb: 1125899906842624
    };
    var m = s.match(/^((\d*\.)?\d+)\s*(([kmgtp]i?)?b)$/i);
    if (m) {
      m[3] = m[3].replace(/ib$/i, 'b').toLowerCase();
      if (x[m[3]]) return m[1] * x[m[3]];
    }
    return NaN;
  }

  d1.plug(this);

})();

  if(typeof module !== "undefined") module.exports = main;
  else if(window) d1tablex = main;
})();
},{"d1css":2}],8:[function(require,module,exports){
/*! d1valid https://github.com/vvvkor/d1valid */
/* Custom form validation */

/* todo: ajax validate, server validate, .js-process */
/* todo: required lookup, wysiwyg, min/max date */

//form, form.js-validate, input[data-hint]~.small
if(typeof module !== "undefined") var d1 = require('d1css');
(function () {
var main = new(function () {

  "use strict";
  
  this.name = 'valid';
  
  this.opt = {
    qsValidate: 'form', // set custom text for browser tooltips
    cUnhint: 'js-unhint' // turn off browser tooltips
  };
  
  /*
  this.validationErrors = [
    'valueMissing',
    'typeMismatch',
    'tooLong',
    'tooShort',
    'patternMismatch',
    'rangeUnderflow',
    'rangeOverflow',
    'stepMismatch',
    'badInput',
    'customError'
    //,'valid'
  ];
  */
  
  this.init = function (opt) {
    var i;
    for (i in opt) this.opt[i] = opt[i];
    var q = this.opt.qsValidate;
    d1.b('', q + " input, " + q + " textarea, "+ q +" select", "", this.initInput.bind(this));
    d1.b('', "form."+this.opt.cUnhint, "", this.unhint.bind(this));
    d1.b('', "form."+this.opt.cUnhint, "submit", this.validateForm.bind(this));
  }
  
  this.initInput = function(n) {
    if (n.willValidate) {
      if (n.tagName == 'select' || n.type == 'radio' || n.type == 'checkbox') n.onchange = this.validateInput.bind(this, n);
      else n.oninput = this.validateInput.bind(this, n);
      n.oninvalid = this.setCustomMessage.bind(this, n);
    }
  }

  this.validateInput = function(n) {
    if (n.type == 'radio') d1.b(n.form, '[name="'+n.name+'"]', '', function(m){ m.setCustomValidity(''); });
    else n.setCustomValidity('');
    n.checkValidity();
  }

  this.setCustomMessage = function(n) {
    var t = n.getAttribute('data-hint') || '';// || n.title;
    t = t.replace(/%([\w\-]+)%/g, function(m,v){ return n.getAttribute(v); })
    n.setCustomValidity(t);
    /*
    var x = '', err = '', i = 0;
    while (!x && (err=this.validationErrors[i++])){
      if(n.validity[err]) x = d1.s(err + ('_' + (n.type || n.tagName.toLowerCase() || '')), '') || d1.s(err,'');
    }
    if (x) {
      x = x.replace(/%(\w+)%/g, function(m,v){ return n.getAttribute(v); });
      if (n.title.length > 0) x += " \n" + n.title;
    }
    n.setCustomValidity(x);
    */
  }
  
  this.unhint = function(n, e) {
    n.setAttribute('novalidate',true);
  }
  
  this.validateForm = function(n, e) {
    n.classList.remove(this.opt.cUnhint);
    if (n.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      var f = d1.q(':invalid', 0, n);
      if(f) f.focus();
    }
  }
  
  d1.plug(this);

})();

  if (typeof module !== "undefined") module.exports = main;
  else if (window) d1valid = main;
})();
},{"d1css":2}],9:[function(require,module,exports){
var d1 = require('d1css');
var d1calendar = require('d1calendar');
var d1dialog = require('d1dialog');
var d1edit = require('d1edit');
var d1gallery = require('d1gallery');
var d1lookup = require('d1lookup');
var d1tablex = require('d1tablex');
var d1valid = require('d1valid');


d1.loadAll();

},{"d1calendar":1,"d1css":2,"d1dialog":3,"d1edit":4,"d1gallery":5,"d1lookup":6,"d1tablex":7,"d1valid":8}]},{},[9]);

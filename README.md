# d1bundle

Bundled [d1](https://github.com/vvvkor/d1) and its plugins.

## Getting Started

### Use bundled from CDN

```
<link href="https://cdn.jsdelivr.net/npm/d1bundle@1.0.1/dist/d1.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/d1bundle@1.0.1/dist/d1bundle.min.js"></script>
```

### Use joined from CDN

```
<link href="https://cdn.jsdelivr.net/npm/d1bundle@1.0.1/dist/d1.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/d1bundle@1.0.1/dist/d1join.min.js"></script>
<script>
  d1.loadAll(options);
</script>
```

### Install manually

Download minified [d1bundle files](https://github.com/vvvkor/d1bundle/tree/master/dist).

```
<link href="d1.min.css" rel="stylesheet">
<script src="d1join.min.js"></script>
<script>
  d1.loadAll(options);
</script>
```

or

```
<link href="d1.min.css" rel="stylesheet">
<script src="d1bundle.min.js"></script>
```

### Options

```
var options = {
  // d1 options
  opt: {hashCancel: '#quit'},
  // d1 strings
  str: {ok: 'Yes'},
  // d1 icons
  ico: {
    close:  'svg-close',
    delete: 'svg-delete',
    edit:   'svg-edit',
    now:    'svg-ok',
    date:   'svg-date',
    prev:   'svg-left',
    next:   'svg-right',
    prev2:  'svg-first',
    next2:  'svg-last'
  },
  // options for plugins
  calendar: {hashNow: '#today'},
  dialog: {hashCancel: '#no'},
  edit: {height: '20vh'},
  gallery: {hashCancel: '#back'},
  lookup: {idList: 'autocomplete-list'},
  tablex: {cFilter: 'bg-i'},
  valid: {qsValidate: 'form.val'}
};
```

## Browser Support

* IE 9 (mobile style only, no js enhancements)
* IE 10+, Edge (except details/summary component)
* Latest Stable: Chrome, Firefox, Opera, Safari
* iOS 6-8
* Android 4.x

## Docs

[Docs and demo](https://vvvkor.github.io/d1/)

## License

[MIT](./LICENSE)

# Watcher JS

## Overview

A JS watcher implementation for objects, arrays, literals

If you need to catch every change made on your JS variables, this
library is for you. 

## Run

```javascript
proxy = require('./proxy')
a = {a:'1', b:[1,2,3]}
p = proxy.createProxy(a, { valueChangeCallback: () => {console.log('hello')} })
p.a = 2
``` 

Will print: 
`hello
`

```javascript
proxy = require('./proxy')
b = {a:{o:[1,2,3]}}
x = proxy.createProxy(b, {}, (prev, next, path) => { console.log(prev + ' -> ' + next + '; path: ' + path)})
x.a.o[0] = -1
``` 

Will print:
`
1 -> -1; path: a.o[0]
`

## More

To test the implementation run: `npm test`

More examples on usage of this library is available at test/proxyTest.js file.


# JS Watcher

## Overview

A JS watcher implementation for objects, arrays, literals

If you need to catch every change made on your JS variables, this
library is for you. 

## Install

`npm i js-watcher` in your npm project directory.

The npm package is located [here](https://www.npmjs.com/package/js-watcher)

## Run

```javascript
proxy = require('js-watcher')
a = {a:'1', b:[1,2,3]}
p = proxy.createProxy(a, { valueChangeCallback: () => {console.log('hello')} })
p.a = 2
``` 

Will print: 
`hello
`

```javascript
proxy = require('js-watcher')
b = {a:{o:[1,2,3]}}
x = proxy.createProxy(b, {}, (prev, next, path) => { console.log(prev + ' -> ' + next + '; path: ' + path)})
x.a.o[0] = -1
``` 

Will print:
`
1 -> -1; path: a.o[0]
`

If you want to prevent assignment of the same value to the object,
you can use comparison in shouldComponentUpdate method.

```javascript
proxy = require('js-watcher')
b = {a:{o:[1,2,3]}}
x = proxy.createProxy(b, {}, (prev, next, path) => { if(prev === next) return false; console.log('hello') })
x.a.o[0] = 1
x.a.o[0] = -1
``` 

Will print (once):
`hello`

## More

To test the implementation run: `npm test`

More examples on usage of this library is available at test/proxyTest.js file.


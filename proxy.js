/**
 * A watcher implementation in JS for detecting changes on variables using proxies.
 * Proxies are used when the initial object (target) can be substituted by a proxy.
 * If substitution is not possible, other implementation should be used.
 *
 * This implementation supports heavily-nested objects and arrays and detects inner changes.
 **/

function createProxy(o, valueChangeCallback, keyInsertionCallback, orderChangeCallback) {
  if(o instanceof Array) {
    return assignProxies(o, valueChangeCallback, () => {}, orderChangeCallback);
  } else if(o instanceof Object) {
    return assignProxies(o, valueChangeCallback, keyInsertionCallback, () => {})
  } else if(o instanceof String || o instanceof Number || typeof(o) === 'number' || typeof(o) === 'string') {
    return new Proxy([o], {
      get (target, prop) {
        console.log('get l')
        if(prop != 'v')
          return undefined
        return target[0]
      },
      set (target, prop, value) {
        console.log('set l')
        if(prop != 'v')
          return false
        valueChangeCallback(value)
        target[0] = value
        return true
      }
    })
  }
  throw new Error('Creation of proxy failed: unknown type')
}

// TODO(aibek): notify user on array's order change, also on nested objects.
function makeArrayProxy (arr, valueChangeCallback, orderChangeCallback) {
  return new Proxy(arr, {
    get (target, prop) {
      if (prop in target)
        return target[prop]
      return undefined
    },
    set (target, prop, value) {
      if(value instanceof Array || value instanceof Object) {
        value = assignProxies(value, valueChangeCallback, () => {}, orderChangeCallback)
      }
      target[prop] = value
      valueChangeCallback()
      return true
    }
  })
}

function makeObjectProxy(obj, valueChangeCallback, keyInsertionCallback) {
  return new Proxy(obj, {
    get (target, prop) {
      if (prop in target)
        return target[prop]
      return undefined
    },
    set (target, prop, value) {
      if(! (prop in target)) {
        keyInsertionCallback()
      } else {
        valueChangeCallback()
      }
      if(value instanceof Array || value instanceof Object) {
        value = assignProxies(value, valueChangeCallback, keyInsertionCallback, () => {})
      }
      target[prop] = value
      return true
    }
  })
}

function assignProxies(obj, valueChangeCallback, keyInsertionCallback, orderChangeCallback) {
  for(let k in obj) {
    if(obj[k] instanceof Array || obj[k] instanceof Object) {
      obj[k] = assignProxies(obj[k], valueChangeCallback, keyInsertionCallback, orderChangeCallback)
    }
  }
  if(obj instanceof Array) {
    return makeArrayProxy(obj, valueChangeCallback, orderChangeCallback)
  } else if(obj instanceof Object) {
    return makeObjectProxy(obj, valueChangeCallback, keyInsertionCallback)
  } else {
    return obj
  }
}

module.exports = {
  createProxy
}
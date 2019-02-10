/**
 * A watcher implementation in JS for detecting changes on variables using proxies.
 * Proxies are used when the initial object (target) can be substituted by a proxy.
 * If substitution is not possible, other implementation should be used.
 *
 * This implementation supports heavily-nested objects and arrays and detects inner changes.
 **/

// TODO(aibek): substitute some of parameters with an object
function createProxy(o, valueChangeCallback, keyInsertionCallback, orderChangeCallback, shouldComponentUpdate) {
  if(! shouldComponentUpdate) {
    shouldComponentUpdate = () => true
  }
  if(o instanceof Array) {
    return assignProxies(o, valueChangeCallback, () => {}, orderChangeCallback, shouldComponentUpdate);
  } else if(o instanceof Object) {
    return assignProxies(o, valueChangeCallback, keyInsertionCallback, () => {}, shouldComponentUpdate)
  } else if(o instanceof String || o instanceof Number || typeof(o) === 'number' || typeof(o) === 'string') {
    return new Proxy([o], {
      get (target, prop) {
        if(prop != 'v')
          return undefined
        return target[0]
      },
      set (target, prop, value) {
        if(prop != 'v')
          return false
        if(shouldComponentUpdate(target[0], value) === false) {
          return false
        }
        valueChangeCallback(value)
        target[0] = value
        return true
      }
    })
  }
  throw new Error('Creation of proxy failed: unknown type')
}

// TODO(aibek): add a graph of nested objects
function assignProxies(obj, valueChangeCallback, keyInsertionCallback, orderChangeCallback, shouldComponentUpdate) {
  for(let k in obj) {
    if(obj[k] instanceof Array || obj[k] instanceof Object) {
      obj[k] = assignProxies(obj[k], valueChangeCallback, keyInsertionCallback, orderChangeCallback, shouldComponentUpdate)
    }
  }
  if(obj instanceof Array) {
    return makeArrayProxy(obj, valueChangeCallback, orderChangeCallback, shouldComponentUpdate)
  } else if(obj instanceof Object) {
    return makeObjectProxy(obj, valueChangeCallback, keyInsertionCallback, shouldComponentUpdate)
  } else {
    return obj
  }
}

// TODO(aibek): notify user on array's order change, also on nested objects.
function makeArrayProxy (arr, valueChangeCallback, orderChangeCallback, shouldComponentUpdate) {
  return new Proxy(arr, {
    get (target, prop) {
      if (prop in target)
        return target[prop]
      return undefined
    },
    set (target, prop, value) {
      if(shouldComponentUpdate(target[prop], value) === false) {
        return false
      }
      if(value instanceof Array || value instanceof Object) {
        value = assignProxies(value, valueChangeCallback, () => {}, orderChangeCallback, shouldComponentUpdate)
      }
      target[prop] = value
      valueChangeCallback()
      return true
    }
  })
}

function makeObjectProxy(obj, valueChangeCallback, keyInsertionCallback, shouldComponentUpdate) {
  return new Proxy(obj, {
    get (target, prop) {
      if (prop in target)
        return target[prop]
      return undefined
    },
    set (target, prop, value) {
      if(shouldComponentUpdate(target[prop], value) === false) {
        return false
      }
      if(! (prop in target)) {
        keyInsertionCallback()
      } else {
        valueChangeCallback()
      }
      if(value instanceof Array || value instanceof Object) {
        value = assignProxies(value, valueChangeCallback, keyInsertionCallback, () => {}, shouldComponentUpdate)
      }
      target[prop] = value
      return true
    }
  })
}

module.exports = {
  createProxy
}
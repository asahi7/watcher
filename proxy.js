/**
 * A watcher implementation in JS for detecting changes on variables using proxies.
 * Proxies are used when the initial object (target) can be substituted by a proxy.
 * If substitution is not possible, other implementation should be used.
 *
 * This implementation supports heavily-nested objects and arrays and detects inner changes.
 **/

// TODO(aibek): substitute some of parameters with an object
function createProxy (o, cbs, shouldComponentUpdate) {
  if (!cbs) {
    cbs = {}
  }
  if (!cbs.valueChangeCallback) {
    cbs.valueChangeCallback = () => {}
  }
  if (!cbs.keyInsertionCallback) {
    cbs.keyInsertionCallback = () => {}
  }
  if (!cbs.orderChangeCallback) {
    cbs.orderChangeCallback = () => {}
  }
  if (!shouldComponentUpdate) {
    shouldComponentUpdate = () => true
  }
  if (o instanceof Array) {
    cbs.keyInsertionCallback = () => {}
    return assignProxies(o, cbs, shouldComponentUpdate)
  } else if (o instanceof Object) {
    cbs.orderChangeCallback = () => {}
    return assignProxies(o, cbs, shouldComponentUpdate)
  } else if (o instanceof String || o instanceof Number || typeof (o) === 'number' || typeof (o) === 'string') {
    return new Proxy([o], {
      get (target, prop) {
        if (prop !== 'v') { return undefined }
        return target[0]
      },
      set (target, prop, value) {
        if (prop !== 'v') { return false }
        if (shouldComponentUpdate(target[0], value) === false) {
          return false
        }
        cbs.valueChangeCallback(value)
        target[0] = value
        return true
      }
    })
  }
  throw new Error('Creation of proxy failed: unknown type')
}

// TODO(aibek): add a graph of nested objects
function assignProxies (obj, cbs, shouldComponentUpdate) {
  for (let k in obj) {
    if (obj[k] instanceof Array || obj[k] instanceof Object) {
      obj[k] = assignProxies(obj[k], cbs, shouldComponentUpdate)
    }
  }
  if (obj instanceof Array) {
    return makeArrayProxy(obj, cbs, shouldComponentUpdate)
  } else if (obj instanceof Object) {
    return makeObjectProxy(obj, cbs, shouldComponentUpdate)
  } else {
    return obj
  }
}

// TODO(aibek): notify user on array's order change, also on nested objects.
function makeArrayProxy (arr, cbs, shouldComponentUpdate) {
  return new Proxy(arr, {
    get (target, prop) {
      if (prop in target) { return target[prop] }
      return undefined
    },
    set (target, prop, value) {
      if (shouldComponentUpdate(target[prop], value) === false) {
        return false
      }
      if (value instanceof Array || value instanceof Object) {
        value = assignProxies(value, cbs, shouldComponentUpdate)
      }
      target[prop] = value
      cbs.valueChangeCallback()
      return true
    }
  })
}

function makeObjectProxy (obj, cbs, shouldComponentUpdate) {
  return new Proxy(obj, {
    get (target, prop) {
      if (prop in target) { return target[prop] }
      return undefined
    },
    set (target, prop, value) {
      if (shouldComponentUpdate(target[prop], value) === false) {
        return false
      }
      if (!(prop in target)) {
        cbs.keyInsertionCallback()
      } else {
        cbs.valueChangeCallback()
      }
      if (value instanceof Array || value instanceof Object) {
        value = assignProxies(value, cbs, shouldComponentUpdate)
      }
      target[prop] = value
      return true
    }
  })
}

module.exports = {
  createProxy
}

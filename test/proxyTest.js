const assert = require('chai').assert;
const proxy = require('../proxy')

describe('Watcher Implementation With Proxy', function() {
  describe('Arrays', function() {
    it('1D Arrays', function() {
      let a = [1,2,3]
      let vcbCalled = false
      let ocbCalled = false
      p = proxy.createProxy(a, () => {
        vcbCalled = true
      }, () => {}, () => {
        ocbCalled = true
      })

      p[0] = -1
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [-1,2,3])
      vcbCalled = false

      p.push(4)
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [-1,2,3,4])
      vcbCalled = false

      p[4] = 5
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [-1,2,3,4,5])
      vcbCalled = false

      p[2] = p[4] = -3
      vcbCalled = false

      p.sort((a, b) => a == b ? 0 : a < b ? -1 : 1)
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [-3,-3,-1,2,4])
      vcbCalled = false

      p.pop()
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [-3,-3,-1,2])
      vcbCalled = false

      assert.strictEqual(a.length, 4)
    });

    it('Nested Arrays', function() {
      let a = [1,2,3]
      let vcbCalled = false
      let ocbCalled = false
      p = proxy.createProxy(a, () => {
        vcbCalled = true
      }, () => {}, () => {
        ocbCalled = true
      })

      p[0] = [4,5]
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [[4,5],2,3])
      vcbCalled = false

      p.push([7,8])
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [[4,5],2,3,[7,8]])
      vcbCalled = false

      p[4] = 5
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [[4,5],2,3,[7,8],5])
      vcbCalled = false

      assert.strictEqual(a.length, 5)

      p[0][1] = 7
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [[4,7],2,3,[7,8],5])
      vcbCalled = false

      p[3][0] = [-1,-2,-3]
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [[4,7],2,3,[[-1,-2,-3],8],5])
      vcbCalled = false
    });

    it('Nested Objects', function() {
      let a = [1,2,3]
      let vcbCalled = false
      let ocbCalled = false
      p = proxy.createProxy(a, () => {
        vcbCalled = true
      }, () => {}, () => {
        ocbCalled = true
      })

      p[0] = {a:[{b:'abc'}]}
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [{a:[{b:'abc'}]},2,3])
      vcbCalled = false

      p[0].a[0].b = 'xyz'
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [{a:[{b:'xyz'}]},2,3])
      vcbCalled = false
    });

    it('Heavy-nested Array Initialization', function() {
      let a = [{a:[{b:'abc'}]},2,3]
      let vcbCalled = false
      let ocbCalled = false
      p = proxy.createProxy(a, () => {
        vcbCalled = true
      }, () => {}, () => {
        ocbCalled = true
      })

      p[0].a[0].b = 'xyz'
      assert.isTrue(vcbCalled)
      assert.deepEqual(a, [{a:[{b:'xyz'}]},2,3])
      vcbCalled = false
    })
  });

  describe('Objects', function() {
    it('Simple Checker', function() {
      let o = {
        a: 1,
        b: 2
      }
      let vcbCalled = false
      let kcbCalled = false
      p = proxy.createProxy(o, () => {
        vcbCalled = true
      }, () => {
        kcbCalled = true
      }, () => {})

      p.a = 3
      assert.isTrue(vcbCalled)
      assert.isFalse(kcbCalled)
      assert.deepEqual(o, {a:3, b:2})
      vcbCalled = false

      p.c = 1
      assert.isTrue(kcbCalled)
      assert.isFalse(vcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:1})
      kcbCalled = false

      p.c = -4
      assert.isTrue(vcbCalled)
      assert.isFalse(kcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4})
      vcbCalled = false

      p.d = []
      assert.isTrue(kcbCalled)
      assert.isFalse(vcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4, d:[]})
      kcbCalled = false

      p.d.push(1)
      assert.isTrue(vcbCalled)
      assert.isFalse(kcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4, d:[1]})
      vcbCalled = false

      assert.strictEqual(p.d[0], 1)
      assert.isFalse(vcbCalled)
      assert.isFalse(kcbCalled)

      p.d[0] = -1
      assert.isTrue(vcbCalled)
      assert.isFalse(kcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4, d:[-1]})
      vcbCalled = false

      p.e = {}
      assert.isTrue(kcbCalled)
      assert.isFalse(vcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4, d:[-1], e: {}})
      kcbCalled = false

      p.e.a = 5
      assert.isTrue(kcbCalled)
      assert.isFalse(vcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4, d:[-1], e: {a:5}})
      kcbCalled = false

      p.e.a = -5
      assert.isTrue(vcbCalled)
      assert.isFalse(kcbCalled)
      assert.deepEqual(o, {a:3, b:2, c:-4, d:[-1], e: {a:-5}})
      vcbCalled = false
    });

    it('Nested Objects Checker', function() {
      let o = {
        a: 1,
        b: 2
      }
      let vcbCalled = false
      let kcbCalled = false
      p = proxy.createProxy(o, () => {
        vcbCalled = true
      }, () => {
        kcbCalled = true
      }, () => {})

      p.c = [{d: 3, e: ['abc']}]
      assert.isFalse(vcbCalled)
      assert.isTrue(kcbCalled)
      assert.deepEqual(o, {a:1, b:2, c:[{d: 3, e: ['abc']}]})
      kcbCalled = false

      p.c[0].e[0] = 'xyz'
      assert.isFalse(kcbCalled)
      assert.isTrue(vcbCalled)
      assert.deepEqual(o, {a:1, b:2, c:[{d: 3, e: ['xyz']}]})
      vcbCalled = false
    });

    it('Heavy-nested Object Initialization', function() {
      let o = {a:1, b:2, c:[{d: 3, e: ['abc']}]}
      let vcbCalled = false
      let kcbCalled = false
      p = proxy.createProxy(o, () => {
        vcbCalled = true
      }, () => {
        kcbCalled = true
      }, () => {})

      p.c[0].e[0] = 'xyz'
      assert.isFalse(kcbCalled)
      assert.isTrue(vcbCalled)
      assert.deepEqual(o, {a:1, b:2, c:[{d: 3, e: ['xyz']}]})
      vcbCalled = false
    })
  });

  describe('String/Number Literals', function() {
    it('Simple Number Checker', function() {
      let l = 5
      let vcbCalled = false
      p = proxy.createProxy(l, (valueTo) => {
        vcbCalled = true
        l = valueTo
      }, () => {}, () => {})

      p.v = 3
      assert.strictEqual(l, 3)
      assert.isTrue(vcbCalled)
      vcbCalled = false
    });

    it('Simple String Checker', function() {
      let l = 'abc'
      let vcbCalled = false
      p = proxy.createProxy(l, (valueTo) => {
        vcbCalled = true
        l = valueTo
      }, () => {}, () => {})

      p.v = 'xyz'
      assert.isTrue(vcbCalled)
      assert.deepEqual(l, 'xyz')
      vcbCalled = false
    });
  });
});
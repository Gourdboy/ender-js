/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
(function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context['$']
    , oldRequire = context['require']
    , oldProvide = context['provide']

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules['$' + identifier] || window[identifier]
    if (!module) throw new Error("Ender Error: Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules['$' + name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  /**
    * main Ender return object
    * @param s a CSS selector or DOM node(s)
    * @param r a root node(s)
    * @return {array} an Ender chainable collection
    */
  function Ender(s, r) {
    var elements
      , i

    this['selector'] = s
    // string || node || nodelist || window
    if (typeof s == 'undefined') {
      elements = []
      this['selector'] = ''
    } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      elements = ender._select(s, r)
    } else {
      elements = isFinite(s.length) ? s : [s]
    }
    this.length = elements.length
    for (i = this.length; i--;) this[i] = elements[i]
  }

  function ender(s, r) {
    return new Ender(s, r)
  }


  ender._VERSION = '0.4.0-dev'

  aug(ender, {
      'fn': Ender.prototype // for easy compat to jQuery plugins
    , 'ender': function (o, chain) {
        aug(chain ? Ender.prototype : ender, o)
      }
    , '_select': function (s, r) {
        if (typeof s == 'string') return (r || document).querySelectorAll(s)
        if (s.nodeName) return [ s ]
        return s
      }
  })

  aug(Ender.prototype, {
      'forEach': function (fn, scope, i, l) {
        // opt out of native forEach so we can intentionally call our own scope
        // defaulting to the current item and be able to return self
        for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
        // return self for chaining
        return this
      }
    , '$': ender // handy reference to self
  })

  // use callback to receive Ender's require & provide
  ender.noConflict = function (callback) {
    context.$ = old
    if (callback) {
      context['provide'] = oldProvide
      context['require'] = oldRequire
      callback(require, provide, this)
    }
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this));

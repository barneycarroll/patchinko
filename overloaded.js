function O(a, b){
  if(arguments.length == 1)
    if(typeof a == 'function')
      if(!(this instanceof O))
        return new O(a)
      
      else
        this.apply = function(c){
          return a(c)
        }

    else
      return new O(function(c){
        return O(c, a)
      })

  else {
    for(var i = 1; i < arguments.length; i++, b = arguments[i])
      for(var key in b)
        if(b.hasOwnProperty(key))
          b[key] == O
          ? delete a[key]
          : a[key] =
            b[key] instanceof O
            ? b[key].apply(a[key])
            : b[key]

    return a
  }
}

try {
  module.exports = O
} catch(e) {}

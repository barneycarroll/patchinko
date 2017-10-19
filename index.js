function p(target){
  for(var i = 1; i < arguments.length; i++)
    for(var key in arguments[i])
      if(arguments[i].hasOwnProperty(key)){
        if(arguments[i][key] === d)
          delete target[key]
        
        else
          target[key] = (
              arguments[i][key] instanceof s
            ? arguments[i][key].apply(target[key])
            : arguments[i][key]
          )
      }

  return target
}

function s(closure){
  if(!(this instanceof s))
    return new s(closure)

  this.apply = function(definition){
    return closure(definition)
  }
}

function ps(target, input){
  return (
    arguments.length === 2
  ? new s(function(definition){
      return p(target, definition, input)
    })
  : new s(function(definition){
      return p(definition, target)
    })
  )
}

var d = {}

try {
  module.exports = {p: p, s: s, ps: ps, d: d}
} catch(e) {}

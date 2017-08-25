function patch(target){
  for(var i = 1; i < arguments.length; i++)
    for(var key in arguments[i])
      if(arguments[i].hasOwnProperty(key))
        target[key] = (
          arguments[i][key] instanceof scope
          ? arguments[i][key].apply(target[key])
          : arguments[i][key]
        )

  return target
}

function scope(closure){
  if(!(this instanceof scope))
    return new scope(closure)

  this.apply = function(definition){
    return closure(definition)
  }
}

function ps(input){
  return new scope(function(definition){
    return patch(definition, input)
  })
}

try {
  module.exports = {patch: patch, scope: scope, ps: ps}
} catch(e) {}

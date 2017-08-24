function patch(target, input){
  for(var key in input)
    if(input.hasOwnProperty(key))
      target[key] = (
        input[key] instanceof scope
        ? input[key].apply(target[key])
        : input[key]
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
} catch(o_O) {}

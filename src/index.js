try {
  var explicit = require('./explicit')

  module.exports = {
    P  : explicit.D,
    S  : explicit.S,
    PS : explicit.PS,
    D  : explicit.D,
    immutable : require('./immutable'),
    constant  : require('./constant'),
  }
}
catch(e){
  throw new Error(
    'The environment attempted to load all Patchinko APIs via CommonJS, '
    + 'but the environment doesn\'t support the CommonJS API. \n'
    + 'You probably need to fix a script tag to point to the specific file you need. \n'
    + 'For install & import instructions, see: \n'
    + 'https://github.com/barneycarroll/patchinko/blob/master/README.md#where \n'
    + 'Original error: \n'
    + e
  )
}

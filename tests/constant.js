try {
  var o = require('ospec')

  var O = require('../constant.js')
}
catch(e){}

const I = x => x
const A = f => x => f(x)


o.spec('Mutable overload API: ', () => {
  o('`O` (with a single function argument)', () => {
    const unique = {}

    o(
      O(I).apply(unique)
    ).equals(
      A(I)(unique)
    )
      ('is equivalent to an applicative combinator')

    o(
      O(I) instanceof O
    ).equals(
      true
    )
      ('whose partial application is identifiable as an `O`')
  })

  o.spec('`O` (with 2 or more arguments)', () => {
    o('consumes a target object & an input object', () => {
      O({}, {})
    })

    o.spec('is equivalent to `Object.assign` in the absence of any sub-properties', () => {
      const [factoryA, factoryB] = [
        () => ({ a: 'foo', b: 2, d: { bar:  'z' }, f: [3, 4] }),
        () => ({ a: 'baz', c: 3, d: { fizz: 'z' }, f: 'buzz' }),
      ]

      o('preserves target identity', () => {
        const [a, b] = [factoryA(), factoryB()]

        o(
          O(a, b)
        ).equals(
          a
        )
      })

      o('copies properties of input onto target', () => {
        o(
          O(factoryA(), factoryB())
        ).deepEquals(
          Object.assign(factoryA(), factoryB())
        )
      })

      o.spec('with the exception that', () => {
        o('it will return the input directly if the target is null or undefined', () => {
          const input = {}

          o(
            O(null, input)
          ).equals(
            input
          )

          o(
            O(undefined, input)
          ).equals(
            input
          )
        })
      })
    })

    o.spec('with nested `O` invocations', () => {
      o.spec('containing a single function', () => {
        o("supplies the target's property value to the scoped function", () => {
          const unique = {}

          let interception

          O(
            { a: unique },
            {
              a: O(received => {
                interception = received
              })
            }
          )

          o(interception).equals(unique);
        })

        o('assigns the product of any scoped closures to the target properties', () => {
          const unique1 = {}
          const unique2 = {}

          o(
            O(
              { a: unique1 },
              { a: O(I) }
            ).a
          ).equals(
            unique1
          )

          o(
            O(
              { a: unique1 },
              { a: O(() => unique2) }
            ).a
          ).equals(
            unique2
          )
        })
      })

      o.spec('containing objects', () => {
        o('performs a deep patch', () => {
          const one = {}
          const two = {}

          let interception

          o(
            O(
              { a: { b: one } },

              {
                a: O({
                  b: O(received => (
                    interception = received,
                    two
                  ))
                })
              }
            )
          ).deepEquals(
            { a: { b: two } }
          )

          o(interception).equals(one)

          o(
            O(
              {},
              { a: O({ b: O({ c: 'foo' }) }) }
            )
          )
            .deepEquals(
              { a:   { b:   { c: 'foo' }  }  }
            )
              ('even if the target does not contain a property on that key')
        })
      })
    })

    o.spec('with `O` supplied as a patched property value', () => {
      o('deletes the target property with the same key', () => {
        o(
          O(
            { a: 1, b: 2 },
            { a: O }
          )
        ).deepEquals(
          { b: 2 }
        )
      })
    })
  })
})

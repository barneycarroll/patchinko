const o = require('ospec')

const O = require('../overloaded.js')

const I = x => x
const A = f => x => f(x)

o.spec('Mutable overload API: ', () => {
  o('`O` (with a single function argument)', () => {
    const unique = Symbol('unicum')

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
      o(O({}, {}))
    })

    o.spec('is equivalent to `Object.assign` in the absence of any sub-properties', () => {
      const [factoryA, factoryB] = [
        () => ({a: 'foo', b: 2, d: {bar:  'z'}, f: [3, 4]}),
        () => ({a: 'baz', c: 3, d: {fizz: 'z'}, f: 'buzz'}),
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

    o.spec('with nested (single-function-consuming) `O` properties', () => {
      o("supplies the target's property value to the scoped function", () => {
        const unique = Symbol('unicum')

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
      });

      o('assigns the product of any scoped closures to the target properties', () => {
        const unique1 = Symbol('unicum1')
        const unique2 = Symbol('unicum2')

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

    o.spec('with `O` (supplied as a property value)', () => {
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

const o = require('ospec')

const O = require('../immutable.js')

const I = x => x
const A = f => x => f(x)

o.spec('Immutable overload:', () => {
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

    o('is equivalent to an immutable `Object.assign` in the absence of any sub-properties', () => {
      const [factoryA, factoryB] = [
        () => ({a: 'foo', b: 2, d: {bar:  'z'}, f: [3, 4]}),
        () => ({a: 'baz', c: 3, d: {fizz: 'z'}, f: 'buzz'}),
      ]

      const [a, b] = [factoryA(), factoryB()]

      o(
        O(a, b)
      ).notEquals(
        a
      )
        ('does not preserves target identity')

      o(
        O(factoryA(), factoryB())
      ).deepEquals(
        Object.assign(factoryA(), factoryB())
      )
        ('copies properties of input onto target')
    })

    o.spec('with nested (single-function-consuming) `O` properties', () => {
      o("supplies the target's property value to the scoped function", () => {
        let interception

        O(
          { a: 'primitive' },
          {
            a: O(received => {
              interception = received
            })
          }
        )

        o(interception).equals('primitive');
      });

      o("clones the target's property value for the scoped function", () => {
        const unique = {a: 'foo'}

        let interception

        O(
          { a: unique },
          {
            a: O(received => {
              interception = received
            })
          }
        )

        o(interception).notEquals(unique);
      });

      o('assigns the product of any scoped closures to the target properties', () => {
        o(
          O(
            { a: 'foo' },
            { a: O(I) }
          ).a
        ).equals(
          'foo'
        )

        o(
          O(
            { a: 'foo' },
            { a: O(() => 'bar') }
          ).a
        ).equals(
          'bar'
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

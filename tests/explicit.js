const o = require('ospec')

const {P, S, PS, D, O} = require('../explicit.js')

const I = x => x
const A = f => x => f(x)

o('`S`', () => {
  const unique = Symbol('unicum')

  o(
    S(I).apply(unique)
  ).equals(
    A(I)(unique)
  )
    ('is equivalent to an applicative combinator')

  o(
    S(I) instanceof S
  ).equals(
    true
  )
    ('whose partial application is identifiable as a `S`')
})

o.spec('`P`', () => {
  o('consumes a target object & an input object', () => {
    o(P({}, {}))
  })

  o('is equivalent to `Object.assign` in the absence of `S`', () => {
    const [factoryA, factoryB] = [
      () => ({a: 'foo', b: 2, d: {bar:  'z'}, f: [3, 4]}),
      () => ({a: 'baz', c: 3, d: {fizz: 'z'}, f: 'buzz'}),
    ]

    const [a, b] = [factoryA(), factoryB()]

    o(
      P(a, b)
    ).equals(
      a
    )
      ('preserves target identity')

    o(
      P(factoryA(), factoryB())
    ).deepEquals(
      Object.assign(factoryA(), factoryB())
    )
      ('copies properties of input onto target')
  })

  o.spec('with `S`', () => {
    o("supplies the target's property value to the scoped function", () => {
      const unique = Symbol('unicum')

      let interception

      P(
        { a: unique },
        {
          a: S(received => {
            interception = received
          })
        }
      )

      o(interception).equals(unique)
    })

    o('assigns the product of any scoped closures to the target properties', () => {
      const unique1 = Symbol('unicum1')
      const unique2 = Symbol('unicum2')

      o(
        P(
          { a: unique1 },
          { a: S(I) }
        ).a
      ).equals(
        unique1
      )

      o(
        P(
          { a: unique1 },
          { a: S(() => unique2) }
        ).a
      ).equals(
        unique2
      )
    })
  })

  o.spec('with `D`', () => {
    o('deletes the target property with the same key', () => {
      o(
        P(
          { a: 1, b: 2 },
          { a: D }
        )
      ).deepEquals(
        { b: 2 }
      )
    })
  })
})

o.spec('`PS`', () => {
  o('composes `P` with `S`, allowing recursion', () => {
    const one = Symbol('one')
    const two = Symbol('two')

    let interception

    o(
      P(
        {
          a: {
            b: one
          }
        },

        {
          a: PS({
            b: S(received => {
              interception = received

              return two
            })
          })
        }
      )
    ).deepEquals(
      {
        a: {
          b: two
        }
      }
    )

    o(interception).equals(one)
  })

  o('accepts a custom target', () => {
    o(
      P(
        {
          a: [1, 2]
        },
        {
          a: PS(
            [],
            {
              1: 3
            }
          )
        }
      )
    ).deepEquals(
      {
        a: [1, 3]
      }
    )
  })
})

o('`O` explicit (with a single function argument)', () => {
  const unique = Symbol('unicum')

  o(
    O(I).apply(unique)
  ).equals(
    A(I)(unique)
  )
    ('is equivalent to an applicative combinator')
})

o.spec('`O` explicit (with 2 or more arguments)', () => {
  o('consumes a target object & an input object', () => {
    o(O({}, {}))
  })

  o('is equivalent to `Object.assign` in the absence of any sub-properties', () => {
    const [factoryA, factoryB] = [
      () => ({a: 'foo', b: 2, d: {bar:  'z'}, f: [3, 4]}),
      () => ({a: 'baz', c: 3, d: {fizz: 'z'}, f: 'buzz'}),
    ]

    const [a, b] = [factoryA(), factoryB()]

    o(
      O(a, b)
    ).equals(
      a
    )
      ('preserves target identity')

    o(
      O(factoryA(), factoryB())
    ).deepEquals(
      Object.assign({}, factoryA(), factoryB())
    )
      ('copies properties of input onto target')
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

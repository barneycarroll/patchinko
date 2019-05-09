try {
  var o = require('ospec')

  var {P, S, PS, D} = require('../explicit.js')
}
catch(e){}

const I = x => x
const A = f => x => f(x)

o('`S`', () => {
  const unique = {}

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
    P({}, {})
  })

  o.spec('is equivalent to `Object.assign` in the absence of any sub-properties', () => {
    const [factoryA, factoryB] = [
      () => ({ a: 'foo', b: 2, d: { bar:  'z' }, f: [3, 4] }),
      () => ({ a: 'baz', c: 3, d: { fizz: 'z' }, f: 'buzz' }),
    ]

    o('preserves target identity', () => {
      const [a, b] = [factoryA(), factoryB()]

      o(
        P(a, b)
      ).equals(
        a
      )
    })

    o('copies properties of input onto target', () => {
      o(
        P(factoryA(), factoryB())
      ).deepEquals(
        Object.assign(factoryA(), factoryB())
      )
    })

    o.spec('with the exception that', () => {
      o('it will return the input directly if the target is null or undefined', () => {
        const input = {}

        o(
          P(null, input)
        ).equals(
          input
        )

        o(
          P(undefined, input)
        ).equals(
          input
        )
      })
    })
  })

  o.spec('with `S`', () => {
    o("supplies the target's property value to the scoped function", () => {
      const unique = {}

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
      const one = {}
      const two = {}

      o(
        P(
          { a: one },
          { a: S(I) }
        ).a
      ).equals(
        one
      )

      o(
        P(
          { a: one },
          { a: S(() => two) }
        ).a
      ).equals(
        two
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
    const one = {}
    const two = {}

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
            b: S(received => (
              interception = received,
              two
            ))
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

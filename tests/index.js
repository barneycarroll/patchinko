const o = require('ospec')

const {patch, scope, ps} = require('../index.js')

const I = x => x
const A = f => x => f(x)

o('`scope`', () => {
  const unique = Symbol('unicum')

  o(
    scope(I).apply(unique)
  ).equals(
    A(I)(unique)
  )
    ('is equivalent to an applicative combinator')

  o(
    scope(I) instanceof scope
  ).equals(
    true
  )
    ('whose partial application is identifiable as a `scope`')
})

o.spec('`patch`', () => {
  o('consumes a target object & an input object', () => {
    o(patch({}, {}))
  })

  o('is equivalent to a binary `Object.assign` in the absence of `scope`', () => {
    const [factoryA, factoryB] = [
      () => ({a:'foo', b:2, d: {bar:  'z'}, f: [3, 4]}),
      () => ({a:'baz', c:3, d: {fizz: 'z'}, f: 'buzz'}),
    ]

    const [a, b] = [factoryA(), factoryB()]

    o(
      patch(a, b)
    ).equals(
      a
    )
      ('preserves target identity')

    o(
      patch(factoryA(), factoryB())
    ).deepEquals(
      Object.assign(factoryA(), factoryB())
    )
      ('copies properties of input onto target')
  })

  o.spec('with `scope`', () => {
    o('supplies the target\'s property value to the scoped function', () => {
      const unique = Symbol('unicum')

      let interception

      patch(
        {a: unique},
        {a: scope(received => {
          interception = received
        })}
      )

      o(interception).equals(unique)
    })

    o('assigns the product of any scoped closures to the target properties', () => {
      const unique1 = Symbol('unicum1')
      const unique2 = Symbol('unicum2')

      o(
        patch(
          {a: unique1},
          {a: scope(I)}
        ).a
      ).equals(
        unique1
      )
      o(
        patch(
          {a: unique1},
          {a: scope(() => unique2)}
        ).a
      ).equals(
        unique2
      )
    })
  })
})

o.spec('`ps`', () => {
  o('composes `patch` with `scope`, allowing recursion', () => {
    const one = Symbol('one')
    const two = Symbol('two')

    let interception

    o(
      patch(
        {
          a: {
            b: one
          }
        },

        {
          a: ps({
            b: scope(received => {
              interception = received

              return two
            })
          })
        }
      )
    )
      .deepEquals(
        {
          a: {
            b: two
          }
        }
      )

    o(interception).equals(one)
  })
})

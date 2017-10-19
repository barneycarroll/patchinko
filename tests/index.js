const o = require('ospec')

const {p, s, ps, d} = require('../index.js')

const I = x => x
const A = f => x => f(x)

o('`s`', () => {
  const unique = Symbol('unicum')

  o(
    s(I).apply(unique)
  ).equals(
    A(I)(unique)
  )
    ('is equivalent to an applicative combinator')

  o(
    s(I) instanceof s
  ).equals(
    true
  )
    ('whose partial application is identifiable as an `s`')
})

o.spec('`p`', () => {
  o('consumes a target object & an input object', () => {
    o(p({}, {}))
  })

  o('is equivalent to `Object.assign` in the absence of `scope`', () => {
    const [factoryA, factoryB] = [
      () => ({a:'foo', b:2, d: {bar:  'z'}, f: [3, 4]}),
      () => ({a:'baz', c:3, d: {fizz: 'z'}, f: 'buzz'}),
    ]

    const [a, b] = [factoryA(), factoryB()]

    o(
      p(a, b)
    ).equals(
      a
    )
      ('preserves target identity')

    o(
      p(factoryA(), factoryB())
    ).deepEquals(
      Object.assign(factoryA(), factoryB())
    )
      ('copies properties of input onto target')
  })

  o.spec('with `s`', () => {
    o('supplies the target\'s property value to the scoped function', () => {
      const unique = Symbol('unicum')

      let interception

      p(
        {a: unique},
        {a: s(received => {
          interception = received
        })}
      )

      o(interception).equals(unique)
    })

    o('assigns the product of any scoped closures to the target properties', () => {
      const unique1 = Symbol('unicum1')
      const unique2 = Symbol('unicum2')

      o(
        p(
          {a: unique1},
          {a: s(I)}
        ).a
      ).equals(
        unique1
      )
      o(
        p(
          {a: unique1},
          {a: s(() => unique2)}
        ).a
      ).equals(
        unique2
      )
    })
  })
})

o.spec('`ps`', () => {
  o('composes `p` with `s`, allowing recursion', () => {
    const one = Symbol('one')
    const two = Symbol('two')

    let interception

    o(
      p(
        {
          a: {
            b: one
          }
        },

        {
          a: ps({
            b: s(received => {
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

  o('accepts a custom target', () => {
    o(
      p(
        {
          a: [1, 2]
        },
        {
          a: ps(
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

o.spec('`d`', () => {
  o('allows properties on the target to be deleted', () => {
    const target = p(
      {foo: 'bar'},
      {foo: d}
    )

    o(
      'foo' in target
    ).equals(
      false
    )
  })
})
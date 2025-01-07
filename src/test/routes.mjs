import { route } from 'iproute'

// route.show()
//   .then((data) => {
//     console.log(data)
//   })
//   .catch(e => {
//     console.error(e)
//   })

route
  .add(
    {
      to: '10.0.0.1',
      via: {
        address: '192.168.100.1',
      },
    },
    { sudo: true }
  )
  .then((d) => {
    console.log('route added')
  })
  .catch((e) => {
    console.error('route add error %j', e)
  })

// route.show()
//   .then((data) => {
//     console.log(data)
//   })
//   .catch(e => {
//     console.error(e)
//   })

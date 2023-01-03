const { render } = require('sass')
const Order = require('../../../models/order')
const moment = require('moment')


function orderController() {
    return {
        store(req, res) {
            // validate request
            const { phone, address } = req.body
            if (!phone || !address) {
                req.flash('error', 'Please enter the details')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, orderPlaced) => {
                    req.flash('success', 'Order placed successfully😄')
                    delete req.session.cart
                    // Emit for realtime
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', orderPlaced)

                    return res.redirect('/customer/orders')

                })

            }).catch(err => {
                req.falsh('error', 'Something went wrong')
                return res.redirect('/cart')
            })
        },
        async index(req, res) {
            console.log('orders')
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customers/orders', { orders, moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            console.log({ order })
            //  Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.render('customers/singleOrder')

        }
    }
}


module.exports = orderController
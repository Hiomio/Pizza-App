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
                req.flash('success', 'Order placed successfully😄')
                delete req.session.cart
                return res.redirect('/customer/orders')
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
            console.log(orders)
            res.render('customers/orders', { orders, moment })
        }
    }
}


module.exports = orderController
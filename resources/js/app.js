import axios from 'axios'
import Noty from "noty";
import moment from 'moment';
import { initAdmin } from './admin';

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')


function updateCart(pizza) {
    axios.post('/update-cart', pizza).then(res => {
        console.log(res);
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            progressBar: false,
            text: `Item add to cart`
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            progressBar: false,
            text: `Something went wrong`
        }).show();
    })
}


addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})



// removing aleart message from /customer/cart
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}








// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')
function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.order
        if (stepCompleted) {
            status.classList.add('step-completed')
        }
        if (dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })

}

updateStatus(order);


// Socket
let socket = io()
initAdmin(socket)
// join
if (order) {
    socket.emit('join', `order_${order._id}`)
}

// for admin order update 
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin') ){
    socket.emit('join', 'adminRoom')
}


// Listen event
socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    console.log(data)
    updateStatus(updatedOrder);
    new Noty({
        layout: 'bottomRight',
        type: 'success',
        timeout: 10000,
        progressBar: false,
        text: `Your order has been updated 😄`
    }).show();
})
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import Noty from "noty";
import { CardWidget } from './CardWidget';



export async function initStripe() {
    const stripe = await loadStripe('pk_test_51MMbLdSINDorkwkT5JiVVRt0NtNFYTs9XqTrb58KR380oIDKKBVsNcp5iPNw5rBnogalkINYc98q1LgYj6T3P8v700VI6erpPb');
    let card = null

    // function mountWidgit() {


    //     const elements = stripe.elements()

    //     let style = {
    //         base: {
    //             color: '#32325d',
    //             fontFamily: '"Helvetica Neue", Helvetica, san-serif',
    //             fontSmoothing: 'antialiased',
    //             fontSize: '16px',
    //             '::placeholder': {
    //                 color: '#aab7c4'
    //             }
    //         },
    //         invalid: {
    //             color: '#fa755a',
    //             iconColor: '#fa755a'
    //         }
    //     };

    //     card = elements.create('card', { style, hidePostalCode: true })
    //     card.mount('#card-element')
    // }





    const placeOrder = (formObject) => {
        // Ajax call

        axios.post('/orders', formObject).then((res) => {
            new Noty({
                layout: 'bottomRight',
                type: 'success',
                timeout: 2000,
                progressBar: false,
                text: res.data.message,
            }).show();

            setTimeout(() => {
                window.location.href = `/customer/orders`

            }, 3500)
        }).catch(err => {
            console.log('noty ', err)
            new Noty({
                layout: 'bottomRight',
                type: 'success',
                timeout: 1000,
                progressBar: false,
                text: err.response.data.message,
            }).show();
        })
    }





    // Payment method
    const paymentType = document.querySelector('#paymentType')
    if (!paymentType) {
        return
    }
    paymentType.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            // display widget 
            card = new CardWidget(stripe)
            card.mount()

        } else {
            card.destroy()
            card = null
        }
    })




    const paymentForm = document.querySelector('#payment-form')
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault()
            let formData = new FormData(paymentForm)
            let formObject = {}

            for (let [key, value] of formData.entries()) {
                formObject[key] = value
            }

            console.log('we are going fforwd');

            if (!card) {
                // Ajax
                placeOrder(formObject);
                return;
            }
    



            // Verify card

            const token = await card.createToken()
            formObject.stripeToken = token.id;
            placeOrder(formObject);

            // stripe.createToken(card).then((result) => {
            //     console.log(result);
            //     formObject.stripeToken = result.token.id
            //     placeOrder(formObject)
            // }).catch((err) => {
            //     console.log(err)
            // })



        })
    }

}




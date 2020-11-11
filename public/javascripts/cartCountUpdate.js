let addToCart = (productId) => {
    // console.log(productId);
    $.ajax({
        // where to sent the request when the button is clicked:
        url: '/cart-items/' + productId,
        method: 'get',
        // here success will get the result from the server
        success: (result) => {
            if(result.status) {
                // my code
                // let cartCount = document.getElementById('cart-count').innerHTML
                // // didn't understand what the +1 was for
                // cartCount = parseInt(cartCount) + 1
                // cartCount = cartCount
                // Their code
                let cartCount = $('#cart-count').html()
                cartCount = parseInt(cartCount) + 1
                $('#cart-count').html(cartCount)
            }
        }
    })
}
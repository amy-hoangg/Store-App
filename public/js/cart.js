const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  // Use the addProductToCart function from utils.js to add the product to the cart
  addProductToCart(productId);
  // Update the product amount in the UI
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  // Decrease the amount of products in the cart using decreaseProductCount from utils.js
  const newCount = decreaseProductCount(productId);
  if (newCount === 0) {
    removeElement('cart-container', `cart-item-${productId}`);
  } else {
    updateProductAmount(productId, newCount);
  }
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  // Read the amount of products in the cart using getProductCountFromCart from utils.js
  const amountElement = document.getElementById(`amount-${productId}`);
  if (amountElement) {
    amountElement.innerText = `${newCount}x`;
  }
};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  // Get all products from the cart using getAllProductsFromCart from utils.js
  const cartItems = getAllProductsFromCart();

  if (cartItems.length === 0) {
    createNotification('Your cart is empty!', 'cart-notifications-container', false);
    return;
  }

  createNotification('Successfully created an order!', 'cart-notifications-container', true);

  cartItems.forEach((item) => {
    removeElement('cart-container', `cart-item-${item.name}`);
  });

  clearCart();
};

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to 
  //        enable editing ith 
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used 
  //        to select all elements with each of those classes, then its 
  //        just up to finding the right index.  querySelectorAll() can be 
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of 
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something 
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart 
  try {
    const cartContainer = document.getElementById('cart-container');
    const products = await getJSON('/api/products');
    const cartItems = getAllProductsFromCart();
    const cartItemTemplate = document.getElementById('cart-item-template');

    cartItems.forEach((item) => {
      const cartItemClone = cartItemTemplate.content.cloneNode(true);
      const product = products.find((p) => p._id === item.name);

      if (product) {
        cartItemClone.querySelector('h3').textContent = product.name;
        cartItemClone.querySelector('.product-price').textContent = `Price: $${product.price}`;
        const amountElement = cartItemClone.querySelector('.product-amount');
        amountElement.innerText = `${item.amount}x`;

        const plusButton = cartItemClone.querySelector('.cart-plus-button');
        plusButton.id = `plus-${item.name}`;
        plusButton.addEventListener('click', () => addToCart(item.name, product.name));

        const minusButton = cartItemClone.querySelector('.cart-minus-button');
        minusButton.id = `minus-${item.name}`;
        minusButton.addEventListener('click', () => decreaseCount(item.name));

        cartItemClone.querySelector('.cart-item').id = `cart-item-${item.name}`;
        cartContainer.appendChild(cartItemClone);
      }
    });
  } catch (error) {
    console.error('Error fetching and displaying cart items:', error);
  }
})();
const addToCart = (productId, productName) => {
  // TODO 9.2
  // you can use addProductToCart(), available already from /public/js/utils.js
  // for showing a notification of the product's creation, /public/js/utils.js  includes createNotification() function
  // Use the addProductToCart function from utils.js to add the product to the cart
  addProductToCart(productId);
  // Show a notification about the product being added to the cart
  createNotification(
    `Added ${productName} to cart!`,
    "notifications-container",
    true
  );
};

(async () => {
  try {
    // Get the 'products-container' element from the /products.html
    const productsContainer = document.getElementById("products-container");

    // Get the 'product-template' element from the /products.html
    const productTemplate = document.getElementById("product-template");

    // Fetch the list of products from the server
    const products = await getJSON("/api/products");

    // Loop through the products and add them to the page
    products.forEach((product) => {
      // Clone the template
      const productClone = productTemplate.content.cloneNode(true);

      // Get product elements based on their position in the template
      const productName = productClone.querySelector(".product-name");
      const productDescription = productClone.querySelector(".product-description");
      const productPrice = productClone.querySelector(".product-price");

      // Set the id attributes for product elements
      productName.id = `name-${product._id}`;
      productDescription.id = `description-${product._id}`;
      productPrice.id = `price-${product._id}`;

      // Set product information to the template elements
      productName.textContent = product.name;
      productDescription.textContent = product.description;
      productPrice.textContent = product.price;

      // Get the Add to cart button
      const addToCartButton = productClone.querySelector("button");

      // Set the id attribute for the Add to cart button
      addToCartButton.id = `add-to-cart-${product._id}`;

      // Add an event listener for the button's 'click' event
      addToCartButton.addEventListener("click", () => {
        addToCart(product._id, product.name);
      });

      // Append the product to the products container
      productsContainer.appendChild(productClone);
    });
  } catch (error) {
    console.error("Error fetching and displaying products:", error);
  }
})();


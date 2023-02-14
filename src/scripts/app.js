// Toggle cart
const cartList = document.querySelector(".cart");
const openCart = document.querySelector(".shopping-bag");
const closeCart = document.querySelector(".close-cart");

// Render Products
const productsEl = document.querySelector(".products");
const cartItemsEl = document.querySelector(".cart-items");
const subtotalEl = document.querySelector(".subtotal");
const totalItemsInCartEl = document.querySelector(".total-items-in-cart");

// Range filter
const rangeEl = document.querySelector(".sort-by-range");

// BASE URL
const url = "./src/api/products.json";

// ComponentDidMount
window.addEventListener("DOMContentLoaded", () => {
  loadData();
});

let productsList;

function loadData() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      productsList = data;
      renderFilterPriceRange(productsList);
      range();
    });
}

// Price range filter
let filteredProducts;

function renderFilterPriceRange(products) {
  filteredProducts = [...productsList];

  const prices = [...productsList].map(({ price }) => price);
  const [lowPrice, highPrice] = [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];

  rangeEl.innerHTML = "";

  rangeEl.innerHTML += `
    <div class="price-input">
      <div class="field">
        <span>Min</span>
        <input type="number" class="input-min" value="${lowPrice}">
      </div>

      <div class="separator">-</div>

      <div class="field">
        <span>Max</span>
        <input type="number" class="input-max" value="${highPrice}">
      </div>
    </div>
    
    <div class="slider">
      <div class="progress"></div>
    </div>
    <div class="range-input">
      <input type="range" class="range-min" min="${lowPrice}" max="${highPrice}" value="${lowPrice}">
      <input type="range" class="range-max" min="${lowPrice}" max="${highPrice}" value="${highPrice}">
    </div>
  `;

  renderProducts(products);
}

function range() {
  const rangeInput = document.querySelectorAll(".range-input input"),
    priceInput = document.querySelectorAll(".price-input input"),
    range = document.querySelector(".slider .progress");
  let priceGap = 100;

  priceInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let [minPrice, maxPrice] = [
        parseInt(priceInput[0].value),
        parseInt(priceInput[1].value),
      ];

      if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
        if (e.target.className === "input-min") {
          rangeInput[0].value = minPrice;
          range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
        } else {
          rangeInput[1].value = maxPrice;
          range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
        }
      }

      const filterByText = productsList.filter(
        (product) => product.price > minPrice && product.price < maxPrice
      );

      filteredProducts = filterByText;

      renderProducts(filterByText);
    });
  });

  rangeInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let [minVal, maxVal] = [
        parseInt(rangeInput[0].value),
        parseInt(rangeInput[1].value),
      ];

      if (maxVal - minVal < priceGap) {
        if (e.target.className === "range-min") {
          rangeInput[0].value = maxVal - priceGap;
        } else {
          rangeInput[1].value = minVal + priceGap;
        }
      } else {
        priceInput[0].value = minVal;
        priceInput[1].value = maxVal;
        range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
        range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
      }

      const productsInPriceRange = productsList.filter(
        ({ price }) => price > minVal && price < maxVal
      );
      filteredProducts = productsInPriceRange;

      renderProducts(productsInPriceRange);
    });
  });
}

// Render products
function renderProducts(products) {
  productsEl.innerHTML = "";

  products.forEach((product) => {
    productsEl.innerHTML += `
      <div class="item">
        <div class="item-container">
          <div class="item-img">
              <img src="${product.imgSrc}" alt="${product.name}">
          </div>
          
          <div class="desc">
            <h2>${product.name}</h2>
            <h2><small>$</small>${product.price}</h2>
            <p>
            ${product.description}
            </p>
          </div>

          <div class="add-to-cart" onclick="addToCart(${product.id})">
              Add to cart
          </div>
        </div>
      </div>
    `;
  });
}

// Sort by price
// eslint-disable-next-line no-unused-vars
function sortByPriceHandler(event) {
  productsEl.innerHTML = "";

  const sortedProductsByPrice = [...filteredProducts];

  if (event.target.value === "default") {
    renderProducts(sortedProductsByPrice);
  }

  if (event.target.value === "lowToHigh") {
    const ascPriceProductsList = sortedProductsByPrice.sort(
      (a, b) => a.price - b.price
    );
    renderProducts(ascPriceProductsList);
  }

  if (event.target.value === "highToLow") {
    const desPriceProductsList = sortedProductsByPrice.sort(
      (a, b) => b.price - a.price
    );
    renderProducts(desPriceProductsList);
  }
}

// Cart Array
let cart = JSON.parse(localStorage.getItem("cart")) || [];
updateCart();

// Add to cart
// eslint-disable-next-line no-unused-vars
function addToCart(id) {
  if (cart.some((product) => product.id === id)) {
    changeNumberOfUnits("plus", id);
  } else {
    const selectedProduct = productsList.find((product) => product.id === id);
    cart.push({
      ...selectedProduct,
      numberOfUnits: 1,
    });

    updateCart();
  }
}

// Update Cart
function updateCart() {
  renderCartItems();
  renderSubtotal();

  // Save cart to Local Storage
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Render Subtotal
function renderSubtotal() {
  let totalPrice = 0,
    totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.numberOfUnits;
    totalItems += item.numberOfUnits;
  });

  subtotalEl.innerHTML = `Subtotal (${totalItems} items): $${totalPrice.toFixed(
    2
  )}`;

  totalItemsInCartEl.innerHTML = totalItems;
}

// Render Cart item
function renderCartItems() {
  cartItemsEl.innerHTML = "";

  cart.forEach((item) => {
    cartItemsEl.innerHTML += `
      <div class="cart-item">
        <div class="remove-item">
          <div class="remove-item-btn" onclick="removeItemFromCart(${item.id})">
            x
          </div>
        </div>
        
        <div class="item-info">
          <img src="${item.imgSrc}" alt="${item.name}">
          <h4>${item.name}</h4>
        </div>

        <div class="unit-price">
            <small>$</small>${item.price}
        </div>

        <div class="units">
          <div class="btn minus" onclick="changeNumberOfUnits('minus', ${item.id})">-</div>
          <div class="number">${item.numberOfUnits}</div>
          <div class="btn plus" onclick="changeNumberOfUnits('plus', ${item.id})">+</div>
        </div>
      </div>
    `;
  });
}

// Change number of units
function changeNumberOfUnits(action, id) {
  cart = cart.map((item) => {
    let numberOfUnits = item.numberOfUnits;

    if (item.id === id) {
      if (action === "minus" && numberOfUnits > 1) {
        numberOfUnits--;
      }

      if (action === "plus") {
        numberOfUnits++;
      }
    }

    return {
      ...item,
      numberOfUnits,
    };
  });

  updateCart();
}

// Remove item from cart
// eslint-disable-next-line no-unused-vars
function removeItemFromCart(id) {
  cart = cart.filter((item) => item.id !== id);

  updateCart();
}

// Toggle cart
openCart.addEventListener("click", (e) => {
  e.preventDefault();
  cartList.classList.add("show");
});

closeCart.addEventListener("click", (e) => {
  e.preventDefault;
  cartList.classList.remove("show");
});


function loadUpsellItems() {
    let upsell = document.getElementById("cartUpsell");

    if (cart.length >= 5) {
        upsell.innerHTML = "";
        return;
    }

    const upsellItems = [
        { name: "SPRITE" },
        { name: "MOUNTAIN DEW" },
        { name: "COCA COLA" },
        { name: "PEPSI" },
        { name: "MINERAL WATER" }
    ];

    upsell.innerHTML = `
        <div class="fw-bold mb-2" style="font-size:15px;">Add a drink?</div>
        ${upsellItems.map(i => `
            <div class="d-flex align-items-center justify-content-between py-1"
                 style="border-bottom:1px solid #eee; font-size:14px;">
                <span>${i.name}</span>
                <button class="drawer-qty-btn"
                    style=" 
   background: #07b243 !important;
    border: none !important;
    color: #fff !important;
    box-shadow: 0 2px 6px rgba(255,59,48,0.4);
    width: 32px;
    height: 32px;"
                    onclick="updateQty('${i.name}', 1)">
                    +
                </button>
            </div>
        `).join('')}
    `;
}



    function updateVH() {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + "px");
}

updateVH();
window.addEventListener('resize', updateVH);


document.getElementById("drawerCloseBtn").onclick = closeSideDrawer;

   function loadSideMenuDrawer() {
    const container = document.getElementById("drawerContent");
    container.innerHTML = "";

    menuData.categories.forEach((cat, index) => {

        const catRow = document.createElement("div");
        catRow.className = "drawerCategory";
        catRow.innerHTML = `
            ${cat.name}
           <span id="arrow${index}">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke="#FC8019" stroke-width="2" fill="none" stroke-linecap="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
</span>

        `;

        const itemsDiv = document.createElement("div");
        itemsDiv.className = "drawerItems";

        // items inside
        cat.items.forEach(item => {
            const it = document.createElement("div");
            it.className = "drawerItem";
            it.innerText = item.name;

            it.onclick = () => {
                closeSideDrawer();
                document
                    .getElementById("card-" + item.name.replace(/ /g, "_"))
                    .scrollIntoView({ behavior: "smooth" });
            };

            itemsDiv.appendChild(it);
        });

        container.appendChild(catRow);
        container.appendChild(itemsDiv);

        // toggle with auto-collapse
        catRow.onclick = () => {
            document.querySelectorAll(".drawerItems").forEach((el, i) => {
                if (i !== index) {
                    el.style.display = "none";
                    document.getElementById(`arrow${i}`).style.transform = "rotate(0deg)";
                }
            });

            const isOpen = itemsDiv.style.display === "block";
            itemsDiv.style.display = isOpen ? "none" : "block";
            document.getElementById(`arrow${index}`).style.transform =
                isOpen ? "rotate(0deg)" : "rotate(180deg)";
        };
    });
}


document.getElementById("menuBtn").onclick = () => {
    document.getElementById("sideMenuDrawer").classList.add("show");
    document.body.classList.add("body-lock");   // 🔥 BODY LOCK
};

function closeSideDrawer() {
    document.getElementById("sideMenuDrawer").classList.remove("show");
    document.body.classList.remove("body-lock");  // 🔥 UNLOCK
}


document.addEventListener("click", (e) => {
    if (!e.target.closest("#sideMenuDrawer") &&
        !e.target.closest("#menuBtn")) {
        closeSideDrawer();
    }
});



function updateCartBubble() {
    let bubble = document.getElementById("cartCountBubble");
    let count = cart.reduce((sum, item) => sum + item.qty, 0);

    if (count > 0) {
        bubble.style.display = "flex";
        bubble.innerText = count;
    } else {
        bubble.style.display = "none";
    }
}


let smoothVH = window.innerHeight;
let animatingVH = false;

function updateVhSmooth() {
    if (animatingVH) return;

    animatingVH = true;
    const target = window.visualViewport.height;

    const start = smoothVH;
    const diff = target - start;
    const duration = 180;
    let startTime = null;

    function step(ts) {
        if (!startTime) startTime = ts;

        const progress = Math.min((ts - startTime) / duration, 1);
        smoothVH = start + diff * progress;

        document.documentElement.style.setProperty('--realHeight', smoothVH + "px");

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            animatingVH = false;
        }
    }

    requestAnimationFrame(step);
}

window.visualViewport.addEventListener("resize", updateVhSmooth);
window.visualViewport.addEventListener("scroll", updateVhSmooth);

updateVhSmooth();



function scrollToSearch() {
    document.getElementById("searchBox").scrollIntoView({ behavior: "smooth" });
    document.getElementById("searchBox").focus();
}

function openCartFromHeader() {
    document.getElementById("openCart").click();
}





let menuData = {};
let cart = [];
let deliveryMode = "takeaway";
let deliveryFee = 0;

// ====================
// LOAD CART FROM STORAGE
// ====================
function loadSavedCart() {
    const saved = JSON.parse(localStorage.getItem("cartData"));
    if (!saved) return;

    const now = Date.now();
    const age = now - saved.timestamp;

    // 24 hours = 86400000 ms
    if (age > 86400000) {
        localStorage.removeItem("cartData");
        return;
    }

    cart = saved.cart || [];
}

loadSavedCart();
updateCartBubble();


/* =====================
   LOAD JSON
===================== */
fetch("menu.json")
.then(res => res.json())
.then(data => {
    menuData = data;
    applyTheme();     
    loadRestaurantInfo();
    loadCategories();
    loadMenu();
    loadSideMenuDrawer();

    document.getElementById("skeletonList").style.display = "none";
document.getElementById("menuList").style.display = "block";

});

/* =====================
   APPLY THEME
===================== */
function applyTheme(){
    if(menuData.theme){
        if(menuData.theme.color){
            document.documentElement.style.setProperty('--theme-color', menuData.theme.color);
        }
        if(menuData.theme.hero){
            document.getElementById("heroSection").style.backgroundImage =
                `url('${menuData.theme.hero}')`;
        }
    }
}

/* =====================
   RESTAURANT INFO
===================== */
function loadRestaurantInfo(){
    document.getElementById("restName").innerText = menuData.restaurant.name;
    document.getElementById("badgeRating").innerText = menuData.restaurant.rating + " ⭐";
    document.getElementById("badgeDelivery").innerText = menuData.restaurant.deliveryTime;
    document.getElementById("badgeTiming").innerText = menuData.restaurant.timing;

    document.getElementById("specialOffer").innerText = menuData.restaurant.specialOffer;
}
// AUTO-UPDATE FOOTER FROM JSON
function loadFooterDynamic() {
   // document.getElementById("footerRestaurantName").innerText = menuData.restaurant.name;
   // document.getElementById("footerRestaurantName2").innerText = menuData.restaurant.name;
   // document.getElementById("footerTiming").innerText = menuData.restaurant.timing;
   // document.getElementById("footerYear").innerText = new Date().getFullYear();
}

setTimeout(loadFooterDynamic, 300);


/* =====================
   CATEGORY TABS
===================== */
function loadCategories(){
    let tabs = document.getElementById("categoryTabs");
    tabs.innerHTML = "";

    menuData.categories.forEach((cat, i) => {
        tabs.innerHTML += `
            <button class="btn category-btn" onclick="activateTab(this, ${i})">${cat.name}</button>
        `;
    });
}

function activateTab(el, i) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    scrollToCategory(i);
}


/* Scroll to category */
function scrollToCategory(i){
    document.getElementById("cat"+i).scrollIntoView({behavior:"smooth"});
}

/* =====================
   LOAD MENU ITEMS
===================== */
function loadMenu(){
    let html = "";
    menuData.categories.forEach((cat, i) => {

        html += `
<h4 id="cat${i}" class="fw-bold my-3">${cat.name}</h4>
<div class="row g-3">   <!-- START ROW -->
`;


        cat.items.forEach(item => {

            html += `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3">
       <div class="food-card" id="card-${item.name.replace(/ /g,'_')}">


            <img src="${item.img}" class="food-img mb-2" style="width:100%; height:180px; object-fit:cover; border-radius:14px;" loading="lazy">

            <h6 class="fw-bold mt-2">${item.name}</h6>
<p class="small text-muted">${item.desc}</p>

${item.variants ? `
<div class="variant-box">
    ${item.variants.map((v, idx) => `
        <div class="variant-pill ${idx === 0 ? 'active' : ''}"
            onclick="selectVariant('${item.name}', ${idx})">
            ${v.label}
        </div>
    `).join('')}
</div>
` : ''}

<div class="food-bottom">
    <strong id="price-${item.name}" 
            style="font-size:17px; font-weight:800; color:#222;">
            ₹${item.variants ? item.variants[0].price : item.price}
    </strong>

    <div class="qty-box">
        <button onclick="updateQty('${item.name}', -1)">-</button>
        <span id="qty-${item.name}">0</span>
        <button onclick="updateQty('${item.name}', 1)">+</button>
    </div>
</div>

       

        </div>
    </div>
`;

           

        }); html += `</div>`;   // CLOSE ROW
    });

    document.getElementById("menuList").innerHTML = html;
    
}

/* =====================
   CART FUNCTIONS
===================== */
function animateValue(element, start, end, duration = 300) {
    const range = end - start;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        element.innerText = "₹" + Math.floor(start + range * progress);

        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function animateQty(element, start, end, duration = 200) {
    const range = end - start;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        element.innerText = Math.floor(start + range * progress);

        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function animateQtyPrice(element, oldQty, newQty, oldTotal, newTotal, duration = 300) {
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / duration, 1);

        // Smooth values
        const currentQty = Math.floor(oldQty + (newQty - oldQty) * progress);
        const currentTotal = Math.floor(oldTotal + (newTotal - oldTotal) * progress);

        element.innerText = `${currentQty} × ₹${currentTotal}`;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

window.selectedVariants = {};


function updateQty(name, change, vIndex = null) {

     // 🔥 FIX: prevent accidental double taps
    if (window.qtyLock) return;
    window.qtyLock = true;
    setTimeout(() => window.qtyLock = false, 150);

let selectedVariant = vIndex !== null
    ? vIndex
    : (window.selectedVariants[name] ?? 0);

let item = cart.find(i =>
    i.name === name && i.variantIndex === selectedVariant
);






    // If first time → add with default variantIndex = 0
    if (!item && change === 1) {
       cart.push({ name, qty: 1, variantIndex: window.selectedVariants[name] || 0 });

    }
    // Update existing qty
    else if (item) {
        item.qty += change;
        if (item.qty > 10) {
            item.qty = 10;
            showError("Maximum 10 quantities allowed per item.");

        }
       if (item.qty <= 0) {

    let removeVariant = vIndex !== null
        ? vIndex
        : (window.selectedVariants[name] ?? 0);

    cart = cart.filter(i =>
        !(i.name === name && i.variantIndex === removeVariant)
    );

    // Stop negative values entirely
    item.qty = 0;
}

    }

    // get latest item
    item = cart.find(i => i.name === name);

    // ========== QTY ANIMATION ON FOOD CARD ==========
    const qtyBox = document.getElementById("qty-" + name);
    const oldQtyCard = parseInt(qtyBox.innerText) || 0;
    const newQtyCard = item ? item.qty : 0;

    animateQty(qtyBox, oldQtyCard, newQtyCard);

    qtyBox.classList.add("qty-animate");
    setTimeout(() => qtyBox.classList.remove("qty-animate"), 250);

    // ========== TOTAL CALCULATION FIX (variant support) ==========
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

    const totalPrice = cart.reduce((sum, i) => {
        // find menu item
        let menuItem = null;
        menuData.categories.forEach(cat => {
            const f = cat.items.find(x => x.name === i.name);
            if (f) menuItem = f;
        });

        let price = menuItem.variants
            ? menuItem.variants[i.variantIndex].price
            : menuItem.price;

        return sum + (i.qty * price);
    }, 0);

    // ========== QTY × TOTAL PRICE PILL ANIMATION ==========
    const qtyPriceEl = document.getElementById("qtyPrice");

    let oldText = qtyPriceEl.innerText.replace("₹", "").split("×");
    let oldQty = parseInt(oldText[0]) || 0;
    let oldTotal = parseInt(oldText[1]) || 0;

    animateQtyPrice(qtyPriceEl, oldQty, totalQty, oldTotal, totalPrice);

    qtyPriceEl.classList.add("glow", "qtyPriceBounce");
    setTimeout(() => qtyPriceEl.classList.remove("glow", "qtyPriceBounce"), 300);

    // ========== SHOW CART BUTTON ==========
    const btn = document.getElementById("openCart");
    btn.classList.toggle("show", totalQty > 0);

    document.getElementById("cartLabel").innerText =
        totalQty > 0 ? "View Cart" : "Cart Empty";

        saveCart();
        updateCartBubble();

    loadCartPage();
    loadUpsellItems();

}


function saveCart() {
    localStorage.setItem("cartData", JSON.stringify({
        cart: cart,
        timestamp: Date.now()
    }));
}



document.getElementById("openCart").addEventListener("click", () => {
    document.body.classList.add("body-lock");      // ⬅ LOCK PAGE SCROLL
    document.getElementById("cartPage").classList.add("show");
    document.getElementById("overlay").style.display = "block";
    document.documentElement.classList.add("html-lock");   // FULL PAGE FREEZE

    loadCartPage();
    loadUpsellItems();

});


function closeCartDrawer(){
    document.getElementById("cartPage").classList.remove("show");
    document.getElementById("overlay").style.display = "none";
    document.body.classList.remove("body-lock");   // ⬅ UNLOCK PAGE SCROLL
 document.documentElement.classList.remove("html-lock");  // UNFREEZE
 
}

// DARK SUMMARY FIX
// Removes all inline light backgrounds forced by old code
function normalizeCartSummary() {
    const box = document.querySelector(".cart-summary-dark");
    if (box) {
        box.style.background = "";
        box.style.border = "";
        box.style.color = "";
    }
}



function loadCartPage() {
    let cartItems = document.getElementById("cartItems");
normalizeCartSummary();

    // empty state
    if (cart.length === 0) {
        cartItems.innerHTML = "";
        document.getElementById("emptyCartState").style.display = "block";
        document.getElementById("checkoutBtn").style.display = "none";
        return;
    }

    document.getElementById("emptyCartState").style.display = "none";
    document.getElementById("checkoutBtn").style.display = "block";
    cartItems.innerHTML = "";

    let subtotal = 0;

    cart.forEach(cartItem => {
        let menuItem = null;

        // find menu item from menuData
        menuData.categories.forEach(cat => {
            const found = cat.items.find(i => i.name === cartItem.name);
            if (found) menuItem = found;
        });

        // correct price logic (variant OR normal)
        let unitPrice = menuItem.variants
            ? menuItem.variants[cartItem.variantIndex].price
            : menuItem.price;

        let lineTotal = unitPrice * cartItem.qty;
        subtotal += lineTotal;

        // add UI
        cartItems.innerHTML += `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">

                <div>
                    <div class="fw-semibold small">${cartItem.name}</div>
                    <div class="small text-muted">₹${unitPrice} each</div>

                    ${menuItem.variants ? `
                    <div class="small text-muted">
                        Variant: ${menuItem.variants[cartItem.variantIndex].label}
                    </div>
                    ` : ""}
                </div>

                <div class="d-flex align-items-center gap-2">
                    <button class="drawer-qty-btn drawer-qty-minus"
                       onclick="updateQty('${cartItem.name}', -1, ${cartItem.variantIndex})">−</button>

                    <span style="font-size:16px; width:24px; text-align:center;">
                        ${cartItem.qty}
                    </span>

                    <button class="drawer-qty-btn drawer-qty-plus"
                        onclick="updateQty('${cartItem.name}', 1, ${cartItem.variantIndex})">+</button>
                </div>

            </div>
        `;
    });

    // summary
    let tax = Math.round(subtotal * 0.05);
    let total = subtotal + tax;

    cartItems.innerHTML += `
        <div class="mt-3 p-3 rounded cart-summary-dark">


            <div class="d-flex justify-content-between small mb-2">
                <span>Tax (5%)</span>
                <span>₹${tax}</span>
            </div>

            <div class="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>₹${total}</span>
            </div>

        </div>
    `;

        saveCart();   // <-- ADD THIS LINE
        updateCartBubble();


}


function updateCheckoutSummary() {
    let subtotal = 0;

    cart.forEach(cartItem => {
        let menuItem = null;

        // find the real item price from menu.json
        menuData.categories.forEach(cat => {
            const found = cat.items.find(i => i.name === cartItem.name);
            if (found) menuItem = found;
        });

        if (menuItem) {
            let unitPrice = menuItem.variants
    ? menuItem.variants[cartItem.variantIndex].price
    : menuItem.price;

subtotal += unitPrice * cartItem.qty;

        }
    });

    let tax = Math.round(subtotal * (menuData.settings.taxPercent / 100));
    let delivery = deliveryMode === "delivery" ? 20 : 0;
    let total = subtotal + tax + delivery;

    let summaryHTML = `
        <div class="rowLine"><span>Subtotal</span><span>₹${subtotal}</span></div>
        <div class="rowLine"><span>Tax (5%)</span><span>₹${tax}</span></div>
        ${deliveryMode === "delivery" 
            ? `<div class="rowLine"><span>Delivery</span><span>₹20</span></div>` 
            : ""
        }
        <div class="rowLine bold"><span>Total</span><span>₹${total}</span></div>
    `;

    document.getElementById("checkoutSummary").innerHTML = summaryHTML;
}

// SEARCH ICON TOGGLE
const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");
const clearIcon = document.getElementById("clearIcon");

// Show ✕ only when typing
searchBox.addEventListener("input", () => {
    if (searchBox.value.trim().length > 0) {
        searchIcon.style.display = "none";
        clearIcon.style.display = "block";
    } else {
        searchIcon.style.display = "block";
        clearIcon.style.display = "none";
    }
});

// Clear search input
clearIcon.addEventListener("click", () => {
    searchBox.value = "";
    searchIcon.style.display = "block";
    clearIcon.style.display = "none";

     // IMPORTANT: trigger searchBox input event again
    searchBox.dispatchEvent(new Event("input"));

    // Reset menu visibility
    document.querySelectorAll(".food-card").forEach(card => {
        card.style.display = "";
    });
});

/* =====================
   SEARCH FILTER
===================== */
document.getElementById("searchBox").addEventListener("input", function () {
    let query = this.value.toLowerCase().trim();
    const menuList = document.getElementById("menuList");
    const searchResults = document.getElementById("searchResults");

    if (query === "") {
        searchResults.style.display = "none";
        menuList.style.display = "block";
        searchResults.innerHTML = "";
        return;
    }

    searchResults.innerHTML = "";
    searchResults.style.display = "block";
    menuList.style.display = "none";

    let uniqueCards = new Set();

    document.querySelectorAll(".food-card").forEach(card => {
        let name = card.querySelector("h6").innerText.toLowerCase();

        if (name.includes(query)) {
            uniqueCards.add(card.outerHTML);   // ONLY add once
        }
    });

    if (uniqueCards.size === 0) {
        searchResults.innerHTML = `
            <div style="padding:20px; text-align:center; color:#777; font-weight:600;">
                No results found
            </div>
        `;
        return;
    }

    searchResults.innerHTML = `
        <h5 class="fw-bold mb-3">Search Results</h5>
        <div class="row g-3">
            ${[...uniqueCards].map(html => `
                <div class="col-12 col-md-6 col-lg-4 col-xl-3">${html}</div>
            `).join("")}
        </div>
    `;
});

// DESKTOP SEARCH -> USE MOBILE SEARCH LOGIC
const desktopBox = document.getElementById("desktopSearchBox");
const mobBox = document.getElementById("searchBox");   
const desktopClear = document.getElementById("desktopClearIcon");

let desktopScrolled = false;

desktopBox.addEventListener("input", () => {
    const q = desktopBox.value.trim();

    // Copy text into mobile searchBox (main search logic)
    mobBox.value = q;
    mobBox.dispatchEvent(new Event("input")); // triggers SAME FILTER

    // Show/hide clear X
    desktopClear.style.display = q.length ? "block" : "none";

    // Auto-scroll once (scroll 300px)
    if (q.length > 0 && !desktopScrolled) {
        desktopScrolled = true;

        window.scrollTo({
            top: window.scrollY + 300,
            behavior: "smooth"
        });
    }

    if (q.length === 0) desktopScrolled = false;
});

// Desktop clear button
desktopClear.addEventListener("click", () => {
    desktopBox.value = "";
    mobBox.value = "";
    desktopClear.style.display = "none";

    mobBox.dispatchEvent(new Event("input")); // reset search
    desktopScrolled = false;
});


function clearSearchResultList() {
    document.getElementById("searchResults").innerHTML = "";
}


// Open checkout drawer
document.getElementById("checkoutBtn").addEventListener("click", () => {

    const minValue = menuData.settings?.minCartValue || 0;

    let subtotal = cart.reduce((sum, item) => {
        let menuItem = null;

        // find menu item
        menuData.categories.forEach(cat => {
            const f = cat.items.find(x => x.name === item.name);
            if (f) menuItem = f;
        });

        let price = menuItem.variants
            ? menuItem.variants[item.variantIndex].price
            : menuItem.price;

        return sum + (item.qty * price);
    }, 0);

    if (subtotal < minValue) {
       
        showError(`Minimum order value is ₹${minValue}`);

        return;
    }

    // ⭐ YOUR FUNCTION (EXISTS)
    updateCheckoutSummary();

    // ⭐ OPEN CHECKOUT (your method)
    document.body.classList.add("body-lock");
    document.getElementById("checkoutPage").classList.add("show");
    document.documentElement.classList.add("html-lock");

});


// Close checkout drawer
document.getElementById("closeCheckout").addEventListener("click", () => {
    document.getElementById("checkoutPage").classList.remove("show");
    document.documentElement.classList.remove("html-lock");

});

// Delivery mode selection
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        deliveryMode = btn.dataset.mode;

        if (deliveryMode === "delivery") {
            deliveryFee = menuData.settings.deliveryFee; 
            document.getElementById("addressFields").style.display = "block";
        } else {
            deliveryFee = 0;
            document.getElementById("addressFields").style.display = "none";
        }

       updateCheckoutSummary();  // 🔥 update summary live

    });
});


function clearErrors() {
    document.querySelectorAll(".error-text").forEach(e => e.innerText = "");
    document.querySelectorAll(".input-error").forEach(e => e.classList.remove("input-error"));
}





document.getElementById("finalWhatsApp").addEventListener("click", () => {

    clearErrors(); // remove old errors

    let name = fullName.value.trim();
    let phone = phoneNumber.value.trim();
    let addressVal = address.value.trim();
    let landmarkVal = landmark.value.trim();

    // NAME
    if (!name) {
        showError( "Please enter your Full Name");
        return;
    }

    // PHONE
    if (!phone || phone.length < 10) {
        showError( "Enter a valid phone number");
        return;
    }

    // DELIVERY ADDRESS
    if (deliveryMode === "delivery") {

        if (!addressVal) {
            showError("Please enter your Address");
            return;
        }
        
    }

    // CART EMPTY
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // BUILD ITEMS TEXT
// BUILD ITEMS TEXT
let itemsText = "";
let subtotal = 0;

cart.forEach(cartItem => {
    let menuItem = null;

    menuData.categories.forEach(cat => {
        const found = cat.items.find(i => i.name === cartItem.name);
        if (found) menuItem = found;
    });

    if (menuItem) {

        // VARIANT HANDLING
        let itemLabel;
        if (menuItem.variants) {
            const variantObj = menuItem.variants[cartItem.variantIndex];
            itemLabel = `${cartItem.name} (${variantObj.label})`;
        } else {
            itemLabel = cartItem.name;
        }

        // BUILD LINE
        itemsText += `${itemLabel} × ${cartItem.qty}\n`;

        // PRICE CALCULATION
        let unitPrice = menuItem.variants
            ? menuItem.variants[cartItem.variantIndex].price
            : menuItem.price;

        subtotal += unitPrice * cartItem.qty;
    }
});

    let tax = Math.round(subtotal * (menuData.settings.taxPercent / 100));
    let deliveryFeeFinal = deliveryMode === "delivery" ? deliveryFee : 0;
    let totalFinal = subtotal + tax + deliveryFeeFinal;
let orderId = menuData.settings.orderPrefix + Date.now().toString().slice(-6);
 const now = new Date();
const orderDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
});

const orderTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
});
  
let message =
`Order ID: ${orderId}
Date: ${orderDate}
Time: ${orderTime}

------------------------
${itemsText}
------------------------
Subtotal: ₹${subtotal}
Tax (5%): ₹${tax}
Delivery Fee: ₹${deliveryFeeFinal}
*Total: ₹${totalFinal}*
------------------------
Mode: ${deliveryMode === "delivery" ? "Home Delivery" : "Takeaway"}
Name: ${name}
Phone: ${phone}
${deliveryMode === "delivery" ? 
`Address: ${addressVal}
Landmark: ${landmarkVal || "N/A"}` 
: ""}
`;

    let businessNumber = "919596184197";  
    let url = "https://wa.me/" + businessNumber + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank");
});

// BESTSELLER CLICK → SCROLL TO CATEGORY
function scrollToCategoryByName(categoryName) {
    const tabs = document.querySelectorAll(".category-btn");

    tabs.forEach((btn, index) => {
        if (btn.innerText.trim().toLowerCase() === categoryName.toLowerCase()) {
            // Activate the tab
            btn.classList.add("active");

            // Scroll to section
            document.getElementById("cat" + index)
                .scrollIntoView({ behavior: "smooth" });

            // Remove active from others
            tabs.forEach(b => { if (b !== btn) b.classList.remove("active"); });
        }
    });
}


document.getElementById("closeCheckout").addEventListener("click", () => {

    // RESET INPUT VALUES
    document.getElementById("fullName").value = "";
    document.getElementById("phoneNumber").value = "";
    document.getElementById("address").value = "";
    document.getElementById("landmark").value = "";

    // RESET ERROR TEXTS
    document.querySelectorAll(".error-text").forEach(el => el.innerText = "");

    // RESET RED ERROR BORDER
    document.querySelectorAll(".checkout-form input").forEach(el => {
        el.classList.remove("input-error");
        el.style.border = "2px solid #d4d4d4"; // default gray border
    });

    // HIDE ADDRESS FIELDS
    document.getElementById("addressFields").style.display = "none";

    // RESET MODE TO TAKEAWAY
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector('.mode-btn[data-mode="takeaway"]').classList.add("active");
    deliveryMode = "takeaway";

    // CLOSE CHECKOUT PAGE
    document.getElementById("checkoutPage").classList.remove("show");
    document.body.classList.remove("body-lock");
    document.documentElement.classList.remove("html-lock");
});
 

if ('caches' in window) {
  caches.open('menu-cache').then(cache => {
    cache.add('menu.json');
  });
}


function selectVariant(name, index) {
    // find the menu item
    let item = null;
    menuData.categories.forEach(cat => {
        cat.items.forEach(i => { if (i.name === name) item = i; });
    });

    if (!item || !item.variants) return;

    // update price on card
    const newPrice = item.variants[index].price;
    document.getElementById(`price-${name}`).innerText = "₹" + newPrice;

    // get the card & pill group
    const safeId = name.replace(/ /g, "_");
    const card = document.getElementById(`card-${safeId}`);
    const pills = card.querySelectorAll(".variant-pill");

    pills.forEach(p => p.classList.remove("active"));
    pills[index].classList.add("active");
    window.selectedVariants[name] = index;

if (cartItem) {
    cartItem.variantIndex = window.selectedVariants[name];
}

   
    // Update variantIndex for active cart item
   let cartItem = cart.find(c => c.name === name && c.variantIndex === window.selectedVariants[name]);

    if (cartItem) {
        cartItem.variantIndex = index;
        updateQty(name, 0);
    }
}

let lastScrollY = 0;
const header = document.getElementById("stickyHeader");

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    // Scroll down → hide header
    if (current > lastScrollY && current > 80) {
        header.style.transform = "translateY(-100%)";
    } 
    // Scroll up → show header
    else {
        header.style.transform = "translateY(0)";
    }

    lastScrollY = current;
});

document.getElementById("newsletterBtn").addEventListener("click", () => {
    const email = document.getElementById("newsletterEmail").value.trim();
    const msg = document.getElementById("newsletterMsg");

    if (email.length < 5 || !email.includes("@")) {
        msg.innerText = "Enter a valid email.";
        msg.style.color = "red";
        return;
    }

    msg.innerText = "Subscribed successfully!";
    msg.style.color = "green";

    document.getElementById("newsletterEmail").value = "";
});

function showError(msg) {
    document.getElementById("errorMessage").innerText = msg;
    document.getElementById("errorOverlay").style.display = "flex";

    // LOCK SCROLL AT ROOT
    document.documentElement.classList.add("html-lock");
}

function closeError() {
    document.getElementById("errorOverlay").style.display = "none";

    // UNLOCK ROOT SCROLL
    document.documentElement.classList.remove("html-lock");
}


// clicking outside also closes
document.getElementById("errorOverlay").addEventListener("click", (e) => {
    if (e.target.id === "errorOverlay") closeError();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(() => console.log("SW Registered"))
    .catch((err) => console.log("SW error:", err));
}

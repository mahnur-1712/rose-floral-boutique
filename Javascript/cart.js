const cartButton = document.getElementById("cart");
const countScreen = document.getElementById("count");
const cartPanel = document.getElementById("cartPanel");
const closeButton = document.getElementById("closeCart");
const cartList = document.getElementById("cartList");

const STORAGE_KEY = "roseFloralCartItems";

function readCart() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    const totalCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    localStorage.setItem("items", totalCount);
    renderCart(cart);
}

function formatPKR(amount) {
    return "PKR " + Number(amount || 0).toLocaleString("en-US");
}

function renderCart(cart = readCart()) {
    const totalCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    if (countScreen) {
        countScreen.textContent = totalCount;
    }

    if (!cartList) return;

    cartList.innerHTML = "";
    cartList.style.listStyle = "none";
    cartList.style.marginTop = "16px";
    cartList.style.maxHeight = "calc(100vh - 120px)";
    cartList.style.overflowY = "auto";

    if (cart.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.textContent = "Your cart is empty.";
        emptyLi.style.padding = "12px 0";
        emptyLi.style.color = "#555";
        cartList.appendChild(emptyLi);
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.padding = "10px 0";
        li.style.borderBottom = "1px solid #d5d2cd";
        li.style.fontSize = "14px";

        const title = document.createElement("div");
        title.style.fontWeight = "bold";
        title.textContent = `${item.name} — ${formatPKR(item.price)}`;
        li.appendChild(title);

        if (item.giftNote) {
            const note = document.createElement("div");
            note.style.fontSize = "12px";
            note.style.fontStyle = "italic";
            note.style.marginTop = "3px";
            note.textContent = `Note: ${item.giftNote}`;
            li.appendChild(note);
        }

        const controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.alignItems = "center";
        controls.style.gap = "6px";
        controls.style.marginTop = "6px";

        const decBtn = document.createElement("button");
        decBtn.type = "button";
        decBtn.textContent = "−";
        decBtn.style.padding = "2px 8px";
        decBtn.style.cursor = "pointer";
        decBtn.addEventListener("click", () => changeItemQty(index, -1));

        const qtySpan = document.createElement("span");
        qtySpan.textContent = String(item.qty);

        const incBtn = document.createElement("button");
        incBtn.type = "button";
        incBtn.textContent = "+";
        incBtn.style.padding = "2px 8px";
        incBtn.style.cursor = "pointer";
        incBtn.addEventListener("click", () => changeItemQty(index, 1));

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Remove";
        removeBtn.style.marginLeft = "auto";
        removeBtn.style.padding = "2px 8px";
        removeBtn.style.cursor = "pointer";
        removeBtn.addEventListener("click", () => removeItem(index));

        controls.append(decBtn, qtySpan, incBtn, removeBtn);
        li.appendChild(controls);
        cartList.appendChild(li);
    });

    const subtotal = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0
    );

    const summaryLi = document.createElement("li");
    summaryLi.style.paddingTop = "14px";
    summaryLi.style.marginTop = "8px";

    const subtotalDiv = document.createElement("div");
    subtotalDiv.style.fontWeight = "bold";
    subtotalDiv.style.fontSize = "15px";
    subtotalDiv.style.marginBottom = "10px";
    subtotalDiv.textContent = `Subtotal: ${formatPKR(subtotal)}`;

    const checkoutBtn = document.createElement("button");
    checkoutBtn.type = "button";
    checkoutBtn.textContent = "Checkout";
    checkoutBtn.style.width = "100%";
    checkoutBtn.style.padding = "8px";
    checkoutBtn.style.backgroundColor = "#C97D8B";
    checkoutBtn.style.color = "#fff";
    checkoutBtn.style.border = "none";
    checkoutBtn.style.borderRadius = "4px";
    checkoutBtn.style.cursor = "pointer";
    checkoutBtn.style.marginBottom = "6px";
    checkoutBtn.addEventListener("click", () => {
        alert(
            `Order Summary\nTotal Items: ${totalCount}\nSubtotal: ${formatPKR(subtotal)}`
        );
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear Cart";
    clearBtn.style.width = "100%";
    clearBtn.style.padding = "6px";
    clearBtn.style.cursor = "pointer";
    clearBtn.addEventListener("click", () => writeCart([]));

    summaryLi.append(subtotalDiv, checkoutBtn, clearBtn);
    cartList.appendChild(summaryLi);
}

function addItemToCart(product) {
    const cart = readCart();
    const note = (product.giftNote || "").trim();
    const qty = Number(product.qty) || 1;

    const existing = cart.find(
        (entry) => entry.name === product.name && (entry.giftNote || "") === note
    );

    if (existing) {
        existing.qty = Math.min(20, existing.qty + qty);
    } else {
        cart.push({
            name: product.name,
            price: Number(product.price) || 0,
            qty,
            giftNote: note
        });
    }

    writeCart(cart);
    if (cartPanel) {
        cartPanel.classList.add("open");
    }
}

function changeItemQty(index, delta) {
    const cart = readCart();
    const item = cart[index];
    if (!item) return;

    const nextQty = item.qty + delta;
    if (nextQty <= 0) {
        cart.splice(index, 1);
    } else {
        item.qty = Math.min(20, nextQty);
    }
    writeCart(cart);
}

function removeItem(index) {
    const cart = readCart();
    cart.splice(index, 1);
    writeCart(cart);
}

if (closeButton && cartPanel) {
    closeButton.addEventListener("click", function () {
        cartPanel.classList.remove("open");
    });
}

if (cartButton && cartPanel) {
    cartButton.addEventListener("click", function () {
        cartPanel.classList.add("open");
    });
}

// Override or hook into product page addToCart() if present on product*.html
window.addToCart = function () {
    const qtyInput = document.getElementById("productQty");
    const noteInput = document.getElementById("giftNote");
    const qty = qtyInput ? Number(qtyInput.value) : 1;
    const giftNote = noteInput ? noteInput.value : "";

    if (qty < 1 || qty > 20 || Number.isNaN(qty)) {
        alert("Please enter a quantity between 1 and 20.");
        return;
    }

    const nameEl = document.querySelector(".product-detail-info h1");
    const priceEl = document.querySelector(".product-detail-info .price");

    const name = nameEl ? nameEl.textContent.trim() : "Floral Bouquet";
    const rawPrice = priceEl ? priceEl.textContent : "0";
    const price = Number(rawPrice.replace(/[^\d]/g, "")) || 0;

    addItemToCart({ name, price, qty, giftNote });
};

let items = Number(localStorage.getItem("items")) || 0;
if (countScreen) {
    countScreen.textContent = items;
}
renderCart();
let items = [];

document.getElementById("addItemBtn").addEventListener("click", () => {
    const name = document.getElementById("itemName").value.trim();
    const price = Number(document.getElementById("itemPrice").value);
    const quantity = Number(document.getElementById("itemQty").value);

    if (!name || !price || !quantity) return;

    items.push({ name, price, quantity });

    renderPreview();

    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemQty").value = "";
});

document.getElementById("createCartBtn").addEventListener("click", async () => {
    const customer_id = Number(document.getElementById("customerId").value);

    if (!customer_id) {
        alert("Enter customer id");
        return;
    }

    if (items.length === 0) {
        alert("Add at least one item");
        return;
    }

    await fetch("/api/carts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer_id,
            items,
            status: "open"
        })
    });

    items = [];
    renderPreview();

    document.getElementById("customerId").value = "";

    loadCarts();
});

function renderPreview() {
    document.getElementById("itemsPreview").textContent =
        JSON.stringify(items, null, 2);
}

async function deleteCart(id) {
    await fetch(`/api/carts/${id}`, {
        method: "DELETE"
    });

    loadCarts();
}

async function saveCart(cart) {
    await fetch(`/api/carts/${cart.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer_id: cart.customer_id,
            items: cart.items,
            status: cart.status
        })
    });

    loadCarts();
}

async function addItemToCart(cart) {
    const name = prompt("Item name:");
    if (!name) return;

    const price = Number(prompt("Price:"));
    if (!price) return;

    const quantity = Number(prompt("Quantity:"));
    if (!quantity) return;

    cart.items.push({ name, price, quantity });

    await saveCart(cart);
}

async function deleteItem(cart, index) {
    cart.items.splice(index, 1);

    await saveCart(cart);
}

async function editItem(cart, index) {
    const item = cart.items[index];

    const name = prompt("Item name:", item.name);
    if (name === null) return;

    const price = Number(prompt("Price:", item.price));
    if (!price) return;

    const quantity = Number(prompt("Quantity:", item.quantity));
    if (!quantity) return;

    cart.items[index] = {
        name,
        price,
        quantity
    };

    await saveCart(cart);
}

async function loadCarts() {
    const res = await fetch("/api/carts");
    const carts = await res.json();

    if (!Array.isArray(carts)) {
        console.error(carts);
        return;
    }

    document.getElementById("cartList").innerHTML =
        carts.map(cart => `
            <div class="cart" data-cy="cart-item">
                <strong>Cart #${cart.id}</strong><br>
                Customer: ${cart.customer_id}<br>
                Status: ${cart.status}<br>

                <ul>
                    ${cart.items.map((item, index) => `
                        <li>
                            ${item.name} — $${item.price} × ${item.quantity}

                            <button
                                data-cy="edit-item-btn"
                                onclick='editItem(${JSON.stringify(cart)}, ${index})'>
                                Edit
                            </button>

                            <button
                                data-cy="delete-item-btn"
                                onclick='deleteItem(${JSON.stringify(cart)}, ${index})'>
                                Delete Item
                            </button>
                        </li>
                    `).join("")}
                </ul>

                <button
                    data-cy="add-item-existing-btn"
                    onclick='addItemToCart(${JSON.stringify(cart)})'>
                    Add Item
                </button>

                <button
                    data-cy="delete-cart-btn"
                    onclick='deleteCart(${cart.id})'>
                    Delete Cart
                </button>
            </div>
        `).join("");
}

loadCarts();
"use strict";

/* =========================
   الحالة العامة
========================= */

const state = {
    products: [],
    orders: [],
    cartItems: [],
    cartTotal: 0,
    editingProductId: null,
    pendingConfirmAction: null,
    activeAdminSection: "dashboard"
};

const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

/* =========================
   عناصر واجهة المتجر
========================= */

const storeView = document.getElementById("storeView");
const adminView = document.getElementById("adminView");

const productsGrid = document.getElementById("productsGrid");
const productsLoading = document.getElementById("productsLoading");
const productsEmpty = document.getElementById("productsEmpty");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const searchButton = document.getElementById("searchButton");
const resetFiltersButton = document.getElementById("resetFiltersButton");

const visibleProductsCount =
    document.getElementById("visibleProductsCount");

const heroProductsCount =
    document.getElementById("heroProductsCount");

const openCartButton =
    document.getElementById("openCartButton");

const heroCartButton =
    document.getElementById("heroCartButton");

const closeCartButton =
    document.getElementById("closeCartButton");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItemsContainer =
    document.getElementById("cartItemsContainer");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartLoading =
    document.getElementById("cartLoading");

const cartCount =
    document.getElementById("cartCount");

const cartItemsQuantity =
    document.getElementById("cartItemsQuantity");

const cartTotal =
    document.getElementById("cartTotal");

const clearCartButton =
    document.getElementById("clearCartButton");

const checkoutButton =
    document.getElementById("checkoutButton");

const checkoutModal =
    document.getElementById("checkoutModal");

const closeCheckoutButton =
    document.getElementById("closeCheckoutButton");

const checkoutForm =
    document.getElementById("checkoutForm");

const customerNameInput =
    document.getElementById("customerName");

const customerPhoneInput =
    document.getElementById("customerPhone");

const customerAddressInput =
    document.getElementById("customerAddress");

const confirmOrderButton =
    document.getElementById("confirmOrderButton");

const checkoutSummaryItems =
    document.getElementById("checkoutSummaryItems");

const checkoutTotal =
    document.getElementById("checkoutTotal");

/* =========================
   عناصر لوحة الإدارة
========================= */

const openAdminButton =
    document.getElementById("openAdminButton");

const backToStoreButton =
    document.getElementById("backToStoreButton");

const adminNavigationButtons =
    document.querySelectorAll(".admin-nav-item");

const adminPageTitle =
    document.getElementById("adminPageTitle");

const adminDashboardSection =
    document.getElementById("adminDashboardSection");

const adminProductsSection =
    document.getElementById("adminProductsSection");

const adminOrdersSection =
    document.getElementById("adminOrdersSection");

const adminProductsCount =
    document.getElementById("adminProductsCount");

const adminOrdersCount =
    document.getElementById("adminOrdersCount");

const adminRevenue =
    document.getElementById("adminRevenue");

const adminStockCount =
    document.getElementById("adminStockCount");

const recentOrdersContainer =
    document.getElementById("recentOrdersContainer");

const lowStockContainer =
    document.getElementById("lowStockContainer");

const adminProductsTableBody =
    document.getElementById("adminProductsTableBody");

const adminOrdersTableBody =
    document.getElementById("adminOrdersTableBody");

const adminProductSearch =
    document.getElementById("adminProductSearch");

const addProductButton =
    document.getElementById("addProductButton");

const refreshOrdersButton =
    document.getElementById("refreshOrdersButton");

const productModal =
    document.getElementById("productModal");

const productModalTitle =
    document.getElementById("productModalTitle");

const closeProductModalButton =
    document.getElementById("closeProductModalButton");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");

const productIdInput =
    document.getElementById("productId");

const productNameInput =
    document.getElementById("productName");

const productCategoryInput =
    document.getElementById("productCategory");

const productPriceInput =
    document.getElementById("productPrice");

const productStockInput =
    document.getElementById("productStock");

const productImageInput =
    document.getElementById("productImage");

const productDescriptionInput =
    document.getElementById("productDescription");

const saveProductButton =
    document.getElementById("saveProductButton");

const orderDetailsModal =
    document.getElementById("orderDetailsModal");

const closeOrderDetailsButton =
    document.getElementById("closeOrderDetailsButton");

const orderDetailsTitle =
    document.getElementById("orderDetailsTitle");

const orderDetailsContent =
    document.getElementById("orderDetailsContent");

    const adminLoginModal =
    document.getElementById('adminLoginModal');

const adminLoginForm =
    document.getElementById('adminLoginForm');

const adminUsernameInput =
    document.getElementById('adminUsername');

const adminPasswordInput =
    document.getElementById('adminPassword');

const adminLoginButton =
    document.getElementById('adminLoginButton');

const adminLoginError =
    document.getElementById('adminLoginError');

const cancelAdminLoginButton =
    document.getElementById('cancelAdminLoginButton');

const toggleAdminPassword =
    document.getElementById('toggleAdminPassword');

const adminLogoutButton =
    document.getElementById('adminLogoutButton');

/* =========================
   تأكيد العمليات
========================= */

const confirmModal =
    document.getElementById("confirmModal");

const confirmTitle =
    document.getElementById("confirmTitle");

const confirmMessage =
    document.getElementById("confirmMessage");

const cancelConfirmButton =
    document.getElementById("cancelConfirmButton");

const confirmActionButton =
    document.getElementById("confirmActionButton");

const toastContainer =
    document.getElementById("toastContainer");

/* =========================
   أدوات مساعدة
========================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0.00";
    }

    return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(value) {
    if (!value) {
        return "غير محدد";
    }

    const normalizedValue =
        String(value).includes("T")
            ? value
            : `${value.replace(" ", "T")}Z`;

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ar", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function normalizeImagePath(image) {
    const value = String(image || "").trim();

    if (!value) {
        return PLACEHOLDER_IMAGE;
    }

    return value;
}

function handleImageError(imageElement) {
    imageElement.onerror = null;
    imageElement.src = PLACEHOLDER_IMAGE;
}

function setButtonLoading(button, loading, loadingText) {
    if (!button) {
        return;
    }

    if (loading) {
        button.dataset.originalContent = button.innerHTML;
        button.disabled = true;

        button.innerHTML = `
            <span class="loader" style="
                width:20px;
                height:20px;
                margin:0;
                border-width:2px;
            "></span>
            ${escapeHtml(loadingText)}
        `;
    } else {
        button.disabled = false;

        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
            delete button.dataset.originalContent;
        }
    }
}

function showToast(message, type = "success", title = "") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon =
        type === "success"
            ? "fa-circle-check"
            : type === "error"
                ? "fa-circle-xmark"
                : "fa-circle-info";

    const defaultTitle =
        type === "success"
            ? "تمت العملية بنجاح"
            : type === "error"
                ? "حدث خطأ"
                : "تنبيه";

    toast.innerHTML = `
        <span class="toast-icon">
            <i class="fa-solid ${icon}"></i>
        </span>

        <div class="toast-content">
            <strong>${escapeHtml(title || defaultTitle)}</strong>
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-20px)";

        window.setTimeout(() => {
            toast.remove();
        }, 250);
    }, 3500);
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            `فشل الطلب برمز ${response.status}`
        );
    }

    return data;
}

function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.classList.remove("show");

    if (!document.querySelector(".modal.show")) {
        document.body.style.overflow = "";
    }
}

function closeModalWhenBackdropClicked(event, modal) {
    if (event.target === modal) {
        closeModal(modal);
    }
}

/* =========================
   المنتجات
========================= */

async function loadProducts() {
    productsLoading.classList.remove("hidden");
    productsGrid.classList.add("hidden");
    productsEmpty.classList.add("hidden");

    try {
        const query = new URLSearchParams();

        const search = searchInput.value.trim();
        const category = categoryFilter.value;

        if (search) {
            query.set("search", search);
        }

        if (category) {
            query.set("category", category);
        }

        const endpoint =
            query.toString()
                ? `/products?${query.toString()}`
                : "/products";

        const data = await requestJson(endpoint);

        state.products = Array.isArray(data.products)
            ? data.products
            : [];

        renderProducts(state.products);
        updateCategoryOptions(state.products);

        heroProductsCount.textContent = data.count ?? state.products.length;
        visibleProductsCount.textContent = state.products.length;
    } catch (error) {
        state.products = [];
        renderProducts([]);

        showToast(error.message, "error");
    } finally {
        productsLoading.classList.add("hidden");
    }
}

function renderProducts(products) {
    productsGrid.innerHTML = "";

    if (!products.length) {
        productsGrid.classList.add("hidden");
        productsEmpty.classList.remove("hidden");
        return;
    }

    productsEmpty.classList.add("hidden");
    productsGrid.classList.remove("hidden");

    for (const product of products) {
        const card = document.createElement("article");
        card.className = "product-card";

        const stock = Number(product.stock || 0);
        const image = normalizeImagePath(product.image);

        card.innerHTML = `
            <div class="product-image-wrapper">
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(product.name)}"
                >

                <span class="product-category-badge">
                    ${escapeHtml(product.category)}
                </span>

                <span class="
                    stock-badge
                    ${stock <= 0 ? "out-of-stock" : ""}
                ">
                    ${
                        stock > 0
                            ? `متوفر: ${stock}`
                            : "نفد المخزون"
                    }
                </span>
            </div>

            <div class="product-card-content">
                <h3 class="product-title">
                    ${escapeHtml(product.name)}
                </h3>

                <p class="product-description">
                    ${
                        escapeHtml(product.description) ||
                        "لا يوجد وصف متاح لهذا المنتج."
                    }
                </p>

                <div class="product-meta">
                    <div class="product-price">
                        <strong>${formatPrice(product.price)}</strong>
                        <span>دولار</span>
                    </div>

                    <button
                        type="button"
                        class="add-cart-button"
                        data-add-product="${product.id}"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        <i class="fa-solid fa-cart-plus"></i>

                        ${
                            stock <= 0
                                ? "غير متوفر"
                                : "أضف للسلة"
                        }
                    </button>
                </div>
            </div>
        `;

        const imageElement = card.querySelector("img");

        imageElement.addEventListener("error", () => {
            handleImageError(imageElement);
        });

        productsGrid.appendChild(card);
    }
}

function updateCategoryOptions(products) {
    const selectedCategory = categoryFilter.value;

    const categories = [
        ...new Set(
            products
                .map(product => String(product.category || "").trim())
                .filter(Boolean)
        )
    ].sort();

    const existingValues = new Set(
        [...categoryFilter.options].map(option => option.value)
    );

    for (const category of categories) {
        if (existingValues.has(category)) {
            continue;
        }

        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    }

    categoryFilter.value = selectedCategory;
}

async function addProductToCart(productId) {
    try {
        const data = await requestJson("/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: Number(productId),
                quantity: 1
            })
        });

        showToast(
            data.message || "تمت إضافة المنتج إلى السلة."
        );

        await loadCart();
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* =========================
   السلة
========================= */

async function loadCart() {
    cartLoading.classList.remove("hidden");

    try {
        const data = await requestJson("/cart");

        state.cartItems = Array.isArray(data.items)
            ? data.items
            : [];

        state.cartTotal = Number(data.total || 0);

        renderCart();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        cartLoading.classList.add("hidden");
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = "";

    const totalQuantity = state.cartItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    cartCount.textContent = totalQuantity;
    cartItemsQuantity.textContent = totalQuantity;
    cartTotal.textContent = formatPrice(state.cartTotal);
    checkoutTotal.textContent = formatPrice(state.cartTotal);

    const cartIsEmpty = state.cartItems.length === 0;

    cartEmpty.classList.toggle("hidden", !cartIsEmpty);
    cartItemsContainer.classList.toggle("hidden", cartIsEmpty);

    checkoutButton.disabled = cartIsEmpty;
    clearCartButton.disabled = cartIsEmpty;

    for (const item of state.cartItems) {
        const element = document.createElement("article");
        element.className = "cart-item";

        element.innerHTML = `
            <img
                class="cart-item-image"
                src="${escapeHtml(normalizeImagePath(item.image))}"
                alt="${escapeHtml(item.name)}"
            >

            <div>
                <div class="cart-item-title-row">
                    <h3>${escapeHtml(item.name)}</h3>

                    <button
                        type="button"
                        class="cart-remove-button"
                        data-remove-cart="${item.product_id}"
                        title="حذف من السلة"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

                <p class="cart-item-price">
                    ${formatPrice(item.price)} $
                </p>

                <div class="cart-item-bottom">
                    <div class="quantity-control">
                        <button
                            type="button"
                            data-cart-decrease="${item.product_id}"
                            data-current-quantity="${item.quantity}"
                        >
                            <i class="fa-solid fa-minus"></i>
                        </button>

                        <span>${item.quantity}</span>

                        <button
                            type="button"
                            data-cart-increase="${item.product_id}"
                            data-current-quantity="${item.quantity}"
                        >
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    <strong class="cart-item-subtotal">
                        ${formatPrice(item.subtotal)} $
                    </strong>
                </div>
            </div>
        `;

        const imageElement = element.querySelector("img");

        imageElement.addEventListener("error", () => {
            handleImageError(imageElement);
        });

        cartItemsContainer.appendChild(element);
    }

    renderCheckoutSummary();
}

function renderCheckoutSummary() {
    checkoutSummaryItems.innerHTML = "";

    for (const item of state.cartItems) {
        const element = document.createElement("div");
        element.className = "checkout-summary-item";

        element.innerHTML = `
            <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span>
                    الكمية: ${item.quantity}
                    ×
                    ${formatPrice(item.price)} $
                </span>
            </div>

            <strong>
                ${formatPrice(item.subtotal)} $
            </strong>
        `;

        checkoutSummaryItems.appendChild(element);
    }
}

function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("show");
    document.body.style.overflow = "hidden";

    loadCart();
}

function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

async function updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
        await removeCartItem(productId);
        return;
    }

    try {
        await requestJson(`/cart/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ quantity })
        });

        await loadCart();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function removeCartItem(productId) {
    try {
        const data = await requestJson(`/cart/${productId}`, {
            method: "DELETE"
        });

        showToast(data.message || "تم حذف المنتج من السلة.");

        await loadCart();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function askToClearCart() {
    if (!state.cartItems.length) {
        showToast("السلة فارغة بالفعل.", "info");
        return;
    }

    openConfirm({
        title: "تفريغ سلة المشتريات",
        message:
            "سيتم حذف جميع المنتجات الموجودة في السلة. هل تريد المتابعة؟",
        action: clearCart
    });
}

async function clearCart() {
    try {
        const data = await requestJson("/cart", {
            method: "DELETE"
        });

        closeModal(confirmModal);

        showToast(data.message || "تم تفريغ السلة.");

        await loadCart();
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* =========================
   إتمام الطلب
========================= */

function openCheckout() {
    if (!state.cartItems.length) {
        showToast(
            "أضف منتجًا واحدًا على الأقل قبل إتمام الطلب.",
            "info"
        );

        return;
    }

    closeCart();
    renderCheckoutSummary();
    openModal(checkoutModal);
}

async function submitOrder(event) {
    event.preventDefault();

    const customerName = customerNameInput.value.trim();
    const customerPhone = customerPhoneInput.value.trim();
    const customerAddress = customerAddressInput.value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
        showToast(
            "يرجى تعبئة جميع بيانات العميل.",
            "error"
        );

        return;
    }

    setButtonLoading(
        confirmOrderButton,
        true,
        "جارٍ إنشاء الطلب..."
    );

    try {
        const data = await requestJson("/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerName,
                customerPhone,
                customerAddress
            })
        });

        checkoutForm.reset();
        closeModal(checkoutModal);

        showToast(
            `تم إنشاء الطلب رقم ${data.order.id} بنجاح.`,
            "success",
            "تم تأكيد طلبك"
        );

        await Promise.all([
            loadCart(),
            loadProducts()
        ]);
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        setButtonLoading(confirmOrderButton, false);
    }
}

/* =========================
   لوحة الإدارة
========================= */

async function checkAdminAuthentication() {
    try {
        const data = await requestJson('/auth/status');

        return data.authenticated === true;
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }
}

async function requestAdminAccess() {
    const authenticated = await checkAdminAuthentication();

    if (authenticated) {
        await showAdminDashboard();
        return;
    }

    adminLoginError.classList.add('hidden');
    adminLoginError.textContent = '';

    adminLoginForm.reset();
    openModal(adminLoginModal);

    window.setTimeout(() => {
        adminUsernameInput.focus();
    }, 100);
}

async function showAdminDashboard() {
    closeModal(adminLoginModal);

    storeView.classList.add('hidden');
    adminView.classList.remove('hidden');

    window.scrollTo({
        top: 0,
        behavior: 'instant'
    });

    await loadAdminData();
}

function closeAdmin() {
    adminView.classList.add("hidden");
    storeView.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    loadProducts();
    loadCart();
}

async function loadAdminData() {
    try {
        const [productsData, ordersData] = await Promise.all([
            requestJson("/products"),
            requestJson("/orders")
        ]);

        state.products = Array.isArray(productsData.products)
            ? productsData.products
            : [];

        state.orders = Array.isArray(ordersData.orders)
            ? ordersData.orders
            : [];

        renderAdminDashboard();
        renderAdminProducts(state.products);
        renderAdminOrders(state.orders);
    } catch (error) {
        showToast(error.message, "error");
    }
}

function renderAdminDashboard() {
    const productsCount = state.products.length;
    const ordersCount = state.orders.length;

    const revenue = state.orders.reduce(
        (sum, order) =>
            sum + Number(order.total_price || 0),
        0
    );

    const totalStock = state.products.reduce(
        (sum, product) =>
            sum + Number(product.stock || 0),
        0
    );

    adminProductsCount.textContent = productsCount;
    adminOrdersCount.textContent = ordersCount;
    adminRevenue.textContent = formatPrice(revenue);
    adminStockCount.textContent = totalStock;

    renderRecentOrders();
    renderLowStockProducts();
}

function renderRecentOrders() {
    recentOrdersContainer.innerHTML = "";

    const recentOrders = state.orders.slice(0, 5);

    if (!recentOrders.length) {
        recentOrdersContainer.innerHTML = `
            <div class="empty-state" style="min-height:180px">
                <i class="fa-solid fa-receipt"></i>
                <h3>لا توجد طلبات</h3>
                <p>ستظهر أحدث الطلبات هنا.</p>
            </div>
        `;

        return;
    }

    for (const order of recentOrders) {
        const element = document.createElement("div");
        element.className = "recent-order-item";

        element.innerHTML = `
            <div class="recent-order-info">
                <span class="recent-order-icon">
                    <i class="fa-solid fa-receipt"></i>
                </span>

                <div>
                    <strong>
                        الطلب #${order.id}
                        -
                        ${escapeHtml(order.customer_name)}
                    </strong>

                    <span>
                        ${formatDate(order.created_at)}
                    </span>
                </div>
            </div>

            <strong>
                ${formatPrice(order.total_price)} $
            </strong>
        `;

        recentOrdersContainer.appendChild(element);
    }
}

function renderLowStockProducts() {
    lowStockContainer.innerHTML = "";

    const lowStockProducts = [...state.products]
        .sort(
            (first, second) =>
                Number(first.stock) - Number(second.stock)
        )
        .slice(0, 5);

    if (!lowStockProducts.length) {
        lowStockContainer.innerHTML = `
            <div class="empty-state" style="min-height:180px">
                <i class="fa-solid fa-box"></i>
                <h3>لا توجد منتجات</h3>
            </div>
        `;

        return;
    }

    for (const product of lowStockProducts) {
        const element = document.createElement("div");
        element.className = "low-stock-item";

        element.innerHTML = `
            <div class="low-stock-info">
                <span class="low-stock-icon">
                    <i class="fa-solid fa-box"></i>
                </span>

                <div>
                    <strong>${escapeHtml(product.name)}</strong>
                    <span>${escapeHtml(product.category)}</span>
                </div>
            </div>

            <strong>
                ${Number(product.stock || 0)}
                قطعة
            </strong>
        `;

        lowStockContainer.appendChild(element);
    }
}

function switchAdminSection(sectionName) {
    state.activeAdminSection = sectionName;

    const sections = {
        dashboard: {
            title: "لوحة المعلومات",
            element: adminDashboardSection
        },
        products: {
            title: "إدارة المنتجات",
            element: adminProductsSection
        },
        orders: {
            title: "الطلبات",
            element: adminOrdersSection
        }
    };

    for (const section of Object.values(sections)) {
        section.element.classList.add("hidden");
    }

    sections[sectionName].element.classList.remove("hidden");
    adminPageTitle.textContent = sections[sectionName].title;

    for (const button of adminNavigationButtons) {
        button.classList.toggle(
            "active",
            button.dataset.adminSection === sectionName
        );
    }
}

/* =========================
   إدارة المنتجات
========================= */

function renderAdminProducts(products) {
    adminProductsTableBody.innerHTML = "";

    if (!products.length) {
        adminProductsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:45px">
                    لا توجد منتجات.
                </td>
            </tr>
        `;

        return;
    }

    for (const product of products) {
        const stock = Number(product.stock || 0);

        const stockClass =
            stock <= 0
                ? "empty"
                : stock <= 5
                    ? "low"
                    : "";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="table-product">
                    <img
                        src="${escapeHtml(normalizeImagePath(product.image))}"
                        alt="${escapeHtml(product.name)}"
                    >

                    <div>
                        <strong>${escapeHtml(product.name)}</strong>
                        <span>رقم المنتج: ${product.id}</span>
                    </div>
                </div>
            </td>

            <td>
                <span class="table-category">
                    ${escapeHtml(product.category)}
                </span>
            </td>

            <td>
                <strong>${formatPrice(product.price)} $</strong>
            </td>

            <td>
                <span class="table-stock ${stockClass}">
                    ${stock}
                </span>
            </td>

            <td>${formatDate(product.created_at)}</td>

            <td>
                <div class="table-actions">
                    <button
                        type="button"
                        class="table-action-button edit"
                        data-edit-product="${product.id}"
                        title="تعديل"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-button delete"
                        data-delete-product="${product.id}"
                        title="حذف"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        const imageElement = row.querySelector("img");

        imageElement.addEventListener("error", () => {
            handleImageError(imageElement);
        });

        adminProductsTableBody.appendChild(row);
    }
}

function openCreateProductModal() {
    state.editingProductId = null;

    productForm.reset();
    productIdInput.value = "";
    productModalTitle.textContent = "إضافة منتج جديد";
    saveProductButton.textContent = "إضافة المنتج";

    openModal(productModal);
}

function openEditProductModal(productId) {
    const product = state.products.find(
        item => Number(item.id) === Number(productId)
    );

    if (!product) {
        showToast("لم يتم العثور على المنتج.", "error");
        return;
    }

    state.editingProductId = Number(product.id);

    productIdInput.value = product.id;
    productNameInput.value = product.name || "";
    productCategoryInput.value = product.category || "";
    productPriceInput.value = product.price ?? 0;
    productStockInput.value = product.stock ?? 0;
    productImageInput.value = product.image || "";
    productDescriptionInput.value = product.description || "";

    productModalTitle.textContent = "تعديل المنتج";
    saveProductButton.textContent = "حفظ التعديلات";

    openModal(productModal);
}

async function saveProduct(event) {
    event.preventDefault();

    const payload = {
        name: productNameInput.value.trim(),
        description: productDescriptionInput.value.trim(),
        price: Number(productPriceInput.value),
        category: productCategoryInput.value.trim(),
        image: productImageInput.value.trim(),
        stock: Number(productStockInput.value)
    };

    if (!payload.name || !payload.category) {
        showToast(
            "اسم المنتج والفئة مطلوبان.",
            "error"
        );

        return;
    }

    if (
        !Number.isFinite(payload.price) ||
        payload.price < 0 ||
        !Number.isInteger(payload.stock) ||
        payload.stock < 0
    ) {
        showToast(
            "يرجى إدخال سعر ومخزون صحيحين.",
            "error"
        );

        return;
    }

    setButtonLoading(
        saveProductButton,
        true,
        "جارٍ الحفظ..."
    );

    try {
        const editing = state.editingProductId !== null;

        const endpoint = editing
            ? `/products/${state.editingProductId}`
            : "/products";

        const method = editing ? "PUT" : "POST";

        const data = await requestJson(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        closeModal(productModal);

        showToast(
            data.message ||
            (
                editing
                    ? "تم تعديل المنتج."
                    : "تمت إضافة المنتج."
            )
        );

        state.editingProductId = null;

        await loadAdminData();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        setButtonLoading(saveProductButton, false);
    }
}

function askToDeleteProduct(productId) {
    const product = state.products.find(
        item => Number(item.id) === Number(productId)
    );

    if (!product) {
        showToast("لم يتم العثور على المنتج.", "error");
        return;
    }

    openConfirm({
        title: "حذف المنتج",
        message:
            `هل تريد حذف المنتج "${product.name}" نهائيًا؟`,
        action: () => deleteProduct(product.id)
    });
}

async function deleteProduct(productId) {
    try {
        const data = await requestJson(`/products/${productId}`, {
            method: "DELETE"
        });

        closeModal(confirmModal);

        showToast(data.message || "تم حذف المنتج.");

        await loadAdminData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function filterAdminProducts() {
    const query = adminProductSearch.value
        .trim()
        .toLowerCase();

    if (!query) {
        renderAdminProducts(state.products);
        return;
    }

    const filtered = state.products.filter(product => {
        const values = [
            product.name,
            product.description,
            product.category,
            product.id
        ];

        return values.some(value =>
            String(value || "")
                .toLowerCase()
                .includes(query)
        );
    });

    renderAdminProducts(filtered);
}

/* =========================
   إدارة الطلبات
========================= */

function renderAdminOrders(orders) {
    adminOrdersTableBody.innerHTML = "";

    if (!orders.length) {
        adminOrdersTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:45px">
                    لا توجد طلبات.
                </td>
            </tr>
        `;

        return;
    }

    for (const order of orders) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>#${order.id}</strong>
            </td>

            <td>${escapeHtml(order.customer_name)}</td>

            <td>${escapeHtml(order.customer_phone)}</td>

            <td>
                <strong>
                    ${formatPrice(order.total_price)} $
                </strong>
            </td>

            <td>
                <span class="order-status">
                    ${escapeHtml(order.status)}
                </span>
            </td>

            <td>${formatDate(order.created_at)}</td>

            <td>
                <button
                    type="button"
                    class="table-action-button view"
                    data-view-order="${order.id}"
                    title="عرض التفاصيل"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>
            </td>
        `;

        adminOrdersTableBody.appendChild(row);
    }
}

async function showOrderDetails(orderId) {
    try {
        const data = await requestJson(`/orders/${orderId}`);
        const order = data.order;

        orderDetailsTitle.textContent =
            `تفاصيل الطلب #${order.id}`;

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        orderDetailsContent.innerHTML = `
            <div class="order-details-grid">

                <div class="order-detail-card">
                    <span>اسم العميل</span>
                    <strong>
                        ${escapeHtml(order.customer_name)}
                    </strong>
                </div>

                <div class="order-detail-card">
                    <span>رقم الهاتف</span>
                    <strong>
                        ${escapeHtml(order.customer_phone)}
                    </strong>
                </div>

                <div class="order-detail-card">
                    <span>عنوان التوصيل</span>
                    <strong>
                        ${escapeHtml(order.customer_address)}
                    </strong>
                </div>

                <div class="order-detail-card">
                    <span>حالة الطلب</span>
                    <strong>
                        ${escapeHtml(order.status)}
                    </strong>
                </div>

                <div class="order-detail-card">
                    <span>تاريخ الطلب</span>
                    <strong>
                        ${formatDate(order.created_at)}
                    </strong>
                </div>

                <div class="order-detail-card">
                    <span>الإجمالي</span>
                    <strong>
                        ${formatPrice(order.total_price)} $
                    </strong>
                </div>

            </div>

            <div class="order-products-list">
                <h3>منتجات الطلب</h3>

                ${
                    items.map(item => `
                        <article class="order-product-item">
                            <div>
                                <strong>
                                    ${escapeHtml(item.product_name)}
                                </strong>

                                <span>
                                    الكمية:
                                    ${item.quantity}
                                    ×
                                    ${formatPrice(item.price)} $
                                </span>
                            </div>

                            <strong>
                                ${
                                    formatPrice(
                                        Number(item.price) *
                                        Number(item.quantity)
                                    )
                                }
                                $
                            </strong>
                        </article>
                    `).join("")
                }
            </div>
        `;

        openModal(orderDetailsModal);
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* =========================
   تأكيد الإجراءات
========================= */

function openConfirm({
    title,
    message,
    action
}) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    state.pendingConfirmAction = action;

    openModal(confirmModal);
}

async function executeConfirmedAction() {
    if (typeof state.pendingConfirmAction !== "function") {
        closeModal(confirmModal);
        return;
    }

    const action = state.pendingConfirmAction;
    state.pendingConfirmAction = null;

    await action();
}

/* =========================
   الأحداث
========================= */

productsGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add-product]");

    if (!button) {
        return;
    }

    addProductToCart(button.dataset.addProduct);
});

searchButton.addEventListener("click", loadProducts);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        loadProducts();
    }
});

categoryFilter.addEventListener("change", loadProducts);

resetFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    loadProducts();
});

openCartButton.addEventListener("click", openCart);
heroCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

cartItemsContainer.addEventListener("click", event => {
    const removeButton =
        event.target.closest("[data-remove-cart]");

    if (removeButton) {
        removeCartItem(removeButton.dataset.removeCart);
        return;
    }

    const decreaseButton =
        event.target.closest("[data-cart-decrease]");

    if (decreaseButton) {
        const productId =
            Number(decreaseButton.dataset.cartDecrease);

        const currentQuantity =
            Number(decreaseButton.dataset.currentQuantity);

        updateCartQuantity(
            productId,
            currentQuantity - 1
        );

        return;
    }

    const increaseButton =
        event.target.closest("[data-cart-increase]");

    if (increaseButton) {
        const productId =
            Number(increaseButton.dataset.cartIncrease);

        const currentQuantity =
            Number(increaseButton.dataset.currentQuantity);

        updateCartQuantity(
            productId,
            currentQuantity + 1
        );
    }
});

clearCartButton.addEventListener("click", askToClearCart);
checkoutButton.addEventListener("click", openCheckout);

closeCheckoutButton.addEventListener("click", () => {
    closeModal(checkoutModal);
});

checkoutModal.addEventListener("click", event => {
    closeModalWhenBackdropClicked(event, checkoutModal);
});

checkoutForm.addEventListener("submit", submitOrder);

openAdminButton.addEventListener(
    'click',
    requestAdminAccess
);backToStoreButton.addEventListener("click", closeAdmin);

adminLoginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value;

    adminLoginError.classList.add("hidden");
    adminLoginError.textContent = "";

    if (!username || !password) {
        adminLoginError.textContent =
            "يرجى إدخال اسم المستخدم وكلمة المرور.";

        adminLoginError.classList.remove("hidden");
        return;
    }

    setButtonLoading(
        adminLoginButton,
        true,
        "جارٍ تسجيل الدخول..."
    );

    try {
        const data = await requestJson("/auth/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })
        });

        adminLoginForm.reset();

        showToast(
            data.message || "تم تسجيل الدخول بنجاح."
        );

        await showAdminDashboard();
    } catch (error) {
        adminLoginError.textContent = error.message;
        adminLoginError.classList.remove("hidden");
    } finally {
        setButtonLoading(adminLoginButton, false);
    }
});

cancelAdminLoginButton.addEventListener("click", () => {
    adminLoginForm.reset();

    adminLoginError.textContent = "";
    adminLoginError.classList.add("hidden");

    closeModal(adminLoginModal);
});

toggleAdminPassword.addEventListener("click", () => {
    const passwordIsHidden =
        adminPasswordInput.type === "password";

    adminPasswordInput.type =
        passwordIsHidden ? "text" : "password";

    toggleAdminPassword.innerHTML =
        passwordIsHidden
            ? '<i class="fa-solid fa-eye-slash"></i>'
            : '<i class="fa-solid fa-eye"></i>';
});

adminLogoutButton.addEventListener("click", async () => {
    try {
        const data = await requestJson("/auth/logout", {
            method: "POST"
        });

        adminView.classList.add("hidden");
        storeView.classList.remove("hidden");

        switchAdminSection("dashboard");

        showToast(
            data.message || "تم تسجيل الخروج بنجاح."
        );

        await Promise.all([
            loadProducts(),
            loadCart()
        ]);
    } catch (error) {
        showToast(error.message, "error");
    }
});

adminLoginModal.addEventListener("click", event => {
    closeModalWhenBackdropClicked(
        event,
        adminLoginModal
    );
});

adminNavigationButtons.forEach(button => {
    button.addEventListener("click", () => {
        switchAdminSection(button.dataset.adminSection);
    });
});

document.querySelectorAll("[data-go-to-orders]")
    .forEach(button => {
        button.addEventListener("click", () => {
            switchAdminSection("orders");
        });
    });

addProductButton.addEventListener(
    "click",
    openCreateProductModal
);

closeProductModalButton.addEventListener("click", () => {
    closeModal(productModal);
});

cancelProductButton.addEventListener("click", () => {
    closeModal(productModal);
});

productModal.addEventListener("click", event => {
    closeModalWhenBackdropClicked(event, productModal);
});

productForm.addEventListener("submit", saveProduct);

adminProductSearch.addEventListener(
    "input",
    filterAdminProducts
);

adminProductsTableBody.addEventListener("click", event => {
    const editButton =
        event.target.closest("[data-edit-product]");

    if (editButton) {
        openEditProductModal(editButton.dataset.editProduct);
        return;
    }

    const deleteButton =
        event.target.closest("[data-delete-product]");

    if (deleteButton) {
        askToDeleteProduct(deleteButton.dataset.deleteProduct);
    }
});

adminOrdersTableBody.addEventListener("click", event => {
    const viewButton =
        event.target.closest("[data-view-order]");

    if (!viewButton) {
        return;
    }

    showOrderDetails(viewButton.dataset.viewOrder);
});

refreshOrdersButton.addEventListener("click", async () => {
    try {
        setButtonLoading(
            refreshOrdersButton,
            true,
            "جارٍ التحديث..."
        );

        await loadAdminData();

        showToast(
            "تم تحديث بيانات الطلبات.",
            "success"
        );
    } finally {
        setButtonLoading(refreshOrdersButton, false);
    }
});

closeOrderDetailsButton.addEventListener("click", () => {
    closeModal(orderDetailsModal);
});

orderDetailsModal.addEventListener("click", event => {
    closeModalWhenBackdropClicked(
        event,
        orderDetailsModal
    );
});

cancelConfirmButton.addEventListener("click", () => {
    state.pendingConfirmAction = null;
    closeModal(confirmModal);
});

confirmActionButton.addEventListener(
    "click",
    executeConfirmedAction
);

confirmModal.addEventListener("click", event => {
    closeModalWhenBackdropClicked(event, confirmModal);
});

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
        return;
    }

    closeCart();

    document.querySelectorAll(".modal.show")
        .forEach(modal => closeModal(modal));
});

/* =========================
   التهيئة
========================= */

async function initializeApplication() {
    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

    document.getElementById("adminDate").textContent =
        new Date().toLocaleDateString("ar", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    await Promise.all([
        loadProducts(),
        loadCart()
    ]);
}

initializeApplication();
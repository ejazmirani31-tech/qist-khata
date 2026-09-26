const STORAGE_KEY = 'qistKhataApp.v1';
const ADMIN_SESSION_KEY = 'qistKhataAdminSession.v1';
const ADMIN_EMAIL = 'admin@qistkhata.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_MOBILE = '03000000000';
const DEFAULT_PLANS = [
  { id: 'plan-free', name: 'Free Plan', monthlyPrice: 0, yearlyPrice: 0, customerLimit: 25, features: ['Limited customers', 'Basic customer khata', 'Basic payment records'], description: 'A simple starting point for small shops.', active: true },
  { id: 'plan-pro', name: 'Pro Plan', monthlyPrice: 999, yearlyPrice: 9990, customerLimit: 250, features: ['Advanced reports', 'Payment history', 'Receipts', 'Cloud backup placeholder'], description: 'More room and insight for a growing business.', active: true },
  { id: 'plan-business', name: 'Business Plan', monthlyPrice: 2499, yearlyPrice: 24990, customerLimit: 0, features: ['Large or unlimited customers', 'Advanced reports', 'Priority features', 'Business tools'], description: 'Full capability for established businesses.', active: true }
];

const state = loadState();
let adminSession = localStorage.getItem(ADMIN_SESSION_KEY) === 'active';
let editingCustomerId = null;
let selectedCustomerId = null;

const welcomeScreen = document.getElementById('welcomeScreen');
const authScreen = document.getElementById('authScreen');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTabs = document.querySelectorAll('.auth-tab');
const customerSearchInput = document.getElementById('customerSearchInput');
const customerForm = document.getElementById('customerForm');
const customerFormPanel = document.getElementById('customerFormPanel');
const customerFormTitle = document.getElementById('customerFormTitle');
const customerList = document.getElementById('customerList');
const khataPanel = document.getElementById('khataPanel');
const khataContent = document.getElementById('khataContent');
const shopNameHeader = document.getElementById('shopNameHeader');
const toastContainer = document.getElementById('toastContainer');
const dashboardGreeting = document.getElementById('dashboardGreeting');
const dashboardDate = document.getElementById('dashboardDate');
const subscriptionStatusBadge = document.getElementById('subscriptionStatusBadge');
const receiptModal = document.getElementById('receiptModal');
const receiptContent = document.getElementById('receiptContent');
const adminUserModal = document.getElementById('adminUserModal');
const adminUserContent = document.getElementById('adminUserContent');
const adminApp = document.getElementById('adminApp');
const adminLoginForm = document.getElementById('adminLoginForm');
const toggleAdminPassword = document.getElementById('toggleAdminPassword');
const adminPasswordInput = document.getElementById('adminPassword');
if (toggleAdminPassword && adminPasswordInput) {
  toggleAdminPassword.addEventListener('click', () => {
    const isHidden = adminPasswordInput.type === 'password';

    adminPasswordInput.type = isHidden ? 'text' : 'password';

    toggleAdminPassword.textContent = isHidden ? '🙈' : '👁️';

    toggleAdminPassword.setAttribute(
      'aria-label',
      isHidden ? 'Hide password' : 'Show password'
    );
  });
}
const adminViews = document.querySelectorAll('.admin-view');
const adminViewButtons = document.querySelectorAll('[data-admin-view]');

const viewButtons = document.querySelectorAll('[data-view]');
const views = {
  dashboard: document.getElementById('dashboardView'),
  customers: document.getElementById('customersView'),
  settings: document.getElementById('settingsView')
};

function createSeedData() {
  const today = new Date();
  const iso = (offset) => toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset));

  const defaultUser = {
    id: 'admin-1',
    mobile: '03001234567',
    password: '123456',
    shopName: 'Qist Khata',
    ownerName: 'Hamza Awan',
    registrationDate: new Date().toISOString(),
    status: 'active',
    planId: 'plan-free',
    subscriptionStatus: 'active',
    subscriptionStart: toISODate(today),
    subscriptionExpiry: iso(30),
    settings: {
      address: 'Main Market, Lahore',
      whatsapp: '03001234567',
      easypaisa: '03001234567',
      bankName: 'HBL',
      bankAccount: '12345678901234',
      serviceCharge: 0
    },
    customers: [
      {
        id: 'cust-1',
        name: 'Ali Raza',
        mobile: '03001112222',
        cnic: '3740567890123',
        member: 'Gold',
        address: 'Gulshan Town, Lahore',
        productName: 'Samsung A54',
        productPrice: 55000,
        advancePayment: 15000,
        installmentAmount: 7000,
        nextInstallmentDate: iso(2),
        note: 'Prefers monthly installments',
        createdAt: new Date().toISOString(),
        payments: [
          { id: 'p-1', amount: 15000, date: iso(-10), method: 'Advance', note: 'Initial advance' }
        ]
      },
      {
        id: 'cust-2',
        name: 'Sara Khan',
        mobile: '03120001111',
        cnic: '3520212345678',
        member: 'Silver',
        address: 'Model Town, Rawalpindi',
        productName: 'MI LED TV',
        productPrice: 45000,
        advancePayment: 12000,
        installmentAmount: 5000,
        nextInstallmentDate: iso(0),
        note: 'Need reminder before due date',
        createdAt: new Date().toISOString(),
        payments: [
          { id: 'p-2', amount: 12000, date: iso(-5), method: 'Advance', note: 'Initial payment' }
        ]
      },
      {
        id: 'cust-3',
        name: 'Nasir Ali',
        mobile: '03450009999',
        cnic: '3630356789012',
        member: 'Platinum',
        address: 'Sialkot Road, Gujranwala',
        productName: 'Refrigerator',
        productPrice: 62000,
        advancePayment: 8000,
        installmentAmount: 6000,
        nextInstallmentDate: iso(-3),
        note: 'Payment overdue by 3 days',
        createdAt: new Date().toISOString(),
        payments: [
          { id: 'p-3', amount: 8000, date: iso(-15), method: 'Advance', note: 'Initial advance' }
        ]
      }
    ]
  };

  return {
    users: [defaultUser],
    activeUserId: null,
    ads: [],
    updates: [],
    plans: DEFAULT_PLANS.map((plan) => ({ ...plan, features: [...plan.features] })),
    announcements: [],
    subscriptionPayments: [],
    paymentSettings: { accountName: '', easypaisa: '', jazzcash: '', bankName: '', accountNumber: '', instructions: '' },
    serviceCharges: { defaultRate: 0, paymentRate: 0, overdueFee: 0, notes: '' },
    systemSettings: { maintenance: false, allowRegistration: true, showUpdates: true }
  };
}

function migrateUser(user) {
  if (user.shopName?.toLowerCase().includes('electronics')) user.shopName = 'Qist Khata';
  user.settings = user.settings || {};
  user.registrationDate = user.registrationDate || new Date().toISOString();
  user.status = user.status || 'active';
  user.planId = user.planId || 'plan-free';
  user.subscriptionStatus = user.subscriptionStatus || 'active';
  user.subscriptionStart = user.subscriptionStart || toISODate(new Date());
  user.subscriptionExpiry = user.subscriptionExpiry || addDaysToISO(user.subscriptionStart, 30);
  return user;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || !Array.isArray(saved.users)) {
      return createSeedData();
    }
    if (!saved.activeUserId || !saved.users.some((user) => user.id === saved.activeUserId)) {
      saved.activeUserId = null;
    }
    saved.users.forEach(migrateUser);
    saved.ads = Array.isArray(saved.ads) ? saved.ads : [];
    saved.updates = Array.isArray(saved.updates) ? saved.updates : [];
    const legacyPlanFeatures = {
      'plan-free': ['Customer khata', 'Payment history', 'Basic receipts'],
      'plan-pro': ['Unlimited receipts', 'Dashboard broadcasts', 'Priority support'],
      'plan-business': ['Unlimited customers', 'Advanced reports', 'Business support']
    };
    saved.plans = Array.isArray(saved.plans) && saved.plans.length ? saved.plans.map((plan) => {
      const defaultPlan = DEFAULT_PLANS.find((item) => item.id === plan.id);
      const features = Array.isArray(plan.features) ? plan.features : [];
      const isLegacy = JSON.stringify(features) === JSON.stringify(legacyPlanFeatures[plan.id]);
      return { ...defaultPlan, ...plan, features: isLegacy ? [...(defaultPlan?.features || features)] : features };
    }) : DEFAULT_PLANS.map((plan) => ({ ...plan, features: [...plan.features] }));
    saved.announcements = Array.isArray(saved.announcements) ? saved.announcements : [];
    saved.subscriptionPayments = Array.isArray(saved.subscriptionPayments) ? saved.subscriptionPayments : [];
    saved.paymentSettings = { accountName: '', easypaisa: '', jazzcash: '', bankName: '', accountNumber: '', instructions: '', ...(saved.paymentSettings || {}) };
    saved.serviceCharges = { defaultRate: 0, paymentRate: 0, overdueFee: 0, notes: '', ...(saved.serviceCharges || {}) };
    saved.systemSettings = { maintenance: false, allowRegistration: true, showUpdates: true, ...(saved.systemSettings || {}) };
    return saved;
  } catch {
    return createSeedData();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentUser() {
  if (!state.activeUserId) return null;
  return state.users.find((user) => user.id === state.activeUserId) || null;
}

function getCurrentCustomers() {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.customers || [] : [];
}

function setActiveView(viewName) {
  Object.entries(views).forEach(([key, view]) => {
    if (key === viewName) {
      view.classList.remove('hidden');
      view.classList.add('active');
    } else {
      view.classList.add('hidden');
      view.classList.remove('active');
    }
  });

  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle('active', isActive);
  });
}

function toISODate(date) {
  const value = new Date(date);
  const offset = value.getTimezoneOffset();
  value.setMinutes(value.getMinutes() - offset);
  return value.toISOString().slice(0, 10);
}

function addDaysToISO(dateString, days) {
  const value = new Date(`${dateString}T00:00:00`);
  value.setDate(value.getDate() + days);
  return toISODate(value);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

function formatDisplayDate(dateString) {
  if (!dateString) return 'Not set';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function getInitials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function calculateOutstanding(customer) {
  const totalPrice = normalizeNumber(customer.productPrice);
  const totalPaid = (customer.payments || []).reduce((sum, payment) => sum + normalizeNumber(payment.amount), 0);
  return Math.max(0, totalPrice - totalPaid);
}

function getCustomerStatus(customer) {
  const outstanding = calculateOutstanding(customer);
  if (outstanding <= 0) {
    return { label: 'Clear', tone: 'green' };
  }

  const today = toISODate(new Date());
  const nextDate = customer.nextInstallmentDate || today;

  if (nextDate === today) {
    return { label: 'Due Today', tone: 'orange' };
  }

  if (nextDate < today) {
    return { label: 'Overdue', tone: 'red' };
  }

  if (nextDate <= addDaysToISO(today, 7)) {
    return { label: 'Upcoming', tone: 'blue' };
  }

  return { label: 'Scheduled', tone: 'green' };
}

function getCustomerDetails(customer) {
  const outstanding = calculateOutstanding(customer);
  const totalPaid = (customer.payments || []).reduce((sum, payment) => sum + normalizeNumber(payment.amount), 0);
  return {
    outstanding,
    totalPaid,
    productTotal: normalizeNumber(customer.productPrice),
    nextDue: customer.nextInstallmentDate || 'Not set'
  };
}

function setAdminView(viewName) {
  adminViews.forEach((view) => view.classList.toggle('hidden', view.id !== viewName));
  adminViewButtons.forEach((button) => button.classList.toggle('active', button.dataset.adminView === viewName));
}

function getActiveAds() {
  const today = toISODate(new Date());
  return state.ads.filter((ad) => ad.active && (!ad.startDate || ad.startDate <= today) && (!ad.endDate || ad.endDate >= today));
}

function renderShopkeeperBroadcasts() {
  const adsContainer = document.getElementById('activeAdsList');
  const updatesContainer = document.getElementById('importantUpdatesList');
  if (!adsContainer || !updatesContainer) return;

  const ads = getActiveAds();
  adsContainer.innerHTML = ads.length ? ads.slice(0, 3).map((ad) => `
    <article class="broadcast-item">
      ${ad.image ? `<img src="${escapeHTML(ad.image)}" alt="" />` : ''}
      <div><strong>${escapeHTML(ad.title)}</strong><p>${escapeHTML(ad.description)}</p>${ad.buttonText ? `<a class="broadcast-link" href="${escapeHTML(ad.link || '#')}" target="_blank" rel="noopener">${escapeHTML(ad.buttonText)} ↗</a>` : ''}</div>
    </article>
  `).join('') : '<div class="empty-state">No active announcements.</div>';

  const updates = state.systemSettings.showUpdates ? state.updates.filter((update) => update.important).slice(0, 3) : [];
  const announcements = state.announcements.filter((announcement) => announcement.active).slice(0, 3);
  const broadcasts = [...announcements.map((announcement) => ({ ...announcement, version: 'Notice', date: announcement.createdAt?.slice(0, 10) })), ...updates];
  updatesContainer.innerHTML = broadcasts.length ? broadcasts.map((update) => `
    <article class="broadcast-item update-item"><span class="update-version ${update.important ? 'important' : ''}">${escapeHTML(update.version)}</span><div><strong>${escapeHTML(update.title)}</strong><p>${escapeHTML(update.description)}</p><small>${formatDisplayDate(update.date)}</small></div></article>
  `).join('') : '<div class="empty-state">No important updates right now.</div>';
}

function renderShopkeeperPlans() {
  const container = document.getElementById('shopkeeperPlansList');
  const user = getCurrentUser();
  if (!container || !user) return;
  const currentPlanId = user.planId || 'plan-free';
  const plans = state.plans.filter((plan) => plan.active !== false);
  container.innerHTML = plans.length ? plans.map((plan) => `
    <article class="shopkeeper-plan-card ${plan.id === currentPlanId ? 'current' : ''}">
      <div class="shopkeeper-plan-head"><div><strong>${escapeHTML(plan.name)}</strong>${plan.id === currentPlanId ? '<span class="current-plan-label">Current plan</span>' : ''}</div><span>${formatCurrency(plan.monthlyPrice)}<small>/month</small></span></div>
      <p>${escapeHTML(plan.description || '')}</p>
      <div class="shopkeeper-plan-prices"><span>Yearly <strong>${formatCurrency(plan.yearlyPrice)}</strong></span><span>${plan.customerLimit ? `${plan.customerLimit} customers` : 'Unlimited customers'}</span></div>
      <ul>${(plan.features || []).map((feature) => `<li>${escapeHTML(feature)}</li>`).join('')}</ul>
    </article>
  `).join('') : '<div class="empty-state">No plans are available right now.</div>';
}

function renderAdminDashboard() {
  const activeShops = state.users.filter(
    (user) => user.status !== 'suspended'
  );

  const activeSubscriptions = state.users.filter(
    (user) =>
      user.subscriptionStatus === 'active' ||
      user.subscriptionStatus === 'trial'
  );

  const totalCustomers = state.users.reduce(
    (sum, user) => sum + (user.customers || []).length,
    0
  );

  const totalPayments = state.users.reduce(
    (sum, user) =>
      sum +
      (user.customers || []).reduce(
        (inner, customer) => inner + (customer.payments || []).length,
        0
      ),
    0
  );

  const outstanding = state.users.reduce(
    (sum, user) =>
      sum +
      (user.customers || []).reduce(
        (inner, customer) => inner + calculateOutstanding(customer),
        0
      ),
    0
  );

  const freeUsers = state.users.filter(
    (user) => user.planId === 'plan-free'
  ).length;

  const proUsers = state.users.filter(
    (user) => user.planId === 'plan-pro'
  ).length;

  const businessUsers = state.users.filter(
    (user) => user.planId === 'plan-business'
  ).length;

  const expiredSubscriptions = state.users.filter(
    (user) => user.subscriptionStatus === 'expired'
  ).length;

  const totalRevenue = state.subscriptionPayments.reduce(
    (sum, payment) => sum + normalizeNumber(payment.amount),
    0
  );

  const currentMonth = toISODate(new Date()).slice(0, 7);

  const monthlyRevenue = state.subscriptionPayments
    .filter((payment) => String(payment.date).startsWith(currentMonth))
    .reduce(
      (sum, payment) => sum + normalizeNumber(payment.amount),
      0
    );

  /* Main dashboard cards */

  document.getElementById('adminShopCount').textContent =
    String(state.users.length);

  document.getElementById('adminActiveShopCount').textContent =
    String(activeShops.length);

  document.getElementById('adminAdCount').textContent =
    String(getActiveAds().length);

  document.getElementById('adminUpdateCount').textContent =
    String(state.updates.length);

  document.getElementById('adminSubscriptionCount').textContent =
    String(activeSubscriptions.length);

  /* Reports */

  document.getElementById('adminTotalUsers').textContent =
    String(state.users.length);

  document.getElementById('adminActiveUsers').textContent =
    String(activeShops.length);

  document.getElementById('adminFreeUsers').textContent =
    String(freeUsers);

  document.getElementById('adminProUsers').textContent =
    String(proUsers);

  document.getElementById('adminBusinessUsers').textContent =
    String(businessUsers);

  document.getElementById('adminActiveSubscriptions').textContent =
    String(activeSubscriptions.length);

  document.getElementById('adminExpiredSubscriptions').textContent =
    String(expiredSubscriptions);

  document.getElementById('adminRecordedRevenue').textContent =
    formatCurrency(totalRevenue);

  document.getElementById('adminMonthlyRevenue').textContent =
    formatCurrency(monthlyRevenue);

  document.getElementById('adminAdvertisementCount').textContent =
    String(state.ads.length);

  /* Report details */

  document.getElementById('adminReportDetails').innerHTML =
    state.users
      .map((user) => {
        const customerCount = (user.customers || []).length;

        const paymentCount = (user.customers || []).reduce(
          (sum, customer) =>
            sum + (customer.payments || []).length,
          0
        );

        const userOutstanding = (user.customers || []).reduce(
          (sum, customer) =>
            sum + calculateOutstanding(customer),
          0
        );

        return `
          <div class="admin-list-row">
            <span class="customer-avatar">
              ${escapeHTML(getInitials(user.shopName))}
            </span>

            <div>
              <strong>
                ${escapeHTML(user.shopName || 'Unnamed Shop')}
              </strong>

              <small>
                ${customerCount} customers ·
                ${paymentCount} payments
              </small>
            </div>

            <strong>
              ${formatCurrency(userOutstanding)}
            </strong>
          </div>
        `;
      })
      .join('') ||
    '<div class="empty-state">No report data yet.</div>';

  /* Recent shops */

  document.getElementById('adminRecentShops').innerHTML =
    state.users
      .slice(-5)
      .reverse()
      .map(
        (user) => `
          <div class="admin-list-row">
            <span class="customer-avatar">
              ${escapeHTML(getInitials(user.shopName))}
            </span>

            <div>
              <strong>
                ${escapeHTML(user.shopName || 'Unnamed Shop')}
              </strong>

              <small>
                ${escapeHTML(user.ownerName || '')}
              </small>
            </div>

            <span class="status-pill ${
              user.status === 'suspended' ? 'red' : 'green'
            }">
              ${user.status === 'suspended' ? 'Suspended' : 'Active'}
            </span>
          </div>
        `
      )
      .join('') ||
    '<div class="empty-state">No shopkeepers yet.</div>';
}

function resetAdForm() {
  document.getElementById('adminAdForm').reset();
  document.getElementById('editingAdId').value = '';
  document.getElementById('adActive').checked = true;
  document.getElementById('adminAdFormTitle').textContent = 'Create Advertisement';
  document.getElementById('adminAdSubmit').textContent = 'Publish Advertisement';
}

function populateAnnouncementForm(announcement) {
  document.getElementById('editingAnnouncementId').value = announcement.id;
  document.getElementById('announcementTitle').value = announcement.title || '';
  document.getElementById('announcementDescription').value = announcement.description || '';
  document.getElementById('announcementImportant').checked = Boolean(announcement.important);
  document.getElementById('announcementActive').checked = announcement.active !== false;
  document.getElementById('adminAnnouncementFormTitle').textContent = 'Edit Announcement';
  document.getElementById('adminAnnouncementSubmit').textContent = 'Update Announcement';
}

function resetAnnouncementForm() {
  document.getElementById('adminAnnouncementForm').reset();
  document.getElementById('editingAnnouncementId').value = '';
  document.getElementById('announcementActive').checked = true;
  document.getElementById('adminAnnouncementFormTitle').textContent = 'Create Announcement';
  document.getElementById('adminAnnouncementSubmit').textContent = 'Publish Announcement';
}

function renderAdminUpdates() {
  document.getElementById('adminUpdatesList').innerHTML = state.updates.length ? state.updates.map((update) => `<article class="admin-item"><div><div class="admin-item-title"><strong>${escapeHTML(update.title)}</strong><span class="update-version">${escapeHTML(update.version)}</span></div><p>${escapeHTML(update.description)}</p><small>${formatDisplayDate(update.date)}</small></div><button class="danger-btn" data-admin-action="deleteUpdate" data-id="${update.id}">Delete</button></article>`).join('') : '<div class="empty-state">No app updates created.</div>';
}

function renderAdminPlans() {
  document.getElementById('adminPlansList').innerHTML = state.plans.length ? state.plans.map((plan) => `<article class="admin-item"><div><div class="admin-item-title"><strong>${escapeHTML(plan.name)}</strong><span class="update-version">${formatCurrency(plan.monthlyPrice)} / mo</span><span class="status-pill ${plan.active !== false ? 'green' : 'red'}">${plan.active !== false ? 'Active' : 'Inactive'}</span></div><p>${escapeHTML(plan.description || 'Flexible shopkeeper plan')}</p><small>${plan.customerLimit ? `${plan.customerLimit} customers` : 'Unlimited customers'} · Yearly ${formatCurrency(plan.yearlyPrice)} · ${escapeHTML((plan.features || []).join(', '))}</small></div><div class="admin-item-actions"><button class="small-btn" data-admin-action="editPlan" data-id="${plan.id}">Edit</button><button class="small-btn" data-admin-action="togglePlan" data-id="${plan.id}">${plan.active !== false ? 'Deactivate' : 'Activate'}</button><button class="danger-btn" data-admin-action="deletePlan" data-id="${plan.id}">Delete</button></div></article>`).join('') : '<div class="empty-state">No plans created.</div>';
}

function renderAdminSubscriptions() {
  const planOptions = state.plans.filter((plan) => plan.active !== false).map((plan) => `<option value="${plan.id}">${escapeHTML(plan.name)}</option>`).join('');
  document.getElementById('subscriptionUser').innerHTML = state.users.map((user) => `<option value="${user.id}">${escapeHTML(user.shopName || user.mobile)}</option>`).join('');
  document.getElementById('subscriptionPlan').innerHTML = planOptions;
  document.getElementById('adminSubscriptionsList').innerHTML = state.users.map((user) => { const plan = state.plans.find((item) => item.id === user.planId); return `<article class="admin-item"><div><div class="admin-item-title"><strong>${escapeHTML(user.shopName || 'Unnamed Shop')}</strong><span class="update-version">${escapeHTML(plan?.name || 'Free Plan')}</span></div><p>${escapeHTML(user.subscriptionStatus || 'active')} · ${formatDisplayDate(user.subscriptionStart)} to ${formatDisplayDate(user.subscriptionExpiry)}</p></div></article>`; }).join('') || '<div class="empty-state">No subscriptions yet.</div>';
}

function populatePlanForm(plan) {
  document.getElementById('editingPlanId').value = plan.id;
  document.getElementById('planName').value = plan.name || '';
  document.getElementById('planMonthlyPrice').value = plan.monthlyPrice || 0;
  document.getElementById('planYearlyPrice').value = plan.yearlyPrice || 0;
  document.getElementById('planCustomerLimit').value = plan.customerLimit || 0;
  document.getElementById('planFeatures').value = (plan.features || []).join(', ');
  document.getElementById('planDescription').value = plan.description || '';
  document.getElementById('planActive').checked = plan.active !== false;
  document.getElementById('adminPlanFormTitle').textContent = 'Edit Plan';
  document.getElementById('adminPlanSubmit').textContent = 'Update Plan';
}

function resetPlanForm() {
  document.getElementById('adminPlanForm').reset();
  document.getElementById('editingPlanId').value = '';
  document.getElementById('planActive').checked = true;
  document.getElementById('adminPlanFormTitle').textContent = 'Create Plan';
  document.getElementById('adminPlanSubmit').textContent = 'Create Plan';
}

function renderAdminForms() {
  const payment = state.paymentSettings;
  const system = state.systemSettings;
  document.getElementById('adminPaymentName').value = payment.accountName || '';
  document.getElementById('adminPaymentEasypaisa').value = payment.easypaisa || '';
  document.getElementById('adminPaymentJazzcash').value = payment.jazzcash || '';
  document.getElementById('adminPaymentBank').value = payment.bankName || '';
  document.getElementById('adminPaymentAccount').value = payment.accountNumber || '';
  document.getElementById('adminPaymentInstructions').value = payment.instructions || '';
  document.getElementById('systemMaintenance').checked = Boolean(system.maintenance);
  document.getElementById('systemAllowRegistration').checked = Boolean(system.allowRegistration);
  document.getElementById('systemShowUpdates').checked = Boolean(system.showUpdates);
  document.getElementById('serviceChargeDefault').value = state.serviceCharges.defaultRate || 0;
  document.getElementById('serviceChargePayment').value = state.serviceCharges.paymentRate || 0;
  document.getElementById('serviceChargeOverdue').value = state.serviceCharges.overdueFee || 0;
  document.getElementById('serviceChargeNotes').value = state.serviceCharges.notes || '';
}

function renderAdminPanel() {
  renderAdminDashboard();
  renderAdminShops();
  renderAdminManagement();
  renderAdminSubscriptions();
  renderAdminAnnouncements();
  renderAdminAds();
  renderAdminUpdates();
  renderAdminPlans();
  renderAdminForms();
}

function renderAuthSection() {
  const user = getCurrentUser();

  if (adminSession) {
    welcomeScreen.classList.add('hidden');
    authScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    adminApp.classList.remove('hidden');
    renderAdminPanel();
    return;
  }

  if (user) {
    welcomeScreen.classList.add('hidden');
    authScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    shopNameHeader.textContent = user.shopName || 'Qist Khata';
    dashboardGreeting.textContent = `Welcome back, ${user.ownerName || 'Shopkeeper'}`;
    dashboardDate.textContent = new Intl.DateTimeFormat('en-PK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
    const currentPlan = state.plans.find((plan) => plan.id === user.planId);
    subscriptionStatusBadge.textContent = `${currentPlan?.name || 'Free Plan'} · ${user.subscriptionStatus || 'active'}`;
    subscriptionStatusBadge.className = `subscription-badge ${user.subscriptionStatus === 'expired' ? 'expired' : ''}`;
    renderSettingsForm();
  } else {
    mainApp.classList.add('hidden');
    adminApp.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    authScreen.classList.add('hidden');
    adminLoginForm.classList.add('hidden');
    document.querySelector('.auth-tabs').classList.remove('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  }
}

function showAuthPage(mode = 'login') {
  welcomeScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  adminLoginForm.classList.add('hidden');
  document.querySelector('.auth-tabs').classList.remove('hidden');
  const isLogin = mode === 'login';
  loginForm.classList.toggle('hidden', !isLogin);
  registerForm.classList.toggle('hidden', isLogin);
  authTabs.forEach((button) => button.classList.toggle('active', button.dataset.authTab === mode));
}

function renderSettingsForm() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById('settingsShopName').value = user.shopName || '';
  document.getElementById('settingsOwnerName').value = user.ownerName || '';
  document.getElementById('settingsMobile').value = user.mobile || '';
  document.getElementById('settingsShopAddress').value = user.settings?.address || '';
  document.getElementById('settingsWhatsapp').value = user.settings?.whatsapp || '';
  document.getElementById('settingsEasypaisa').value = user.settings?.easypaisa || '';
  document.getElementById('settingsBankName').value = user.settings?.bankName || '';
  document.getElementById('settingsBankAccount').value = user.settings?.bankAccount || '';
  document.getElementById('settingsServiceCharge').value = user.settings?.serviceCharge || 0;
}

function renderDashboard() {
  const customers = getCurrentCustomers();
  const today = toISODate(new Date());

  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce((sum, customer) => sum + calculateOutstanding(customer), 0);
  const todayDue = customers.filter((customer) => customer.nextInstallmentDate === today && calculateOutstanding(customer) > 0).length;
  const upcoming = customers.filter((customer) => {
    const outstanding = calculateOutstanding(customer);
    const nextDate = customer.nextInstallmentDate || today;
    return outstanding > 0 && nextDate > today && nextDate <= addDaysToISO(today, 7);
  }).length;
  const overdue = customers.filter((customer) => {
    const outstanding = calculateOutstanding(customer);
    return outstanding > 0 && (customer.nextInstallmentDate || today) < today;
  }).length;

  document.getElementById('totalCustomers').textContent = String(totalCustomers);
  document.getElementById('totalOutstanding').textContent = formatCurrency(totalOutstanding);
  document.getElementById('todayDueCount').textContent = String(todayDue);
  document.getElementById('upcomingQistCount').textContent = String(upcoming);
  document.getElementById('overdueCount').textContent = String(overdue);

  renderDueSection('todayDueList', customers.filter((customer) => customer.nextInstallmentDate === today && calculateOutstanding(customer) > 0), 'No customers due today.', 'today');
  renderDueSection('upcomingDueList', customers.filter((customer) => {
    const outstanding = calculateOutstanding(customer);
    const nextDate = customer.nextInstallmentDate || today;
    return outstanding > 0 && nextDate > today && nextDate <= addDaysToISO(today, 7);
  }), 'No upcoming installment plans.', 'upcoming');
  renderDueSection('overdueList', customers.filter((customer) => {
    const outstanding = calculateOutstanding(customer);
    return outstanding > 0 && (customer.nextInstallmentDate || today) < today;
  }), 'No overdue payments.', 'overdue');
}

function renderDueSection(elementId, customers, emptyText, type) {
  const container = document.getElementById(elementId);
  if (!customers.length) {
    container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  container.innerHTML = customers.map((customer) => {
    const details = getCustomerDetails(customer);
    const status = getCustomerStatus(customer);
    return `
      <div class="list-item">
        <div class="list-row">
          <div class="customer-identity"><span class="customer-avatar">${escapeHTML(getInitials(customer.name))}</span><div class="customer-name">${escapeHTML(customer.name)}</div></div>
            <span class="status-pill ${status.tone}">${escapeHTML(status.label)}</span>
        </div>
        <div class="list-row">
          <span>${escapeHTML(customer.productName)}</span>
          <strong>${formatCurrency(details.outstanding)}</strong>
        </div>
        <div class="list-row">
          <span>Next due: ${formatDisplayDate(customer.nextInstallmentDate)}</span>
          <button class="small-btn" data-customer-id="${customer.id}" data-action="khata">Open</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-action="khata"]').forEach((button) => {
    button.addEventListener('click', () => {
      openKhata(button.dataset.customerId);
    });
  });
}

function renderCustomerList() {
  const query = customerSearchInput.value.trim().toLowerCase();
  const customers = getCurrentCustomers().filter((customer) => {
    const searchable = [customer.name, customer.mobile, customer.productName].join(' ').toLowerCase();
    return !query || searchable.includes(query);
  }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (!customers.length) {
    customerList.innerHTML = '<div class="empty-state">No customers found.</div>';
    return;
  }

  customerList.innerHTML = customers.map((customer) => {
    const details = getCustomerDetails(customer);
    const status = getCustomerStatus(customer);
    return `
      <article class="customer-card">
        <div class="customer-card-top">
          <div class="customer-identity">
            <span class="customer-avatar">${escapeHTML(getInitials(customer.name))}</span>
            <div>
            <h4>${escapeHTML(customer.name)}</h4>
            <small>${escapeHTML(customer.mobile)}</small>
            </div>
          </div>
          <span class="status-pill ${status.tone}">${escapeHTML(status.label)}</span>
        </div>

        <div class="customer-meta">
          <div class="meta-row"><span>Product</span><strong>${escapeHTML(customer.productName)}</strong></div>
          <div class="meta-row"><span>Member</span><strong class="member-value">${escapeHTML(customer.member || 'Regular')}</strong></div>
          <div class="meta-row"><span>Outstanding</span><strong>${formatCurrency(details.outstanding)}</strong></div>
          <div class="meta-row"><span>Next Qist</span><strong>${formatDisplayDate(customer.nextInstallmentDate)}</strong></div>
          <div class="meta-row"><span>Installment</span><strong>${formatCurrency(customer.installmentAmount || 0)}</strong></div>
        </div>

        <div class="customer-card-actions">
          <button type="button" class="small-btn" data-action="khata" data-id="${customer.id}">Khata</button>
          <button type="button" class="small-btn" data-action="receipt" data-id="${customer.id}">Receipt</button>
          <button type="button" class="small-btn" data-action="edit" data-id="${customer.id}">Edit</button>
          <button type="button" class="danger-btn" data-action="delete" data-id="${customer.id}">Delete</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderSettingsView() {
  renderSettingsForm();
}

function renderApp() {
  renderAuthSection();

  if (adminSession) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  renderDashboard();
  renderCustomerList();
  renderSettingsView();
  renderShopkeeperBroadcasts();
  renderShopkeeperPlans();
}

function openKhata(customerId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const customer = currentUser.customers.find((item) => item.id === customerId);
  if (!customer) return;

  selectedCustomerId = customerId;
  khataPanel.classList.remove('hidden');
  khataContent.innerHTML = `
    <div class="khata-card">
      <div class="khata-summary">
        <div class="summary-box">
          <span>Product</span>
          <strong>${escapeHTML(customer.productName)}</strong>
        </div>
        <div class="summary-box">
          <span>Outstanding</span>
          <strong>${formatCurrency(calculateOutstanding(customer))}</strong>
        </div>
        <div class="summary-box">
          <span>Total Price</span>
          <strong>${formatCurrency(customer.productPrice || 0)}</strong>
        </div>
        <div class="summary-box">
          <span>Next Qist</span>
          <strong>${formatDisplayDate(customer.nextInstallmentDate)}</strong>
        </div>
      </div>

      <div class="panel">
        <div class="section-header">
          <div><p class="eyebrow">Record a transaction</p><h3>Receive Payment</h3></div>
        </div>

        <form id="paymentForm" class="payment-form">
          <label>
            Amount
            <input id="paymentAmount" type="number" min="1" step="100" required />
          </label>
          <label>
            Date
            <input id="paymentDate" type="date" required />
          </label>
          <label>
            Method
            <select id="paymentMethod">
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="JazzCash">JazzCash</option>
            </select>
          </label>
          <label>
            Note
            <input id="paymentNote" type="text" placeholder="Payment note" />
          </label>
          <div class="full-span">
            <button type="submit" class="primary-btn full">Receive Payment</button>
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="section-header">
          <div><p class="eyebrow">Complete transaction trail</p><h3>Payment History</h3></div>
        </div>
        <div class="table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Balance</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${renderPaymentRows(customer)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('khataTitle').textContent = `${customer.name} - Khata`;
  document.getElementById('paymentDate').value = toISODate(new Date());

  const paymentForm = document.getElementById('paymentForm');
  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const customerRecord = getCurrentUser().customers.find((item) => item.id === customerId);
    const amount = normalizeNumber(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;
    const method = document.getElementById('paymentMethod').value;
    const note = document.getElementById('paymentNote').value.trim();
    const maxAllowed = calculateOutstanding(customerRecord);

    if (!date || amount <= 0) {
      showToast('Please enter a valid payment amount and date.');
      return;
    }

    if (amount > maxAllowed) {
      showToast('Payment amount exceeds remaining balance.');
      return;
    }

    customerRecord.payments.push({
      id: `pay-${Date.now()}`,
      amount,
      date,
      method,
      note: note || 'Payment received'
    });

    saveState();
    showToast('Payment received successfully.');
    renderApp();
    openKhata(customerId);
  });
}

function renderPaymentRows(customer) {
  const payments = [...(customer.payments || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!payments.length) {
    return '<tr><td colspan="5" class="empty-state">No payment history yet.</td></tr>';
  }

  let runningBalance = normalizeNumber(customer.productPrice || 0);

  return payments.map((payment) => {
    runningBalance -= normalizeNumber(payment.amount);
    return `
      <tr>
        <td>${payment.date}</td>
        <td class="amount-positive">${formatCurrency(payment.amount)}</td>
        <td>${escapeHTML(payment.method)}</td>
        <td class="${runningBalance <= 0 ? 'amount-positive' : 'amount-negative'}">${formatCurrency(runningBalance)}</td>
        <td><button type="button" class="small-btn receipt-table-btn" data-receipt-payment="${customer.id}:${payment.id}">View</button></td>
      </tr>
    `;
  }).join('');
}

function showReceipt(customerId, paymentId = null) {
  const user = getCurrentUser();
  if (!user) return;

  const customer = user.customers.find((item) => item.id === customerId);
  if (!customer) return;

  const payment = paymentId ? (customer.payments || []).find((item) => item.id === paymentId) : null;
  const profile = user.settings || {};
  const receiptType = payment ? 'Payment Receipt' : 'Customer Receipt';
  const totalPaid = (customer.payments || []).reduce((sum, item) => sum + normalizeNumber(item.amount), 0);

  receiptContent.innerHTML = `
    <div class="receipt-sheet">
      <div class="receipt-brand">
        <span class="brand-chip">Qist Khata</span>
        <h2 id="receiptTitle">${escapeHTML(user.shopName || 'Qist Khata')}</h2>
        <p>${escapeHTML(profile.address || 'Shop address not added')}</p>
        <p>${escapeHTML(user.mobile || '')}${profile.whatsapp ? ` · WhatsApp ${escapeHTML(profile.whatsapp)}` : ''}</p>
      </div>
      <div class="receipt-title-row">
        <span>${receiptType}</span>
        <strong>${formatDisplayDate(payment?.date || toISODate(new Date()))}</strong>
      </div>
      <div class="receipt-customer">
        <span>Customer</span>
        <strong>${escapeHTML(customer.name)}</strong>
        <small>${escapeHTML(customer.mobile)} · ${escapeHTML(customer.productName)}</small>
      </div>
      <div class="receipt-lines">
        <div><span>Product Price</span><strong>${formatCurrency(customer.productPrice)}</strong></div>
        ${payment ? `<div><span>Payment Received</span><strong class="amount-positive">${formatCurrency(payment.amount)}</strong></div><div><span>Method</span><strong>${escapeHTML(payment.method)}</strong></div>` : ''}
        <div><span>Total Paid</span><strong>${formatCurrency(totalPaid)}</strong></div>
        <div class="receipt-total"><span>Outstanding Balance</span><strong>${formatCurrency(calculateOutstanding(customer))}</strong></div>
      </div>
      <p class="receipt-note">Thank you for your business.</p>
    </div>
  `;
  receiptModal.classList.remove('hidden');
}
const whatsappReceiptBtn = document.getElementById('whatsappReceiptBtn');
console.log('WhatsApp button found:', whatsappReceiptBtn);
if (whatsappReceiptBtn) {
  whatsappReceiptBtn.onclick = () => {
    const whatsappNumber = customer.mobile || profile.whatsapp || user.mobile || '';

    if (!whatsappNumber) {
      showToast('WhatsApp number is not available.', 'error');
      return;
    }

    const message =
      `Qist Khata Receipt\n\n` +
      `Customer: ${customer.name}\n` +
      `Product: ${customer.productName}\n` +
      `Payment Received: ${payment ? formatCurrency(payment.amount) : 'N/A'}\n` +
      `Total Paid: ${formatCurrency(totalPaid)}\n` +
      `Outstanding Balance: ${formatCurrency(calculateOutstanding(customer))}\n\n` +
      `Thank you for your business.`;

    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    const finalNumber = cleanNumber.startsWith('0')
      ? '92' + cleanNumber.slice(1)
      : cleanNumber;

    const whatsappUrl =
      `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };
}
function populateCustomerForm(customer) {
  const form = customerForm;
  form.elements.customerName.value = customer.name || '';
  form.elements.customerMobile.value = customer.mobile || '';
  form.elements.customerCnic.value = customer.cnic || '';
  form.elements.customerMember.value = customer.member || 'Regular';
  form.elements.customerAddress.value = customer.address || '';
  form.elements.productName.value = customer.productName || '';
  form.elements.productPrice.value = customer.productPrice || 0;
  form.elements.advancePayment.value = customer.advancePayment || 0;
  form.elements.installmentAmount.value = customer.installmentAmount || 0;
  form.elements.nextInstallmentDate.value = customer.nextInstallmentDate || '';
  form.elements.customerNote.value = customer.note || '';
  updateOutstandingPreview();
}

function updateOutstandingPreview() {
  const productPrice = normalizeNumber(document.getElementById('productPrice').value);
  const advancePayment = normalizeNumber(document.getElementById('advancePayment').value);
  const preview = Math.max(0, productPrice - advancePayment);
  document.getElementById('autoOutstandingText').textContent = formatCurrency(preview);
}

function resetCustomerForm() {
  customerForm.reset();
  editingCustomerId = null;
  customerFormTitle.textContent = 'Add Customer';
  document.getElementById('advancePayment').value = 0;
  document.getElementById('nextInstallmentDate').value = toISODate(new Date());
  updateOutstandingPreview();
}

function openCustomerFormForEditing(customerId) {
  const customer = getCurrentCustomers().find((item) => item.id === customerId);
  if (!customer) return;

  editingCustomerId = customerId;
  customerFormTitle.textContent = 'Edit Customer';
  customerFormPanel.classList.remove('hidden');
  populateCustomerForm(customer);
}

function handleCustomerSave(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const payload = {
    name: document.getElementById('customerName').value.trim(),
    mobile: document.getElementById('customerMobile').value.trim(),
    cnic: document.getElementById('customerCnic').value.trim(),
    member: document.getElementById('customerMember').value,
    address: document.getElementById('customerAddress').value.trim(),
    productName: document.getElementById('productName').value.trim(),
    productPrice: normalizeNumber(document.getElementById('productPrice').value),
    advancePayment: normalizeNumber(document.getElementById('advancePayment').value),
    installmentAmount: normalizeNumber(document.getElementById('installmentAmount').value),
    nextInstallmentDate: document.getElementById('nextInstallmentDate').value,
    note: document.getElementById('customerNote').value.trim(),
    createdAt: new Date().toISOString()
  };

  if (!payload.name || !payload.mobile || !payload.productName || !payload.nextInstallmentDate) {
    showToast('Please fill required fields before saving.');
    return;
  }

  if (editingCustomerId) {
    const existing = currentUser.customers.find((customer) => customer.id === editingCustomerId);
    if (!existing) return;

    Object.assign(existing, payload);
    if (!existing.payments || !existing.payments.length) {
      existing.payments = [];
    }
    if (payload.advancePayment > 0 && !existing.payments.some((entry) => entry.note === 'Initial advance')) {
      existing.payments.unshift({
        id: `advance-${Date.now()}`,
        amount: payload.advancePayment,
        date: toISODate(new Date()),
        method: 'Advance',
        note: 'Initial advance'
      });
    }
    showToast('Customer updated successfully.');
  } else {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...payload,
      payments: payload.advancePayment > 0 ? [{
        id: `advance-${Date.now()}`,
        amount: payload.advancePayment,
        date: toISODate(new Date()),
        method: 'Advance',
        note: 'Initial advance'
      }] : []
    };

    currentUser.customers.push(newCustomer);
    showToast('Customer saved successfully.');
  }

  saveState();
  resetCustomerForm();
  customerFormPanel.classList.add('hidden');
  renderApp();
}

function handleDeleteCustomer(customerId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const customer = currentUser.customers.find((item) => item.id === customerId);
  if (!customer) return;

  const confirmDelete = window.confirm(`Delete customer ${customer.name}? This cannot be undone.`);
  if (!confirmDelete) return;

  currentUser.customers = currentUser.customers.filter((item) => item.id !== customerId);
  saveState();
  renderApp();
  showToast('Customer deleted.');
}

function handleLogin(event) {
  event.preventDefault();
  const mobile = document.getElementById('loginMobile').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const user = state.users.find((item) => item.mobile === mobile && item.password === password);
  if (!user || user.status === 'suspended') {
    showToast('Invalid mobile number or password.');
    return;
  }

  state.activeUserId = user.id;
  saveState();
  renderApp();
  showToast('Login successful.');
}

function handleRegister(event) {
  event.preventDefault();
  if (state.systemSettings && state.systemSettings.allowRegistration === false) {
    showToast('New shopkeeper registration is currently closed.');
    return;
  }
  const shopName = document.getElementById('registerShopName').value.trim();
  const ownerName = document.getElementById('registerOwnerName').value.trim();
  const mobile = document.getElementById('registerMobile').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!shopName || !ownerName || !mobile || !password) {
    showToast('Please complete all registration fields.');
    return;
  }

  const exists = state.users.some((user) => user.mobile === mobile);
  if (exists) {
    showToast('This mobile number is already registered.');
    return;
  }

  const newUser = {
    id: `user-${Date.now()}`,
    mobile,
    password,
    shopName,
    ownerName,
    registrationDate: new Date().toISOString(),
    settings: {
      address: '',
      whatsapp: '',
      easypaisa: '',
      bankName: '',
      bankAccount: '',
      serviceCharge: 0
    },
    planId: 'plan-free',
    subscriptionStatus: 'active',
    subscriptionStart: toISODate(new Date()),
    subscriptionExpiry: addDaysToISO(toISODate(new Date()), 30),
    customers: []
  };

  state.users.push(newUser);
  state.activeUserId = newUser.id;
  saveState();
  registerForm.reset();
  renderApp();
  showToast('Account created successfully.');
}

function handleSettingsSave(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  currentUser.shopName = document.getElementById('settingsShopName').value.trim();
  currentUser.ownerName = document.getElementById('settingsOwnerName').value.trim();
  currentUser.mobile = document.getElementById('settingsMobile').value.trim();
  currentUser.settings = {
    address: document.getElementById('settingsShopAddress').value.trim(),
    whatsapp: document.getElementById('settingsWhatsapp').value.trim(),
    easypaisa: document.getElementById('settingsEasypaisa').value.trim(),
    bankName: document.getElementById('settingsBankName').value.trim(),
    bankAccount: document.getElementById('settingsBankAccount').value.trim(),
    serviceCharge: normalizeNumber(document.getElementById('settingsServiceCharge').value)
  };

  saveState();
  renderApp();
  showToast('Shop profile saved successfully.');
}

function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const password = document.getElementById('adminPassword').value;
  if (![ADMIN_EMAIL, ADMIN_MOBILE].includes(email) || password !== ADMIN_PASSWORD) {
    showToast('Invalid admin credentials.');
    return;
  }
  state.activeUserId = null;
  adminSession = true;
  localStorage.setItem(ADMIN_SESSION_KEY, 'active');
  saveState();
  adminLoginForm.reset();
  renderApp();
  showToast('Admin panel opened.');
}

function handleAdminLogout() {
  adminSession = false;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  renderApp();
  showToast('Admin session closed.');
}

function handleAdminAdSave(event) {
  event.preventDefault();
  const editingAdId = document.getElementById('editingAdId').value;
  const payload = {
    title: document.getElementById('adTitle').value.trim(),
    description: document.getElementById('adDescription').value.trim(),
    image: document.getElementById('adImage').value.trim(),
    buttonText: document.getElementById('adButtonText').value.trim(),
    link: document.getElementById('adLink').value.trim(),
    startDate: document.getElementById('adStartDate').value,
    endDate: document.getElementById('adEndDate').value,
    active: document.getElementById('adActive').checked,
    createdAt: new Date().toISOString()
  };
  if (editingAdId) {
    const existingAd = state.ads.find((ad) => ad.id === editingAdId);
    if (existingAd) Object.assign(existingAd, payload);
  } else {
    state.ads.unshift({ id: `ad-${Date.now()}`, ...payload });
  }
  saveState();
  resetAdForm();
  renderAdminPanel();
  showToast(editingAdId ? 'Advertisement updated.' : 'Advertisement published.');
}

function handleAdminAnnouncementSave(event) {
  event.preventDefault();
  const editingAnnouncementId = document.getElementById('editingAnnouncementId').value;
  const payload = {
    title: document.getElementById('announcementTitle').value.trim(),
    description: document.getElementById('announcementDescription').value.trim(),
    important: document.getElementById('announcementImportant').checked,
    active: document.getElementById('announcementActive').checked,
    createdAt: new Date().toISOString()
  };
  if (editingAnnouncementId) {
    const existingAnnouncement = state.announcements.find((item) => item.id === editingAnnouncementId);
    if (existingAnnouncement) Object.assign(existingAnnouncement, payload);
  } else {
    state.announcements.unshift({ id: `announcement-${Date.now()}`, ...payload });
  }
  saveState();
  resetAnnouncementForm();
  renderAdminPanel();
  showToast(editingAnnouncementId ? 'Announcement updated.' : 'Announcement published.');
}

function handleAdminUpdateSave(event) {
  event.preventDefault();
  state.updates.unshift({
    id: `update-${Date.now()}`,
    title: document.getElementById('updateTitle').value.trim(),
    version: document.getElementById('updateVersion').value.trim(),
    date: document.getElementById('updateDate').value,
    description: document.getElementById('updateDescription').value.trim(),
    important: document.getElementById('updateImportant').checked
  });
  saveState();
  event.target.reset();
  document.getElementById('updateImportant').checked = true;
  renderAdminPanel();
  showToast('App update published.');
}

function handleAdminPlanSave(event) {
  event.preventDefault();
  const editingPlanId = document.getElementById('editingPlanId').value;
  const payload = {
    name: document.getElementById('planName').value.trim(),
    monthlyPrice: normalizeNumber(document.getElementById('planMonthlyPrice').value),
    yearlyPrice: normalizeNumber(document.getElementById('planYearlyPrice').value),
    customerLimit: normalizeNumber(document.getElementById('planCustomerLimit').value),
    features: document.getElementById('planFeatures').value.split(',').map((feature) => feature.trim()).filter(Boolean),
    description: document.getElementById('planDescription').value.trim(),
    active: document.getElementById('planActive').checked
  };
  if (editingPlanId) {
    const existingPlan = state.plans.find((plan) => plan.id === editingPlanId);
    if (existingPlan) Object.assign(existingPlan, payload);
  } else {
    state.plans.push({ id: `plan-${Date.now()}`, ...payload });
  }
  saveState();
  resetPlanForm();
  renderAdminPanel();
  showToast(editingPlanId ? 'Plan updated.' : 'Plan created.');
}

function handleAdminPaymentSave(event) {
  event.preventDefault();
  state.paymentSettings = {
    accountName: document.getElementById('adminPaymentName').value.trim(),
    easypaisa: document.getElementById('adminPaymentEasypaisa').value.trim(),
    jazzcash: document.getElementById('adminPaymentJazzcash').value.trim(),
    bankName: document.getElementById('adminPaymentBank').value.trim(),
    accountNumber: document.getElementById('adminPaymentAccount').value.trim(),
    instructions: document.getElementById('adminPaymentInstructions').value.trim()
  };
  saveState();
  showToast('Payment settings saved.');
}

function handleAdminSubscriptionSave(event) {
  event.preventDefault();
  const user = state.users.find((item) => item.id === document.getElementById('subscriptionUser').value);
  if (!user) return;
  const planId = document.getElementById('subscriptionPlan').value;
  const oldPlan = state.plans.find((plan) => plan.id === user.planId);
  const plan = state.plans.find((item) => item.id === planId);
  user.planId = planId;
  user.subscriptionStatus = document.getElementById('subscriptionStatus').value;
  user.subscriptionStart = document.getElementById('subscriptionStart').value;
  user.subscriptionExpiry = document.getElementById('subscriptionExpiry').value;
  if (plan && plan.monthlyPrice > 0 && user.subscriptionStatus === 'active' && (oldPlan?.id !== plan.id || oldPlan?.monthlyPrice !== plan.monthlyPrice)) {
    state.subscriptionPayments.push({ id: `subscription-payment-${Date.now()}`, userId: user.id, planId, amount: plan.monthlyPrice, date: toISODate(new Date()), status: 'recorded' });
  }
  saveState();
  renderAdminPanel();
  showToast('Subscription saved.');
}

function handleAdminServiceChargeSave(event) {
  event.preventDefault();
  state.serviceCharges = {
    defaultRate: normalizeNumber(document.getElementById('serviceChargeDefault').value),
    paymentRate: normalizeNumber(document.getElementById('serviceChargePayment').value),
    overdueFee: normalizeNumber(document.getElementById('serviceChargeOverdue').value),
    notes: document.getElementById('serviceChargeNotes').value.trim()
  };
  saveState();
  showToast('Service charges saved.');
}

function handleAdminSystemSave(event) {
  event.preventDefault();
  state.systemSettings = {
    maintenance: document.getElementById('systemMaintenance').checked,
    allowRegistration: document.getElementById('systemAllowRegistration').checked,
    showUpdates: document.getElementById('systemShowUpdates').checked
  };
  saveState();
  renderAdminPanel();
  showToast('System settings saved.');
}

function handleAdminAction(event) {
  const target = event.target.closest('[data-admin-action]');
  if (!target) return;
  const { adminAction, id, userId } = target.dataset;
  if (adminAction === 'deleteAd') state.ads = state.ads.filter((ad) => ad.id !== id);
  if (adminAction === 'toggleAd') {
    const ad = state.ads.find((item) => item.id === id);
    if (ad) ad.active = ad.active === false;
  }
  if (adminAction === 'deleteUpdate') state.updates = state.updates.filter((update) => update.id !== id);
  if (adminAction === 'deleteAnnouncement') state.announcements = state.announcements.filter((announcement) => announcement.id !== id);
  if (adminAction === 'toggleAnnouncement') {
    const announcement = state.announcements.find((item) => item.id === id);
    if (announcement) announcement.active = announcement.active === false;
  }
  if (adminAction === 'deletePlan') state.plans = state.plans.filter((plan) => plan.id !== id);
  if (adminAction === 'togglePlan') {
    const plan = state.plans.find((item) => item.id === id);
    if (plan) plan.active = plan.active === false;
  }
  if (adminAction === 'editPlan') {
    const plan = state.plans.find((item) => item.id === id);
    if (plan) {
      setAdminView('adminPlans');
      populatePlanForm(plan);
    }
    return;
  }
  if (adminAction === 'editAd') {
    const ad = state.ads.find((item) => item.id === id);
    if (ad) {
      setAdminView('adminAds');
      populateAdForm(ad);
    }
    return;
  }
  if (adminAction === 'editAnnouncement') {
    const announcement = state.announcements.find((item) => item.id === id);
    if (announcement) {
      setAdminView('adminAnnouncements');
      populateAnnouncementForm(announcement);
    }
    return;
  }
  if (adminAction === 'toggleUser') {
    const user = state.users.find((item) => item.id === userId);
    if (user) user.status = user.status === 'suspended' ? 'active' : 'suspended';
  }
  if (adminAction === 'viewUser') {
    showAdminUser(userId);
    return;
  }
  if (adminAction === 'manageSubscription') {
    const user = state.users.find((item) => item.id === userId);
    if (user) {
      setAdminView('adminSubscriptions');
      document.getElementById('subscriptionUser').value = user.id;
      document.getElementById('subscriptionPlan').value = user.planId || 'plan-free';
      document.getElementById('subscriptionStatus').value = user.subscriptionStatus || 'active';
      document.getElementById('subscriptionStart').value = user.subscriptionStart || '';
      document.getElementById('subscriptionExpiry').value = user.subscriptionExpiry || '';
    }
    return;
  }
  saveState();
  renderAdminPanel();
}

function bindStaticEvents() {
  document.getElementById('welcomeLoginBtn').addEventListener('click', () => showAuthPage('login'));
  document.getElementById('welcomeRegisterBtn').addEventListener('click', () => showAuthPage('register'));

  authTabs.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.authTab;
      const isLogin = tab === 'login';
      document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
      document.getElementById('registerForm').classList.toggle('hidden', isLogin);
      authTabs.forEach((tabButton) => tabButton.classList.toggle('active', tabButton === button));
    });
  });

  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  document.getElementById('adminAccessBtn').addEventListener('click', () => {
    document.querySelectorAll('.auth-form').forEach((form) => form.classList.add('hidden'));
    adminLoginForm.classList.remove('hidden');
    document.querySelector('.auth-tabs').classList.add('hidden');
  });
  document.getElementById('cancelAdminLoginBtn').addEventListener('click', () => {
    adminLoginForm.classList.add('hidden');
    document.querySelector('.auth-tabs').classList.remove('hidden');
    loginForm.classList.remove('hidden');
  });
  adminLoginForm.addEventListener('submit', handleAdminLogin);
  customerSearchInput.addEventListener('input', renderCustomerList);
  customerForm.addEventListener('input', updateOutstandingPreview);
  customerForm.addEventListener('submit', handleCustomerSave);
  document.getElementById('addCustomerBtn').addEventListener('click', () => {
    customerFormPanel.classList.remove('hidden');
    resetCustomerForm();
  });
  document.getElementById('cancelCustomerFormBtn').addEventListener('click', () => {
    customerFormPanel.classList.add('hidden');
    resetCustomerForm();
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    state.activeUserId = null;
    saveState();
    renderApp();
    showToast('Logged out.');
  });

  document.getElementById('closeKhataBtn').addEventListener('click', () => {
    khataPanel.classList.add('hidden');
    selectedCustomerId = null;
  });

  document.getElementById('closeReceiptBtn').addEventListener('click', () => {
    receiptModal.classList.add('hidden');
  });
  document.getElementById('printReceiptBtn').addEventListener('click', () => {
    window.print();
  });
  khataContent.addEventListener('click', (event) => {
    const receiptButton = event.target.closest('[data-receipt-payment]');
    if (!receiptButton) return;
    const [customerId, paymentId] = receiptButton.dataset.receiptPayment.split(':');
    showReceipt(customerId, paymentId);
  });

  document.getElementById('settingsForm').addEventListener('submit', handleSettingsSave);
  document.getElementById('adminLogoutBtn').addEventListener('click', handleAdminLogout);
  document.getElementById('closeAdminUserBtn').addEventListener('click', () => adminUserModal.classList.add('hidden'));
  document.getElementById('adminAdForm').addEventListener('submit', handleAdminAdSave);
  document.getElementById('adminAnnouncementForm').addEventListener('submit', handleAdminAnnouncementSave);
  document.getElementById('adminUpdateForm').addEventListener('submit', handleAdminUpdateSave);
  document.getElementById('adminPlanForm').addEventListener('submit', handleAdminPlanSave);
  document.getElementById('adminSubscriptionForm').addEventListener('submit', handleAdminSubscriptionSave);
  document.getElementById('adminPaymentForm').addEventListener('submit', handleAdminPaymentSave);
  document.getElementById('adminServiceChargeForm').addEventListener('submit', handleAdminServiceChargeSave);
  document.getElementById('adminSystemForm').addEventListener('submit', handleAdminSystemSave);
  adminApp.addEventListener('click', handleAdminAction);

  adminViewButtons.forEach((button) => {
    button.addEventListener('click', () => setAdminView(button.dataset.adminView));
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveView(button.dataset.view);
    });
  });

  customerList.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;

    const { action, id } = actionTarget.dataset;
    if (action === 'khata') {
      openKhata(id);
    }
    if (action === 'receipt') {
      showReceipt(id);
    }
    if (action === 'edit') {
      openCustomerFormForEditing(id);
    }
    if (action === 'delete') {
      handleDeleteCustomer(id);
    }
  });
}

bindStaticEvents();
resetCustomerForm();
setActiveView('dashboard');
renderApp();

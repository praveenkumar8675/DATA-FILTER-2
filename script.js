
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const authPages = ['register.html', 'registration.html', 'login.html'];
  const isAuthPage = authPages.includes(currentPage);
  const currentUserRaw = localStorage.getItem('df_current_user');
  const registeredUserRaw = localStorage.getItem('df_registered_user');

  if (!currentUserRaw && !isAuthPage) {
    window.location.replace(registeredUserRaw ? 'login.html' : 'register.html');
    return;
  }
  document.addEventListener('DOMContentLoaded', function () {
    initializeRegistration();
    initializeLogin();
    initializeShowPassword();
    initializeUserAvatar();
    initializeMobileMenu();
    initializeContactForm();
    initializeTheme();
    initializeDataFilter();
    if (!isAuthPage) initializeCalculator();
    initializeChatbot();
  });

  function initializeRegistration() {
    const form = $('registerForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = $('regName');
      const email = $('regEmail');
      const business = $('regBusiness');
      const password = $('regPass');
      const confirmPassword = $('regConfirm');
      const successMessage = $('regOk');
      let valid = true;

      setError('regName', '');
      setError('regEmail', '');
      setError('regBusiness', '');
      setError('regPass', '');
      setError('regConfirm', '');
      if (successMessage) successMessage.hidden = true;

      if (!name || !name.value.trim()) {
        setError('regName', 'Please enter your full name.');
        valid = false;
      }

      const emailValue = email ? email.value.trim().toLowerCase() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailValue || !emailRegex.test(emailValue)) {
        setError('regEmail', 'Please enter a valid email address.');
        valid = false;
      }

      if (!business || !business.value.trim()) {
        setError('regBusiness', 'Please enter your business or organization name.');
        valid = false;
      }

      if (!password || password.value.length < 6) {
        setError('regPass', 'Password must be at least 6 characters.');
        valid = false;
      }

      if (!confirmPassword || !password || confirmPassword.value !== password.value) {
        setError('regConfirm', 'Passwords do not match.');
        valid = false;
      }

      if (!valid) return;

      const userData = {
        name: name.value.trim(),
        email: emailValue,
        business: business.value.trim(),
        password: password.value
      };

      localStorage.setItem('df_registered_user', JSON.stringify(userData));
      if (successMessage) successMessage.hidden = false;

      window.setTimeout(function () {
        window.location.href = 'login.html';
      }, 1000);
    });
  }
  function initializeLogin() {
    const form = $('loginForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const email = $('loginEmail');
      const password = $('loginPass');
      const successMessage = $('loginOk');

      setError('loginEmail', '');
      setError('loginPass', '');
      if (successMessage) successMessage.hidden = true;

      const savedData = localStorage.getItem('df_registered_user');
      if (!savedData) {
        setError('loginEmail', 'No account found. Please register first.');
        return;
      }

      let user;
      try {
        user = JSON.parse(savedData);
      } catch (error) {
        setError('loginEmail', 'Saved account data is invalid. Please register again.');
        return;
      }

      if (!email || email.value.trim().toLowerCase() !== user.email) {
        setError('loginEmail', 'Email does not match the registered account.');
        return;
      }

      if (!password || password.value !== user.password) {
        setError('loginPass', 'Incorrect password.');
        return;
      }

      localStorage.setItem('df_current_user', JSON.stringify(user));
      if (successMessage) successMessage.hidden = false;

      window.setTimeout(function () {
        window.location.href = 'index.html';
      }, 800);
    });
  }

  function setError(fieldName, message) {
    const errorElement = document.querySelector('[data-err="' + fieldName + '"]');
    if (errorElement) errorElement.textContent = message;
  }

  // ------------------------------------------------------------
  // 4. SHOW / HIDE PASSWORD
  // ------------------------------------------------------------
  function initializeShowPassword() {
    document.querySelectorAll('input[type="password"]').forEach(function (input) {
      // Avoid adding the same checkbox twice.
      if (input.dataset.showPasswordAdded === 'true') return;
      input.dataset.showPasswordAdded = 'true';

      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '8px';
      label.style.marginTop = '6px';
      label.style.fontSize = '0.88rem';
      label.style.cursor = 'pointer';
      label.style.userSelect = 'none';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.width = 'auto';
      checkbox.style.margin = '0';

      const text = document.createElement('span');
      text.textContent = 'Show password';

      checkbox.addEventListener('change', function () {
        input.type = checkbox.checked ? 'text' : 'password';
      });

      label.appendChild(checkbox);
      label.appendChild(text);
      input.insertAdjacentElement('afterend', label);
    });
  }

  // ------------------------------------------------------------
  // 5. USER AVATAR, ACCOUNT DETAILS, AND LOGOUT
  // ------------------------------------------------------------
  function initializeUserAvatar() {
    const nav = $('nav');
    const userRaw = localStorage.getItem('df_current_user');
    if (!nav || !userRaw || $('userAvatarWrap')) return;

    let user;
    try {
      user = JSON.parse(userRaw);
    } catch (error) {
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'user-avatar-wrap';
    wrap.id = 'userAvatarWrap';

    const circle = document.createElement('button');
    circle.type = 'button';
    circle.className = 'user-avatar-circle';
    circle.textContent = (user.name || 'U').trim().charAt(0).toUpperCase();
    circle.setAttribute('aria-label', 'Show account details');
    circle.title = (user.name || 'User') + ' (' + (user.email || '') + ')';

    const card = document.createElement('div');
    card.className = 'user-hover-card';

    const name = document.createElement('p');
    name.className = 'user-hover-name';
    name.textContent = user.name || 'User';

    const email = document.createElement('p');
    email.className = 'user-hover-email';
    email.textContent = user.email || '';

    const business = document.createElement('p');
    business.className = 'user-hover-biz';
    business.textContent = 'Organization: ' + (user.business || 'Not provided');

    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'user-logout-btn';
    logout.textContent = 'Log Out';
    logout.addEventListener('click', function () {
      localStorage.removeItem('df_current_user');
      window.location.href = 'login.html';
    });

    card.append(name, email, business, logout);
    wrap.append(circle, card);
    nav.appendChild(wrap);

    if (!$('userAvatarStyles')) {
      const style = document.createElement('style');
      style.id = 'userAvatarStyles';
      style.textContent = `
        .user-avatar-wrap{position:relative;display:inline-flex;align-items:center;margin-left:8px}
        .user-avatar-circle{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#8b5cf6);color:#fff;font-weight:700;font-size:1rem;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid rgba(255,255,255,.28);box-shadow:0 4px 12px rgba(139,92,246,.35);transition:transform .2s ease,box-shadow .2s ease}
        .user-avatar-wrap:hover .user-avatar-circle,.user-avatar-wrap:focus-within .user-avatar-circle{transform:scale(1.08);box-shadow:0 6px 16px rgba(56,189,248,.5)}
        .user-hover-card{position:absolute;top:calc(100% + 10px);right:0;min-width:230px;background:#131b2e;border:1px solid rgba(139,92,246,.45);border-radius:14px;padding:14px 16px;box-shadow:0 12px 28px rgba(0,0,0,.55);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .2s ease,transform .2s ease,visibility .2s;z-index:9999;text-align:left}
        .user-avatar-wrap:hover .user-hover-card,.user-avatar-wrap:focus-within .user-hover-card{opacity:1;visibility:visible;transform:translateY(0)}
        .user-hover-name{font-weight:700;color:#fff;font-size:.98rem;margin:0 0 3px}
        .user-hover-email{color:#38bdf8;font-size:.84rem;margin:0 0 6px;word-break:break-all}
        .user-hover-biz{color:#94a3b8;font-size:.8rem;margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.1)}
        .user-logout-btn{width:100%;padding:7px 12px;border-radius:8px;border:1px solid rgba(248,113,113,.4);background:rgba(248,113,113,.12);color:#fca5a5;font-size:.84rem;font-weight:600;cursor:pointer}
        .user-logout-btn:hover{background:rgba(248,113,113,.25);color:#fff}
      `;
      document.head.appendChild(style);
    }
  }

  // ------------------------------------------------------------
  // 6. MOBILE NAVIGATION
  // ------------------------------------------------------------
  function initializeMobileMenu() {
    const menuButton = document.querySelector('.menu');
    const nav = $('nav');
    if (!menuButton || !nav) return;

    menuButton.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ------------------------------------------------------------
  // 7. CONTACT FORM VALIDATION
  // ------------------------------------------------------------
  function initializeContactForm() {
    const form = $('contactForm');
    if (!form) return;

    const rules = {
      name: value => value.trim().length >= 2 || 'Please enter your name (at least 2 characters).',
      email: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || 'Please enter a valid email address.',
      business: value => value.trim().length >= 2 || 'Please enter your business name.',
      service: value => value !== '' || 'Please choose a service.',
      message: value => value.trim().length >= 10 || 'Please write at least 10 characters.'
    };

    const wantedService = new URLSearchParams(window.location.search).get('service');
    const serviceSelect = form.elements.service;
    if (serviceSelect && Array.from(serviceSelect.options).some(option => option.value === wantedService)) {
      serviceSelect.value = wantedService;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      let allValid = true;

      Object.keys(rules).forEach(function (fieldName) {
        const input = form.elements[fieldName];
        const errorElement = form.querySelector('[data-err="' + fieldName + '"]');
        if (!input) return;

        const result = rules[fieldName](input.value);
        const message = result === true ? '' : result;
        if (errorElement) errorElement.textContent = message;
        input.setAttribute('aria-invalid', String(message !== ''));
        if (message) allValid = false;
      });

      const successMessage = $('ok');
      if (successMessage) successMessage.hidden = !allValid;
      // This is a front-end demonstration; the form is not sent to a server.
      if (allValid) form.reset();
    });
  }

  // ------------------------------------------------------------
  // 8. LIGHT / DARK THEME
  // ------------------------------------------------------------
  function initializeTheme() {
    const toggleButton = $('themeToggleBtn');
    const themeIcon = $('themeIcon');

    function applyTheme(theme) {
      const selectedTheme = theme === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', selectedTheme);
      if (themeIcon) {
        themeIcon.className = selectedTheme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      }
    }

    applyTheme(localStorage.getItem('userTheme') || 'dark');

    if (toggleButton) {
      toggleButton.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem('userTheme', nextTheme);
      });
    }
  }

  // ------------------------------------------------------------
  // 9. SAMPLE DATA FILTER
  // ------------------------------------------------------------
  function initializeDataFilter() {
    const search = $('q');
    const category = $('cat');
    const minSales = $('min');
    const minLabel = $('minv');
    const rows = $('rows');
    const count = $('count');
    const total = $('total');
    const noResults = $('none');
    const resetButton = $('reset');

    // Only run this feature on the page containing all its controls.
    if (!search || !category || !minSales || !rows || !count || !total || !noResults || !resetButton) return;

    const data = [
      { name: 'Wireless Earbuds', category: 'Electronics', sales: 320, revenue: 480000 },
      { name: 'Smart Watch', category: 'Electronics', sales: 150, revenue: 375000 },
      { name: 'Laptop Stand', category: 'Electronics', sales: 210, revenue: 252000 },
      { name: 'Bluetooth Speaker', category: 'Electronics', sales: 95, revenue: 190000 },
      { name: 'Cotton T-Shirt', category: 'Clothing', sales: 480, revenue: 240000 },
      { name: 'Denim Jacket', category: 'Clothing', sales: 120, revenue: 300000 },
      { name: 'Running Shoes', category: 'Sports', sales: 260, revenue: 520000 },
      { name: 'Yoga Mat', category: 'Sports', sales: 340, revenue: 170000 },
      { name: 'Dumbbell Set', category: 'Sports', sales: 75, revenue: 225000 },
      { name: 'Ceramic Mug Set', category: 'Home', sales: 410, revenue: 164000 },
      { name: 'LED Desk Lamp', category: 'Home', sales: 185, revenue: 129500 },
      { name: 'Cushion Cover Pack', category: 'Home', sales: 290, revenue: 87000 },
      { name: 'Organic Green Tea', category: 'Grocery', sales: 520, revenue: 156000 },
      { name: 'Almond Butter', category: 'Grocery', sales: 230, revenue: 138000 },
      { name: 'Basmati Rice 5kg', category: 'Grocery', sales: 610, revenue: 305000 },
      { name: 'Notebook Bundle', category: 'Stationery', sales: 700, revenue: 140000 }
    ];

    const formatMoney = value => '₹' + value.toLocaleString('en-IN');

    // Add category choices only when they are not already present in the HTML.
    const existingCategories = new Set(Array.from(category.options).map(option => option.value));
    Array.from(new Set(data.map(item => item.category))).forEach(function (categoryName) {
      if (existingCategories.has(categoryName)) return;
      const option = document.createElement('option');
      option.value = categoryName;
      option.textContent = categoryName;
      category.appendChild(option);
    });

    function renderRows() {
      const searchTerm = search.value.trim().toLowerCase();
      const selectedCategory = category.value;
      const minimumSales = Number(minSales.value);
      if (minLabel) minLabel.textContent = String(minimumSales);

      const filteredData = data.filter(function (item) {
        const matchesName = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesName && matchesCategory && item.sales >= minimumSales;
      });

      rows.replaceChildren();
      filteredData.forEach(function (item) {
        const row = rows.insertRow();
        [item.name, item.category, item.sales, formatMoney(item.revenue)].forEach(function (value, index) {
          const cell = row.insertCell();
          cell.textContent = String(value);
          if (index > 1) cell.className = 'num';
        });
      });

      count.textContent = String(filteredData.length);
      total.textContent = formatMoney(filteredData.reduce((sum, item) => sum + item.revenue, 0));
      noResults.hidden = filteredData.length > 0;
    }

    [search, category, minSales].forEach(function (control) {
      control.addEventListener('input', renderRows);
      control.addEventListener('change', renderRows);
    });

    resetButton.addEventListener('click', function () {
      search.value = '';
      category.value = 'all';
      minSales.value = '0';
      renderRows();
    });

    renderRows();
  }

  // ------------------------------------------------------------
  // 10. CALCULATOR
  // Automatically adds a floating calculator to every logged-in page.
  // It also supports the separate calculator.html interface if it exists.
  // ------------------------------------------------------------
  function initializeCalculator() {
    // If a standalone calculator is already present, use it. Otherwise,
    // create the calculator launcher and popup directly from this JavaScript.
    let calculator = document.querySelector('.calculator');
    let calculatorWindow = null;
    let keypad = calculator ? calculator.querySelector('.keys') : null;

    // A page without the original calculator markup gets the floating calculator.
    if (!calculator || !keypad) {
      if ($('df-calculator-launcher')) return;
      createCalculatorInterface();
      calculator = $('df-calculator-window');
      calculatorWindow = calculator;
      keypad = $('df-calculator-keys');
    }

    const display = calculator.querySelector('#display') || $('df-calculator-display');
    const expression = calculator.querySelector('#expression') || $('df-calculator-expression');
    if (!display || !expression || !keypad) return;

    let currentValue = '0';
    let previousValue = null;
    let selectedOperator = null;
    let shouldResetDisplay = false;

    function updateDisplay() {
      display.textContent = currentValue;
    }

    function formatNumber(value) {
      return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 10 });
    }

    function enterNumber(number) {
      if (currentValue === 'Error' || shouldResetDisplay) {
        currentValue = number;
        shouldResetDisplay = false;
      } else {
        currentValue = currentValue === '0' ? number : currentValue + number;
      }
      updateDisplay();
    }

    function enterDecimal() {
      if (currentValue === 'Error' || shouldResetDisplay) {
        currentValue = '0';
        shouldResetDisplay = false;
      }
      if (!currentValue.includes('.')) currentValue += '.';
      updateDisplay();
    }

    function showError(message) {
      currentValue = 'Error';
      previousValue = null;
      selectedOperator = null;
      shouldResetDisplay = true;
      expression.textContent = message;
      updateDisplay();
    }

    function performCalculation(first, second, operator) {
      switch (operator) {
        case '+': return first + second;
        case '−': return first - second;
        case '×': return first * second;
        case '÷': return second === 0 ? null : first / second;
        default: return second;
      }
    }

    function chooseOperator(operator) {
      if (currentValue === 'Error') return;
      if (selectedOperator && !shouldResetDisplay) {
        calculate();
        if (currentValue === 'Error') return;
      }
      previousValue = Number(currentValue);
      selectedOperator = operator;
      shouldResetDisplay = true;
      expression.textContent = formatNumber(previousValue) + ' ' + operator;
    }

    function calculate() {
      if (selectedOperator === null || previousValue === null || currentValue === 'Error') return;
      const secondValue = Number(currentValue);
      const firstValue = previousValue;
      const operator = selectedOperator;
      const result = performCalculation(firstValue, secondValue, operator);
      if (result === null || !Number.isFinite(result)) {
        showError('Cannot divide by zero');
        return;
      }
      expression.textContent = formatNumber(firstValue) + ' ' + operator + ' ' +
        formatNumber(secondValue) + ' =';
      currentValue = String(Number(result.toPrecision(12)));
      previousValue = null;
      selectedOperator = null;
      shouldResetDisplay = true;
      updateDisplay();
    }

    function clearCalculator() {
      currentValue = '0';
      previousValue = null;
      selectedOperator = null;
      shouldResetDisplay = false;
      expression.textContent = '';
      updateDisplay();
    }

    function deleteLast() {
      if (currentValue === 'Error' || shouldResetDisplay) {
        currentValue = '0';
        shouldResetDisplay = false;
      } else {
        currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
        if (currentValue === '-' || currentValue === '') currentValue = '0';
      }
      updateDisplay();
    }

    function applyPercent() {
      if (currentValue === 'Error') return;
      currentValue = String(Number(currentValue) / 100);
      shouldResetDisplay = false;
      updateDisplay();
    }

    keypad.addEventListener('click', function (event) {
      const button = event.target.closest('button');
      if (!button || !keypad.contains(button)) return;
      if (button.dataset.number !== undefined) {
        enterNumber(button.dataset.number);
      } else if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
      } else {
        switch (button.dataset.action) {
          case 'clear': clearCalculator(); break;
          case 'delete': deleteLast(); break;
          case 'decimal': enterDecimal(); break;
          case 'percent': applyPercent(); break;
          case 'equals': calculate(); break;
        }
      }
    });

    // Keyboard shortcuts work while the floating calculator is open.
    // On the standalone calculator page, they work whenever the page is active.
    document.addEventListener('keydown', function (event) {
      if (calculatorWindow && !calculatorWindow.classList.contains('open')) return;
      const target = event.target;
      const isTypingField = target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      );
      if (isTypingField) return;

      if (/^[0-9]$/.test(event.key)) enterNumber(event.key);
      else if (event.key === '.') enterDecimal();
      else if (event.key === '+') chooseOperator('+');
      else if (event.key === '-') chooseOperator('−');
      else if (event.key === '*') chooseOperator('×');
      else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
      else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculate(); }
      else if (event.key === 'Backspace') { event.preventDefault(); deleteLast(); }
      else if (event.key === 'Escape') clearCalculator();
      else if (event.key === '%') applyPercent();
    });

    updateDisplay();
  }

  function createCalculatorInterface() {
    if ($('df-calculator-styles')) return;

    const style = document.createElement('style');
    style.id = 'df-calculator-styles';
    style.textContent = `
      #df-calculator-launcher{position:fixed;left:24px;bottom:24px;width:58px;height:58px;border:0;border-radius:50%;background:linear-gradient(135deg,#0f9f8f,#087e8b);color:#fff;font-size:25px;cursor:pointer;z-index:9998;box-shadow:0 8px 24px rgba(15,159,143,.35);transition:transform .2s,box-shadow .2s}
      #df-calculator-launcher:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(15,159,143,.45)}
      #df-calculator-window{position:fixed;left:24px;bottom:94px;width:min(340px,calc(100vw - 32px));padding:18px;border:1px solid rgba(148,163,184,.25);border-radius:20px;background:#111827;color:#f8fafc;box-shadow:0 18px 55px rgba(0,0,0,.35);display:none;z-index:9998;font-family:Arial,Helvetica,sans-serif}
      #df-calculator-window.open{display:block}
      .df-calc-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-size:16px;font-weight:700}
      #df-calculator-close{width:30px;height:30px;border:0;border-radius:8px;background:#293548;color:#fff;font-size:20px;cursor:pointer}
      .df-calc-screen{min-height:82px;margin-bottom:13px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;border-radius:12px;background:#080f1d;overflow:hidden}
      #df-calculator-expression{min-height:18px;width:100%;color:#94a3b8;font-size:12px;text-align:right;overflow-wrap:anywhere}
      #df-calculator-display{width:100%;color:#fff;font-size:30px;text-align:right;overflow-wrap:anywhere}
      #df-calculator-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
      #df-calculator-keys button{min-height:48px;border:0;border-radius:11px;background:#26364f;color:#f8fafc;font-size:17px;cursor:pointer;transition:filter .15s,transform .15s}
      #df-calculator-keys button:hover{filter:brightness(1.2)}
      #df-calculator-keys button:active{transform:scale(.96)}
      #df-calculator-keys .utility{background:#475569}
      #df-calculator-keys .operator{background:#075985}
      #df-calculator-keys .equals{background:#0f9f8f}
      #df-calculator-keys .zero{grid-column:span 2}
      .df-calc-hint{margin:11px 0 0;color:#94a3b8;font-size:11px;text-align:center}
      @media(max-width:480px){#df-calculator-launcher{left:16px;bottom:16px;width:52px;height:52px}#df-calculator-window{left:16px;bottom:78px}}
    `;
    document.head.appendChild(style);

    const launcher = document.createElement('button');
    launcher.id = 'df-calculator-launcher';
    launcher.type = 'button';
    launcher.textContent = '🧮';
    launcher.title = 'Open calculator';
    launcher.setAttribute('aria-label', 'Open calculator');
    launcher.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('section');
    panel.id = 'df-calculator-window';
    panel.setAttribute('aria-label', 'Data Filter calculator');

    const heading = document.createElement('div');
    heading.className = 'df-calc-heading';
    const title = document.createElement('span');
    title.textContent = '🧮 Calculator';
    const close = document.createElement('button');
    close.id = 'df-calculator-close';
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close calculator');
    heading.append(title, close);

    const screen = document.createElement('div');
    screen.className = 'df-calc-screen';
    screen.setAttribute('aria-live', 'polite');
    const expression = document.createElement('div');
    expression.id = 'df-calculator-expression';
    const display = document.createElement('div');
    display.id = 'df-calculator-display';
    display.textContent = '0';
    screen.append(expression, display);

    const keys = document.createElement('div');
    keys.id = 'df-calculator-keys';
    const buttons = [
      ['AC', 'utility', 'clear'], ['DEL', 'utility', 'delete'], ['%', 'utility', 'percent'], ['÷', 'operator', 'operator:÷'],
      ['7', '', 'number:7'], ['8', '', 'number:8'], ['9', '', 'number:9'], ['×', 'operator', 'operator:×'],
      ['4', '', 'number:4'], ['5', '', 'number:5'], ['6', '', 'number:6'], ['−', 'operator', 'operator:−'],
      ['1', '', 'number:1'], ['2', '', 'number:2'], ['3', '', 'number:3'], ['+', 'operator', 'operator:+'],
      ['0', 'zero', 'number:0'], ['.', '', 'decimal'], ['=', 'equals', 'equals']
    ];

    buttons.forEach(function (item) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item[0];
      if (item[1]) button.className = item[1];
      if (item[2].startsWith('number:')) button.dataset.number = item[2].split(':')[1];
      else if (item[2].startsWith('operator:')) button.dataset.operator = item[2].split(':')[1];
      else button.dataset.action = item[2];
      keys.appendChild(button);
    });

    const hint = document.createElement('p');
    hint.className = 'df-calc-hint';
    hint.textContent = 'Keyboard supported • Esc to clear';

    panel.append(heading, screen, keys, hint);
    document.body.append(launcher, panel);

    launcher.addEventListener('click', function () {
      const isOpen = panel.classList.toggle('open');
      launcher.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) panel.querySelector('#df-calculator-keys button').focus();
    });

    close.addEventListener('click', function () {
      panel.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    });
  }

  // ------------------------------------------------------------
  // 10. DATA FILTER CHATBOT
  // ------------------------------------------------------------
  function initializeChatbot() {
    if (!$('ai-chat-launcher')) createChatbotInterface();

    const launcher = $('ai-chat-launcher');
    const chatWindow = $('ai-chat-window');
    const closeButton = $('ai-chat-close');
    const form = $('ai-chat-form');
    const input = $('ai-chat-input');
    const messages = $('ai-chat-messages');

    if (!launcher || !chatWindow || !closeButton || !form || !input || !messages) return;

    launcher.addEventListener('click', function () {
      chatWindow.classList.toggle('open');
      if (chatWindow.classList.contains('open')) input.focus();
    });

    closeButton.addEventListener('click', function () {
      chatWindow.classList.remove('open');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      handleUserQuery(input.value);
    });

    document.querySelectorAll('.ai-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        handleUserQuery(chip.getAttribute('data-q') || '');
      });
    });

    function printMessage(messageText, className) {
      const message = document.createElement('div');
      message.className = className;
      message.textContent = messageText;
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
      return message;
    }

    async function handleUserQuery(queryText) {
      const question = String(queryText || '').trim();
      if (!question) return;

      printMessage(question, 'user-msg');
      input.value = '';
      const thinkingMessage = printMessage('Analyzing page...', 'ai-msg');

      const answer = await getBotReply(question);
      thinkingMessage.textContent = answer;
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function createChatbotInterface() {
    if (!$('dataFilterChatStyles')) {
      const style = document.createElement('style');
      style.id = 'dataFilterChatStyles';
      style.textContent = `
        #ai-chat-launcher{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(37,99,235,.4);font-size:24px;display:flex;align-items:center;justify-content:center;z-index:9999;transition:transform .2s ease}
        #ai-chat-launcher:hover{transform:scale(1.08)}
        #ai-chat-window{position:fixed;bottom:96px;right:24px;width:min(360px,calc(100vw - 32px));height:490px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:'Segoe UI',system-ui,sans-serif;border:1px solid #e5e7eb}
        #ai-chat-window.open{display:flex}
        .ai-chat-header{background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;font-weight:600}
        .ai-chat-header button{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1}
        #ai-chat-messages{flex:1;padding:14px;overflow-y:auto;background:#f8fafc;display:flex;flex-direction:column;gap:10px}
        .ai-msg,.user-msg{max-width:84%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.45;overflow-wrap:anywhere;white-space:pre-line}
        .ai-msg{background:#fff;color:#1e293b;align-self:flex-start;border:1px solid #e2e8f0;border-bottom-left-radius:4px}
        .user-msg{background:#2563eb;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
        .ai-chat-suggestions{display:flex;gap:6px;padding:8px 12px;background:#f8fafc;overflow-x:auto;border-top:1px solid #f1f5f9}
        .ai-chip{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:5px 10px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap}
        .ai-chip:hover{background:#dbeafe}
        #ai-chat-form{display:flex;padding:10px;background:#fff;border-top:1px solid #e5e7eb;gap:8px}
        #ai-chat-input{min-width:0;flex:1;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;outline:none;font-size:14px;color:#1e293b}
        #ai-chat-input:focus{border-color:#2563eb}
        #ai-chat-send{background:#2563eb;color:#fff;border:none;padding:0 16px;border-radius:8px;font-weight:600;cursor:pointer}
      `;
      document.head.appendChild(style);
    }

    const user = getLoggedInUser();
    const wrapper = document.createElement('div');

    const launcher = document.createElement('button');
    launcher.id = 'ai-chat-launcher';
    launcher.type = 'button';
    launcher.title = 'Chat with Data Filter assistant';
    launcher.textContent = '💬';

    const chatWindow = document.createElement('section');
    chatWindow.id = 'ai-chat-window';
    chatWindow.setAttribute('aria-label', 'Data Filter assistant chat');

    const header = document.createElement('div');
    header.className = 'ai-chat-header';
    const heading = document.createElement('span');
    heading.textContent = '🤖 Data Filter Assistant' + (user ? ' (' + user.name + ')' : '');
    const closeButton = document.createElement('button');
    closeButton.id = 'ai-chat-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close chat');
    closeButton.textContent = '×';
    header.append(heading, closeButton);

    const messages = document.createElement('div');
    messages.id = 'ai-chat-messages';
    const greeting = document.createElement('div');
    greeting.className = 'ai-msg';
    greeting.textContent = user
      ? 'Hi ' + user.name + '! 👋 Welcome back to Data Filter. Ask me about the table records, features, or your account.'
      : 'Hi there! 👋 I am the Data Filter assistant. Ask me about the table data, features, or login.';
    messages.appendChild(greeting);

    const suggestions = document.createElement('div');
    suggestions.className = 'ai-chat-suggestions';
    [
      ['📊 Count Table Rows', 'Summarize the table data'],
      ['👤 My Account', 'Who am I logged in as?'],
      ['📋 Table Columns', 'What are the table columns?'],
      ['ℹ️ About', 'What is Data Filter?']
    ].forEach(function (item) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ai-chip';
      chip.textContent = item[0];
      chip.setAttribute('data-q', item[1]);
      suggestions.appendChild(chip);
    });

    const form = document.createElement('form');
    form.id = 'ai-chat-form';
    const input = document.createElement('input');
    input.id = 'ai-chat-input';
    input.type = 'text';
    input.placeholder = 'Ask about table data or this site...';
    input.autocomplete = 'off';
    input.required = true;
    const send = document.createElement('button');
    send.id = 'ai-chat-send';
    send.type = 'submit';
    send.textContent = 'Send';
    form.append(input, send);

    chatWindow.append(header, messages, suggestions, form);
    wrapper.append(launcher, chatWindow);
    document.body.appendChild(wrapper);
  }

  function getLoggedInUser() {
    // Read the same key used by the registration/login system first.
    const currentRaw = localStorage.getItem('df_current_user');
    if (currentRaw) {
      try {
        const current = JSON.parse(currentRaw);
        if (current && (current.name || current.email)) {
          return {
            name: current.name || current.email.split('@')[0],
            email: current.email || '',
            business: current.business || ''
          };
        }
      } catch (error) {
        // Try the compatibility keys below.
      }
    }

    const possibleKeys = ['currentUser', 'loggedInUser', 'user', 'userData', 'activeUser'];
    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.name || parsed.username || parsed.fullName || parsed.email)) {
          return {
            name: parsed.name || parsed.username || parsed.fullName || (parsed.email ? parsed.email.split('@')[0] : 'User'),
            email: parsed.email || '',
            business: parsed.business || ''
          };
        }
      } catch (error) {
        if (raw.trim() && raw.trim().length < 40) return { name: raw.trim(), email: '', business: '' };
      }
    }

    const directName = localStorage.getItem('userName') || localStorage.getItem('username');
    return directName
      ? { name: directName, email: localStorage.getItem('userEmail') || '', business: '' }
      : null;
  }

  function analyzePageTable(searchQuery) {
    const table = document.querySelector('table');
    if (!table) return { hasTable: false, summary: 'No data table detected on this page.' };

    const headerCells = Array.from(table.querySelectorAll('thead th, tr:first-child th'));
    const headers = headerCells.map(cell => cell.textContent.trim());
    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    const allRows = bodyRows.length
      ? bodyRows
      : Array.from(table.querySelectorAll('tr')).slice(headers.length ? 1 : 0);

    const visibleRows = allRows.filter(function (row) {
      const style = window.getComputedStyle(row);
      return style.display !== 'none' && style.visibility !== 'hidden' && !row.hidden;
    });

    const rowData = visibleRows.map(row =>
      Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim()).join(' | ')
    );

    const query = String(searchQuery || '').trim().toLowerCase();
    const matches = query ? rowData.filter(row => row.toLowerCase().includes(query)) : [];

    return {
      hasTable: true,
      headers: headers,
      totalRows: allRows.length,
      visibleRows: visibleRows.length,
      sampleRows: rowData.slice(0, 15),
      matches: matches
    };
  }

  async function getBotReply(userText) {
    const clean = userText.toLowerCase().trim();
    const user = getLoggedInUser();
    const tableInfo = analyzePageTable();

    // Optional Gemini integration. Keep the key empty for the built-in assistant.
    // Do not put a real secret API key in front-end JavaScript on a public website.
    const GEMINI_API_KEY = '';
    if (GEMINI_API_KEY) {
      try {
        const systemContext = `You are the assistant for the Data Filter web application.\nLogged-in user: ${user ? user.name + ' (' + (user.email || 'no email') + ')' : 'Guest'}.\nTable: ${tableInfo.hasTable ? 'Total rows ' + tableInfo.totalRows + ', visible rows ' + tableInfo.visibleRows + ', columns ' + tableInfo.headers.join(', ') + ', sample ' + tableInfo.sampleRows.join(' || ') : 'No HTML table on this page.'}\nAnswer accurately and briefly.`;
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemContext + '\n\nUser question: ' + userText }] }] })
          }
        );
        if (!response.ok) throw new Error('Gemini request failed');
        const result = await response.json();
        const answer = result && result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]
          ? result.candidates[0].content.parts[0].text
          : '';
        if (answer) return answer;
      } catch (error) {
        console.warn('AI service unavailable; using the built-in assistant.', error);
      }
    }

    if (clean.includes('who am i') || clean.includes('my name') || clean.includes('my account') || clean.includes('logged in')) {
      return user
        ? 'You are currently logged in as ' + user.name + (user.email ? ' (' + user.email + ')' : '') + '.'
        : "You are browsing as a guest. Please log in or register to use your account.";
    }

    if (clean.includes('how many') || clean.includes('count') || clean.includes('summarize') || clean.includes('rows') || clean.includes('records')) {
      if (!tableInfo.hasTable) return 'I do not see a data table on this page. Open the main Data Filter dashboard to analyze records.';
      return '📊 Live Table Status:\n• Total Records: ' + tableInfo.totalRows + '\n• Visible Records: ' + tableInfo.visibleRows + '\n• Columns: ' + (tableInfo.headers.join(', ') || 'Not available');
    }

    if (clean.includes('column') || clean.includes('header') || clean.includes('fields')) {
      return tableInfo.hasTable
        ? '📋 Table columns: ' + (tableInfo.headers.join(' | ') || 'No column headings found.')
        : 'No table is loaded on this page right now.';
    }

    if (/^(find|search|filter)\s+/i.test(clean)) {
      const term = clean.replace(/^(find|search|filter)\s+/i, '').trim();
      if (!tableInfo.hasTable) return 'There is no table on this page to search.';
      const result = analyzePageTable(term);
      return result.matches.length
        ? '🔍 Found ' + result.matches.length + ' matching visible row(s):\n• ' + result.matches.slice(0, 3).join('\n• ')
        : 'No visible rows matched "' + term + '". Try another keyword or clear some filters.';
    }

    if (clean.includes('what is') || clean.includes('about')) {
      return 'Data Filter is a web application for searching, filtering, and analyzing dataset records with personalized user accounts.';
    }

    if (clean.includes('price') || clean.includes('free') || clean.includes('cost')) {
      return 'This project demo does not currently process payments. Check with the project owner for deployment or service costs.';
    }

    if (clean.includes('hi') || clean.includes('hello') || clean.includes('hey')) {
      return user
        ? 'Hey ' + user.name + '! Want me to count the table rows or search for a record?'
        : 'Hello! Ask me to count the table rows, list the columns, or search for a keyword.';
    }

    return 'I can help analyze this page. Try asking: “Summarize the table data”, “What are the table columns?”, “Find [keyword]”, or “Who am I logged in as?”.';
  }
})();

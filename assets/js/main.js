/* ============================================================
   Royal Enfield Finance Page – main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================
     1. HAMBURGER / MOBILE NAV
     ======================================================== */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ========================================================
     2. NAVBAR SCROLL SHADOW
     ======================================================== */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  /* ========================================================
     3. EMI CALCULATOR
     ======================================================== */
  const sliders = {
    price:    document.getElementById('sliderPrice'),
    down:     document.getElementById('sliderDown'),
    rate:     document.getElementById('sliderRate'),
    tenure:   document.getElementById('sliderTenure'),
  };
  const displays = {
    price:    document.getElementById('valPrice'),
    down:     document.getElementById('valDown'),
    rate:     document.getElementById('valRate'),
    tenure:   document.getElementById('valTenure'),
  };

  function calcEMI() {
    if (!sliders.price) return;
    const price   = parseInt(sliders.price.value);
    const down    = parseInt(sliders.down.value);
    const rateAnn = parseFloat(sliders.rate.value);
    const months  = parseInt(sliders.tenure.value);

    // Update display values
    displays.price.textContent  = '₹' + price.toLocaleString('en-IN');
    displays.down.textContent   = '₹' + down.toLocaleString('en-IN');
    displays.rate.textContent   = rateAnn.toFixed(1) + '%';
    displays.tenure.textContent = months + ' Mo';

    // EMI formula
    const principal = price - down;
    const r = rateAnn / (12 * 100);
    let emi;
    if (r === 0) {
      emi = principal / months;
    } else {
      emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    }

    const totalPayable  = emi * months;
    const totalInterest = totalPayable - principal;

    // Update result elements
    const emiEl = document.getElementById('resultEMI');
    const loanEl = document.getElementById('resultLoan');
    const intEl  = document.getElementById('resultInterest');
    const totalEl = document.getElementById('resultTotal');

    if (emiEl)   emiEl.textContent   = '₹' + Math.round(emi).toLocaleString('en-IN');
    if (loanEl)  loanEl.textContent  = '₹' + principal.toLocaleString('en-IN');
    if (intEl)   intEl.textContent   = '₹' + Math.round(totalInterest).toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = '₹' + Math.round(totalPayable).toLocaleString('en-IN');

    // Clamp down payment slider max to bike price
    if (sliders.down) {
      sliders.down.max = price - 10000;
      if (parseInt(sliders.down.value) > price - 10000) {
        sliders.down.value = price - 10000;
      }
    }
  }

  Object.values(sliders).forEach(s => {
    if (s) s.addEventListener('input', calcEMI);
  });

  calcEMI(); // initial

  /* ========================================================
     4. FINANCE FORM VALIDATION
     ======================================================== */
  const financeForm = document.getElementById('financeForm');

  if (financeForm) {
    const rules = {
      fullName:   { required: true, minLen: 2, pattern: /^[A-Za-z\s]+$/, patternMsg: 'Only alphabets allowed.' },
      email:      { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMsg: 'Enter a valid email address.' },
      mobile:     { required: true, pattern: /^[6-9]\d{9}$/, patternMsg: 'Enter a valid 10-digit Indian mobile number.' },
      city:       { required: true, minLen: 2 },
      model:      { required: true },
      employType: { required: true },
      loanAmount: { required: true },
      tenure:     { required: true },
      agreeTerms: { required: true, isCheckbox: true },
    };

    function validateField(name, value, el) {
      const rule  = rules[name];
      const group = el.closest('.form-group') || el.closest('.checkbox-group');
      if (!rule || !group) return true;

      let msg = '';

      if (rule.isCheckbox) {
        if (!el.checked) msg = 'You must agree to the terms and conditions.';
      } else {
        if (rule.required && !value.trim()) {
          msg = 'This field is required.';
        } else if (value.trim() && rule.minLen && value.trim().length < rule.minLen) {
          msg = `Minimum ${rule.minLen} characters required.`;
        } else if (value.trim() && rule.pattern && !rule.pattern.test(value.trim())) {
          msg = rule.patternMsg || 'Invalid input.';
        }
      }

      const errEl = group.querySelector('.error-msg');
      if (msg) {
        group.classList.add('has-error');
        if (errEl) errEl.textContent = msg;
        return false;
      } else {
        group.classList.remove('has-error');
        if (errEl) errEl.textContent = '';
        return true;
      }
    }

    // Real-time validation on blur
    financeForm.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('blur', () => validateField(el.name, el.value, el));
      el.addEventListener('input', () => {
        if (el.closest('.form-group')?.classList.contains('has-error')) {
          validateField(el.name, el.value, el);
        }
      });
    });

    // Submit
    financeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      Object.keys(rules).forEach(name => {
        const el = financeForm.querySelector(`[name="${name}"]`);
        if (el) {
          const val = rules[name].isCheckbox ? el.checked : el.value;
          if (!validateField(name, String(val), el)) valid = false;
        }
      });

      if (valid) {
        // Show success
        const formBody    = document.getElementById('formBody');
        const formSuccess = document.getElementById('formSuccess');
        if (formBody && formSuccess) {
          formBody.style.display    = 'none';
          formSuccess.style.display = 'block';
        }
      } else {
        // Scroll to first error
        const firstErr = financeForm.querySelector('.has-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* ========================================================
     5. DOCS TABS
     ======================================================== */
  const docsTabBtns = document.querySelectorAll('.docs-tab');
  const docsContents = document.querySelectorAll('.docs-content');

  docsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      docsTabBtns.forEach(b => b.classList.remove('active'));
      docsContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetEl = document.getElementById('docs-' + target);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  /* ========================================================
     6. FAQ ACCORDION
     ======================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      faqItems.forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ========================================================
     7. SCROLL REVEAL (simple intersection observer)
     ======================================================== */
  const revealEls = document.querySelectorAll(
    '.bike-card, .step-card, .testimonial-card, .doc-item, .faq-item'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  /* ========================================================
     8. SMOOTH SCROLL for anchor links
     ======================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--re-nav-h'));
        const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ========================================================
     9. Mobile number: allow digits only
     ======================================================== */
  const mobileInput = document.getElementById('mobile');
  if (mobileInput) {
    mobileInput.addEventListener('input', () => {
      mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

});

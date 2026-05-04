document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.header');
  var floatingCta = document.querySelector('.floating-cta');
  var heroHeight = document.querySelector('.hero').offsetHeight;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    if (scrollY > 50) {
      header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    } else {
      header.style.boxShadow = 'none';
    }

    if (floatingCta) {
      if (scrollY > heroHeight) {
        floatingCta.style.transform = 'translateY(0)';
      } else {
        floatingCta.style.transform = 'translateY(100%)';
      }
    }
  });

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var submitBtn = contactForm.querySelector('.btn-submit');
    var inputs = contactForm.querySelectorAll('input[required], textarea[required]');

    function sanitize(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
      return /^[\d\-+() ]{6,20}$/.test(phone);
    }

    function validateForm() {
      var allFilled = true;
      inputs.forEach(function (input) {
        if (input.type === 'checkbox') {
          if (!input.checked) allFilled = false;
        } else if (!input.value.trim()) {
          allFilled = false;
        }
      });
      var emailInput = document.getElementById('email');
      var phoneInput = document.getElementById('phone');
      if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) allFilled = false;
      if (phoneInput && phoneInput.value && !isValidPhone(phoneInput.value)) allFilled = false;
      submitBtn.disabled = !allFilled;
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', validateForm);
      input.addEventListener('change', validateForm);
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = {};
      var textInputs = contactForm.querySelectorAll('input:not([type="checkbox"]), textarea');
      textInputs.forEach(function (input) {
        formData[input.name] = sanitize(input.value.trim());
      });
      var emailInput = document.getElementById('email');
      var phoneInput = document.getElementById('phone');
      if (!isValidEmail(emailInput.value)) return;
      if (!isValidPhone(phoneInput.value)) return;
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';
      console.log('Form data (sanitized):', formData);
      submitBtn.textContent = '送信完了';
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = header.offsetHeight + 16;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
});

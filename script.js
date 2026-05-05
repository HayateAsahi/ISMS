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
    var feedback = document.getElementById('contactFeedback');
    var inputs = contactForm.querySelectorAll('input[required], textarea[required]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';
    var isSubmitting = false;
    var emailInput = document.getElementById('email');
    var phoneInput = document.getElementById('phone');
    var emailError = document.getElementById('contactEmailError');
    var phoneError = document.getElementById('contactPhoneError');

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
      return /^[\d\-+() ]{6,20}$/.test(phone);
    }

    function syncFieldError(input, error, message, validator) {
      if (!input || !error) return true;

      var value = input.value.trim();
      var hasFormatError = value !== '' && !validator(value);

      input.setCustomValidity(hasFormatError ? message : '');
      input.setAttribute('aria-invalid', hasFormatError ? 'true' : 'false');
      error.textContent = hasFormatError ? message : '';

      return !hasFormatError;
    }

    function syncFieldErrors() {
      var emailIsValid = syncFieldError(
        emailInput,
        emailError,
        'メールアドレスの形式が正しくありません。',
        isValidEmail
      );
      var phoneIsValid = syncFieldError(
        phoneInput,
        phoneError,
        '電話番号は数字・ハイフンを含む6〜20文字で入力してください。',
        isValidPhone
      );

      return emailIsValid && phoneIsValid;
    }

    function validateForm() {
      syncFieldErrors();
      var allFilled = true;
      inputs.forEach(function (input) {
        if (input.type === 'checkbox') {
          if (!input.checked) allFilled = false;
        } else if (!input.value.trim()) {
          allFilled = false;
        }
      });
      if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) allFilled = false;
      if (phoneInput && phoneInput.value && !isValidPhone(phoneInput.value)) allFilled = false;
      submitBtn.disabled = isSubmitting || !allFilled;
    }

    function setFeedback(message, type) {
      if (!feedback) return;

      feedback.textContent = message;
      feedback.className = 'contact-form__feedback';

      if (type) {
        feedback.classList.add('contact-form__feedback--' + type);
      }
    }

    function applyFeedbackFromQuery() {
      var params = new URLSearchParams(window.location.search);
      var status = params.get('contact_status');
      var message = params.get('contact_message');

      if (!status || !message) return;

      setFeedback(message, status === 'success' ? 'success' : 'error');
      params.delete('contact_status');
      params.delete('contact_message');

      var nextSearch = params.toString();
      var nextUrl = window.location.pathname + (nextSearch ? '?' + nextSearch : '') + window.location.hash;
      window.history.replaceState({}, document.title, nextUrl);
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', validateForm);
      input.addEventListener('change', validateForm);
    });

    applyFeedbackFromQuery();
    validateForm();

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var hasValidInlineFields = syncFieldErrors();

      if (!contactForm.checkValidity()) {
        if (hasValidInlineFields) {
          contactForm.reportValidity();
        }
        validateForm();
        return;
      }

      if (!isValidEmail(emailInput.value)) return;
      if (!isValidPhone(phoneInput.value)) return;

      var formData = new FormData(contactForm);
      submitBtn.disabled = true;
      isSubmitting = true;
      setFeedback('');
      submitBtn.textContent = '送信中...';

      fetch(contactForm.getAttribute('action') || 'contact.php', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      })
        .then(function (response) {
          return response.json().catch(function () {
            return null;
          }).then(function (result) {
            if (!response.ok || !result || !result.data || !result.data.sent) {
              var fields = result && result.error && result.error.fields;
              var firstFieldError = fields ? Object.values(fields)[0] : '';
              var message = firstFieldError || (result && result.error && result.error.message) || 'お問い合わせの送信に失敗しました。時間をおいて再度お試しください。';
              throw new Error(message);
            }

            setFeedback(result.data.message || 'お問い合わせを受け付けました。', 'success');
            contactForm.reset();
          });
        })
        .catch(function (error) {
          setFeedback(error && error.message ? error.message : 'お問い合わせの送信に失敗しました。時間をおいて再度お試しください。', 'error');
        })
        .finally(function () {
          isSubmitting = false;
          submitBtn.textContent = submitLabel;
          validateForm();
        });
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

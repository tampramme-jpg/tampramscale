/**
 * TamPramScale — Main Interactive Engine
 * Fully portable for GitHub Pages (/tampramscales/) & custom root domain.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initAccordion();
  initFormHandler();
});

// 1. Sticky Header elevation on scroll
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 2. Mobile Drawer Navigation & Accessibility
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (!toggleBtn || !drawer) return;

  const toggle = (forceClose = false) => {
    const isOpen = forceClose ? false : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggle());

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggle(true);
    }
  });

  // Close when clicking nav links
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggle(true));
  });
}

// 3. Accessible FAQ Accordion (Enforce single open item)
function initAccordion() {
  const accordions = document.querySelectorAll('.faq-accordion details');
  accordions.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        accordions.forEach(other => {
          if (other !== item) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });
}

// 4. Contact Form Static Handling (Formspree + CAPTCHA verification placeholder)
function initFormHandler() {
  const form = document.getElementById('agencyContactForm');
  if (!form) return;

  const statusBox = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Check Honeypot spam trap
    const honey = form.querySelector('input[name="_gotcha"]');
    if (honey && honey.value) return;

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending Message...';
    if (statusBox) statusBox.style.display = 'none';

    try {
      const formData = new FormData(form);
      const endpoint = form.getAttribute('action');

      // Check if endpoint is still placeholder
      if (!endpoint || endpoint.includes('YOUR_FORMSPREE_ENDPOINT')) {
        throw new Error('Please configure your Formspree endpoint in the form action attribute before sending.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        if (statusBox) {
          statusBox.className = 'form-status success';
          statusBox.textContent = 'Thank you! Your message has been sent successfully. We will get back to you within 24 hours.';
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed. Please contact us directly at tampram.me@gmail.com');
      }
    } catch (err) {
      if (statusBox) {
        statusBox.className = 'form-status error';
        statusBox.textContent = err.message || 'An error occurred. Please try again or WhatsApp us at +91 9002872727.';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}
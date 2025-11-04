document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  // Validation
  if (!name || !email || !subject || !message) {
    showToast('⚠️ Please fill in all fields.', 'error');
    return;
  }

  try {
    const response = await fetch('https://getform.io/f/bgdjmjja', {
      method: 'POST',
      body: new FormData(this),
    });

    if (response.ok) {
      showToast('✅ Message sent successfully! Thank you for reaching out.', 'success');
      this.reset();
    } else {
      showToast('❌ Something went wrong. Please try again.', 'error');
    }
  } catch (error) {
    showToast('⚠️ Network error. Please try again later.', 'error');
  }
});

// Toast Notification Function
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

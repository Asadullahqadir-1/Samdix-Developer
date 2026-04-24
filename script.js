const revealElements = document.querySelectorAll('.reveal');
const staggerItems = document.querySelectorAll('.stagger-item');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((el) => revealObserver.observe(el));

const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const items = entry.target.querySelectorAll('.stagger-item');
      items.forEach((item, index) => {
        item.style.animationDelay = `${index * 90}ms`;
        item.classList.add('is-visible');
      });

      staggerObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

const staggerWraps = document.querySelectorAll('.stagger-wrap');
staggerWraps.forEach((wrap) => staggerObserver.observe(wrap));

const contactForm = document.querySelector('#contact-form');
const statusMessage = document.querySelector('#form-status');

if (contactForm && statusMessage) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const projectType = String(formData.get('projectType') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !projectType || !message) {
      statusMessage.textContent = 'Please complete all fields before sending.';
      return;
    }

    const recipients = 'samdixdev@gmail.com,Samdixdeveloper@gmail.com';
    const subject = encodeURIComponent(`New Project Inquiry: ${projectType}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject Type: ${projectType}\n\nProject Brief:\n${message}`
    );

    statusMessage.textContent = 'Opening your email app to send the inquiry...';
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    contactForm.reset();
  });
}

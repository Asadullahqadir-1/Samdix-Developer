const revealElements = document.querySelectorAll('.reveal');
const staggerItems = document.querySelectorAll('.stagger-item');

function removeLogoBackground(img) {
  if (!img || img.dataset.bgRemoved === 'true') {
    return;
  }

  const processImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    if (!canvas.width || !canvas.height) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.drawImage(img, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a === 0) {
        continue;
      }

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isNearBlack = max < 58 || (max < 84 && max - min < 20);

      if (isNearBlack) {
        pixels[i + 3] = 0;
      }
    }

    context.putImageData(imageData, 0, 0);
    img.src = canvas.toDataURL('image/png');
    img.dataset.bgRemoved = 'true';
  };

  if (img.complete) {
    processImage();
  } else {
    img.addEventListener('load', processImage, { once: true });
  }
}

const logoImage = document.querySelector('#site-logo');
removeLogoBackground(logoImage);

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

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

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = pixels[(y * canvas.width + x) * 4 + 3];
        if (alpha < 18) {
          continue;
        }

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX >= minX && maxY >= minY) {
      const trimmedCanvas = document.createElement('canvas');
      const trimmedWidth = maxX - minX + 1;
      const trimmedHeight = maxY - minY + 1;

      trimmedCanvas.width = trimmedWidth;
      trimmedCanvas.height = trimmedHeight;

      const trimmedContext = trimmedCanvas.getContext('2d');
      if (trimmedContext) {
        trimmedContext.drawImage(
          canvas,
          minX,
          minY,
          trimmedWidth,
          trimmedHeight,
          0,
          0,
          trimmedWidth,
          trimmedHeight
        );
        img.src = trimmedCanvas.toDataURL('image/png');
      }
    } else {
      img.src = canvas.toDataURL('image/png');
    }

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
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const projectType = String(formData.get('projectType') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const contactTime = String(formData.get('contact_time') || '').trim();

    if (!name || !email || !projectType || !message) {
      statusMessage.textContent = 'Please complete all fields before sending.';
      return;
    }

    statusMessage.textContent = 'Sending your message...';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          projectType,
          message,
          contact_time: contactTime
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || 'Submission failed');
      }

      statusMessage.textContent = 'Message sent successfully. We will get back to you soon.';
      contactForm.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      statusMessage.textContent = errorMessage
        ? `Unable to send: ${errorMessage}`
        : 'Unable to send right now. Please try again in a moment or email samdixdev@gmail.com.';
    }
  });
}

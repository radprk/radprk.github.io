// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to navigation links on scroll
window.addEventListener('scroll', () => {
    const allSections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.main-nav a');
    
    let current = '';
    
    allSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add fade-in animation for cards
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.experience-card, .beyond-card, .project-card').forEach(card => {
    observer.observe(card);
});

// Navigation background change on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = 'none';
    }
});

// Mobile navigation toggle
const createMobileNav = () => {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-btn');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    nav.querySelector('.nav-content').appendChild(mobileMenuBtn);
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
};

// Initialize mobile navigation
if (window.innerWidth <= 768) {
    createMobileNav();
}

// Add animation to elements when they come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.project-card, .skill-category, .about-content');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });
};

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const submitButton = document.getElementById('submit-button');

    // Simple fade-in animation for elements
    const fadeInElements = document.querySelectorAll('.contact-header, .contact-info, .contact-form');
    fadeInElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Sending...</span>';

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Here you would typically send the data to your backend
            // For GitHub Pages, you might want to use a form submission service
            // like Formspree, Netlify Forms, or a similar service
            console.log('Form data:', data);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';

            // Reset form
            form.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
                form.style.display = 'block';
            }, 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error sending your message. Please try again.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
        }
    });
});

// Accordion functionality for Education & Campus Life

document.addEventListener('DOMContentLoaded', function () {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      // Collapse all
      accordionHeaders.forEach(h => {
        h.setAttribute('aria-expanded', 'false');
        h.nextElementSibling.style.display = 'none';
      });
      // Expand this one if it was not already expanded
      if (!expanded) {
        this.setAttribute('aria-expanded', 'true');
        this.nextElementSibling.style.display = 'block';
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme
    if (!document.body.getAttribute('data-theme')) {
        document.body.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');
    }

    if (themeToggle) {
        themeToggle.onclick = function() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            // Update icon
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        };
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const allSections = document.querySelectorAll('section');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        allSections.forEach(section => {
            const content = section.textContent.toLowerCase();
            const isVisible = content.includes(searchTerm);
            section.style.display = isVisible ? 'block' : 'none';
        });
    });

    // Accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            
            const panel = header.nextElementSibling;
            panel.style.display = isExpanded ? 'none' : 'block';
        });
    });

    // Image modal functionality
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');

    function bindImageLinks() {
        const imageLinks = document.querySelectorAll('.image-link');
        imageLinks.forEach(link => {
            link.onclick = function(e) {
                e.preventDefault();
                const imagePath = this.getAttribute('data-image');
                modalImg.src = imagePath;
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            };
        });
    }

    bindImageLinks();

    closeModal.onclick = function() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    window.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    };

    // If content is dynamically updated, re-bind image links
    const observer = new MutationObserver(bindImageLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 60;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to navigation links based on scroll position
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.main-nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}); 



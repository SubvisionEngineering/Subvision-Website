// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Counter animation for stats
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the value, the faster the animation
    
    // Start counters when they come into view
    const observerOptions = {
      threshold: 0.5,
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'));
          let count = 0;
          const updateCount = () => {
            const increment = target / speed;
            if (count < target) {
              count += increment;
              counter.innerText = Math.floor(count);
              setTimeout(updateCount, 1);
            } else {
              counter.innerText = target;
            }
          };
          updateCount();
          observer.unobserve(counter);
        }
      });
    }, observerOptions);
    
    counters.forEach(counter => {
      observer.observe(counter);
    });
    
    // Scroll animations for story containers
    const storyContainers = document.querySelectorAll('.story-container');
    
    const storyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          storyObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });
    
    storyContainers.forEach(container => {
      storyObserver.observe(container);
    });
    
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.nav-links-mobile');
    
    hamburger.addEventListener('click', function() {
      setTimeout(() => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
      }, 200); // Delay to allow CSS transition
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          // Close mobile menu if open
          if (mobileNav.classList.contains('active')) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
          }
          
          window.scrollTo({
            top: target.offsetTop - 100, // Offset for fixed header
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Form submission handling with validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic form validation
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        
        let isValid = true;
        
        if (!name.value.trim()) {
          highlightError(name);
          isValid = false;
        } else {
          removeError(name);
        }
        
        if (!email.value.trim() || !isValidEmail(email.value)) {
          highlightError(email);
          isValid = false;
        } else {
          removeError(email);
        }
        
        if (!message.value.trim()) {
          highlightError(message);
          isValid = false;
        } else {
          removeError(message);
        }
        
        if (isValid) {
          // Here you would typically send the form data to a server
          // For now, we'll just show a success message
          contactForm.innerHTML = `
            <div class="success-message">
              <h3>Thank you for your interest!</h3>
              <p>We've received your message and will be in touch soon.</p>
            </div>
          `;
        }
      });
    }
    
    function highlightError(element) {
      element.style.borderColor = '#e74c3c';
      element.parentElement.classList.add('error');
    }
    
    function removeError(element) {
      element.style.borderColor = '';
      element.parentElement.classList.remove('error');
    }
    
    function isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
    
    // Interactive hover effects for contribution level cards
    const levelCards = document.querySelectorAll('.level-card');
    
    levelCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#1a1a1a';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#111';
      });
    });
    
    // Add animations for elements as they come into view
    const fadeElements = document.querySelectorAll('.impact-stats-header, .impact-message, .contributor-header, .level-card, .connect-wrapper');
    
    const fadeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });
    
    fadeElements.forEach(element => {
      fadeObserver.observe(element);
    });
  });
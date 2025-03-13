document.addEventListener("DOMContentLoaded", () => {
    // Counter animation for statistics
    const counters = document.querySelectorAll(".counter")
    const speed = 200 // The lower the slower
  
    // Intersection Observer for counter animation
    // const counterObserver = new IntersectionObserver(
    //   (entries) => {
    //     entries.forEach((entry) => {
    //       if (entry.isIntersecting) {
    //         const counter = entry.target
    //         const target = Number.parseInt(counter.closest(".stat-item").dataset.count)
    //         let count = 0
  
    //         const updateCount = () => {
    //           const increment = target / speed
    //           if (count < target) {
    //             count += increment
    //             counter.innerText = Math.ceil(count)
    //             setTimeout(updateCount, 1)
    //           } else {
    //             counter.innerText = target
    //           }
    //         }
  
    //         updateCount()
    //         counterObserver.unobserve(counter)
    //       }
    //     })
    //   },
    //   { threshold: 0.5 },
    // )
  
    // counters.forEach((counter) => {
    //   counterObserver.observe(counter)
    // })
  
    // Animate story cards on scroll
    // const storyCards = document.querySelectorAll(".story-card")
  
    // const storyObserver = new IntersectionObserver(
    //   (entries) => {
    //     entries.forEach((entry) => {
    //       if (entry.isIntersecting) {
    //         entry.target.classList.add("animate")
    //         storyObserver.unobserve(entry.target)
    //       }
    //     })
    //   },
    //   { threshold: 0.2 },
    // )
  
    // storyCards.forEach((card) => {
    //   storyObserver.observe(card)
    // })
  
    // Mobile navigation toggle
    const hamburger = document.querySelector(".hamburger")
    const mobileNav = document.querySelector(".nav-links-mobile")
  
    if (hamburger && mobileNav) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active")
        mobileNav.classList.toggle("active")
      })
    }
  
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
  
        const targetId = this.getAttribute("href")
        if (targetId === "#") return
  
        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          // Close mobile menu if open
          if (hamburger && hamburger.classList.contains("active")) {
            hamburger.classList.remove("active")
            mobileNav.classList.remove("active")
          }
  
          // Scroll to target
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  
    // Form submission handling
    const contactForm = document.querySelector(".contact-form")
  
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault()
  
        // Get form data
        const formData = new FormData(this)
        const formObject = {}
  
        formData.forEach((value, key) => {
          formObject[key] = value
        })
  
        // Here you would typically send the data to your server
        // For demonstration, we'll just show a success message
  
        // Create success message
        const successMessage = document.createElement("div")
        successMessage.className = "form-success fade-in"
        successMessage.innerHTML = `
          <h3>Thank you for your interest!</h3>
          <p>We've received your message and will get back to you shortly.</p>
        `
  
        // Replace form with success message
        contactForm.innerHTML = ""
        contactForm.appendChild(successMessage)
  
        // Log form data to console (for demonstration)
        console.log("Form submitted:", formObject)
      })
    }
  
    // Add placeholder images if real images aren't available
    document.querySelectorAll(".image-container img").forEach((img) => {
      img.addEventListener("error", function () {
        // If image fails to load, replace with placeholder
        const width = this.width || 400
        const height = this.height || 300
        this.src = `/placeholder.svg?width=${width}&height=${height}`
      })
    })
  })
  document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation toggle
    const hamburger = document.querySelector(".hamburger")
    const mobileNav = document.querySelector(".nav-links-mobile")
  
    if (hamburger && mobileNav) {
      hamburger.addEventListener("click", function () {
        this.classList.toggle("active")
        mobileNav.classList.toggle("active")
      })
    }
  
    // Counter animation for statistics
    const counters = document.querySelectorAll(".counter")
    const speed = 200 // The lower the slower
  
    function animateCounters() {
      counters.forEach((counter) => {
        const target = Number.parseInt(counter.closest(".stat-item").dataset.count)
        let count = 0
  
        const updateCount = () => {
          const increment = target / speed
          if (count < target) {
            count += increment
            counter.innerText = Math.ceil(count)
            setTimeout(updateCount, 1)
          } else {
            counter.innerText = target
          }
        }
  
        updateCount()
      })
    }
  
    // Animate story cards on scroll
    const storyCards = document.querySelectorAll(".story-card")
  
    function animateOnScroll() {
      storyCards.forEach((card) => {
        const cardPosition = card.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.3
  
        if (cardPosition < screenPosition) {
          card.classList.add("animate")
        }
      })
    }
  
    // Initialize animations
    setTimeout(animateCounters, 500)
  
    // Add scroll event listener for animations
    window.addEventListener("scroll", animateOnScroll)
    // Trigger once on load to check for elements already in view
    animateOnScroll()
  
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
  
        const targetId = this.getAttribute("href")
        if (targetId === "#") return
  
        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          // Close mobile menu if open
          if (hamburger && hamburger.classList.contains("active")) {
            hamburger.classList.remove("active")
            mobileNav.classList.remove("active")
          }
  
          // Scroll to target
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Offset for fixed header
            behavior: "smooth",
          })
        }
      })
    })
  
    // Form submission handling
    const contactForm = document.querySelector(".contact-form")
  
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault()
  
        // Get form data
        const formData = new FormData(this)
        const formObject = {}
  
        formData.forEach((value, key) => {
          formObject[key] = value
        })
  
        // Here you would typically send the data to your server
        // For demonstration, we'll just show a success message
  
        // Create success message
        const successMessage = document.createElement("div")
        successMessage.className = "form-success fade-in"
        successMessage.innerHTML = `
          <h3 style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 1rem;">Thank you for your interest!</h3>
          <p style="color: #555;">We've received your message and will get back to you shortly.</p>
        `
  
        // Replace form with success message
        contactForm.innerHTML = ""
        contactForm.appendChild(successMessage)
  
        // Log form data to console (for demonstration)
        console.log("Form submitted:", formObject)
      })
    }
  
    // Add placeholder images if real images aren't available
    document.querySelectorAll(".image-container img").forEach((img) => {
      img.addEventListener("error", function () {
        // If image fails to load, replace with placeholder
        const width = this.width || 400
        const height = this.height || 300
        this.src = `https://via.placeholder.com/${width}x${height}/4a90e2/ffffff?text=SubVision`
      })
    })
  
    // Add fallback icons if SVG icons aren't available
    const iconElements = document.querySelectorAll(".option-icon, .contact-icon")
    iconElements.forEach((icon) => {
      // Check if background image loaded successfully
      const computedStyle = getComputedStyle(icon)
      const backgroundImage = computedStyle.backgroundImage
  
      if (backgroundImage === "none" || backgroundImage === "") {
        // Background image didn't load, fallback is already in CSS
        console.log("Using fallback icon for", icon.className)
      }
    })
  })
  
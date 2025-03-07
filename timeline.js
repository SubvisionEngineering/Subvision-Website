document.addEventListener('DOMContentLoaded', () => {
  const timelineContainer = document.querySelector('.timeline-container');
  const progressLine = document.querySelector('.timeline-progress');
  const movingDot = document.querySelector('.moving-dot');
  const timelineMonths = document.querySelectorAll('.timeline-month');
  const timelineDetails = document.querySelectorAll('.timeline-details');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });
  
  timelineDetails.forEach(detail => {
    observer.observe(detail);
  });

  // Add scroll animation for the blue dot and month highlighting
  window.addEventListener('scroll', () => {
    const timelineRect = timelineContainer.getBoundingClientRect();
    const timelineStart = timelineRect.top;
    const timelineHeight = timelineRect.height;
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll progress
    let scrollProgress = 0;
    
    if (timelineStart < 0) {
      scrollProgress = Math.min((-timelineStart) / (timelineHeight - viewportHeight), 1);
    }

    // Update progress line height
    progressLine.style.height = `${scrollProgress * 100}%`;

    // Calculate dot position
    const dotPosition = scrollProgress * timelineHeight;

    // Check each month's position and highlight if dot is nearby
    timelineMonths.forEach(month => {
      const monthRect = month.getBoundingClientRect();
      const monthCenter = monthRect.top + monthRect.height / 2;
      const dotCenter = timelineRect.top + dotPosition;
      
      // If dot is within 50px of month center, add active class
      if (Math.abs(monthCenter - dotCenter) < 50) {
        month.classList.add('active');
      } else {
        month.classList.remove('active');
      }
    });

    // Check if we've reached the end
    if (scrollProgress >= 0.99) {
      movingDot.classList.add('at-end');
      document.querySelector('.timeline-line').classList.add('reached-end');
    } else {
      movingDot.classList.remove('at-end');
      document.querySelector('.timeline-line').classList.remove('reached-end');
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const timelineContainer = document.querySelector('.timeline-container');
  const progressContainer = document.querySelector('.timeline-progress-container');
  const progressLine = document.querySelector('.timeline-progress');
  const movingDot = document.querySelector('.moving-dot');
  const timelineMonths = document.querySelectorAll('.timeline-month');
  const timelineLine = document.querySelector('.timeline-line');
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

  let lastScrollPosition = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    lastScrollPosition = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTimeline(lastScrollPosition);
        ticking = false;
      });
      ticking = true;
    }
  });

  function updateTimeline() {
    const timelineRect = timelineContainer.getBoundingClientRect();
    const timelineStart = timelineRect.top;
    const timelineHeight = timelineRect.height;
    const viewportHeight = window.innerHeight;
    
    if (timelineStart < viewportHeight && timelineStart > -timelineHeight) {
      const scrollProgress = Math.min(
        Math.max(
          (-timelineStart) / (timelineHeight - viewportHeight/2), 
          0
        ), 
        1
      );
      
      // Update progress line height and dot position together
      progressLine.style.height = `${scrollProgress * 100}%`;
      movingDot.style.top = `${scrollProgress * 100}%`;

      // Show "Now" text when reaching the end
      if (scrollProgress >= 0.95) {
        timelineLine.classList.add('reached-end');
      } else {
        timelineLine.classList.remove('reached-end');
      }
      
      // Update month highlighting
      timelineMonths.forEach(month => {
        const monthRect = month.getBoundingClientRect();
        const monthCenter = monthRect.top + monthRect.height / 2;
        const dotCenter = timelineRect.top + (scrollProgress * timelineHeight);
        
        if (Math.abs(monthCenter - dotCenter) < 50) {
          month.classList.add('active');
        } else {
          month.classList.remove('active');
        }
      });
    }
  }
});
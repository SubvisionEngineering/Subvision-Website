// JavaScript for Hero Video Functionality
document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.getElementById('heroVideo');
    const heroMuteBtn = document.getElementById('heroMuteBtn');
    const heroExpandBtn = document.getElementById('heroExpandBtn');
    const heroMuteIcon = document.getElementById('heroMuteIcon');
    const heroUnmuteIcon = document.getElementById('heroUnmuteIcon');

    if (!heroVideo) {
      console.error('[v0] Hero video element not found');
      return;
    }

    // Intersection Observer for autoplay when 50% visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroVideo.play().catch(err => console.log('[v0] Autoplay prevented:', err));
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0.5 });

    heroObserver.observe(heroVideo);

    if (heroMuteBtn && heroMuteIcon && heroUnmuteIcon) {
      // Mute/Unmute toggle
      heroMuteBtn.addEventListener('click', () => {
        heroVideo.muted = !heroVideo.muted;
        if (heroVideo.muted) {
          heroMuteIcon.style.display = 'block';
          heroUnmuteIcon.style.display = 'none';
        } else {
          heroMuteIcon.style.display = 'none';
          heroUnmuteIcon.style.display = 'block';
        }
      });
    }

    if (heroExpandBtn) {
      // Fullscreen toggle
      heroExpandBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          heroVideo.requestFullscreen().catch(err => {
            console.log('[v0] Fullscreen error:', err);
          });
        } else {
          document.exitFullscreen();
        }
      });
    }
  });

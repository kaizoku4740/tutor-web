// Wait for DOM to fully load before running scripts
document.addEventListener('DOMContentLoaded', function(){
  // ===== SET CURRENT YEAR IN FOOTER =====
  // Get the current year and inject it into all #year elements (footers)
  const y = new Date().getFullYear();
  document.querySelectorAll('#year').forEach(el=>el.textContent = y);

  // ===== MOBILE NAV TOGGLE =====
  // Handle hamburger menu: clicking the toggle button shows/hides the nav menu
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', ()=> mainNav.classList.toggle('show'))
  }

  // ===== CONTACT FORM HANDLER =====
  // Handle contact form submission: prevent default, show a thank you message, clear form
  const form = document.getElementById('contact-form');
  if(form){
    const status = document.getElementById('form-status');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || 'friend';
      status.textContent = `Thanks, ${name}! (This demo doesn't send messages.)`;
      form.reset();
    })
  }
});

// ===== GLOBAL HELPER FUNCTIONS =====
// Expose utility functions that review pages and other scripts can use
window.appHelpers = {
  // Escape HTML special characters to prevent XSS attacks
  escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') },
  // Format a timestamp (milliseconds since epoch) into a human-readable date string
  formatDate(ts){ try{ const d = new Date(ts); return d.toLocaleString(); }catch(e){ return '' } }
}

// ===== HOME PAGE TESTIMONIALS WITH TA SELECTOR =====
// IIFE: Render reviews on homepage and allow users to select which TA's reviews to display
;(function renderHomeTestimonials(){
  try{
    // Get DOM elements needed for testimonials and selector
    const el = document.getElementById('home-testimonials-list');
    const selector = document.getElementById('ta-selector');
    const reviewLink = document.getElementById('ta-review-link');
    // Exit early if elements don't exist on this page
    if(!el || !selector) return;

    // ===== RENDER TESTIMONIALS FUNCTION =====
    // This function fetches reviews for the selected TA and displays them
    function renderTestimonials(){
      // Get the selected TA ID from dropdown
      const taId = selector.value;
      // Fetch reviews from localStorage for this TA (key: "reviews-{taId}")
      const reviews = JSON.parse(localStorage.getItem(`reviews-${taId}`) || '[]');
      
      // If no reviews exist, show placeholder message
      if(!reviews || reviews.length===0){ 
        el.innerHTML = '<p style="color:var(--muted)">no reviews yet</p>'; 
        reviewLink.href = `reviews/${taId}.html`;
        return 
      }
      
      // Sort reviews by newest first, take top 3, then render them as cards
      const recent = reviews.slice().sort((a,b)=>b.ts - a.ts).slice(0,3);
      el.innerHTML = recent.map(r=>`<div class="card reveal" style="margin-bottom:.6rem"><strong>${appHelpers.escapeHtml(r.name)}</strong> <div style="color:var(--muted);font-size:.9rem">${appHelpers.formatDate(r.ts)}</div><div style="margin:.4rem 0">${'★'.repeat(r.rating)}</div><div>${appHelpers.escapeHtml(r.text)}</div></div>`).join('');
      
      // Update the review link to point to the selected TA's review page
      reviewLink.href = `reviews/${taId}.html`;
    }

    // Listen for changes to the TA selector dropdown
    selector.addEventListener('change', renderTestimonials);
    // Initial render with the default selected TA
    renderTestimonials();
  }catch(e){ console.warn('testimonials render failed', e) }
})();

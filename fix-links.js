// Auto-remap old GitHub Pages links to new Monorepo paths
document.addEventListener('DOMContentLoaded', function() {
  var linkMap = {
    'Travel-Booking-Landing-Page': 'travel-booking-landing-page',
    'E-Learning-Landing-Page': 'e-learning-landing-page',
    'Fitness-Gym-Landing-Page': 'fitness-gym-landing-page',
    'Tech-Agency-Landing-Page': 'tech-agency-landing-page',
    'Restaurant-Landing-Page': 'restaurant-landing-page'
  };

  // Fix live demo links (GitHub Pages -> relative monorepo paths)
  document.querySelectorAll('a').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    
    // Fix GitHub Pages demo links
    Object.keys(linkMap).forEach(function(oldName) {
      if (href.indexOf('mahmoudmagdyedu.github.io/' + oldName) !== -1) {
        a.setAttribute('href', '/frontend/' + linkMap[oldName] + '/');
        a.removeAttribute('target');
        a.removeAttribute('rel');
      }
    });

    // Fix GitHub repo source code links  
    Object.keys(linkMap).forEach(function(oldName) {
      if (href === 'https://github.com/mahmoudmagdyedu/' + oldName) {
        a.setAttribute('href', 'https://github.com/mahmoudmagdyedu/My-Portfolio/tree/main/frontend/' + linkMap[oldName]);
      }
    });
  });
});

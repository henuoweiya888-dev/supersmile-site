(() => {
  const profile = document.getElementById('about-profile');
  const story = document.getElementById('about-story-flow');
  const photo = document.getElementById('about-profile-team');
  if (!profile || !story || !photo) return;

  const photoPath = '/assets/images/factory/factory-employee-group-web.jpg';
  const photoAlt = {
    en: 'Super Smile factory team group photo',
    zh: '超斯迈尔工厂员工团队合影',
  };

  function synchronizeProfile() {
    const language = document.documentElement.lang === 'zh' ? 'zh' : 'en';
    profile.querySelectorAll('[data-profile-language]').forEach(element => {
      element.hidden = element.dataset.profileLanguage !== language;
    });

    // The shared page renderer rebuilds the story after a language switch.
    // Move its original team image back to the profile without changing story copy.
    const team = story.querySelector('.about-story-team');
    const originalImage = team?.querySelector('img');
    if (originalImage && new URL(originalImage.src, location.href).pathname === photoPath) {
      photo.replaceChildren(originalImage);
      if (!team.querySelector('.about-story-copy')) team.remove();
    }
    const image = photo.querySelector('img');
    if (image) {
      image.alt = photoAlt[language];
      image.width = 680;
      image.height = 453;
    }
  }

  const observer = new MutationObserver(synchronizeProfile);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  observer.observe(story, { childList: true });
  synchronizeProfile();
})();

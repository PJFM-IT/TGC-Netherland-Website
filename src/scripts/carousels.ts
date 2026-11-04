/**
 * Swiper carousels (vanilla). Each carousel root holds its own prev/next buttons and
 * dots container, found relative to the root's parent <section>.
 */
import Swiper from 'swiper';
import { A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

const VIDEO_ATTRIBUTES = ['videoid', 'playlabel', 'params', 'style', 'class'];

/** Stops a playing <lite-youtube> by swapping it for a fresh, un-activated copy. */
export function resetVideo(el: Element): void {
  if (!el.classList.contains('lyt-activated')) return;
  const fresh = document.createElement('lite-youtube');
  for (const name of VIDEO_ATTRIBUTES) {
    const value = el.getAttribute(name);
    if (value !== null) fresh.setAttribute(name, value);
  }
  fresh.classList.remove('lyt-activated');
  const button = el.querySelector('.lyt-playbtn');
  if (button) fresh.append(button.cloneNode(true));
  el.replaceWith(fresh);
}

const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shared options: arrows, clickable dots, keyboard and screen-reader support. */
function baseOptions(root: HTMLElement): SwiperOptions {
  const section = root.closest('section') ?? root.parentElement ?? root;
  const lang = document.documentElement.lang.startsWith('nl') ? 'nl' : 'en';
  const messages =
    lang === 'nl'
      ? { prev: 'Vorige', next: 'Volgende', bullet: 'Ga naar dia {{index}}', slide: '{{index}} van {{slidesLength}}', container: 'carrousel', item: 'dia' }
      : { prev: 'Previous slide', next: 'Next slide', bullet: 'Go to slide {{index}}', slide: '{{index}} of {{slidesLength}}', container: 'carousel', item: 'slide' };

  const dots = section.querySelector<HTMLElement>('[data-dots]');

  return {
    modules: [Navigation, A11y, Keyboard, ...(dots ? [Pagination] : [])],
    speed: reducedMotion() ? 0 : 550,
    grabCursor: true,
    watchSlidesProgress: true,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: section.querySelector<HTMLElement>('[data-prev]'),
      nextEl: section.querySelector<HTMLElement>('[data-next]'),
    },
    ...(dots && { pagination: { el: dots, clickable: true, bulletElement: 'button' } }),
    a11y: {
      enabled: true,
      prevSlideMessage: messages.prev,
      nextSlideMessage: messages.next,
      paginationBulletMessage: messages.bullet,
      slideLabelMessage: messages.slide,
      slideRole: 'group',
      containerRoleDescriptionMessage: messages.container,
      itemRoleDescriptionMessage: messages.item,
    },
  };
}

/** Home hero: one large centred slide with neighbours peeking in. */
export function initHeroCarousels(): void {
  document.querySelectorAll<HTMLElement>('[data-hero-carousel]').forEach((root) => {
    const base = baseOptions(root);
    const autoplay = !reducedMotion();
    new Swiper(root, {
      ...base,
      modules: [...(base.modules ?? []), Autoplay],
      loop: true,
      centeredSlides: true,
      slidesPerView: 1.12,
      spaceBetween: 12,
      breakpoints: {
        768: { slidesPerView: 1.45, spaceBetween: 20 },
        1100: { slidesPerView: 1.6, spaceBetween: 24 },
      },
      autoplay: autoplay ? { delay: 6000, disableOnInteraction: true, pauseOnMouseEnter: true } : false,
    });
  });
}

/**
 * Community Life: coverflow behind a fixed phone mockup. The active slide lines up with
 * the phone's screen; the date shown at the top of the phone follows the active slide.
 */
export function initHighlightsCarousels(): void {
  document.querySelectorAll<HTMLElement>('[data-highlights-carousel]').forEach((root) => {
    const base = baseOptions(root);
    const section = root.closest('section');
    const phoneDate = section?.querySelector<HTMLElement>('[data-phone-date]');

    const swiper = new Swiper(root, {
      ...base,
      modules: [...(base.modules ?? []), EffectCoverflow],
      effect: 'coverflow',
      centeredSlides: true,
      slidesPerView: 'auto',
      initialSlide: Number(root.dataset.initial ?? 0),
      slideToClickedSlide: true,
      // Room for the phone bezel between the centre card and its neighbours.
      spaceBetween: 40,
      coverflowEffect: {
        rotate: reducedMotion() ? 0 : 20,
        stretch: 0,
        depth: 70,
        modifier: 1,
        scale: 0.96,
        slideShadows: false,
      },
      breakpoints: {
        768: { spaceBetween: 44 },
      },
    });

    swiper.on('slideChange', () => {
      // Stop any video that moves out of the phone.
      swiper.slides.forEach((slide, index) => {
        if (index !== swiper.activeIndex) slide.querySelectorAll('lite-youtube').forEach(resetVideo);
      });
      const label = swiper.slides[swiper.activeIndex]?.dataset.dateLabel;
      if (phoneDate && label) phoneDate.textContent = label;
    });
  });
}

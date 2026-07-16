document.documentElement.classList.add("is-loading");

if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  if (typeof lenis !== "undefined" && lenis)
    lenis.scrollTo(0, { immediate: true });
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    window.scrollTo(0, 0);
    if (typeof lenis !== "undefined" && lenis)
      lenis.scrollTo(0, { immediate: true });
  }
});

let lenis; // declared here so the loader code (outside jQuery ready) can access it

jQuery(document).ready(function () {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true // ignores height-only resize events from iOS toolbar show/hide
  });
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.2,
    touchMultiplier: 1.5,
    lerp: 0.08,
  });

  // NEW: reset via Lenis itself, immediately (no animation), so its internal target matches 0
  lenis.scrollTo(0, { immediate: true });

  lenis.on("scroll", ScrollTrigger.update);
  lenis.stop(); // lock scroll until loader finishes
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();

  let resizeTimer;
  let lastWidth = window.innerWidth;

  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;
    if (currentWidth === lastWidth) return; // height-only change (iOS toolbar) — ignore
    lastWidth = currentWidth;

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  });

  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = this.getAttribute("href");
      if (target.startsWith("#") && document.querySelector(target)) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
  $(".back-top-btn").on("click", function (e) {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  // lenis js ends

  // build slider js
  if ($(".build-slider").length) {

    $(".build-slider").slick({
      slidesToShow: 2,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      infinite: true,
      speed: 3000,
      pauseOnHover: false,
      pauseOnFocus: false,

      responsive: [
        { breakpoint: 1200, settings: { slidesToShow: 2 } },
        { breakpoint: 768, settings: { slidesToShow: 1 } },
      ],
    });
  }

  // exam slider

  if ($(".exam-slider").length) {

    $(".exam-slider").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      infinite: true,
      speed: 3000,
      pauseOnHover: false,
      pauseOnFocus: false,

      responsive: [
        { breakpoint: 1200, settings: { slidesToShow: 2 } },
        { breakpoint: 768, settings: { slidesToShow: 1 } },
      ],
    });
  }

  // slider cards on scroll

  const mm = gsap.matchMedia();

  mm.add("(min-width: 767px)", () => {
    const slides = gsap.utils.toArray(".out-cm-bx");

    /* ---------- Initial States ---------- */

    slides.forEach((slide, index) => {
      const left = slide.querySelector(".outcm-lft");
      const right = slide.querySelector(".outcm-rgt");

      if (index === 0) {
        gsap.set(left, {
          opacity: 1,
          xPercent: 0,
        });

        gsap.set(right, {
          opacity: 1,
          yPercent: 0,
        });

        gsap.set(slide, {
          autoAlpha: 1,
          zIndex: slides.length,
        });

        return;
      }

      gsap.set(slide, {
        autoAlpha: 1,
        visibility: "hidden",
        zIndex: slides.length - index,
      });

      gsap.set(left, {
        opacity: 0,
        xPercent: 100,
      });

      gsap.set(right, {
        opacity: 0,
        yPercent: 100,
      });

      gsap.set(".out-cm-bx1 .outcm-rgt", {
        opacity: 1,
        clearProps: "opacity",
      });
    });

    /* ---------- Master Timeline ---------- */

    const master = gsap.timeline({
      scrollTrigger: {
        trigger: ".outcome-sec",
        start: "top top",
        end: `+=${slides.length * 150}%`,
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
      },
    });

    /* ---------- Slide Transitions ---------- */

    slides.forEach((slide, index) => {
      if (index === 0) return;

      const prevSlide = slides[index - 1];

      const prevLeft = prevSlide.querySelector(".outcm-lft");
      const prevRight = prevSlide.querySelector(".outcm-rgt");

      const currLeft = slide.querySelector(".outcm-lft");
      const currRight = slide.querySelector(".outcm-rgt");

      master.add(() => {
        gsap.set(slide, {
          visibility: "visible",
        });
      });

      master.set(slides, {
        zIndex: -1,
      });

      master.to(
        prevLeft,
        {
          scale: 0.85,
          opacity: 0,
          duration: 1,
        },
        ">",
      );

      master.to(
        prevRight,
        {
          xPercent: -100,
          x: -50,
          duration: 1.2,
        },
        "<",
      );

      master.to(
        prevRight,
        {
          opacity: 0,
          duration: 0.2,
        },
        "<",
      );

      master.to(
        currLeft,
        {
          opacity: 1,
          duration: 0.2,
        },
        "<",
      );

      master.to(
        currLeft,
        {
          xPercent: 0,
          duration: 1.2,
        },
        "<",
      );

      master.to(
        currRight,
        {
          duration: 0.3,
          opacity: 1,
        },
        "<",
      );

      master.to(
        currRight,
        {
          yPercent: 0,
          duration: 1.2,
        },
        "<",
      );
      master.addLabel(`slide-${index}`);
    });

  });

  // cv teal slider ad cv white slider js 
  function initCvSlider(sliderClass) {

    const $slider = $(sliderClass);
    const $wrapper = $slider.closest(".cv-innr");

    const $bar = $wrapper.find(".progress-bar .bar");
    const $current = $wrapper.find(".current-slide");
    const $total = $wrapper.find(".total-slides");

    $slider.on("init reInit afterChange", function (e, slick, currentSlide) {

      const current = (currentSlide || 0) + 1;

      $current.text(current);
      $total.text(slick.slideCount);
      $bar.css("width", (current / slick.slideCount) * 100 + "%");
    });

    $slider.slick({
      dots: false,
      slidesToShow: 3,
      slidesToScroll: 1,
      prevArrow: $wrapper.find(".previous"),
      nextArrow: $wrapper.find(".next"),
      responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });

  }

  // Initialize both sliders
  initCvSlider(".cv-slider-sec");
  initCvSlider(".cv-slider2");


  // banner content blur+lift on scroll
  if ($(".hm-content, .hm-content2").length) {
    const bannerMM = gsap.matchMedia();

    // above 575px — blur + lift
    bannerMM.add("(min-width: 576px)", () => {
      gsap.to(
        [".hm-content h1", ".hm-content p", ".hm-content .bnr-cta-wrap", ".hm-content2 h1", ".hm-content2 p", ".hm-content2 .bnr-cta-wrap", ".hm-content2 ul"],
        {
          filter: "blur(10px)",
          y: -100,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: ".hm-bnr-sec",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    // 575px and below — lift only, no blur
    bannerMM.add("(max-width: 575px)", () => {
      gsap.to(
        [".hm-content h1", ".hm-content p", ".hm-content .bnr-cta-wrap", ".hm-content2 h1", ".hm-content2 p", ".hm-content2 .bnr-cta-wrap", ".hm-content2 ul"],
        {
          y: 0,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: ".hm-bnr-sec",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });
  }


  // vertqo-img drift left/right based on scroll direction
  if ($(".vertqo-img img, .vertqo-img2 img").length) {
    gsap.to(".vertqo-img img, .vertqo-img2 img", {
      x: -320,
      ease: "none",
      scrollTrigger: {
        trigger: ".hm-bnr-sec",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
  }


  // sec fade up gsap 
  const secFadeUp = gsap.matchMedia();

  secFadeUp.add("(min-width: 768px)", () => {
    gsap.utils.toArray(".sec-fadeup").forEach((element) => {
      gsap.from(element, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play reverse play reverse"
        }
      });
    });
  });

  // text color animation gsap

  /*text animation*/
  if (document.querySelector(".reveal-text")) {
    const split = new SplitType(".reveal-text", {
      types: "words"
    });

    gsap.set(split.words, { opacity: 0.2 });

    gsap.to(split.words, {
      opacity: 1,
      stagger: 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: ".reveal-text",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1
      }
    });
  }
  const select = document.getElementById("subject");

  if (select) {
    select.addEventListener("change", () => {
      select.blur();
    });
  }
  // image movement on scroll

  gsap.fromTo(".vert-big-txt img",
    {
      x: 200 // initial position
    },
    {
      x: -200, // final position
      ease: "none",
      scrollTrigger: {
        trigger: ".vert-big-txt",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    }
  );

  // faq active script 
  $('.accordion-collapse')
    .on('shown.bs.collapse', function () {
      $('.accordion-item').removeClass('active');
      $(this).closest('.accordion-item').addClass('active');
    })
    .on('hidden.bs.collapse', function () {
      $(this).closest('.accordion-item').removeClass('active');
    });


  //faq script   
  const faqSideItems = document.querySelectorAll('.faqSideItem');
  const faqPanels = document.querySelectorAll('.faqAccordionList');

  const highlightSidebarItem = category => {
    faqSideItems.forEach(item =>
      item.classList.toggle('faqSideItemActive', item.dataset.category === category)
    );
  };

  let isClickScrolling = false;

  faqSideItems.forEach(item => {
    item.addEventListener('click', () => {
      const panel = document.getElementById(`faqSection-${item.dataset.category}`);
      if (!panel) return;

      isClickScrolling = true;
      highlightSidebarItem(item.dataset.category);

      panel.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      requestAnimationFrame(function check() {
        const top = panel.getBoundingClientRect().top;
        if (Math.abs(top) < 5) {
          isClickScrolling = false;
        } else {
          requestAnimationFrame(check);
        }
      });
    });
  });

  const scrollSpy = new IntersectionObserver(entries => {
    if (isClickScrolling) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        highlightSidebarItem(entry.target.dataset.category);
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  faqPanels.forEach(panel => scrollSpy.observe(panel));

  // blog page js
  const $pills = $('.tab-pill');
  const $cards = $('.card');
  const $emptyState = $('#emptyState');
  const $catScroll = $('#catScroll');
  const catScrollEl = $catScroll[0];

  /* ---- Drag-to-scroll for the pill bar ---- */
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let didDrag = false;
  const DRAG_THRESHOLD = 6; // px of movement before we treat it as a drag, not a click

  $catScroll.on('mousedown', function (e) {
    isDown = true;
    didDrag = false;
    startX = e.pageX;
    scrollStart = catScrollEl.scrollLeft;
  });

  $(window).on('mousemove', function (e) {
    if (!isDown) return;
    const delta = e.pageX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      didDrag = true;
      $catScroll.addClass('dragging');
    }
    if (didDrag) {
      catScrollEl.scrollLeft = scrollStart - delta;
    }
  });

  $(window).on('mouseup', function () {
    isDown = false;
    $catScroll.removeClass('dragging');
  });

  // touch support (native touch scrolling already works, this just keeps it smooth/consistent)
  let touchStartX = 0;
  let touchScrollStart = 0;

  $catScroll.on('touchstart', function (e) {
    touchStartX = e.originalEvent.touches[0].pageX;
    touchScrollStart = catScrollEl.scrollLeft;
  });

  $catScroll.on('touchmove', function (e) {
    const delta = e.originalEvent.touches[0].pageX - touchStartX;
    catScrollEl.scrollLeft = touchScrollStart - delta;
  });

  $pills.on('click', function () {
    if (didDrag) return; // ignore click that follows a drag gesture

    const $pill = $(this);

    $pills.removeClass('active');
    $pill.addClass('active');

    // keep clicked pill visible within the scroll area
    this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    const filter = $pill.data('filter');
    let visibleCount = 0;

    $cards.each(function () {
      const $card = $(this);
      const match = filter === 'all' || $card.data('category') === filter;
      $card.toggleClass('hidden', !match);
      if (match) visibleCount++;
    });

    $emptyState.toggleClass('show', visibleCount === 0);
  });

  // quiz steps js 
  const totalSteps = 5;
  let currentStep = 1;

  // Initial State
  $(".quiz-cmmn").hide();
  $('.quiz-cmmn[data-step="1"]').show().addClass("active");
  updateQuiz();

  // Next Button
  $(".quiz-nxt").on("click", function () {

    // If Result button clicked
    if ($(this).closest(".quiz-result").length) {
      return;
    }

    if (currentStep < totalSteps) {
      showStep(currentStep + 1);
    } else {
      // Show Result
      $(".quiz-cmmn").removeClass("active").hide();
      $(".quiz-result").fadeIn().addClass("active");

      $(".current-step").text("🎉");
      $(".quiz-pro-update").css("width", "100%");
    }
  });

  // Previous Button
  $(".quiz-prev").on("click", function () {

    if (currentStep > 1) {
      showStep(currentStep - 1);
    }

  });

  function showStep(step) {

    currentStep = step;

    $(".quiz-cmmn").removeClass("active").hide();
    $('.quiz-cmmn[data-step="' + step + '"]')
      .fadeIn()
      .addClass("active");

    updateQuiz();
  }

  function updateQuiz() {

    $(".current-step").text(currentStep);

    let progress = (currentStep / totalSteps) * 100;
    $(".quiz-pro-update").css("width", progress + "%");
  }
  // new js here 
  // Radio change
  // Click anywhere on the option
  $(".quiz-optn").on("click", function () {

    const $radio = $(this).find('input[type="radio"]');

    // Check the radio
    $radio.prop("checked", true);

    // Remove active from siblings
    $(this).siblings(".quiz-optn").removeClass("active");

    // Add active to current
    $(this).addClass("active");

  });


  // review and success slider
  $(".success-slider").on("init reInit afterChange", function (e, slick, currentSlide) {
    let i = (currentSlide || 0) + 1;
    let width = (i / slick.slideCount) * 100;

    console.log(width + "%");

    $(".progres-bar").css("width", width + "%",);

  });

  $('.success-slider').slick({
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    infinite: true,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,

        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });

  // review -slider
  $(".review-slider").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    infinite: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });

});

// header scroll js
$(window).on("scroll", function () {
  if ($(this).scrollTop() > 50) {
    $(".site-header").addClass("scrolled");
  } else {
    $(".site-header").removeClass("scrolled");
  }
});

$(window).on("scroll resize", function () {
  const $header = $(".site-header");
  const $start = $(".faa-hd");
  const $end = $(".faa-btm");

  if (!$start.length || !$end.length) return;

  const scrollTop = $(window).scrollTop();
  const startTop = $start.offset().top;
  const endTop = $end.offset().top;

  if (scrollTop >= startTop && scrollTop < endTop) {
    $header.addClass("faa-active");
  } else {
    $header.removeClass("faa-active");
  }
});


$(window).on("scroll resize", function () {
  const $header = $(".site-header");
  const $start = $(".roadmap-sec");
  const $end = $(".headr-visible");

  if (!$start.length || !$end.length) return;

  const scrollTop = $(window).scrollTop();
  const startTop = $start.offset().top - 150; // Trigger 150px earlier
  const endTop = $end.offset().top;

  if (scrollTop >= startTop && scrollTop < endTop) {
    $header.addClass("faa-active");
  } else {
    $header.removeClass("faa-active");
  }
});
// header scroll js ends

// loader animation main animation timeline

// NEW: detect context
const isHome = !!document.querySelector(".home-loader-trigger");
const runLoader2 = isHome && window.innerWidth >= 1200;
// NEW: detect inner-page loader
const isInnerLoader = !!document.querySelector(".inner-loader");
gsap.set(".p1", { x: -400, y: -300, opacity: 0 }); // top-left
gsap.set(".p2", { x: 0, y: -350, opacity: 0 }); // top
gsap.set(".p3", { x: 400, y: -300, opacity: 0 }); // top-right
gsap.set(".p4", { x: 350, y: 300, opacity: 0 }); // bottom-left
gsap.set(".p5", { x: 350, y: 300, opacity: 0 }); // bottom-right
gsap.set(".p6", { x: -300, scale: 0, opacity: 0 }); // center piece

// Hide homepage elements initially — .site-header REMOVED from this array
gsap.set(
  [".hm-content", ".vertqo-img", ".hm-btm-wrap", ".inr-bnr-img", ".hm-bnr-innr2", ".drone-img2"],
  {
    opacity: 0,
    y: 80,
  },
);
// NEW: only hide the header when it's NOT the inner-header
if (!isInnerLoader) {
  gsap.set(".site-header", { opacity: 0, y: 80 });
}
gsap.set([".bnr-drone"], {
  opacity: 0,
  scale: 0,
  x: 150,
});

gsap.set(".loader1", {
  opacity: 1,
  visibility: "visible",
});

gsap.set(".loader2", {
  opacity: 0,
  visibility: "hidden",
});

// timeline starts here
const tl = gsap.timeline();

tl.to(".loader1", { duration: isInnerLoader ? 1 : 2 }).to(".loader1", {
  duration: isInnerLoader ? 1 : 1.6,
  opacity: 0,
  onComplete: () => gsap.set(".loader1", { display: "none" }),
});

// NEW: only build the loader2 / drone-assembly segment when allowed
if (runLoader2) {
  tl.set(".loader2", { visibility: "visible", display: "flex" })
    .to(".loader2", { duration: 0.4, opacity: 1 })
    .to(
      ".p1",
      { x: 0, y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
      "<",
    )
    .to(
      ".p2",
      { x: 0, y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
      "<",
    )
    .to(
      ".p3",
      { x: 0, y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
      "<",
    )
    .to(
      ".p4",
      { x: 0, y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
      "<",
    )
    .to(
      ".p5",
      { x: 0, y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
      "<",
    )
    .to(
      ".p6",
      { scale: 1, x: 0, opacity: 1, duration: 1.2, ease: "back.out(2)" },
      "<0.3",
    )
    .to({}, { duration: 1.2 }); // hold assembled drone
}
tl.to(".main-loader", {
  duration: isInnerLoader ? 0.6 : 1,
  x: 200,
  scale: 0.8,
  pointerEvents: "none",
}).to(
  [".hm-content", ".vertqo-img", ".hm-btm-wrap", ".b-cloud"],
  {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "power3.out",
  },
  "-=0.35",
)
  .to(
    [".inr-bnr-img", ".hm-bnr-innr2", ".drone-img2"],
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: "power3.out",
    },
    "<", // same start time as the block above
  );
// break the chain here — plain statement, not chained
if (!isInnerLoader) {
  tl.to(
    ".site-header",
    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    "<",
  );
}

// resume chaining from tl again

tl.call(
  () => {
    document.querySelectorAll(".b-cloud").forEach((el) => {
      el.style.animationPlayState = "running";
    });
  },
  [],
  "<",
).to(".main-loader", {
  duration: isInnerLoader ? 1 : 1.5,
  x: 400,
  opacity: 0,
  scale: 0,
});

// break the chain — plain statement
if (isHome) {
  tl.to(
    [".bnr-drone"],
    {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      x: 0,
      stagger: 0.15,
      ease: "power3.out",
    },
    "-=0.35",
  );
}

// resume chaining from tl again
tl.add(() => {
  const loader = document.querySelector(".main-loader");
  if (loader) loader.remove();

  document.documentElement.classList.remove('is-loading');
  window.scrollTo(0, 0);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    lenis.start();
  }
  // NEW: continuous gentle float for the drone, starts once loader is fully done
  if (isHome) {
    gsap.to(".bnr-drone", {
      y: -18,
      duration: 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }
});



// flying drone sec

const flyingDrone = gsap.matchMedia();

flyingDrone.add("(min-width: 768px)", () => {

  // Initial states
  gsap.set(".flying-drone", {
    left: "60%",
    xPercent: -50,
    yPercent: -50,
    top: "50%"
  });

  gsap.set(".train-cntnt-drone", {
    y: 130,
    opacity: 0,
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".flying-drone-sec",
      start: "top top",
      end: "+=180%",
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
    }
  });

  // Drone flies to its final position
  tl.to(".flying-drone", {
    left: "3%",          // adjust according to your design
    top: "52%",
    xPercent: 0,
    duration: 1.5,
    ease: "power2.out"
  })

    // Content comes from bottom
    .to(".train-cntnt-drone", {
      y: 0,
      opacity: 1,
      duration: 0.3,

    }, "-=0.8");

});



//  drone js 
$(function () {
  gsap.registerPlugin(ScrollTrigger);

  const droneTimeline = gsap.matchMedia();

  droneTimeline.add("(min-width: 768px)", () => {

    const section = document.getElementById('success-timeline');
    if (!section) return;

    const wrap = section.querySelector('.s-time-wrap');
    const track = section.querySelector('.wave-track');
    const drone = section.querySelector('.moving-drone-small');
    const steps = gsap.utils.toArray(section.querySelectorAll('.rstep'));

    const BAND_TOP = 190;
    const DESIGN_HEIGHT = 620;

    /* ---------- 1. position each step at its exact wave coordinate ---------- */
    steps.forEach(el => {
      const x = parseFloat(el.dataset.x);
      const y = parseFloat(el.dataset.y) + BAND_TOP;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    });

    /* ---------- 2. initial (hidden) state ---------- */
    steps.forEach(el => {
      const content = el.querySelector('.rstep-cntnt');
      const circle = el.querySelector('.rstep-circle');
      const dir = el.classList.contains('peak') ? -1 : 1;

      gsap.set(content, {
        opacity: 0,
        scale: 0.35,
        y: dir * 26,
        transformOrigin: "50% 50%"
      });

      gsap.set(circle, {
        scale: 0,
        transformOrigin: "50% 50%"
      });

      el.dataset.shown = "0";
    });

    function buildWavePoints() {
      const pts = steps.map(el => ({
        x: parseFloat(el.dataset.x),
        y: parseFloat(el.dataset.y) + BAND_TOP
      }));

      const firstGap = (pts[1] ? pts[1].x - pts[0].x : 400) * 0.4;
      const lastGap = pts.length > 1
        ? (pts[pts.length - 1].x - pts[pts.length - 2].x) * 0.4
        : 400;

      const leadY = (pts[0].y + (pts[1] ? pts[1].y : pts[0].y)) / 2;
      const trailY = (
        pts[pts.length - 1].y +
        (pts[pts.length - 2]
          ? pts[pts.length - 2].y
          : pts[pts.length - 1].y)
      ) / 2;

      return [
        { x: pts[0].x - firstGap, y: leadY },
        ...pts,
        { x: pts[pts.length - 1].x + lastGap, y: trailY }
      ];
    }

    function getTotalWidth() {
      const lastStep = steps[steps.length - 1];
      return parseFloat(lastStep.dataset.x) + 400;
    }

    let wavePoints = buildWavePoints();
    let totalWidth = getTotalWidth();

    function catmullRom2bezier(points) {
      let d = `M${points[0].x},${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 === points.length ? i + 1 : i + 2];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }

      return d;
    }

    const helperSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    helperSvg.setAttribute("width", "0");
    helperSvg.setAttribute("height", "0");
    helperSvg.style.position = "absolute";
    helperSvg.style.overflow = "hidden";

    const motionPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    helperSvg.appendChild(motionPath);
    track.appendChild(helperSvg);

    let pathLength;

    function rebuildMotionPath() {
      wavePoints = buildWavePoints();
      totalWidth = getTotalWidth();
      motionPath.setAttribute("d", catmullRom2bezier(wavePoints));
      pathLength = motionPath.getTotalLength();
    }

    rebuildMotionPath();

    gsap.set(drone, {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "50% 50%"
    });

    function updateDrone(p) {
      p = gsap.utils.clamp(0, 1, p);

      const pt = motionPath.getPointAtLength(p * pathLength);
      const ptAhead = motionPath.getPointAtLength(
        gsap.utils.clamp(0, 1, p + 0.002) * pathLength
      );

      const angle = Math.atan2(
        ptAhead.y - pt.y,
        ptAhead.x - pt.x
      ) * (180 / Math.PI);

      gsap.set(drone, {
        x: pt.x,
        y: pt.y,
        rotation: gsap.utils.clamp(-12, 12, angle * 0.3)
      });
    }

    let currentScale = 1;

    function applyScale() {
      currentScale = gsap.utils.clamp(
        0.45,
        1.2,
        wrap.clientHeight / DESIGN_HEIGHT
      );

      gsap.set(track, {
        scale: currentScale
      });
    }

    function getPanDistance() {
      const lastStep = steps[steps.length - 1];
      const lastX = parseFloat(lastStep.dataset.x);
      const localWrapWidth = wrap.clientWidth / currentScale;
      const maxVisibleX = lastX + 480;

      return Math.max(0, maxVisibleX - localWrapWidth);
    }

    applyScale();

    const panTween = gsap.fromTo(
      track,
      { x: 0 },
      {
        x: () => -getPanDistance() * currentScale,
        ease: "none",
        duration: 1
      }
    ).pause();

    const thresholdBuffer = 0.04;

    function getStepThresholds() {
      return steps.map(el => parseFloat(el.dataset.x) / totalWidth);
    }

    let stepThresholds = getStepThresholds();

    function updateSteps(p) {
      // Your existing updateSteps() code...
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => "+=" + (window.innerHeight * 3 + getPanDistance() * currentScale),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        const panStartProgress = 0.15;
        const panP =
          p < panStartProgress
            ? 0
            : Math.min(1, (p - panStartProgress) / (1 - panStartProgress));

        panTween.progress(panP);
        updateSteps(p);
        updateDrone(p);
      }
    });

    let resizeT;

    window.addEventListener("resize", () => {
      clearTimeout(resizeT);

      resizeT = setTimeout(() => {
        applyScale();
        rebuildMotionPath();
        stepThresholds = getStepThresholds();
        ScrollTrigger.refresh();
      }, 200);
    });

    // Cleanup when viewport goes below 768px
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  });
});
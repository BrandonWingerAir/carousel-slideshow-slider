$(() => {
  $.mobile.loading().hide();

  // Slider
  const autoplaySpeed = 6000;
  const transitionSpeed = 1;
  const slider = document.querySelector('.slider');
  const sliderCarousel = document.querySelector('.slider-carousel');
  const slideOverlay = document.querySelector('.slide-overlay');
  const sliderContainer = document.querySelector('.slider-container');

  // Controls
  const playSlideshow = document.querySelector('.play-slideshow');
  const pauseSlideshow = document.querySelector('.pause-slideshow');
  const sliderToggle = document.querySelector('.slideshow-toggle');
  const sliderToggleIcons = document.querySelectorAll('.slideshow-toggle i');
  const prevSlideArrow = document.querySelector('.prev-slide');
  const nextSlideArrow = document.querySelector('.next-slide');
  const slideIndicator = document.querySelector('.slide-selector');

  // Modal
  const sliderModal = document.querySelector('.slider-modal');
  const modalContent = document.querySelector('.modal-slide');
  const closeModalBtn = document.querySelector('.slider-close');
  const largeScreenModal = window.matchMedia("(min-width: 1024px)");
  const tabletScreenModal = window.matchMedia("(min-width: 480px)");
  const phoneScreenModal = window.matchMedia("(max-width: 479px)");
  const slideText = document.querySelectorAll('.slide-box');

  // Indexing
  let slideDirection;
  let sectionIndex = 'indexDefault';
  let numSlides = document.querySelector(".slide-selector").getElementsByTagName("li").length;
  let slideInterval = 0;
  let slideReady = true;
  let slidePaused = false;
  let slideModalFix = false;

  slider.style.width = `${(numSlides * 100)}%`;

  // Ensure transitions complete
  $(slider).on('transitionstart', function() {
    slideReady = false;
  });

  $(slider).on('transitionend', function() {
    if (slideDirection == 1) {
      slider.prepend(slider.lastElementChild);
    } else {
      slider.appendChild(slider.firstElementChild);
    }
      
    slider.style.transition = 'none';
    slider.style.transform = 'translate(0)';
    setTimeout(function() {
      slider.style.transition = `all ${transitionSpeed}s`;
    });
    slideReady = true;
  });

  // Prev/Next Slides
  prevSlide = () => {
    if (slideDirection == -1) {
      slider.appendChild(slider.firstElementChild);
      slideDirection = 1;
    }

    slideDirection = 1;

    sliderCarousel.style.justifyContent = 'flex-end';

    if (sectionIndex > 0) {
      slider.style.transform = 'translate(20%)';
    } else if (sectionIndex == 'indexDefault') {
      slider.appendChild(slider.firstElementChild);
      slider.style.transform = 'translate(20%)';
    } else {
      slider.style.transform = 'translate(20%)';
    }
  }

  nextSlide = () => {
    if (sectionIndex == 'indexDefault') {
      sectionIndex = 0;
    }
    
    if (slideDirection == 1) {
      slider.prepend(slider.lastElementChild);
      slideDirection = -1;
    }

    slideDirection = -1;

    sliderCarousel.style.justifyContent = 'flex-start';
    slider.style.transform = 'translate(-20%)';
  }

  // Change 'slide-selected' class
  setIndex = () => {
    $('.slider-controls .slide-selected').removeClass('slide-selected');
    slideIndicator.children[sectionIndex].classList.add('slide-selected');
  }

  // Set prev/next index
  prevSectionIndex = () => {
    sectionIndex = (sectionIndex > 0) ? sectionIndex  - 1 : numSlides - 1;
  }

  nextSectionIndex = () => {
    sectionIndex = (sectionIndex < numSlides - 1) ? sectionIndex + 1 : 0;
  }

  // Prev/Next Arrows
  $(prevSlideArrow).click(() => {
    if (!slideReady) { return; }
    prevSlide();
    prevSectionIndex();
    setIndex();
  });

  $(nextSlideArrow).click(() => {
    if (!slideReady) { return; }
    nextSlide();
    nextSectionIndex();
    setIndex();
  });

  // Handle swipe to prev/next
  $(slider).on('swiperight', function(e) {
    if (!slideReady) { return; }
    prevSlide();
    prevSectionIndex();
    setIndex();
  });

  $(slider).on('swipeleft', function(e) {
    if (!slideReady) { return; }
    nextSlide();
    nextSectionIndex();
    setIndex();
  });

  // Slide selector
  document.querySelectorAll('.slider-controls li').forEach(function(indicator, index) {
    $(indicator).click(function() {
      if (slideReady) {
        slideReady = false;
      
        if (!$(indicator).hasClass('slide-selected')) {
          clearInterval(slideInterval);

          moveToNext = () => {
            slider.appendChild(slider.firstElementChild);
            sliderCarousel.style.justifyContent = 'flex-start';
            slider.style.transform = 'translate(-20%)';
          }
    
          if (sectionIndex < index) {
            nextSlide();
    
            for (var i = sectionIndex + 1; i < index; i++) {
              moveToNext();
            }
          } else if (sectionIndex > index) {
            prevSlide();
    
            for (var i = sectionIndex - 1; i > index; i--) {
              slider.prepend(slider.lastElementChild);
              sliderCarousel.style.justifyContent = 'flex-end';
              slider.style.transform = 'translate(20%)';        
            }
          } else {
            sectionIndex = 0;
            nextSlide();
    
            for (var i = sectionIndex + 1; i < index; i++) {
              moveToNext();
            }
          }
    
          sectionIndex = index;
    
          setIndex();
    
          indicator.classList.add('slide-selected');
        }
      }
    });
  });

  // Close Modal
  closeModal = () => {
    $(sliderContainer).on('mouseleave', () => { 
      auto();
    });

    modalContent.removeChild(sliderContainer);
    sliderModal.style.display = 'none';
    slideIndicator.style.display = 'flex';

    modalSmall = (size) => {
      sliderContainer.style.height = (phoneScreenModal.matches) ? '250px' : '400px';
    }
    
    modalSmall(phoneScreenModal);
    phoneScreenModal.addListener(modalSmall);

    $(sliderContainer).insertBefore(sliderModal); 

    slideText.forEach(slide => slide.style.display = 'flex');
    slideOverlay.style.display = 'block';
    sliderContainer.style.paddingTop = '0';

    slideModalFix = true; 
    auto(); 

    playSlideshow.style.display = 'none';
    $(sliderToggle).css({ right: '100px', bottom: '20px' });
    sliderToggleIcons.forEach(icon => icon.style.fontSize = '3rem');
    pauseSlideshow.style.display = 'flex';

    $(sliderCarousel).hover(() => {
      $(slideIndicator).css({ display: 'flex' });
    }, () => {
      $(slideIndicator).css({ display: 'flex' });
    });
  }

  // Left/Right, Spacebar & Escape Key Controls
  document.onkeydown = checkKey;

  function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '37') {
      if (!slideReady) { return; }
      prevSlide();
      prevSectionIndex();
      setIndex();
    }
    else if (e.keyCode == '39') {
      if (!slideReady) { return; }
      nextSlide();
      nextSectionIndex();
      setIndex();
    } else if (e.keyCode == '27') {
      closeModal();
    } else if (e.keyCode == '32') {      
      if (!slidePaused) {
        pauseSlideshow.style.display = 'none';
        playSlideshow.style.display = 'flex';

        pauseAutoplay();
        clearInterval(slideInterval);    

        slidePaused = true;
      } else {
        playSlideshow.style.display = 'none';
        pauseSlideshow.style.display = 'flex';

        $(sliderContainer).on('mouseenter', function(e){
          var onMouEnt = e.type == 'mouseenter' ? clearInterval(slideInterval) : auto() ;
        });
      
        $(sliderContainer).on('mouseleave', function(e){ 
          mouseLeaveCheck(e);  
        });
      }
    }
  } 

  // Open Modal
  $(slider).click(() => {
    clearInterval(slideInterval);

    $(sliderContainer).on('mouseenter', function(e){
      window.clearInterval(slideInterval);
    });

    $(sliderContainer).on('mouseleave', function(e){ 
      clearInterval(slideInterval);
    });

    slideText.forEach(slide => slide.style.display = 'none');
    pauseSlideshow.style.display = 'none';
    $(sliderToggle).css({ right: '43.45%', bottom: '44.55%' });
    sliderToggleIcons.forEach(icon => icon.style.fontSize = '3rem');
    playSlideshow.style.display = 'flex';
    slideOverlay.style.display = 'none';
    sliderModal.style.display = 'block';

    function modalSmall(size) {
      sliderContainer.style.height = (phoneScreenModal.matches) ? '50vh' : '90vh';
    }

    function modalLarge(size) {
      sliderContainer.style.paddingTop = (largeScreenModal.matches) ? '.5vh' : '20vh';
    }
    function modalMedium(size) {
      sliderContainer.style.paddingTop = (tabletScreenModal.matches) ? '1vh' : '20vh';
    }

    
    modalSmall(phoneScreenModal);
    phoneScreenModal.addListener(modalSmall);

    modalLarge(largeScreenModal);
    largeScreenModal.addListener(modalLarge);
    modalMedium(tabletScreenModal);
    tabletScreenModal.addListener(modalMedium);


    modalContent.appendChild(sliderContainer);    

    // Display controls on hover
    $(sliderCarousel).hover(() => {
      slideIndicator.style.display = 'flex';
    }, function(){
      slideIndicator.style.display = 'none';
    });
  });
  
  $(closeModalBtn).click(() => {
    closeModal();
  });

  // Autoplay Toggle
  pauseAutoplay = () => {
    $(sliderContainer).on('mouseenter', function(e){
      clearInterval(slideInterval);
    });
  
    $(sliderContainer).on('mouseleave', function(e){ 
      clearInterval(slideInterval);
    });
  }

  mouseLeaveCheck = (e) => {
    var onMouEnt = e.type == 'mouseenter' ?  
                      clearInterval(slideInterval) :   
                      auto();       
  }

  slideToggle = () => {
    if (!slidePaused) {
      pauseAutoplay();
      clearInterval(slideInterval);    
    } else {
      $(sliderContainer).on('mouseenter', function(e){
        var onMouEnt = e.type == 'mouseenter' ? clearInterval(slideInterval) : auto() ;
      });
    
      $(sliderContainer).on('mouseleave', function(e){ 
        mouseLeaveCheck(e);  
      });
    }
  }

  if (slidePaused == false) {    
    $(sliderContainer).on('mouseenter', function(e){
      var onMouEnt = e.type=='mouseenter' ? clearInterval(slideInterval) : auto() ;
    });
  
    $(sliderContainer).on('mouseleave', function(e){ 
      if (slideModalFix) {
        auto();
      } else if (slidePaused) {
        clearInterval(slideInterval);
      } else {
        mouseLeaveCheck(e);               
      }
    });
  } 

  $(pauseSlideshow).click(function() {
    pauseSlideshow.style.display = 'none';
    playSlideshow.style.display = 'flex';

    pauseAutoplay();
    clearInterval(slideInterval);

    slideToggle();
    slidePaused = true;

  });

  $(playSlideshow).click(function() {
    playSlideshow.style.display = 'none';
    pauseSlideshow.style.display = 'block';
    slidePaused = false;

    slideToggle();
  });

  // Autoplay
  auto = () => {
    slideInterval = setInterval(function() {
      nextSlide();
      nextSectionIndex();
      setIndex();
    }, autoplaySpeed); // interval 
  }

  auto();

  // Pause autoplay when window is not in focus
   function addEvent(obj, evType, fn, isCapturing){
    if (isCapturing==null) isCapturing=false; 
    if (obj.addEventListener){
      // Firefox
      obj.addEventListener(evType, fn, isCapturing);
      return true;
    } else if (obj.attachEvent){
      // MSIE
      var r = obj.attachEvent('on'+evType, fn);
      return r;
    } else {
      return false;
    }
  }

  // register to the potential page visibility change
  addEvent(document, "potentialvisilitychange", function(event) {});

  // register to the W3C Page Visibility API
  var hidden=null;
  var visibilityChange=null;
  if (typeof document.mozHidden !== "undefined") {
    hidden="mozHidden";
    visibilityChange="mozvisibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden="msHidden";
    visibilityChange="msvisibilitychange";
  } else if (typeof document.webkitHidden!=="undefined") {
    hidden="webkitHidden";
    visibilityChange="webkitvisibilitychange";
  } else if (typeof document.hidden !=="hidden") {
    hidden="hidden";
    visibilityChange="visibilitychange";
  }

  var potentialPageVisibility = {
    pageVisibilityChangeThreshold:3*3600, // in seconds
    init:function() {
      function setAsNotHidden() {
        var dispatchEventRequired=document.potentialHidden;
        document.potentialHidden=false;
        document.potentiallyHiddenSince=0;
        if (dispatchEventRequired) dispatchPageVisibilityChangeEvent();
      }

      function initPotentiallyHiddenDetection() {
        if (!hasFocusLocal) {
          clearInterval(slideInterval);

          // the window does not has the focus => check for  user activity in the window
          lastActionDate=new Date();
          if (timeoutHandler!=null) {
            clearTimeout(timeoutHandler);
          }
          timeoutHandler = setTimeout(checkPageVisibility, potentialPageVisibility.pageVisibilityChangeThreshold*1000+100); // +100 ms to avoid rounding issues under Firefox
        }
      }

      function dispatchPageVisibilityChangeEvent() {
        unifiedVisilityChangeEventDispatchAllowed=false;
        var evt = document.createEvent("Event");
        evt.initEvent("potentialvisilitychange", true, true);
        document.dispatchEvent(evt);
      }

      function checkPageVisibility() {
        var potentialHiddenDuration=(hasFocusLocal || lastActionDate==null?0:Math.floor((new Date().getTime()-lastActionDate.getTime())/1000));
                                      document.potentiallyHiddenSince=potentialHiddenDuration;
        if (potentialHiddenDuration>=potentialPageVisibility.pageVisibilityChangeThreshold && !document.potentialHidden) {
          // page visibility change threshold reached => raise the event
          document.potentialHidden=true;
          dispatchPageVisibilityChangeEvent();
        }
      }

      var lastActionDate=null;
      var hasFocusLocal=true;
      var hasMouseOver=true;
      document.potentialHidden=false;
      document.potentiallyHiddenSince=0;
      var timeoutHandler = null;

      addEvent(document, "pageshow", function(event) {});
      addEvent(document, "pagehide", function(event) {});
      addEvent(window, "pageshow", function(event) {});
      addEvent(window, "pagehide", function(event) {});
      addEvent(document, "mousemove", function(event) {
        lastActionDate=new Date();
      });
      addEvent(document, "mouseover", function(event) {
        hasMouseOver=true;
        setAsNotHidden();
      });
      addEvent(document, "mouseout", function(event) {
        hasMouseOver=false;
        initPotentiallyHiddenDetection();
      });
      addEvent(window, "blur", function(event) {
        hasFocusLocal=false;
        initPotentiallyHiddenDetection();
      });
      addEvent(window, "focus", function(event) {
        hasFocusLocal=true;
        setAsNotHidden();
      });
      setAsNotHidden();
    }
  }

  potentialPageVisibility.pageVisibilityChangeThreshold=0; // 4 seconds for testing
  potentialPageVisibility.init();
});
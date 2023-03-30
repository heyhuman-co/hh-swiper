import { getDocument } from 'ssr-window';

import onTouchStart from './onTouchStart.js';
import onTouchMove from './onTouchMove.js';
import onTouchEnd from './onTouchEnd.js';
import onResize from './onResize.js';
import onClick from './onClick.js';
import onScroll from './onScroll.js';
import onLoad from './onLoad.js';

let dummyEventAttached = false;
function dummyEventListener() {}

const events = (swiper, method) => {
  const document = getIframeDocument();
  const { params, el, wrapperEl, device } = swiper;
  const capture = !!params.nested;
  const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
  const swiperMethod = method;

  // Touch Events
  el[domMethod]('pointerdown', swiper.onTouchStart, { passive: false });
  document[domMethod]('pointermove', swiper.onTouchMove, { passive: false, capture });
  document[domMethod]('pointerup', swiper.onTouchEnd, { passive: true });
  document[domMethod]('pointercancel', swiper.onTouchEnd, { passive: true });
  document[domMethod]('pointerout', swiper.onTouchEnd, { passive: true });
  document[domMethod]('pointerleave', swiper.onTouchEnd, { passive: true });

  // Prevent Links Clicks
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]('click', swiper.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]('scroll', swiper.onScroll);
  }

  // Resize handler
  if (params.updateOnWindowResize) {
    swiper[swiperMethod](
      device.ios || device.android
        ? 'resize orientationchange observerUpdate'
        : 'resize observerUpdate',
      onResize,
      true,
    );
  } else {
    swiper[swiperMethod]('observerUpdate', onResize, true);
  }

  // Images loader
  el[domMethod]('load', swiper.onLoad, { capture: true });
};

function attachEvents() {
  const swiper = this;
  const document = getIframeDocument();
  const { params } = swiper;

  swiper.onTouchStart = onTouchStart.bind(swiper);
  swiper.onTouchMove = onTouchMove.bind(swiper);
  swiper.onTouchEnd = onTouchEnd.bind(swiper);

  if (params.cssMode) {
    swiper.onScroll = onScroll.bind(swiper);
  }

  swiper.onClick = onClick.bind(swiper);
  swiper.onLoad = onLoad.bind(swiper);

  if (!dummyEventAttached) {
    document.addEventListener('touchstart', dummyEventListener);
    dummyEventAttached = true;
  }

  events(swiper, 'on');
}

function detachEvents() {
  const swiper = this;
  events(swiper, 'off');
}

function getIframeDocument(){
  var iframeDocument =  window.parent.document.querySelector('[id^="heyhuman_iframe-"]').id;.contentWindow.document;
  if(iframeDocument){
    return iframeDocument;
  }
  else{
    console.error("No iframe document found for heyhuman_iframe to attach hh-swiper touchevents");
    return getDocument();
  }
}

export default {
  attachEvents,
  detachEvents,
};

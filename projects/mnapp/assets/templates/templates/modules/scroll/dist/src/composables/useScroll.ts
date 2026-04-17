import type { ComponentPublicInstance } from 'vue';

import { scroll } from 'quasar';

import { requiredConfigEntries } from 'composables/useConfig.js';

const { getScrollTarget, setVerticalScrollPosition } = scroll;

export default function () {
  // Private

  const { scrollDuration, scrollOffset } = requiredConfigEntries('scrollDuration', 'scrollOffset');

  // Methods

  function toTop() {
    const target = getScrollTarget(window.document.body);
    setVerticalScrollPosition(target, 0, scrollDuration);
  }

  function toElement(
    destination: ComponentPublicInstance | Element | ComponentPublicInstance[] | Element[],
    index?: number,
  ) {
    let el: Element | undefined;

    if ((destination as ComponentPublicInstance).$el instanceof Element) {
      el = (destination as ComponentPublicInstance).$el as Element;
    }

    if (destination instanceof Element) {
      el = destination;
    }

    if (destination instanceof Array) {
      if (index === undefined) index = 0;

      destination =
        destination[index] ||
        (() => {
          throw new Error('[mnapp-scroll] Index out of range');
        })();

      if ((destination as ComponentPublicInstance).$el instanceof Element) {
        el = (destination as ComponentPublicInstance).$el as Element;
      }

      if (destination instanceof Element) {
        el = destination;
      }
    }

    el === undefined &&
      (() => {
        throw new Error('[mnapp-scroll] No element to scroll to');
      })();

    const target = getScrollTarget(el);

    let offset = (el as HTMLElement).offsetTop;
    let offsetParent = el as HTMLElement;

    while (offsetParent.offsetParent) {
      offsetParent = offsetParent.offsetParent as HTMLElement;
      offset += offsetParent.offsetTop;
    }

    offset -= scrollOffset;

    setVerticalScrollPosition(target, offset, scrollDuration);
  }

  return {
    toTop,
    toElement,
  };
}

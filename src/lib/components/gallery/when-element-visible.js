/**
 * @param {Element} element
 * @param {(arg0: { isVisibleOnInit: boolean; entry: IntersectionObserverEntry; }) => void} cb
 */
export default function(element, cb, { delay = 300 } = {}) {
  let isInitial = true;
  let prevTime = 0;
  /**
   * @type {string | number | NodeJS.Timeout | undefined}
   */
  let timeoutID;

  const observer = new IntersectionObserver((entries, observer) => {
    const { time, isIntersecting } = entries[0];

    const callback = () => {
      cb({
        isVisibleOnInit: isInitial,
        entry: entries[0]
      });
    }

    if (isIntersecting) {
      if (isInitial) {
        observer.disconnect();
        callback();
      } else {
        timeoutID = setTimeout(() => {
          if (prevTime === time) {
            observer.disconnect();
            callback();
          }
        }, delay);
      }
    }

    prevTime = time;
    isInitial = false;
  });

  observer.observe(element);

  return () => {
    clearTimeout(timeoutID);
    observer.disconnect();
  }
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement /*, fromIndex*/) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
        }

        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) { k = 0; }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}

if (typeof rrDomStickyScroll !== 'function' || typeof rrDomStickyTouchMove !== 'function') {
    var currentScroll,
        currentJourney,
        scrolling = false,
        touchObj = null,
        bodyTop,
        startY,
        dist = 0,
        direction,
        scrollIds = [];

    function buildNav(data, withTransition) {
        var scenes = document.getElementsByClassName('scene');

        scrollIds = ['scene-home'];

        if (typeof data !== 'undefined' && data !== null) {
            scrollIds = scrollIds.concat(data);

            for (i = 0; i < scenes.length; i++) {
                if (scenes[i].id !== 'scene-home') {
                    var id = scenes[i].id;

                    if (scrollIds.includes(id)) {
                        scenes[i].classList.remove('hidden');
                    } else {
                        scenes[i].classList.add('hidden');
                    }
                }
            }
        } else {
            if (typeof scenes !== 'undefined' && scenes !== null && scenes.length > 0) {
                for (i = 0; i < scenes.length; i++) {
                    if (scenes[i].id !== 'scene-home')
                        scenes[i].classList.add('hidden');
                }

            }
        }

        if (typeof withTransition !== 'undefined' && withTransition !== null && withTransition === true)
            currentScroll = 1;
        else 
            currentScroll = 0;

        smoothScroll(scrollIds[currentScroll]);
    }

    function viewJourney(journey, withTransition) {
        if (typeof journey !== 'undefined' && journey !== null) {
            if (journey !== currentJourney) {
                currentJourney = journey;
                buildNav(window.journeys[journey], withTransition);
            }
        }
        else
            buildNav();
    }

    function currentYPosition() {
        // Firefox, Chrome, Opera, Safari
        if (self.pageYOffset)
            return self.pageYOffset;

        // Internet Explorer 6 - standards mode
        if (document.documentElement && document.documentElement.scrollTop)
            return document.documentElement.scrollTop;

        // Internet Explorer 6, 7 and 8
        if (document.body && document.body.scrollTop)
            return document.body.scrollTop;

        return 0;
    }

    function elmYPosition(eID) {
        var elm = document.getElementById(eID),
            y = elm.offsetTop,
            node = elm;

        while (node.offsetParent && node.offsetParent != document.body) {
            node = node.offsetParent;
            y += node.offsetTop;
        }

        return y;
    }

    function smoothScroll(eID) {
        var startY = currentYPosition(),
            stopY = elmYPosition(eID);

        var distance = stopY > startY ? stopY - startY : startY - stopY;

        setActiveScroll(eID);

        var speed = Math.round(distance / 100);

        if (speed >= 20)
            speed = 20;

        var step = Math.round(distance / 25),
            leapY = stopY > startY ? startY + step : startY - step,
            timer = 0;

        if (stopY > startY) {
            for (var i = startY; i < stopY; i += step) {
                setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                leapY += step;

                if (leapY > stopY)
                    leapY = stopY;

                timer++;
            }

            return;
        }

        for (var i = startY; i > stopY; i -= step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY -= step;

            if (leapY < stopY)
                leapY = stopY;

            timer++;
        }
    }

    function setActiveScroll(eID) {
        var currentActive = document.getElementsByClassName('active-scroll')[0],
            currentActiveHeaderNav = document.getElementsByClassName('active-link')[0],
            targetActive = document.getElementById(eID),
            targetActiveHeaderNav = document.getElementById(eID + '-link');

        if (typeof currentActive === 'undefined' || currentActive === null)
            currentActive = {};
        if (typeof currentActiveHeaderNav === 'undefined' || currentActiveHeaderNav === null)
            currentActiveHeaderNav = {};

        if (currentActive.id !== targetActive.id) {
            if (typeof currentActive.id !== 'undefined' && currentActive.id !== null)
                currentActive.classList.remove('active-scroll');
            if (typeof currentActiveHeaderNav.id !== 'undefined' && currentActiveHeaderNav.id !== null && targetActiveHeaderNav !== null)
                currentActiveHeaderNav.classList.remove('active-link');
            
            targetActive.classList.add('active-scroll');
            if (targetActiveHeaderNav !== null)
                targetActiveHeaderNav.classList.add('active-link');

            currentScroll = scrollIds.indexOf(eID);
        }
    }

    function checkActiveScroll() {
        direction = (dist < 0) ? 'down' : 'up';

        var nextScrollIndex = getNextElementIndex(direction);
        var shouldAddActive = checkNextElementPosition(nextScrollIndex, direction);

        var eID = scrollIds[nextScrollIndex];

        if (shouldAddActive) {
            setActiveScroll(eID);
        }
    }

    function getNextElementIndex(direction) {
        var nextElementIndex = currentScroll;

        if (direction === 'up') {
            if (nextElementIndex > 0) {
                nextElementIndex--;
            }
        } else if (direction === 'down') {
            if (nextElementIndex < scrollIds.length - 1) {
                nextElementIndex++;
            }
        } else {
            return;
        }

        return nextElementIndex;
    }

    function checkNextElementPosition(elementIndex, direction) {
        if (elementIndex >= 0 && elementIndex < scrollIds.length) {
            var elementBoundingBox = document.getElementById(scrollIds[elementIndex]).getBoundingClientRect();
            var scrollPoint = window.innerHeight * 0.50;

            if (direction === 'up') {
                // True if next element's bottom reaches 50% of top of the window
                if (scrollPoint < elementBoundingBox.bottom) {
                    currentScroll--;
                    return true;
                }
            } else if (direction === 'down') {
                // True if next element's top reaches 25% of bottom of the window
                if (scrollPoint > elementBoundingBox.top) {
                    currentScroll++;
                    return true;
                }
            }
        }

        return false;
    }

    function rrDomStickyScroll(e) {
        dist = -1 * e.deltaY;
        checkActiveScroll();
    }

    function rrDomStickyTouchMove(e) {
        touchObj = e.changedTouches[0];
        dist = parseInt(touchObj.clientY) - startY;
        checkActiveScroll();
    }

    function rrDomStickyTouchStart(e) {
        touchObj = e.changedTouches[0];
        startY = parseInt(touchObj.clientY);
    }

    window.addEventListener('mousewheel', rrDomStickyScroll, false);
    window.addEventListener('DOMMouseScroll', rrDomStickyScroll, false);

    window.addEventListener('touchmove', rrDomStickyTouchMove, false);
    window.addEventListener('touchstart', rrDomStickyTouchStart, false);
}
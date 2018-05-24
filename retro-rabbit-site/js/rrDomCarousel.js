if (typeof rrDomCarousel != 'function') {
    function rrDomCarousel(id) {

        var carouselId = id;
        var activeIndex = 0;
        var containerWidth = 0;
        var prevTotal = 0;
        var carouselObj = [];

        function GetCarouselObj() {
            loadJSON(function (data) {
                carouselObj = JSON.parse(data);

                BuildCarousel(carouselObj);

            }, 'js/carouselItems.json');
        }

        function DoMiniScroll(index, carousel) {
            if (activeIndex != index) {
                var miniScrollElements = carousel.querySelector("#mini-slider").getElementsByClassName('mini-scroll');
                miniScrollElements[activeIndex].className = "mini-scroll";

                var headerElements = carousel.getElementsByClassName("heading");
                var imageElements = carousel.getElementsByClassName("image");
                var contentElements = carousel.getElementsByClassName("contents");

                contentElements[activeIndex].className = "contents off";
                activeIndex = index;

                contentElements[activeIndex].className = "contents on";
                miniScrollElements[activeIndex].className += " selected";
                prevTotal = headerElements[0] && headerElements[0].clientWidth * activeIndex;

                headerElements[0] && DoTransition(headerElements, imageElements, contentElements, prevTotal);
            }

        }


        function BuildCarousel(carouselObj) {
            var carousel = document.getElementById(carouselId);
            var carouselItems = carousel.getElementsByClassName("carousel-items")[0];
            var headerContainer = carousel.getElementsByClassName('headings-container')[0];
            var imagesContainer = carousel.getElementsByClassName('images-container')[0];
            var contentsContainer = carousel.getElementsByClassName('contents-container')[0];
            var carouselMiniScroll = carousel.querySelector("#mini-slider");


            var carouselWidth = carousel.clientWidth;

            carouselMiniScroll.style.width = carousel.clientWidth + "px";

            containerWidth = carousel.clientWidth * carouselObj.length;

            carousel.style.width = carouselWidth + "px";

            carouselItems.style.overflowX = "hidden";
            carouselItems.style.width = containerWidth + "px";

            headerContainer.style.width = containerWidth + "px";
            headerContainer.style.overflowX = "hidden";

            imagesContainer.style.width = containerWidth + "px";
            imagesContainer.style.overflow = "hidden";

            contentsContainer.style.width = containerWidth + "px";
            contentsContainer.style.overflowX = "hidden";

            for (var x = 0; x < carouselObj.length; x++) {
                if (x != carouselObj.length) {
                    var heading = document.createElement("div");
                    var image = document.createElement("div");
                    var contents = document.createElement("div");
                    var label = document.createElement("label");

                    label.className = (x == 0) ? "mini-scroll selected" : "mini-scroll";

                    (function (index) {
                        label.addEventListener("click", function () {
                            DoMiniScroll(index, carousel)
                        });
                    })(x);




                    heading.innerHTML = '<div class="container" ><h4>' + carouselObj[x].heading + '</h4></div>';
                    heading.className = (x == 0) ? "heading on" : "heading off";
                    heading.style.width = carouselWidth + "px";


                    image.style.backgroundImage = "url('" + carouselObj[x].image + "')";
                    image.className = (x == 0) ? "image on" : "image off";
                    image.style.width = carouselWidth + "px";


                    contents.innerHTML = '<div class="container" >' + carouselObj[x].content + '</div>';
                    contents.className = (x == 0) ? "contents on" : "contents off";
                    contents.style.width = carouselWidth + "px";

                    headerContainer.appendChild(heading);
                    imagesContainer.appendChild(image);
                    contentsContainer.appendChild(contents);
                    carouselMiniScroll.appendChild(label);
                }
            }

            CreateScrollListener();
        }

        function CreateScrollListener() {
            var carousel = document.getElementById(carouselId);
            var carouselItems = carousel.getElementsByClassName("carousel-items")[0];
            var headerContainer = carousel.getElementsByClassName('headings-container')[0];
            var imagesContainer = carousel.getElementsByClassName('images-container')[0];
            var contentsContainer = carousel.getElementsByClassName('contents-container')[0];
            var carouselMiniScroll = document.getElementById("mini-slider");

            var headerElements = headerContainer.getElementsByClassName("heading");
            var imageElements = imagesContainer.getElementsByClassName("image");
            var contentElements = contentsContainer.getElementsByClassName("contents");
            var miniScrollElements = document.getElementById("mini-slider").getElementsByClassName('mini-scroll');

            var carouselTouchObject;
            var carouselTouchStartX;
            var carouselTouchOrigSlide;
            var carouselTouchStartTranslate;

            var scrollPrev = carousel.querySelector('.scrollPrev');
            var scrollNext = carousel.querySelector('.scrollNext');

            prevTotal = containerWidth;

            scrollNext.addEventListener("click", function () {
                miniScrollElements[activeIndex].className = "mini-scroll";
                contentElements[activeIndex].className = "contents off";

                activeIndex = activeIndex + 1;

                if (activeIndex >= headerElements.length) {
                    activeIndex = 0;
                }

                prevTotal = headerElements[0].clientWidth * activeIndex;

                if (prevTotal >= containerWidth) {
                    prevTotal = 0;
                }

                contentElements[activeIndex].className = "contents on";
                miniScrollElements[activeIndex].className += " selected";
                DoTransition(headerElements, imageElements, contentElements, prevTotal);
            });

            scrollPrev.addEventListener("click", function () {
                miniScrollElements[activeIndex].className = "mini-scroll";
                contentElements[activeIndex].className = "contents off";

                prevTotal -= headerElements[0].clientWidth;
                activeIndex = activeIndex - 1;

                if (activeIndex < 0) {
                    activeIndex = headerElements.length - 1;
                }
                if (prevTotal < 0) {
                    prevTotal = containerWidth - headerElements[0].clientWidth;
                }

                contentElements[activeIndex].className = "contents on";
                miniScrollElements[activeIndex].className += " selected";
                DoTransition(headerElements, imageElements, contentElements, prevTotal);
            });

            carouselItems.addEventListener('touchmove', function (e) {
                carouselTouchObject = e.changedTouches[0];

                dist = parseInt(carouselTouchObject.clientX) - carouselTouchStartX;
                var dragPosition = (carouselTouchStartTranslate - dist);

                DoTransition(headerElements, imageElements, contentElements, dragPosition);

                miniScrollElements[activeIndex].className = "mini-scroll";
                contentElements[activeIndex].className = "contents off";

                if (dist > 100) {
                    activeIndex = carouselTouchOrigSlide - 1;
                } else if (dist < -100) {
                    activeIndex = carouselTouchOrigSlide + 1;
                } else {
                    activeIndex = carouselTouchOrigSlide;
                }

                if (activeIndex >= contentElements.length)
                    activeIndex = contentElements.length - 1;
                if (activeIndex < 0)
                    activeIndex = 0;

                contentElements[activeIndex].className = "contents on";
                miniScrollElements[activeIndex].className += " selected";
            }, false);

            carouselItems.addEventListener('touchstart', function (e) {
                carouselTouchObject = e.changedTouches[0];
                carouselTouchStartX = parseInt(carouselTouchObject.clientX);

                carouselTouchOrigSlide = activeIndex;

                var slideWidth = carousel.clientWidth;
                carouselTouchStartTranslate = (carouselTouchOrigSlide * slideWidth) + (carouselTouchOrigSlide * 4);

                carouselItems.classList.add('quick-transform-transition');
            }, false);

            carouselItems.addEventListener('touchend', function (e) {
                carouselItems.classList.remove('quick-transform-transition');

                prevTotal = carousel.clientWidth * activeIndex;
                
                DoTransition(headerElements, imageElements, contentElements, prevTotal);
            }, false);
        }


        function DoTransition(headerElements, imageElements, contentElements, prevTotal) {
            for (var x = 0; x < headerElements.length; x++) {
                headerElements[x].style['transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                headerElements[x].style['-ms-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                headerElements[x].style['-moz-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                headerElements[x].style['-webkit-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';

                imageElements[x].style['transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                imageElements[x].style['-ms-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                imageElements[x].style['-moz-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                imageElements[x].style['-webkit-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';

                contentElements[x].style['transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                contentElements[x].style['-ms-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                contentElements[x].style['-moz-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
                contentElements[x].style['-webkit-transform'] = 'translate3d(-' + prevTotal + 'px,0,0)';
            }
        }

        function ReSize(event) {
            var carousel = document.getElementById(carouselId);
            var carouselItems = carousel.getElementsByClassName("carousel-items")[0];
            var headerContainer = carousel.getElementsByClassName('headings-container')[0];
            var imagesContainer = carousel.getElementsByClassName('images-container')[0];
            var contentsContainer = carousel.getElementsByClassName('contents-container')[0];
            var carouselMiniScroll = document.getElementById("mini-slider");

            /*var paddingLeft = parseInt(window.getComputedStyle(carousel, null).getPropertyValue('padding-left').replace("px",""));
            var paddingRight = parseInt(window.getComputedStyle(carousel, null).getPropertyValue('padding-right').replace("px",""));

           var carouselWidth = document.getElementById(carouselId+'-parent').clientWidth - (paddingLeft+paddingRight);*/

            var carouselWidth = document.getElementById(carouselId + '-parent').clientWidth

            carousel.style.width = carouselWidth + "px";
            carouselMiniScroll.style.width = carouselWidth + "px";
            var headerElements = headerContainer.getElementsByClassName("heading");
            var imageElements = imagesContainer.getElementsByClassName("image");
            var contentElements = contentsContainer.getElementsByClassName("contents");


            for (var x = 0; x < headerElements.length; x++) {
                headerElements[x].style.width = carouselWidth + "px";


                imageElements[x].style.width = carouselWidth + "px";

                contentElements[x].style.width = carouselWidth + "px";
            }

            prevTotal = carouselWidth * activeIndex;


            containerWidth = carouselWidth * carouselObj.length;

            carouselItems.style.width = containerWidth + "px";

            headerContainer.style.width = containerWidth + "px";

            imagesContainer.style.width = containerWidth + "px";

            contentsContainer.style.width = containerWidth + "px";

            DoTransition(headerElements, imageElements, contentElements, prevTotal);

        }

        window.onresize = function (event) {
            ReSize(event);
        };

        GetCarouselObj()

    }
}
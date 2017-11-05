(function($){//Модули: 
//Скролл лучше неуменьшать оно и так идёт поверх контента
//Недостаток - плагин определяет скрыт скролл или нет по классам в боди и атрибуту style overflow: hidden
var defaultOptions = {
    nameIFrame: "",
    pixelsScrollableInSeconds: 2000,
    minWOuterScroll: 23,
    minHOuterScroll: 23,
    permanentVisible: true,
    lookClasses: []
};

var customScrollIFrame = function($container, options) {
    this._options = options;
    var ____ = this;

    //хак для плавности скролла в ie11
    ____.$fix_animate = $('<div class="csif-fix-animate"></div>');
    
    this._create = function() {
        //Вставка HTML скроллов
        ____._initPasteHTML();
        
        //Скрыть скролл в iFrame
        var $iFrame = $('#'+(____._options.nameIFrame)).contents();
        $iFrame.find(' head').append('\n\
            <style id="csif-clear-scroll-body" type="text/css">\n\
                body {\n\
                    overflow: hidden !important;\n\
                }\n\
            </style>\n\
        ');

        //Проверять скрывают ли скролл плагины
        ____.look = false;
        ____.lookInterval = setInterval(____.checkLook, 100);
        
        //Свойства для ползунков
        ____._Y_Scrollable = false;
        ____._X_Scrollable = false;
        ____._cursor_Y = 0;
        ____._cursor_X = 0;
        ____._topScrollIFrameTemp = 0;
        ____._leftScrollIFrameTemp = 0;

        ____._fixVisibleOuterScroll = false;
        ____._temporarilyVisibledOuterScrollTimeout = null;

        //Установка обработчиков событий
        var iframe = document.getElementById(____._options.nameIFrame);
        var win = iframe.contentWindow || iframe;
        $(win).on("resize scroll", ____.updateOuterScroll);
        $(window).on("resize", ____.updateOuterScroll);
        
        $container.find(' .csif-outer-scroll-v .scrolling').on('mousedown', ____._handlerDown_Y);
        $container.find(' .csif-outer-scroll-g .scrolling').on('mousedown', ____._handlerDown_X);
        $iFrame.find('body').on('mouseup', ____._handlerUp);
        $('body').on('mouseup', ____._handlerUp);
        $iFrame.find('body').on('mousemove', ____._handlerMove);
        $('body').on('mousemove', ____._handlerMove);
        
        $container.find(' .csif-outer-scroll-v .arrow-top').on('mousedown', ____._handlerArrowTop);
        $container.find(' .csif-outer-scroll-v .arrow-bottom').on('mousedown', ____._handlerArrowBottom);
        $container.find(' .csif-outer-scroll-g .arrow-left').on('mousedown', ____._handlerArrowLeft);
        $container.find(' .csif-outer-scroll-g .arrow-right').on('mousedown', ____._handlerArrowRight);
        $container.find(' .csif-outer-scroll-v .arrow').on('mouseup mouseleave', ____._handlerArrowLeave);
        $container.find(' .csif-outer-scroll-g .arrow').on('mouseup mouseleave', ____._handlerArrowLeave);
        
        $iFrame.find('body').on('wheel', ____._handlerMouseWheel);
        
        //Первое выполнение
         ____.updateOuterScroll();
        if(____._options.permanentVisible) {
            $container.find(' .csif-outer-scroll-v').addClass("active");
            $container.find(' .csif-outer-scroll-g').addClass("active");
            $container.find(' .csif-square').addClass("active");
        }
    }
    
    this._destroy = function() {
        var $iFrame = $('#'+(____._options.nameIFrame)).contents();

        if(____.lookInterval !== undefined) {clearInterval(____.lookInterval)}
        
        $container.find(" .csif-outer-scroll-v").remove();
        $container.find(" .csif-outer-scroll-g").remove();
        $container.find(" .csif-square").remove();
        
        $(window).off("resize", ____.updateOuterScroll);
        
        $iFrame.find('body').off('mouseup', ____._handlerUp);
        $('body').off('mouseup', ____._handlerUp);
        $iFrame.find('body').off('mousemove', ____._handlerMove);
        $('body').off('mousemove', ____._handlerMove);

        $container.find(' .csif-outer-scroll-v .arrow-top').off('mousedown', ____._handlerArrowTop);
        $container.find(' .csif-outer-scroll-v .arrow-bottom').off('mousedown', ____._handlerArrowBottom);
        $container.find(' .csif-outer-scroll-g .arrow-left').off('mousedown', ____._handlerArrowLeft);
        $container.find(' .csif-outer-scroll-g .arrow-right').off('mousedown', ____._handlerArrowRight);
        $container.find(' .csif-outer-scroll-v .arrow').off('mouseup mouseleave', ____._handlerArrowLeave);
        $container.find(' .csif-outer-scroll-g .arrow').off('mouseup mouseleave', ____._handlerArrowLeave);
        
        $iFrame.find('body').off('wheel', ____._handlerMouseWheel);
    }
    
    this.reload = function() {
        ____._destroy();
        ____._create();
    }
    
    //Просто вставка html
    this._initPasteHTML = function() {
        $container.append('\n\
            <div class="csif-outer-scroll-v">\n\
                <div class="csif-container">\n\
                    <div class="arrow arrow-top"><i class="glyphicon glyphicon-chevron-up"></i></div>\n\
                    <div class="arrow arrow-bottom"><i class="glyphicon glyphicon-chevron-down"></i></div>\n\
                    <div class="scrolling-container">\n\
                        <div class="scrolling"></div>\n\
                    </div>\n\
                </div>\n\
            </div>\n\
            <div class="csif-outer-scroll-g">\n\
                <div class="csif-container">\n\
                    <div class="arrow arrow-left"><i class="glyphicon glyphicon-chevron-left"></i></div>\n\
                    <div class="arrow arrow-right"><i class="glyphicon glyphicon-chevron-right"></i></div>\n\
                    <div class="scrolling-container">\n\
                        <div class="scrolling"></div>\n\
                    </div>\n\
                </div>\n\
            </div>\n\
            <div class="csif-square"></div>\n\
        ');
    }

    //Блокировка скролла если какойто плагин установил свойство overflow в "hidden" для тега body
    this.checkLook = function() {
        var lookOld = ____.look;
        ____.look = false;

        var $body = $('#'+(____._options.nameIFrame)).contents().find('body');
        for(var i in ____._options.lookClasses) {
            ____.look = ____.look || $body.hasClass(____._options.lookClasses[i]);
            if(____.look) {
                break;
            }
        }
        if($body.attr('style') !== undefined && $body.attr('style') !== null) {
            ____.look = ____.look || /overflow:\s*hidden\s*;/gi.test($body.attr('style'));
        }

        if(lookOld !== ____.look) {
            $container.find(" .csif-outer-scroll-v").toggleClass("csif-look", ____.look);
            $container.find(" .csif-outer-scroll-g").toggleClass("csif-look", ____.look);
            $container.find(" .csif-square").toggleClass("csif-look", ____.look);
        }
    }
    
    //Обновление ползунков "Внешнего скролла"
    this.updateOuterScroll = function() {
        var iframe = document.getElementById(____._options.nameIFrame);
        var win = iframe.contentWindow || iframe;
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        var $iframe = $('#'+(____._options.nameIFrame)).contents();
        var wWindow, hWindow, wDocument, hDocument, topScroll, leftScroll,
        wOuterScroll, hOuterScroll, hConOuterScroll, wConOuterScroll, topMargin, leftMargin;
        
        wWindow = $(win).width();
        hWindow = $(win).height();
        wDocument = $(doc).width();
        hDocument = $(doc).height();
        
        //Узнаем прокрутку
        topScroll = $(win).scrollTop();
        leftScroll = $(win).scrollLeft();
        //==========
        
        hConOuterScroll = $container.find(' .csif-outer-scroll-v .scrolling-container').height();
        wConOuterScroll = $container.find(' .csif-outer-scroll-g .scrolling-container').width();
        
        //Вычисляем размеры элементов "за которые можно прокручивать" на внешнем скролле и отступы для смешения чтоб показать насколько прокручена страница
        hOuterScroll = Math.round(hWindow / hDocument * hConOuterScroll);
        if(hOuterScroll < ____._options.minHOuterScroll)
        {
            hOuterScroll = ____._options.minHOuterScroll;
        }
        topMargin = Math.round(topScroll / (hDocument - hWindow) * (hConOuterScroll - hOuterScroll));
        
        wOuterScroll = Math.round(wWindow / wDocument * wConOuterScroll);
        if(wOuterScroll < ____._options.minWOuterScroll)
        {
            wOuterScroll = ____._options.minWOuterScroll;
        }
        leftMargin = Math.round(leftScroll / (wDocument - wWindow) * (wConOuterScroll - wOuterScroll));
        //==========
        $container.find(' .csif-outer-scroll-v .scrolling').css({height: hOuterScroll, marginTop: topMargin});
        $container.find(' .csif-outer-scroll-g .scrolling').css({width: wOuterScroll, marginLeft: leftMargin});

        ____.temporarilyVisibleOuterScroll();
    }

    //Добавляем класс "active" на 1 сек
    this.temporarilyVisibleOuterScroll = function(e) {
        if(!____._options.permanentVisible) {
            if(!____._fixVisibleOuterScroll) {
                if(____._temporarilyVisibledOuterScrollTimeout !== null) {
                    clearTimeout(____._temporarilyVisibledOuterScrollTimeout);
                }

                $container.find(' .csif-outer-scroll-v').addClass("active");
                $container.find(' .csif-outer-scroll-g').addClass("active");
                $container.find(' .csif-square').addClass("active");

                ____._temporarilyVisibledOuterScrollTimeout = setTimeout(function() {
                    $container.find(' .csif-outer-scroll-v').removeClass("active");
                    $container.find(' .csif-outer-scroll-g').removeClass("active");
                    $container.find(' .csif-square').removeClass("active");
                    ____._temporarilyVisibledOuterScrollTimeout = null;
                }, 1000);
            }
        }
    }

    //Добавляем класс "active"
    this.visibleOuterScroll = function(e) {
        if(!____._options.permanentVisible) {
            ____._fixVisibleOuterScroll = true;
            $container.find(' .csif-outer-scroll-v').addClass("active");
            $container.find(' .csif-outer-scroll-g').addClass("active");
            $container.find(' .csif-square').addClass("active");
            if(____._temporarilyVisibledOuterScrollTimeout !== null) {
                clearTimeout(____._temporarilyVisibledOuterScrollTimeout);
                ____._temporarilyVisibledOuterScrollTimeout = null;
            }
        }
    }

    //Удаляем класс "active"
    this.hideOuterScroll = function(e) {
        if(!____._options.permanentVisible) {
            ____._fixVisibleOuterScroll = false;
            $container.find(' .csif-outer-scroll-v').removeClass("active");
            $container.find(' .csif-outer-scroll-g').removeClass("active");
            $container.find(' .csif-square').removeClass("active");
            if(____._temporarilyVisibledOuterScrollTimeout !== null) {
                clearTimeout(____._temporarilyVisibledOuterScrollTimeout);
                ____._temporarilyVisibledOuterScrollTimeout = null;
            }
        }
    }
    
    //Нажатие на вертикальный ползунок
    this._handlerDown_Y = function(e) {
        ____._Y_Scrollable = true;
        ____._cursor_Y = e.screenY;
        var iframe = document.getElementById(____._options.nameIFrame);
        var win = iframe.contentWindow || iframe;
        ____._topScrollIFrameTemp = $(win).scrollTop();
        ____.visibleOuterScroll();
    }
    
    //Нажатие на горизонтальный ползунок
    this._handlerDown_X = function(e) {
        ____._X_Scrollable = true;
        ____._cursor_X = e.screenX;
        var iframe = document.getElementById(____._options.nameIFrame);
        var win = iframe.contentWindow || iframe;
        ____._leftScrollIFrameTemp = $(win).scrollLeft();
        ____.visibleOuterScroll();
    }
    
    //Отпускание мыши с ползунка
    this._handlerUp = function() {
        ____._Y_Scrollable = false;
        ____._X_Scrollable = false;

        ____.hideOuterScroll();
    }
    
    //Обновление скрытого скролла в IFrame
    this._handlerMove = function(e) {
        if(!____.look) {
            if( ____._Y_Scrollable || ____._X_Scrollable ) {
                var iframe = document.getElementById(____._options.nameIFrame);
                var win = iframe.contentWindow || iframe;
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                var $iframe = $("#"+(____._options.nameIFrame)).contents();
                var wWindow, hWindow, wDocument, hDocument, topScroll, leftScroll,
                    wOuterScroll, hOuterScroll, hConOuterScroll, wConOuterScroll,
                    resTopScroll, resLeftScroll, oneStepVertical, oneStepGorizontal;

                wWindow = $(win).width();
                hWindow = $(win).height();
                wDocument = $(doc).width();
                hDocument = $(doc).height();

                //Узнаем прокрутку
                topScroll = $(win).scrollTop();
                leftScroll = $(win).scrollLeft();
                //==========

                hConOuterScroll = $container.find(' .csif-outer-scroll-v .scrolling-container').height();
                wConOuterScroll = $container.find(' .csif-outer-scroll-g .scrolling-container').width();

                //Вычисляем размеры элементов "за которые можно прокручивать" на внешнем скролле и отступы для смешения чтоб показать насколько прокручена страница
                hOuterScroll = hWindow / hDocument * hConOuterScroll;
                if(hOuterScroll < ____._options.minHOuterScroll)
                {
                    hOuterScroll = ____._options.minHOuterScroll;
                }

                wOuterScroll = wWindow / wDocument * wConOuterScroll;
                if(wOuterScroll < ____._options.minWOuterScroll)
                {
                    wOuterScroll = ____._options.minWOuterScroll;
                }
                //==========
                if(____._Y_Scrollable)
                {
                    oneStepVertical = (hDocument - hWindow) / (hConOuterScroll - hOuterScroll);
                    resTopScroll = Math.round((e.screenY - ____._cursor_Y) * oneStepVertical + ____._topScrollIFrameTemp);
                    if(resTopScroll < 0)
                    {
                        resTopScroll = 0;
                    }
                    if(resTopScroll > hDocument - hWindow)
                    {
                        resTopScroll = hDocument - hWindow;
                    }
                    $(win).scrollTop(resTopScroll);
                    $container.trigger("csif.scroll");
                }

                if(____._X_Scrollable)
                {
                    oneStepGorizontal = (wDocument - wWindow) / (wConOuterScroll - wOuterScroll);
                    resLeftScroll = Math.round((e.screenX - ____._cursor_X) * oneStepGorizontal + ____._leftScrollIFrameTemp);
                    if(resLeftScroll < 0)
                    {
                        resLeftScroll = 0;
                    }
                    if(resLeftScroll > wDocument - wWindow)
                    {
                        resLeftScroll = wDocument - wWindow;
                    }
                    $(win).scrollLeft(resLeftScroll);
                    $container.trigger("csif.scroll");
                }
            }
        }
    }
    
    //Верхняя стрелочка
    this._handlerArrowTop = function() {
        if(!____.look) {
            var iframe = document.getElementById(____._options.nameIFrame);
            var win = iframe.contentWindow || iframe;

            $(this).addClass('active');

            var topScroll = $(win).scrollTop();

            ____.$fix_animate.css({top: topScroll});
            ____.$fix_animate.stop().animate({top: 0}, //По нормальному чтото она непашет - пришлось через зад делать...
                {
                    duration: Math.round(topScroll / ____._options.pixelsScrollableInSeconds * 1000),
                    easing: "linear",
                    complete: function(){
                        $(win).scrollTop(0);
                        $container.trigger("csif.scroll");
                    },
                    step: function(now,fx){
                        $(win).scrollTop(now);
                        $container.trigger("csif.scroll");
                    }
                });
        }
    }
    
    //Нижняя стрелочка
    this._handlerArrowBottom = function() {
        if(!____.look) {
            var iframe = document.getElementById(____._options.nameIFrame);
            var win = iframe.contentWindow || iframe;
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            $(this).addClass('active');
            var hWindow, hDocument, topScroll;

            hWindow = $(win).height();
            hDocument = $(doc).height();
            topScroll = $(win).scrollTop();

            var resTopScroll = hDocument - hWindow;

            ____.$fix_animate.css({top: topScroll});
            ____.$fix_animate.stop().animate({top: resTopScroll},
                {
                    duration: Math.round((hDocument - hWindow - topScroll) / ____._options.pixelsScrollableInSeconds * 1000),
                    easing: "linear",
                    complete: function(){
                        $(win).scrollTop(resTopScroll);
                        $container.trigger("csif.scroll");
                    },
                    step: function(now,fx){
                        $(win).scrollTop(now);
                        $container.trigger("csif.scroll");
                    }
                });
        }
    }
    //Левая стрелочка
    this._handlerArrowLeft = function() {
        if(!____.look) {
            var iframe = document.getElementById(____._options.nameIFrame);
            var win = iframe.contentWindow || iframe;
            $(this).addClass('active');

            var leftScroll = $(win).scrollLeft();

            ____.$fix_animate.css({left: leftScroll});
            ____.$fix_animate.stop().animate({left: 0},
                {
                    duration: Math.round(leftScroll / ____._options.pixelsScrollableInSeconds * 1000),
                    easing: "linear",
                    complete: function(){
                        $(win).scrollLeft(0);
                        $container.trigger("csif.scroll");
                    },
                    step: function(now,fx){
                        $(win).scrollLeft(now);
                        $container.trigger("csif.scroll");
                    }
                });
        }
    }

    //Правая стрелочка
    this._handlerArrowRight = function() {
        if(!____.look) {
            var iframe = document.getElementById(____._options.nameIFrame);
            var win = iframe.contentWindow || iframe;
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            $(this).addClass('active');
            var wWindow, wDocument, leftScroll;

            wWindow = $(win).width();
            wDocument = $(doc).width();
            leftScroll = $(win).scrollLeft();

            var resLeftScroll = wDocument - wWindow;

            ____.$fix_animate.css({left: leftScroll});
            ____.$fix_animate.stop().animate({left: resLeftScroll},
                {
                    duration: Math.round((wDocument - wWindow - leftScroll) / ____._options.pixelsScrollableInSeconds * 1000),
                    easing: "linear",
                    complete: function(){
                        $(win).scrollLeft(resLeftScroll);
                        $container.trigger("csif.scroll");
                    },
                    step: function(now,fx){
                        $(win).scrollLeft(now);
                        $container.trigger("csif.scroll");
                    }
                });
        }
    }
    
    //Убрать мышку со стрелочки
    this._handlerArrowLeave = function() {
        ____.$fix_animate.stop();
        $(this).removeClass('active');
    }
    
    //Прокрутка колесом мыши
    this._mouseWheelAnimated = false;
    this._tempWheelAnimated = 0;
    this._handlerMouseWheel = function(e) {
        if(!____.look) {
            if(____._options.nameIFrame in window) {
                var deltaY;
                if("mozMovementY" in e.originalEvent) {
                    deltaY = e.originalEvent.deltaY || -1 * e.originalEvent.wheelDelta;
                    deltaY *= 40;
                } else if( /rv\:11/.test(navigator.userAgent) ) {
                    if( (e.originalEvent.deltaY || -1 * e.originalEvent.wheelDelta) > 0 ) {
                        deltaY = 120;
                    } else {
                        deltaY = -120;
                    }
                } else if( /Firefox\//.test(navigator.userAgent) ) {
                    deltaY = e.originalEvent.deltaY || -1 * e.originalEvent.wheelDelta;
                    deltaY *= 40;
                } else {
                    deltaY = e.originalEvent.deltaY || -1 * e.originalEvent.wheelDelta;
                    if(Math.abs(deltaY) < 50) {
                        deltaY *= 120;
                    }
                }

                var iframe = document.getElementById(____._options.nameIFrame);
                var win = iframe.contentWindow || iframe;

                topScroll = $(win).scrollTop();
                if( ____._mouseWheelAnimated ) {
                    //Если пользователь резко начал крутить в другую сторону
                    if(sign(____._tempWheelAnimated - topScroll) !== sign(deltaY)) {//IE НЕПОТДЕРЖИВАЕТ "Math.sign"
                        ____._tempWheelAnimated = topScroll + deltaY;
                    } else {
                        ____._tempWheelAnimated += deltaY;
                    }
                } else {
                    ____._tempWheelAnimated = topScroll + deltaY;
                }
                function sign(number) {
                    if( number > 0 ) {
                        return 1;
                    } else if( number === 0 ) {
                        return 0;
                    } else {
                        return -1;
                    }
                }

                ____._mouseWheelAnimated = true;

                ____.$fix_animate.css({top: topScroll});
                ____.$fix_animate.stop().animate({top: ____._tempWheelAnimated},
                    {
                        duration: 100,
                        easing: "linear",
                        complete: function(){
                            $(win).scrollTop(____._tempWheelAnimated);
                            ____._mouseWheelAnimated = false;

                            $container.trigger("csif.scroll");
                        },
                        step: function(now,fx){
                            $(win).scrollTop(now);

                            $container.trigger("csif.scroll");
                        }
                    });
            }
        }
    }
}

modules.customScrollIFrame = customScrollIFrame;
    
})(jQuery);
(function($){//Модули: malihu-custom-scrollbar

var defaultOptions = {
    dirScrins: "a-pp-design-screenshots",
    nameIFrame: "PP_iframe"
};

var pixelPerfect = function($container, options) {
    this._options = options;
    var ____ = this;
    ____.$container = $container;
    
    this._create = function( href ) {
        $container.append('<div class="pp-design"></div>');
        
        //свойства
        ____.intervalRefreshByResizeDocument = null;
        ____.wIFrame = null;
        ____.checkBottomSpace__interval = null;
        
        ____.changePositionTemp = {};
        
        //Установка событий
        var iframe = document.getElementById(____._options.nameIFrame);
        var win = iframe.contentWindow || iframe;
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        $(win).on("scroll", ____._refreshByScroll);
        $(win).on('resize', ____._refreshByResizeDocument);
        ____.intervalRefreshByResizeDocument = setInterval(function(){
            var iframe = document.getElementById(____._options.nameIFrame);
            var win = iframe.contentWindow || iframe;
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            if( ____.wIFrame === null || ____.wIFrame !== Math.round( $(doc).width() ) ) {
                ____.wIFrame = Math.round( $(doc).width() );
                ____._refreshByResizeDocument();
            }
        }, 1000);
    }
    
    this._destroy = function() {
        if(____.intervalRefreshByResizeDocument !== null) {
            clearInterval( ____.intervalRefreshByResizeDocument );
        }
        $container.find( " .pp-design" ).remove();
    }
    
    this._refreshByScroll = function() {
        var $design = $container.find( " .pp-design" );
        var iframe = document.getElementById(____._options.nameIFrame);
        var win = iframe.contentWindow || iframe;
        var doc = iframe.contentDocument || iframe.contentWindow.document;

        if(iframe !== null) {
            $design.find( " .pp-screen-static" ).css({
                top: "-" + Math.round( $(win).scrollTop() ) + "px",
                left: "-" + Math.round( $(win).scrollLeft() ) + "px"
            });
        }
    }
    
    this._refreshByResizeDocument = function() {
        var iframe = document.getElementById(____._options.nameIFrame);

        if(iframe !== null) {
            var win = iframe.contentWindow || iframe;
            var doc = iframe.contentDocument || iframe.contentWindow.document;

            var $design = $container.find( " .pp-design" );

            $design.find( " .pp-screen-static" ).css({
                width: Math.round( $(doc).width() )
            });
        }
    }
    
    this.refreshScrins = function(collectionScrins, sizeScrins) {
        if(collectionScrins !== null) {
            var scrinsModified = false;
            var scrinsChangePos = false;
            if(!("collectionScrinsTemp" in ____)) {
                scrinsModified = true;
            } else if(typeof ____.collectionScrinsTemp !== typeof collectionScrins) {//null или обьект
                scrinsModified = true;
            } else if(____.collectionScrinsTemp.length != collectionScrins.length) {
                scrinsModified = true;
            } else {
                for(var i in ____.collectionScrinsTemp) {
                    var a = ____.collectionScrinsTemp[i];
                    var b = collectionScrins[i];
                    if(a.urn !== b.urn || a.active !== b.active) {
                        scrinsModified = true;
                        break;
                    } else if(a.pos !== b.pos || a.l !== b.l || a.t !== b.t || a.lpx !== b.lpx || a.tpx !== b.tpx || a.lper !== b.lper || a.tper !== b.tper) {
                        scrinsChangePos = true;
                    }
                }
            }

            if(scrinsModified) {
                ____.refreshAllScrins(collectionScrins, sizeScrins);
            } else if(scrinsChangePos) {
                ____.refreshPosScrins(collectionScrins);
            }

            ____._refreshByScroll();
            ____._refreshByResizeDocument();
        } else {
            ____._deleteScrins();
        }
    }

    this._deleteScrins = function() {
        $container.find( " .pp-design" ).empty();
    }

    this.refreshAllScrins = function(collectionScrins, sizeScrins) {
        ____._deleteScrins();
        var $design = $container.find( " .pp-design" );
        var html = "";

        ____.collectionScrinsTemp = [];

        for(var i in collectionScrins) {
            var s = collectionScrins[i];
            //сохраним изменения
            var newObj = {};
            ____.collectionScrinsTemp.push(newObj);
            //

            if(s.active) {
                if(s.pos == "static") {
                    s.t = "top";
                }

                var l, t, l_img, t_img;
                switch(s.l) {
                    case "left": l = 0; l_img = 0; break;
                    case "center": l = 50; l_img = -50; break;
                    case "right": l = 100; l_img = -100; break;
                }
                switch(s.t) {
                    case "top": t = 0; t_img = 0; break;
                    case "center": t = 50; t_img = -50; break;
                    case "bottom": t = 100; t_img = -100; break;
                }
                html += '\
                    <div class="pp-screen-design pp-screen-'+((s.pos == "static")?"static":"fixed")+'">\
                        <div style="left: '+(s.lper + l)+'%; top: '+(s.tper + t)+'%;" class="pp-wrap-deviation-percent">\
                            <div style="width: ' + sizeScrins[s.urn].w + 'px; height: ' + sizeScrins[s.urn].h + 'px; left: ' + s.lpx + 'px; top: ' + s.tpx + 'px;" class="pp-wrap-deviation-pixels">\
                                <img src="'+(____._options.dirScrins + "/" + s.urn)+'?a-pp=1" style="width: ' + sizeScrins[s.urn].w + 'px; height: ' + sizeScrins[s.urn].h + 'px; left: ' + l_img + '%; top: ' + t_img + '%;"/>\
                            </div>\
                        </div>\
                    </div>';
            }
        }

        $design.append(html);

        ____._refreshByScroll();
        ____._refreshByResizeDocument();
    }

    this.refreshPosScrins = function(collectionScrins) {
        var $design = $container.find( " .pp-design" );

        var i = 0;
        $design.find(" .pp-screen-design").each(function() {
            do {
                i++;
                var a = ____.collectionScrinsTemp[i-1];
                var b = collectionScrins[i-1];
                if((a.pos !== b.pos || a.l !== b.l || a.t !== b.t || a.lpx !== b.lpx || a.tpx !== b.tpx || a.lper !== b.lper || a.tper !== b.tper)) {
                    //записываем изменения
                    a.pos = b.pos, a.l = b.l, a.t = b.t, a.lpx = b.lpx, a.tpx = b.tpx, a.lper = b.lper, a.tper = b.tper;
                    if(b.active) {
                        if(b.pos == "static") {
                            b.t = "top";
                        }

                        var l, t, l_img, t_img;
                        switch(b.l) {
                            case "left": l = 0; l_img = 0; break;
                            case "center": l = 50; l_img = -50; break;
                            case "right": l = 100; l_img = -100; break;
                        }
                        switch(b.t) {
                            case "top": t = 0; t_img = 0; break;
                            case "center": t = 50; t_img = -50; break;
                            case "bottom": t = 100; t_img = -100; break;
                        }

                        //применяем
                        if(b.pos == "static") {
                            if(!$(this).hasClass("pp-screen-static")) {
                                $(this).removeClass("pp-screen-fixed").addClass("pp-screen-static");
                            }
                        } else {
                            if(!$(this).hasClass("pp-screen-fixed")) {
                                $(this).removeClass("pp-screen-static").addClass("pp-screen-fixed");
                            }
                        }
                        $(this).find(" .pp-wrap-deviation-percent").css({left: (b.lper + l) + "%", top: (b.tper + t) + "%"});
                        $(this).find(" .pp-wrap-deviation-pixels").css({left: b.lpx, top: b.tpx});
                        $(this).find(" img").css({left: l_img + "%", top: t_img + "%"});
                    } else {
                        continue;
                    }
                }
            } while(false);
        });
    }
    
    this.showPageProofsOrDesign = function(show) {
        //0 - показать верстку,
        //1 - показать на половину и верстку и дизайн,
        //2 - показать дизайн
        switch (show) {
            case 0:
                $container.find( " .pp-design" ).css({opacity: 0});
                $( '#'+(____._options.nameIFrame) ).css({opacity: 1});
                break;
            case 1:
                $container.find( " .pp-design" ).css({opacity: 1});
                $( '#'+(____._options.nameIFrame) ).css({opacity: 0.5});
                break;
            case 2:
                $container.find( " .pp-design" ).css({opacity: 1});
                $( '#'+(____._options.nameIFrame) ).css({opacity: 0});
                break;
        }
    }

    this.insertBottomSpace = function() {
        if(____.checkBottomSpace__interval !== null) {
            clearInterval(____.checkBottomSpace__interval);
        }

        $('#'+(____._options.nameIFrame)).contents().find(' .a-pp__bottom-space').remove();
        $('#'+(____._options.nameIFrame)).contents().find('body').append('<div class="a-pp__bottom-space" style="height: 1200px;"></div>');
        
        ____.checkBottomSpace__interval = setInterval(function() {
            if($('#'+(____._options.nameIFrame)).contents().find(' .a-pp__bottom-space + *').length) {
                $('#'+(____._options.nameIFrame)).contents().find(' .a-pp__bottom-space').remove();
                $('#'+(____._options.nameIFrame)).contents().find('body').append('<div class="a-pp__bottom-space" style="height: 1200px;"></div>');
            }
            if(!$('#'+(____._options.nameIFrame)).contents().find(' .a-pp__bottom-space').length) {
                $('#'+(____._options.nameIFrame)).contents().find('body').append('<div class="a-pp__bottom-space" style="height: 1200px;"></div>');
            }
        }, 1000);
    }

    this.deleteBottomSpace = function() {
        if(____.checkBottomSpace__interval !== null) {
            clearInterval(____.checkBottomSpace__interval);
            ____.checkBottomSpace__interval = null;
            $('#'+(____._options.nameIFrame)).contents().find(' .a-pp__bottom-space').remove();

            //Хром сохраняет скролл и при возвращении блока сам прокручивает вниз
            var iframe = document.getElementById(____._options.nameIFrame);
            var win = iframe.contentWindow || iframe;
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            var hWindow, hDocument, topScroll;

            hWindow = $(win).height();
            hDocument = $(doc).height();
            topScroll = $(win).scrollTop();

            if(topScroll >= hDocument - hWindow) {
                $(win).scrollTop(0);
                $(win).scrollTop(hDocument - hWindow);
            }
        }
    }
}

    modules.pixelPerfect = pixelPerfect;
    
})(jQuery);
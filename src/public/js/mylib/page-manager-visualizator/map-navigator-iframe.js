(function($){//Модули: 

var defaultOptions = {
    $mapNavigatorContainer: undefined,
    nameIFrame: "",
    minWDraggable: 15,
    minHDraggable: 15,
    responsiveToMovementOfTheCursorInAConfinedSpace: true,//в включённом состоянии запоминает положение курсора, при выходе за границы будет реагировать только при возращении курсора в область реагирования, если отключить то при выходе курсора из области реагирование его состояние будет сбрасываеться и при смене движения модуль будет реагировать неожидая возвращения в область реагирования
    movementOfTheCursorInAConfinedSpaceSpred: 10,//насколько курсор должен выйти за границы реагирования чтобы его состояние начало сбрасываться
    factorDraggableGrid: 0.5
};

var mapNavigatorIFrame = function($container, options) {
    this._options = options;
    var ____ = this;

    ____._last_cursor_Y = 0;
    ____._last_cursor_X = 0;

    this._create = function() {
        var $iFrame = $("#"+(____._options.nameIFrame)).contents();

        ____._options.$mapNavigatorContainer.append('<div class="mnif-show-space panel panel-primary"><div class="mnif-draggable panel-body"></div></div>');
        
        //Свойства для навигатора
        ____._draggable = false;
        ____._cursor_Y = 0;
        ____._cursor_X = 0;
        ____._draggableTopTemp = 0;
        ____._draggableLeftTemp = 0;

        ____._fixVisibleNavigator = false;
        ____._temporarilyVisibledNavigatorTimeout = null;

        //Установка обработчиков событий
        $iFrame.find('body').on('mousemove', ____._handlerMove);
        $('body').on('mousemove', ____._handlerMove);
        //$('body').on('keydown', ____._handlerKeyDown);
        //$iFrame.find('body').on('keydown', ____._handlerKeyDown);
        ____._options.$mapNavigatorContainer.find(" .mnif-draggable").on('mousedown', ____._handlerMouseDown);
        $('body').on('keyup mouseup', ____._handlerUp);
        $iFrame.find('body').on('keyup mouseup', ____._handlerUp);

        //Инициализация
        ____.updateDraggable();
    };
    
    this._destroy = function() {
        ____._options.$mapNavigatorContainer.find(" .mnif-show-space").remove();
        
        var $iFrame = $("#"+(____._options.nameIFrame)).contents();
        
        $iFrame.find('body').off('mousemove', ____._handlerMove);
        $('body').off('mousemove', ____._handlerMove);
        //$('body').off('keydown', ____._handlerKeyDown);
        //$iFrame.find('body').off('keydown', ____._handlerKeyDown);
        ____._options.$mapNavigatorContainer.find(" .mnif-draggable").off('mousedown', ____._handlerMouseDown);
        $('body').off('keyup mouseup', ____._handlerUp);
        $iFrame.find('body').off('keyup mouseup', ____._handlerUp);
    };
    
    this.reload = function() {
        ____._destroy();
        ____._create();
    }

    //Добавляем класс "active" на 1 сек
    this.temporarilyVisibleNavigator = function(e) {
        if(!____._fixVisibleNavigator) {
            if(____._temporarilyVisibledNavigatorTimeout !== null) {
                clearTimeout(____._temporarilyVisibledNavigatorTimeout);
            }

            ____._options.$mapNavigatorContainer.parent().addClass("active");

            ____._temporarilyVisibledNavigatorTimeout = setTimeout(function() {
                ____._options.$mapNavigatorContainer.parent().removeClass("active");
                ____._temporarilyVisibledNavigatorTimeout = null;
            }, 1000);
        }
    };

    //Добавляем класс "active"
    this.visibleNavigator = function(e) {
        ____._fixVisibleNavigator = true;
        ____._options.$mapNavigatorContainer.parent().addClass("active");
        if(____._temporarilyVisibledNavigatorTimeout !== null) {
            clearTimeout(____._temporarilyVisibledNavigatorTimeout);
            ____._temporarilyVisibledNavigatorTimeout = null;
        }
    };

    //Удаляем класс "active"
    this.hideNavigator = function(e) {
        ____._fixVisibleNavigator = false;
        ____._options.$mapNavigatorContainer.parent().removeClass("active");
        if(____._temporarilyVisibledNavigatorTimeout !== null) {
            clearTimeout(____._temporarilyVisibledNavigatorTimeout);
            ____._temporarilyVisibledNavigatorTimeout = null;
        }
    };

    this._handlerKeyDown = function(e) {
        if(e.which == 69 && e.ctrlKey && !e.shiftKey && !e.altKey)
        {
            ____._handlerDown(e);
        }
    };

    this._handlerMouseDown = function(e) {
        ____._handlerDown(e);
    };

    this._handlerDown = function(e) {
        if( !____._draggable ) {
            //Фиксация в пикселах (чтоб меньше багов при расчётах было) и центрирование
            var $mnif = ____._options.$mapNavigatorContainer.find(" .mnif-show-space");
            $mnif
            .attr("style", "");
            //.css({display: "block"});
            var w = $mnif.outerWidth();
            var h = $mnif.outerHeight();
            var w_c = $container.find(" .pmv-outer-wrap").width();
            var h_c = $container.find(" .pmv-outer-wrap").height();

            //После перемещения в новое окошко центрирование уже нетребуеться
            /*$mnif.css({
                width: Math.round( w ),
                height: Math.round( h ),
                top: Math.round( (h_c - h) / 2 ),
                left: Math.round( (w_c - w) / 2 ),
            });*/

            ____._draggable = true;
            ____._cursor_X = false;
            ____._cursor_Y = false;
            ____._draggableTopTemp = $container.find(" .pmv-fitting-wrap").position().top;
            ____._draggableLeftTemp = $container.find(" .pmv-fitting-wrap").position().left;

            ____.updateDraggable();
            ____.visibleNavigator();
        }

        if(e.preventDefault){e.preventDefault()}else{e.stop()};e.returnValue = false;e.stopPropagation();return false;
    };

    this._handlerUp = function(e) {
        if( ____._draggable ) {
            /*var $mnif = ____._options.$mapNavigatorContainer.find(" .mnif-show-space");
            $mnif.css({display: "none"});*/
            ____._draggable = false;
            ____.hideNavigator();
        }
    };
    
    //Обновление карты
    this.updateDraggable = function() {
        var $iframe = $("#"+(____._options.nameIFrame));
        var $fittingWrap = $iframe.closest(".pmv-fitting-wrap");
        var $outerWrap = $iframe.closest(".pmv-outer-wrap");
        var $mnif = ____._options.$mapNavigatorContainer.find(" .mnif-show-space");
        var w, h, w_c, t, l, h_c,
        wDrag, hDrag, tDrag, lDrag, wDrag_c, hDrag_c;
        
        w =   $fittingWrap.width();
        h =   $fittingWrap.height();
        t =   $fittingWrap.position().top;
        l =   $fittingWrap.position().left;
        w_c = $outerWrap.width();
        h_c = $outerWrap.height();
        
        wDrag_c = $mnif.width();
        hDrag_c = $mnif.height();
        
        hDrag = h_c / h * hDrag_c;
        if(hDrag < ____._options.minHDraggable) {hDrag = ____._options.minHDraggable;}
        if(hDrag > hDrag_c) {hDrag = hDrag_c;}
        tDrag = t / - (h - h_c) * (hDrag_c - hDrag);
        
        wDrag = w_c / w * wDrag_c;
        if(wDrag < ____._options.minWDraggable){wDrag = ____._options.minWDraggable;}
        if(wDrag > wDrag_c) {wDrag = wDrag_c;}
        lDrag = l / - (w - w_c) * (wDrag_c - wDrag);

        $mnif.find(".mnif-draggable").css({
            width: Math.round( wDrag ),
            height: Math.round( hDrag ),
            top: Math.round( tDrag ),
            left: Math.round( lDrag )
        });

        //Левый бордер
        if(l >= 0) {
            $mnif.css({borderLeftColor: "#000"});
        } else {
            $mnif.css({borderLeftColor: "#ddd"});
        }

        //Правый бордер
        if(l + w <= w_c) {
            $mnif.css({borderRightColor: "#000"});
        } else {
            $mnif.css({borderRightColor: "#ddd"});
        }

        //Вверхний бордер
        if(t >= 0) {
            $mnif.css({borderTopColor: "#000"});
        } else {
            $mnif.css({borderTopColor: "#ddd"});
        }

        //Нижний бордер
        if(t + h <= h_c) {
            $mnif.css({borderBottomColor: "#000"});
        } else {
            $mnif.css({borderBottomColor: "#ddd"});
        }

        //Сетка
        /*var html = "";

        var stepG = Math.round(wDrag * ____._options.factorDraggableGrid); stepG = (stepG < 1)?1:stepG;
        var stepV = Math.round(hDrag * ____._options.factorDraggableGrid); stepV = (stepV < 1)?1:stepV;

        //Вертикальные линии
        $mnif.find(" .mnif-border").remove();

        var i = 0;
        while(Math.round(lDrag) - (stepG * i) > 0) {
            html += '<i class="mnif-border mnif-border-v" style="left: '+(Math.round(lDrag) - (stepG * i))+'px;"></i>';
            i++;
        }
        i = 1;
        var lastL = null;
        while((Math.round(lDrag) + (stepG * i)) + wDrag <= wDrag_c) {
            lastL = (Math.round(lDrag) + (stepG * i));
            html += '<i class="mnif-border mnif-border-v" style="left: '+lastL+'px;"></i>';
            i++;
        }
        if(lastL !== wDrag_c - wDrag && wDrag_c - wDrag > 0) {
            html += '<i class="mnif-border mnif-border-v" style="left: '+(wDrag_c - wDrag)+'px;"></i>';
        }

        //Горизонтальные линии
        i = 0;
        while(Math.round(tDrag) - (stepV * i) > 0) {
            html += '<i class="mnif-border mnif-border-g" style="top: '+(Math.round(tDrag) - (stepV * i))+'px;"></i>';
            i++;
        }
        i = 1;
        var lastT = null;
        while((Math.round(tDrag) + (stepV * i)) + hDrag <= hDrag_c) {
            lastT = (Math.round(tDrag) + (stepV * i));
            html += '<i class="mnif-border mnif-border-g" style="top: '+lastT+'px;"></i>';
            i++;
        }
        if(lastT !== hDrag_c - hDrag && hDrag_c - hDrag > 0) {
            html += '<i class="mnif-border mnif-border-g" style="top: '+(hDrag_c - hDrag)+'px;"></i>';
        }

        $mnif.prepend(html);*/
    };
    
    //Обновление скрытого скролла в IFrame
    this._handlerMove = function(e) {
        ____._last_cursor_X = e.screenX;
        ____._last_cursor_Y = e.screenY;
        
        if( ____._draggable )
        {
            if(____._cursor_Y === false) {
                ____._cursor_X = ____._last_cursor_X;
                ____._cursor_Y = ____._last_cursor_Y;
            }
            
            var $iframe = $("#"+(____._options.nameIFrame));
            var $fittingWrap = $iframe.closest(".pmv-fitting-wrap");
            var $outerWrap = $iframe.closest(".pmv-outer-wrap");
            var $mnif = ____._options.$mapNavigatorContainer.find(" .mnif-show-space");
            var w, h, w_c, h_c, t, l,
            wDrag, hDrag, tDrag, lDrag, wDrag_c, hDrag_c,
            stepVertical, stepGorizontal,
            resTop, resLeft;
            
            w =   $fittingWrap.width();
            h =   $fittingWrap.height();
            t =   $fittingWrap.position().top;
            l =   $fittingWrap.position().left;
            w_c = $outerWrap.width();
            h_c = $outerWrap.height();
            
            wDrag_c = $mnif.width();
            hDrag_c = $mnif.height();
            
            //Вычисляем размеры элементов "за которые можно прокручивать" на внешнем скролле и отступы для смешения чтоб показать насколько прокручена страница
            hDrag = h_c / h * hDrag_c;
            if(hDrag < ____._options.minHDraggable) {hDrag = ____._options.minHDraggable;}
            
            wDrag = w_c / w * wDrag_c;
            if(wDrag < ____._options.minWDraggable){wDrag = ____._options.minWDraggable;}

            if(h > h_c) {
                stepVertical   = (h_c - h) / (hDrag_c - hDrag);

                resTop = (e.screenY - ____._cursor_Y) * stepVertical + ____._draggableTopTemp;
                tDrag = resTop / - (h - h_c) * (hDrag_c - hDrag);

                if( resTop > 0 ) {
                    resTop = 0;
                    if(!____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        ____._cursor_Y = e.screenY; ____._draggableTopTemp = t;
                    }
                    if(____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        if(tDrag < - ____._options.movementOfTheCursorInAConfinedSpaceSpred) {
                            ____._cursor_Y += tDrag + ____._options.movementOfTheCursorInAConfinedSpaceSpred;
                        }
                    }
                }
                if( resTop < - (h - h_c) ) {
                    resTop = - (h - h_c);
                    if(!____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        ____._cursor_Y = e.screenY; ____._draggableTopTemp = t;
                    }
                    if(____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        if(tDrag > (hDrag_c - hDrag) + ____._options.movementOfTheCursorInAConfinedSpaceSpred) {
                            ____._cursor_Y += tDrag - ((hDrag_c - hDrag) + ____._options.movementOfTheCursorInAConfinedSpaceSpred);
                        }
                    }
                }
                
                $fittingWrap.css({top: Math.round( resTop )});

                $container.trigger("mnif.changePos");
            }
            
            if(w > w_c) {
                stepGorizontal = (w_c - w) / (wDrag_c - wDrag);

                resLeft = (e.screenX - ____._cursor_X) * stepGorizontal + ____._draggableLeftTemp;
                lDrag = resLeft / - (w - w_c) * (wDrag_c - wDrag);

                if( resLeft > 0 ) {
                    resLeft = 0;
                    if(!____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        ____._cursor_X = e.screenX; ____._draggableLeftTemp = l;
                    }
                    if(____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        if(lDrag < - ____._options.movementOfTheCursorInAConfinedSpaceSpred) {
                            ____._cursor_X += lDrag + ____._options.movementOfTheCursorInAConfinedSpaceSpred;
                        }
                    }
                }
                if( resLeft < - (w - w_c) ) {
                    resLeft = - (w - w_c);
                    if(!____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        ____._cursor_X = e.screenX; ____._draggableLeftTemp = l;
                                            
                    }
                    if(____._options.responsiveToMovementOfTheCursorInAConfinedSpace) {
                        if(lDrag > (wDrag_c - wDrag) + ____._options.movementOfTheCursorInAConfinedSpaceSpred) {
                            ____._cursor_X += lDrag - ((wDrag_c - wDrag) + ____._options.movementOfTheCursorInAConfinedSpaceSpred);
                        }
                    }
                }
    			
                $fittingWrap.css({left: Math.round( resLeft )});

                $container.trigger("mnif.changePos");
            }
            
            ____.updateDraggable();
        }
    };

    this.handlerChangePosIFrameKeyPress = function(e) {
        if((e.which == 87 || e.which == 65 || e.which == 83 || e.which == 68) && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            var $iframe = $("#"+(____._options.nameIFrame));
            var $fittingWrap = $iframe.closest(".pmv-fitting-wrap");
            var $outerWrap = $iframe.closest(".pmv-outer-wrap");
            var $mnif = ____._options.$mapNavigatorContainer.find(" .mnif-show-space");
            var w, h, w_c, h_c, t, l,
                wDrag, hDrag, tDrag, lDrag, wDrag_c, hDrag_c,
                stepVertical, stepGorizontal,
                resTop, resLeft;

            w =   $fittingWrap.width();
            h =   $fittingWrap.height();
            t =   $fittingWrap.position().top;
            l =   $fittingWrap.position().left;
            w_c = $outerWrap.width();
            h_c = $outerWrap.height();

            wDrag_c = $mnif.width();
            hDrag_c = $mnif.height();

            //Вычисляем размеры элементов "за которые можно прокручивать" на внешнем скролле и отступы для смешения чтоб показать насколько прокручена страница
            hDrag = h_c / h * hDrag_c;
            if(hDrag < ____._options.minHDraggable) {hDrag = ____._options.minHDraggable;}

            wDrag = w_c / w * wDrag_c;
            if(wDrag < ____._options.minWDraggable){wDrag = ____._options.minWDraggable;}

            var stepDragG = Math.round(wDrag * ____._options.factorDraggableGrid); stepDragG = (stepDragG < 1)?1:stepDragG;
            var stepDragV = Math.round(hDrag * ____._options.factorDraggableGrid); stepDragV = (stepDragV < 1)?1:stepDragV;

            var stepsG = 0;
            var stepsV = 0;

            switch(e.which) {
                case 87: stepsV = - stepDragV; break;
                case 65: stepsG = - stepDragG; break;
                case 83: stepsV = stepDragV; break;
                case 68: stepsG = stepDragG; break;
            }

            if(h > h_c) {//Нуль делить нельзя
                stepVertical = (h_c - h) / (hDrag_c - hDrag);

                resTop = (stepsV) * stepVertical + t;
                tDrag = resTop / - (h - h_c) * (hDrag_c - hDrag);

                if( resTop > 0 ) {
                    resTop = 0;
                }
                if( resTop < - (h - h_c) ) {
                    resTop = - (h - h_c);
                }

                $fittingWrap.css({top: Math.round( resTop )});

                $container.trigger("mnif.changePos");
            }

            if(w > w_c) {
                stepGorizontal = (w_c - w) / (wDrag_c - wDrag);

                resLeft = (stepsG) * stepGorizontal + l;
                lDrag = resLeft / - (w - w_c) * (wDrag_c - wDrag);

                if( resLeft > 0 ) {
                    resLeft = 0;
                }
                if( resLeft < - (w - w_c) ) {
                    resLeft = - (w - w_c);
                }

                $fittingWrap.css({left: Math.round( resLeft )});

                $container.trigger("mnif.changePos");
            }

            ____.updateDraggable();
            ____.temporarilyVisibleNavigator();
        }
    }
};

modules.mapNavigatorIFrame = mapNavigatorIFrame;
    
})(jQuery);
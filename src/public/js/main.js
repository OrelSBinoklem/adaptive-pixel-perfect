/****************************************************/
/*Шаблонизатор*/
/****************************************************/
var crossModulesFunctions = {};
jQuery(function($) {
    var session;
    var socket = io.connect('/a-pp');

    socket.once('session.load', function (data) {
        session = new modules.sessionModel(data, socket);
        next();
    });

    function next() {
        //Глобальная переменная - зажата ли левая кнопка мыши
        var maximumDeviationOfMouse = 10;
        var mouseKeyPressed = false;
        var mouse_last_cursor_X = null;
        var mouse_last_cursor_Y = null;
        var mouse_pressfix_cursor_X = 0;
        var mouse_pressfix_cursor_Y = 0;
        $("body").on({
            "mousedown.body.iframe": function() {
                mouseKeyPressed = true;
                mouse_pressfix_cursor_X = null;
                mouse_pressfix_cursor_Y = null;
            },
            "mouseup.body.iframe": function() {
                mouseKeyPressed = false;
            },
            "mousemove.body.iframe": function(e) {
                mouse_last_cursor_X = e.screenX;
                mouse_last_cursor_Y = e.screenY;

                if(mouseKeyPressed) {
                    if(mouse_pressfix_cursor_Y === null) {
                        mouse_pressfix_cursor_X = mouse_last_cursor_X;
                        mouse_pressfix_cursor_Y = mouse_last_cursor_Y;
                    }

                    if(Math.abs(mouse_pressfix_cursor_X - e.screenX) > maximumDeviationOfMouse || Math.abs(mouse_pressfix_cursor_Y - e.screenY) > maximumDeviationOfMouse) {
                        mouseKeyPressed = false;
                    }
                }
            }
        });

        /****************************************************/
        /*Общее*/
        /****************************************************/

        (function() {
            crossModulesFunctions["refreshCenteredFloatMenu"] = function() {
                var $menu = $(".shab__main-menu-container");

                if($menu.is(":visible")) {
                    if($menu.hasClass("__vertical-center") && $("body").hasClass("float-panels")) {
                        $menu.css({marginTop: - Math.round($menu.outerHeight() / 2)});
                    } else {
                        $menu.css({marginTop: ""});
                    }


                }
            }
            shablonizator.toggleToFloatPanels = function() {
                $("body").addClass("float-panels");

                crossModulesFunctions["refreshCenteredFloatMenu"]();
                if($(".shab__main-menu-container").is(":visible")) {
                    pageManagerVisualizator.updateModules();
                }
            }
            shablonizator.toggleLeaveFromFloatPanels = function() {
                $("body").removeClass("float-panels");

                crossModulesFunctions["refreshCenteredFloatMenu"]();
                if($(".shab__main-menu-container").is(":visible")) {
                    pageManagerVisualizator.updateModules();
                }
            }

            //Айжрейм во весь размер и плавающие панели
            var pp__floatPanelsBtn__stop_recursion = true;
            $(".pp__float-panels-btn").on("change", function(){
                if(pp__floatPanelsBtn__stop_recursion) {
                    if($(".pp__float-panels-btn").prop("checked")) {
                        shablonizator.toggleToFloatPanels();
                    } else {
                        shablonizator.toggleLeaveFromFloatPanels();
                    }

                    sendFloatPanels($(".pp__float-panels-btn").prop("checked"));
                }
            });

            function sendFloatPanels(state) {
                session.onFloatPanels(state);
            }

            session.responseHandlers["onFloatPanels"] = function() {
                if("floatPanels" in session.data.globalSession) {
                    pp__floatPanelsBtn__stop_recursion = false;
                    if(session.data.globalSession.floatPanels) {
                        shablonizator.toggleToFloatPanels();
                        $(".pp__float-panels-btn").bootstrapToggle('on');
                    } else {
                        shablonizator.toggleLeaveFromFloatPanels();
                        $(".pp__float-panels-btn").bootstrapToggle('off');
                    }
                    pp__floatPanelsBtn__stop_recursion = true;
                }
            }

            pp__floatPanelsBtn__stop_recursion = false;
            if(session.data.globalSession.floatPanels) {
                shablonizator.toggleToFloatPanels();
                $(".pp__float-panels-btn").bootstrapToggle('on');
            } else {
                shablonizator.toggleLeaveFromFloatPanels();
                $(".pp__float-panels-btn").bootstrapToggle('off');
            }
            pp__floatPanelsBtn__stop_recursion = true;

            //Выравнивание плавающих панелей по вертикали
            $(".settings__float-panels-vertical-btn-top").on("click", function(){
                floatPanelsAlignAddClass("top");
                sendFloatPanelsAlign("top");
            });
            $(".settings__float-panels-vertical-btn-middle").on("click", function(){
                floatPanelsAlignAddClass("center");
                sendFloatPanelsAlign("center");
            });
            $(".settings__float-panels-vertical-btn-bottom").on("click", function(){
                floatPanelsAlignAddClass("bottom");
                sendFloatPanelsAlign("bottom");
            });

            function floatPanelsAlignAddClass(state) {
                $(".shab__main-menu-container").removeClass("__vertical-top __vertical-center __vertical-bottom");
                $(".settings__float-panels-vertical-btn-top, .settings__float-panels-vertical-btn-middle, .settings__float-panels-vertical-btn-bottom").removeClass("active");
                switch(state) {
                    case "top":
                        $(".shab__main-menu-container").addClass("__vertical-top");
                        $(".settings__float-panels-vertical-btn-top").addClass("active");
                        break;
                    case "center":
                        $(".shab__main-menu-container").addClass("__vertical-center");
                        $(".settings__float-panels-vertical-btn-middle").addClass("active");
                        break;
                    case "bottom":
                        $(".shab__main-menu-container").addClass("__vertical-bottom");
                        $(".settings__float-panels-vertical-btn-bottom").addClass("active");
                        break;
                }
                crossModulesFunctions["refreshCenteredFloatMenu"]();
            }

            function sendFloatPanelsAlign(state) {
                session.onFloatPanelsAlign(state);
            }

            session.responseHandlers["onFloatPanelsAlign"] = function() {
                floatPanelsAlignAddClass(session.data.globalSession.floatPanelsAlign);
            }

            floatPanelsAlignAddClass(session.data.globalSession.floatPanelsAlign);
        })();

        /****************************************************/
        /*Настройки*/
        /****************************************************/
        (function() {
            //Открыть-закрыть меню выбора настроек
            $(".settings__window-open-btn").on("click", function () {
                if($(this).hasClass('active')) {
                    $(".settings__window-open-btn").removeClass('active');
                    $(".settings__window").css({display: "none"});
                } else {
                    $(".settings__window-open-btn").addClass('active');
                    $(".settings__window").css({display: "block"});
                }
            });
            var dragItemList = false;
            $("body").on("click click.body.iframe", function (e) {
                if( $(e.target).closest($(".settings__window-open-btn").add($(".settings__window, #a-pp__modal-add-group-session, #a-pp__modal-delete-group-session"))).length == 0 && !dragItemList ) {
                    $(".settings__window-open-btn").removeClass('active');
                    $(".settings__window").css({display: "none"});
                }
            });

            //Выбор языка
            $('select.settings__lang-select').on("change", function(){
                setLang($(this).val());

                sendChangeLang($(this).val());
            });

            setLang(session.data.globalSession.lang);
            $('.settings__lang-select.selectpicker').selectpicker('val', session.data.globalSession.lang);

            //Запись и отправка данных настроек
            function sendChangeLang(lang) {
                session.onChangeLang(lang);
            }

            //Приём данных настроек
            session.responseHandlers["onChangeLang"] = function() {
                setLang(session.data.globalSession.lang);
                $('.settings__lang-select.selectpicker').selectpicker('val', session.data.globalSession.lang);
            }
        })();

        /****************************************************/
        /*Синхронизация по группам сессий*/
        /****************************************************/
        (function() {
            //Формирование меню групп сессий
            $(".shab__session-groups-list").prepend("<ul class='shab__session-groups-list-ul'></ul>");
            refreshMenuView();
            $(".shab__session-groups-list-ul").sortable({
                    axis: "y",
                    //handle: 'button',
                    items: "> li",
                    placeholder: "placeholder",
                    forceHelperSize: true,
                    forcePlaceholderSize: true,
                    update: function() {
                        sendSessionSortableGroups();
                    }
                })
                .disableSelection();
            function refreshMenuView() {
                if(session.data.sessionGroupSynchronizations.length) {
                    var haveCookie = $.cookie('adaptive_pixel_perfect_groups_session') !== undefined;
                    var activeGroups;

                    if(haveCookie) {
                        activeGroups = $.secureEvalJSON($.cookie('adaptive_pixel_perfect_groups_session')).groups;
                        //список в обьект по именам групп сессий
                        var sessionGroupsForNames = {};
                        for(var key in session.data.sessionGroupSynchronizations) {
                            var one = session.data.sessionGroupSynchronizations[key];
                            sessionGroupsForNames[one.name] = one;
                        }

                        //Удаляем имена выбранных групп которых уже нету
                        activeGroups.filter(function(item, i, arr) {
                            return item in sessionGroupsForNames;
                        });
                        $.cookie('adaptive_pixel_perfect_groups_session', $.toJSON({"groups": activeGroups}), {expires: 7, path: '/'});
                        if(!activeGroups.length) {
                            $.removeCookie('adaptive_pixel_perfect_groups_session');
                            haveCookie = false;
                            activeGroups = [];
                        }
                    }
                    var activeGroupsObj = {};
                    for(var i in activeGroups) {
                        activeGroupsObj[activeGroups[i]] = true;
                    }

                    //Формируем меню
                    var html = "";

                    for(var key in session.data.sessionGroupSynchronizations) {
                        var oneGroup = session.data.sessionGroupSynchronizations[key];

                        var activeParamsObj = {};
                        for(var i in oneGroup.synchroParams) {
                            activeParamsObj[oneGroup.synchroParams[i]] = true;
                        }

                        var active = (haveCookie && (oneGroup.name in activeGroupsObj))?"active":"";
                        html += '<li class="shab__session-groups-list-item '+active+'" data-name="'+(oneGroup.name)+'">' +
                            '<div class="btn-group shab__session-groups-special">' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("pages"          in activeParamsObj)?"active":"")+'" data-param="pages"><i class="fa fa-file-o"></i></button>' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("resolutions"    in activeParamsObj)?"active":"")+'" data-param="resolutions"><i class="fa fa-desktop"></i> <i class="fa fa-mobile"></i></button>' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("showPageProofsOrDesign"          in activeParamsObj)?"active":"")+'" data-param="showPageProofsOrDesign"><i class="fa fa-clone"></i></button>' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("showBottomSpace"    in activeParamsObj)?"active":"")+'" data-param="showBottomSpace"><i class="fa fa-chevron-down"></i></button>' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("iframePosition" in activeParamsObj)?"active":"")+'" data-param="iframePosition"><i class="glyphicon glyphicon-modal-window"></i></button>' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("iframeSize"     in activeParamsObj)?"active":"")+'" data-param="iframeSize"><i class="fa fa-desktop"></i></button>' +
                                '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("iframeScroll"   in activeParamsObj)?"active":"")+'" data-param="iframeScroll"><i class="fa fa-arrows-v"></i></button>' +
                            '</div>' +
                            '<button class="btn btn-default btn-xs btn-block shab__session-groups-list-btn '+active+'">'+(oneGroup.name)+'</button>' +
                            '<div class="btn btn-default btn-xs shab__session-groups-btn-drag"><span class="glyphicon glyphicon-move"></span></div>' +
                            '<button class="btn btn-default btn-xs shab__session-groups-delete-btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                            '</li>';
                    }

                    $(".shab__session-groups-list-ul").empty().append(html);
                } else {
                    if($.cookie('adaptive_pixel_perfect_groups_session') !== undefined) {
                        $.removeCookie('adaptive_pixel_perfect_groups_session');
                    }
                }
            }

            //Добавить группу
            $('.shab__add-group-session').on('click', function(){
                $('#a-pp__modal-add-group-session .modal').modal('show');
            });
            $('#a-pp__modal-add-group-session .btn-select').on('click', function(){
                var name = $('#a-pp__modal-add-group-session .a-pp__modal-add-group-session__name').val();
                if($.trim(name)) {
                    var html = '<li class="shab__session-groups-list-item" data-name="'+($.trim(name))+'">' +
                        '<div class="btn-group shab__session-groups-special">' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("pages"          in activeParamsObj)?"active":"")+'" data-param="pages"><i class="fa fa-file-o"></i></button>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("resolutions"    in activeParamsObj)?"active":"")+'" data-param="resolutions"><i class="fa fa-desktop"></i> <i class="fa fa-mobile"></i></button>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("showPageProofsOrDesign"          in activeParamsObj)?"active":"")+'" data-param="showPageProofsOrDesign"><i class="fa fa-clone"></i></button>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("showBottomSpace"    in activeParamsObj)?"active":"")+'" data-param="showBottomSpace"><i class="fa fa-chevron-down"></i></button>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("iframePosition" in activeParamsObj)?"active":"")+'" data-param="iframePosition"><i class="glyphicon glyphicon-modal-window"></i></button>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("iframeSize"     in activeParamsObj)?"active":"")+'" data-param="iframeSize"><i class="fa fa-desktop"></i></button>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-synchro-params-btn '+(("iframeScroll"   in activeParamsObj)?"active":"")+'" data-param="iframeScroll"><i class="fa fa-arrows-v"></i></button>' +
                        '</div>' +
                        '<button class="btn btn-default btn-xs btn-block shab__session-groups-list-btn">'+($.trim(name))+'</button>' +
                        '<div class="btn btn-default btn-xs shab__session-groups-btn-drag"><span class="glyphicon glyphicon-move"></span></div>' +
                        '<button class="btn btn-default btn-xs shab__session-groups-delete-btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                        '</li>';
                    $(".shab__session-groups-list-ul").append(html);

                    sendSessionAddGroup();
                } else {
                    alert("Имя недолжно быть пустым");
                }
                $('#a-pp__modal-add-group-session .modal').modal('hide');
            });

            //Удалить группу
            $('.shab__session-groups-list').on('click', " .shab__session-groups-delete-btn", function(){
                $('#a-pp__modal-delete-group-session .modal').modal('show');

                var name = $(this).closest(".shab__session-groups-list-item").attr("data-name");
                $('#a-pp__modal-delete-group-session .a-pp__modal-delete-group-session__name')
                    .attr("data-name", name)
                    .text(name);
            });
            $('#a-pp__modal-delete-group-session .btn-select').on('click', function(){
                var name = $('#a-pp__modal-delete-group-session .a-pp__modal-delete-group-session__name').attr("data-name");
                $(".shab__session-groups-list-item[data-name='"+name+"']").remove();

                sendSessionDeleteGroup();

                $('#a-pp__modal-delete-group-session .modal').modal('hide');
            });

            //Активировать-деактивировать группу
            $('.shab__session-groups-list').on('click', " .shab__session-groups-list-btn", function(){
                if(!$(this).hasClass("active")) {
                    $(this).addClass("active")
                        .closest(".shab__session-groups-list-item").addClass("active");
                } else {
                    $(this).removeClass("active")
                        .closest(".shab__session-groups-list-item").removeClass("active");
                }

                sendSessionActivatedGroup($(this).closest(".shab__session-groups-list-item").attr("data-name"), $(this).hasClass("active"));
            });

            //Активировать-деактивировать параметр группы
            $('.shab__session-groups-list').on('click', " .shab__session-groups-synchro-params-btn", function(){
                if(!$(this).hasClass("active")) {
                    $(this).addClass("active");
                } else {
                    $(this).removeClass("active");
                }

                sendSessionActivatedParam($(this).closest(".shab__session-groups-list-item").attr("data-name"), $(this).attr("data-param"), $(this).hasClass("active"));
            });

            function groupsSessionToJson($main) {
                var sessionGroupSynchronizations = [];
                $main.find(" .shab__session-groups-list-ul > li").each(function() {
                    var activeParams = [];
                    $(this).find(" .shab__session-groups-synchro-params-btn.active").each(function() {
                        activeParams.push($(this).attr("data-param"));
                    });
                    sessionGroupSynchronizations.push({
                        name: $(this).attr("data-name"),
                        synchroParams: activeParams
                    });
                });
                return sessionGroupSynchronizations;
            }

            //Запись и отправка данных сессии
            function sendSessionSortableGroups() {
                session.onChangeSessionGroups(groupsSessionToJson($('.shab__session-groups-list')));
                applyAllParamsLocalSession(true);
            }
            function sendSessionAddGroup() {
                session.onChangeSessionGroups(groupsSessionToJson($('.shab__session-groups-list')));
                applyAllParamsLocalSession(true);
            }
            function sendSessionDeleteGroup() {
                session.onChangeSessionGroups(groupsSessionToJson($('.shab__session-groups-list')));
                applyAllParamsLocalSession(true);
            }
            function sendSessionActivatedGroup(name, activated) {
                session.onSessionActivatedGroup(name, activated);
                applyAllParamsLocalSession(true);
            }
            function sendSessionActivatedParam(name, nameParam, activated) {
                session.onSessionActivatedParam(name, nameParam, activated);
                applyAllParamsLocalSession(true);
            }

            //Приём данных сессии
            session.responseHandlers["onChangeSessionGroups"] = function() {
                refreshMenuView();
                applyAllParamsLocalSession(true);
            }
            session.responseHandlers["onSessionActivatedParam"] = function(name, nameParam, activated) {
                $(".shab__session-groups-list-ul [data-name='"+name+"'] [data-param='"+nameParam+"']").toggleClass("active", activated);
                applyAllParamsLocalSession(true);
            }

            //Применение новой локальной сессии
            crossModulesFunctions["session.applyAllParamsLocalSession"] = function(onlyChange) {
                //Получаем сессию без куков потому что м в куках и так будет записано текущее состояние сессии
                var ls = session.getLocalSessionParams(onlyChange);
                //console.log(ls);
                //Страница
                if( ls && "pages" in ls && "currentPage" in ls.pages && (!onlyChange || ls.pages.currentPage !== pageManagerVisualizator.currentPage) ) {
                    pageManagerVisualizator.$container.one("pmv.load.iframe", pageLoaded);
                    pageManagerVisualizator.selectPage(ls.pages.currentPage);
                } else {
                    pageLoaded();
                }
                function pageLoaded() {
                    //Разрешение
                    if( ls && "iframeSize" in ls && ls.iframeSize.w !== null) {
                        pageManagerVisualizator.setSizeIFrame(ls.iframeSize.w, ls.iframeSize.h, true);
                        $(".pp__resolution-name-btn.active").addClass("bloor");
                    } else if(ls && "resolutions" in ls && "currentResolution" in ls.resolutions) {
                        pageManagerVisualizator.setSizeIFrame(ls.resolutions.currentResolution.w, ls.resolutions.currentResolution.h, true);
                    }
                    var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                    pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
                    if(ls && "showPageProofsOrDesign" in ls) {
                        pixelPerfect.showPageProofsOrDesign(ls.showPageProofsOrDesign);
                        crossModulesFunctions["pp.refreshButtonsPageProofsOrDesign"](ls.showPageProofsOrDesign);
                    }
                    pp__bottomSpaceBtn__stop_recursion = false;
                    if(ls && "showBottomSpace" in ls) {
                        if(ls.showBottomSpace) {
                            pixelPerfect.insertBottomSpace();
                            $(".pp__bottom-space-btn").bootstrapToggle('on');
                        } else {
                            $(".pp__bottom-space-btn").bootstrapToggle('off');
                        }
                    }
                    pp__bottomSpaceBtn__stop_recursion = true;
                    //iFrame
                    //Разрешение выше
                    /*if( ls && "iframe" in ls && "size" in ls.iframe ) {
                        pageManagerVisualizator.setSizeIFrame(ls.iframeSize.w, ls.iframeSize.h, true);
                    }*/
                    if( ls && "iframePosition" in ls ) {
                        pageManagerVisualizator.setPositionIFrame(ls.iframePosition.left, ls.iframePosition.top);
                    }
                    if( ls && "iframeScroll" in ls ) {
                        pageManagerVisualizator.setScrollIFrame(ls.iframeScroll.left, ls.iframeScroll.top);
                    }

                    pageManagerVisualizator.$container.trigger("session.apply");
                }
            }
            function applyAllParamsLocalSession(onlyChange) {
                crossModulesFunctions["session.applyAllParamsLocalSession"](onlyChange);
            }
        })();

        /****************************************************/
        /*Менеджер страниц и визуализатор*/
        /****************************************************/
        (function() {
            pageManagerVisualizator = new modules.pageManagerVisualizator($("#wrap_iframe"), session, {
                $mapNavigatorContainer: $('.mnif__navigator-window'),
                nameIFrame: "PP_iframe",
                pixelsScrollableInSeconds: 2000,
                minWOuterScroll: 16,
                minHOuterScroll: 16,
                permanentVisible: true,
                lookClasses: ['modal-open', 'is-reveal-open', 'dimmed'],
                minWDraggable: 15,
                minHDraggable: 15,
                minWIFrame: 320,
                minHIFrame: 480,
                //$dimensions: $(".shab__float-buttons-left-dimensions"),
                responsiveToMovementOfTheCursorInAConfinedSpace: true,
                movementOfTheCursorInAConfinedSpaceSpred: 10,
                factorDraggableGrid: 0.5,
                gorizontalFixation: "center",
                verticalFixation: "top",
                minHeightCalculateAuto: 480,
                heightCalculateRatio: 16/9,
                calculatedHeightAsMaxHeight: true,
                stopAllAnimationsAtResize: true
            });

            /****************************************************/
            /*Страницы*/
            /****************************************************/
            //Скроллбар для списка страниц
            $(".pmv__pages-sortable-scrollwrap").mCustomScrollbar({
                axis: "y",
                theme: "dark",
                scrollbarPosition: "outside",
                scrollInertia: 100,
                mouseWheel: {
                    scrollAmount: 100
                }
            });

            //Открыть-закрыть меню выбора страниц
            $(".pmv__select-page-open-list").on("click", function () {
                if($(this).hasClass('active')) {
                    $(".pmv__select-page-open-list").removeClass('active');
                } else {
                    $(".pmv__select-page-open-list").addClass('active');
                }
            });
            var dragItemList = false;
            $("body").on("click click.body.iframe", function (e) {
                if( $(e.target).closest($(".pmv__select-page-open-list").add($(".pmv__pages-window, #pmv__modal-add-page-href, #pmv__modal-add-group, #pmv__modal-page-or-group-delete, #pmv__modal-page-or-group-update"))).length == 0 && !dragItemList ) {
                    $(".pmv__select-page-open-list").removeClass('active');
                }
            });

            //Сменяем страницу
            $('.pmv__pages-sortable').on('click', ' .pmv__pages-btn-page', function() {
                $(".pmv__pages-btn-page").removeClass("active");
                $(this).addClass("active");
                pageManagerVisualizator.selectPage( $(this).closest(".pmv__pages-item").attr("data-name") );
                if( $(".pmv__select-page-open-list").hasClass('active') ) {
                    $(".pmv__select-page-open-list").removeClass('active');
                }
                sendSelectPage();
            });

            //Добавляем страницу
            $('#pmv__modal-add-page-href .btn-select').on('click', function(event){
                var urn = $('#pmv__modal-add-page-href .pmv-href').val();

                //Проверяем на ошибки
                $('.pmv__modal-urn-exists').css({display: ""});
                $('.pmv__modal-urn-empty').css({display: ""});
                $('.pmv__modal-add-page-content').removeClass("has-error");

                if($.trim(urn)) {
                    if(session.getPage(urn) === false) {
                        next();
                    } else {
                        $('.pmv__modal-urn-exists').css({display: "block"});
                        $('.pmv__modal-add-page-content').addClass("has-error");
                    }
                } else {
                    $('.pmv__modal-urn-empty').css({display: "block"});
                    $('.pmv__modal-add-page-content').addClass("has-error");
                }

                //Добавляем страницу
                function next() {
                    $(".pmv__pages-sortable > ul").prepend( createMenuItem("page", $.trim(urn)) );
                    $('#pmv__modal-add-page-href .modal').modal('hide');

                    sendAddPage();
                }
            });
            $('.pmv__add-page').on('click', function(){
                $('.pmv__modal-urn-exists').css({display: ""});
                $('.pmv__modal-urn-empty').css({display: ""});
                $('.pmv__modal-add-page-content').removeClass("has-error");

                if(pageManagerVisualizator._options.nameIFrame in window) {
                    //Отделение домена от urn
                    var iframe = document.getElementById(pageManagerVisualizator._options.nameIFrame);
                    var win = iframe.contentWindow || iframe;
                    var href = win.location.href;
                    var hrefObj = str.parsingUrl(href);
                    var urn = "";
                    urn += hrefObj.protocol + "//" + hrefObj.domain;
                    if(hrefObj.port !== null) {
                        urn += ":" + hrefObj.port;
                    }
                    urn = $.trim(href.substring(urn.length));
                    if(/^\//gim.test(urn)) {
                        urn = urn.substring(1);
                    }
                    if(urn == "") {
                        urn = "/";
                    }
                    $('#pmv__modal-add-page-href .pmv-href').val( urn );
                }
                $('#pmv__modal-add-page-href .modal').modal('show');
            });
            $('#pmv__modal-add-page-href').on('shown.bs.modal', function(e){
                var input = $('#pmv__modal-add-page-href .pmv-href');
                //Выделение
                input.get(0).focus();
                //input.get(0).setSelectionRange(0, input.val().length);
            });

            //Добавляем группу
            $('#pmv__modal-add-group .btn-select').on('click', function(event){
                var name = $('#pmv__modal-add-group .pmv__modal-name-group').val();

                //Проверяем на ошибки
                $('#pmv__modal-add-group .pmv__modal-name-exists').css({display: ""});
                $('#pmv__modal-add-group .pmv__modal-name-empty').css({display: ""});
                $('.pmv__modal-add-group-content').removeClass("has-error");
                if($.trim(name)) {
                    if(session.getGroup(name) === false) {
                        next();
                    } else {
                        $('.pmv__modal-name-exists').css({display: "block"});
                        $('.pmv__modal-add-group-content').addClass("has-error");
                    }
                } else {
                    $('#pmv__modal-add-group .pmv__modal-name-empty').css({display: "block"});
                    $('.pmv__modal-add-group-content').addClass("has-error");
                }

                //Добавляем группу
                function next() {
                    $(".pmv__pages-sortable > ul").prepend( createMenuItem("group", $.trim(name)) );
                    $('#pmv__modal-add-group .modal').modal('hide');

                    sendAddPageGroup();
                }
            });
            $('.pmv__add-group').on('click', function(){
                $('#pmv__modal-add-group .pmv__modal-name-exists').css({display: ""});
                $('#pmv__modal-add-group .pmv__modal-name-empty').css({display: ""});
                $('.pmv__modal-add-group-content').removeClass("has-error");

                $('#pmv__modal-add-group .modal').modal('show');
            });

            //Удаляем страницу или группу
            $('.pmv__pages-sortable').on('click', " .pmv__pages-btn-delete", function(){
                if($(this).closest(".pmv__pages-item").hasClass("have-nested")) {
                    $("#pmv__modal-page-or-group-delete .pmv__modal-page-or-group-delete-nested-btn").css({display: "inline-block"});
                } else {
                    $("#pmv__modal-page-or-group-delete .pmv__modal-page-or-group-delete-nested-btn").css({display: "none"});
                }

                $('#pmv__modal-page-or-group-delete .modal').modal('show');

                var name = $(this).closest(".pmv__pages-item").attr("data-name");
                var type = $(this).closest(".pmv__pages-item").attr("data-type");
                $('#pmv__modal-page-or-group-delete .shab__page-or-group__name')
                    .attr("data-name", name)
                    .text(name);
                $('#pmv__modal-page-or-group-delete .shab__page-or-group__type').text((type == "page")?_l_("pmv__modal-page-or-group-delete|page", langCascade):_l_("pmv__modal-page-or-group-delete|group", langCascade));
            });
            $('#pmv__modal-page-or-group-delete .pmv__modal-page-or-group-delete-btn').on('click', function(){
                var name = $('#pmv__modal-page-or-group-delete .shab__page-or-group__name').attr("data-name");
                var $cutItems = $(".pmv__pages-item[data-name='"+name+"'] > ul > .pmv__pages-item").remove();
                $(".pmv__pages-item[data-name='"+name+"']").after($cutItems);
                $(".pmv__pages-item[data-name='"+name+"']").remove();

                var $main = $(".pmv__pages-sortable");
                clearEmptyUl($main);
                refreshNestedEl($main);
                clearCollapseNotNested($main);

                $('#pmv__modal-page-or-group-delete .modal').modal('hide');

                sendDeletePageOrGroup();
            });
            $('#pmv__modal-page-or-group-delete .pmv__modal-page-or-group-delete-nested-btn').on('click', function(){
                var name = $('#pmv__modal-page-or-group-delete .shab__page-or-group__name').attr("data-name");
                $(".pmv__pages-item[data-name='"+name+"']").remove();

                var $main = $(".pmv__pages-sortable");
                clearEmptyUl($main);
                refreshNestedEl($main);
                clearCollapseNotNested($main);

                $('#pmv__modal-page-or-group-delete .modal').modal('hide');

                sendDeletePageOrGroup();
            });

            //Обновляем страницу или группу
            $('.pmv__pages-sortable').on('click', " .pmv__pages-btn-edit", function(){
                $('#pmv__modal-page-or-group-update .modal').modal('show');

                var name = $(this).closest(".pmv__pages-item").attr("data-name");
                var type = $(this).closest(".pmv__pages-item").attr("data-type");
                $('#pmv__modal-page-or-group-update .shab__page-or-group__name')
                    .attr("data-name", name);
                $('#pmv__modal-page-or-group-update .pmv__modal-page-or-group-update__name').val(name);

                $('#pmv__modal-page-or-group-update .shab__page-or-group__type').attr("data-type", type).text((type == "page")?_l_("pmv__modal-page-or-group-update|new-urn", langCascade):_l_("pmv__modal-page-or-group-update|new-name", langCascade));
            });
            $('#pmv__modal-page-or-group-update .btn-select').on('click', function(){
                var name = $('#pmv__modal-page-or-group-update .shab__page-or-group__name').attr("data-name");
                var type = $('#pmv__modal-page-or-group-update .shab__page-or-group__type').attr("data-type");
                var newName = $('#pmv__modal-page-or-group-update .pmv__modal-page-or-group-update__name').val();

                //Проверяем на ошибки
                $('#pmv__modal-page-or-group-update .pmv__modal-urn-exists').css({display: ""});
                $('#pmv__modal-page-or-group-update .pmv__modal-name-exists').css({display: ""});
                $('#pmv__modal-page-or-group-update .pmv__modal-empty').css({display: ""});
                $('#pmv__modal-page-or-group-update .pmv__modal-content').removeClass("has-error");

                if(type == "page") {
                    if($.trim(newName)) {
                        if(session.getPage(newName) === false) {
                            next();
                        } else {
                            $('#pmv__modal-page-or-group-update .pmv__modal-urn-exists').css({display: "block"});
                            $('#pmv__modal-page-or-group-update .pmv__modal-content').addClass("has-error");
                        }
                    } else {
                        $('#pmv__modal-page-or-group-update .pmv__modal-empty').css({display: "block"});
                        $('#pmv__modal-page-or-group-update .pmv__modal-content').addClass("has-error");
                    }
                } else {
                    if($.trim(newName)) {
                        if(session.getGroup(newName) === false) {
                            next();
                        } else {
                            $('#pmv__modal-page-or-group-update .pmv__modal-name-exists').css({display: "block"});
                            $('#pmv__modal-page-or-group-update .pmv__modal-content').addClass("has-error");
                        }
                    } else {
                        $('#pmv__modal-page-or-group-update .pmv__modal-empty').css({display: "block"});
                        $('#pmv__modal-page-or-group-update .pmv__modal-content').addClass("has-error");
                    }
                }

                //Обновляем страницу
                function next() {
                    var $li = $(".pmv__pages-sortable .pmv__pages-item[data-type='"+type+"'][data-name='"+name+"']")
                    $li.attr("data-name", newName)
                        .find(" > * > .pmv__pages-btn-name").text(newName);

                    $('#pmv__modal-page-or-group-update .modal').modal('hide');

                    if(type == "page") {
                        if($li.find(" .pmv__pages-btn-page").hasClass("active")) {
                            pageManagerVisualizator.selectPage( newName );
                            sendUpdatePageOrGroup();
                            sendSelectPage();
                        } else {
                            sendUpdatePageOrGroup();
                        }
                    } else {
                        sendUpdatePageOrGroup();
                    }
                }
            });

            //Коллапсируем-расколлапсируем пункты с вложенными пунктами
            $(".pmv__pages-sortable").on("click", " .pmv__pages-btn-collapsed", function(){
                var $item = $(this).closest(".pmv__pages-item");
                if( $item.hasClass("collapsed") ) {
                    $item.removeClass("collapsed")
                        .find(" > ul").css({display: "block"});
                } else {
                    $item.addClass("collapsed")
                        .find(" > ul").css({display: "none"});
                }

                sendCollapseUncollapsePageOrGroup();
            });

            //Запись и отправка данных сессии
            function sendSelectPage() {
                session.onSelectPage(pageManagerVisualizator.currentPage);
            }
            function sendAddPage() {
                session.onChangePages(pagesNestedToJson($('.pmv__pages-sortable')));
            }
            function sendAddPageGroup() {
                session.onChangePages(pagesNestedToJson($('.pmv__pages-sortable')));
            }
            function sendDeletePageOrGroup() {
                session.onChangePages(pagesNestedToJson($('.pmv__pages-sortable')));
            }
            function sendUpdatePageOrGroup() {
                //обновить нетолько меню но и страницу которую мозможно модифицировали
                session.onUpdatePageOrGroup(pagesNestedToJson($('.pmv__pages-sortable')));
            }
            function sendSortablePageOrGroup() {
                session.onChangePages(pagesNestedToJson($('.pmv__pages-sortable')));
            }
            function sendCollapseUncollapsePageOrGroup() {
                session.onChangePages(pagesNestedToJson($('.pmv__pages-sortable')));
            }

            //Приём данных сессии
            session.responseHandlers["onSelectPage"] = function(o) {
                //Получаем сессию без куков потому что м в куках и так будет записано текущее состояние сессии
                var ls = session.getLocalSessionParams(true);
                //Страница
                if( ls && "pages" in ls && "currentPage" in ls.pages && (ls.pages.currentPage !== pageManagerVisualizator.currentPage && true) ) {
                    $(".pmv__pages-btn-page").removeClass("active");
                    $(".pmv__pages-item[data-name='"+(ls.pages.currentPage)+"'] > * > .pmv__pages-btn-page").addClass("active");
                    pageManagerVisualizator.selectPage(ls.pages.currentPage);
                }
            }
            session.responseHandlers["onChangePages"] = function(o) {
                refreshMenuPages();
            }
            session.responseHandlers["onUpdatePageOrGroup"] = function(o) {
                refreshMenuPages();
            }

            //Генерируем пункт меню
            function createMenuItem(type, name) {
                var _class = (type == "page")?"page":"group btn-yellow";
                return '<li class="pmv__pages-item" data-type="'+type+'" data-name="'+name+'">' +
                    '<div class="pmv__pages-item-content">' +
                    '<button class="btn btn-default btn-xs pmv__pages-btn-collapsed"><span class="glyphicon glyphicon-minus"></span><span class="glyphicon glyphicon-plus"></span></button>' +
                    '<button class="btn btn-default btn-xs btn-block pmv__pages-btn-name pmv__pages-btn-'+_class+'">'+name+'</button>' +
                    '<div class="btn-group pmv__pages-btn-specials">' +
                        '<button class="btn btn-default btn-xs pmv__pages-btn-delete"><span class="glyphicon glyphicon-remove"></span></button>' +
                        '<button class="btn btn-default btn-xs pmv__pages-btn-edit"><span class="glyphicon glyphicon-edit"></span></button>' +
                        '<div class="btn btn-default btn-xs pmv__pages-btn-drag"><span class="glyphicon glyphicon-move"></span></div>' +
                    '</div>' +
                    '</div>' +
                    '</li>';

            }

            //Обновляем список страниц в верхнем меню
            $(".pmv__pages-sortable").prepend("<ul class='pmv__pages-sortable-ul'></ul>");
            $(".pmv__pages-sortable-ul").nestedSortable({
                forcePlaceholderSize: true,
                handle: 'div',
                items: 'li',
                placeholder: 'placeholder',
                revert: 250,
                tabSize: 25,
                toleranceElement: '> div',
                listType: "ul",
                helper:	'clone',
                maxLevels: 3,
                isTree: true,
                start: function () {
                    dragItemList = true;
                },
                stop: function () {
                    dragItemList = false;
                },
                update: function( event, ui ) {
                    var $main = $(".pmv__pages-sortable");
                    clearEmptyUl($main);
                    refreshNestedEl($main);
                    clearCollapseNotNested($main);
                    sendSortablePageOrGroup();
                }
            });

            refreshMenuPages();

            function refreshMenuPages() {
                var localSession = session.getLocalSessionParams();
                dragItemList = false;
                var $main = $(".pmv__pages-sortable-ul");
                $main.empty();

                var res = (function recursion(el, html) {
                    //li
                    for(var i in el) {
                        var name = (el[i].type == "page") ? el[i].urn : el[i].name;
                        var _class = (el[i].type == "page")?"page":"group btn-yellow";
                        var active = (el[i].type == "page" && localSession && "pages" in localSession && localSession.pages.currentPage === name)?"active":"";
                        html += "<li class='pmv__pages-item "+(("collapsed" in el[i] && el[i].collapsed)?"collapsed":"")+"' data-type='"+(el[i].type)+"' data-name='"+name+"'>";
                        html += '<div class="pmv__pages-item-content">' +
                            '<button class="btn btn-default btn-xs pmv__pages-btn-collapsed"><span class="glyphicon glyphicon-minus"></span><span class="glyphicon glyphicon-plus"></span></button>' +
                            '<button class="btn btn-default btn-xs btn-block pmv__pages-btn-name pmv__pages-btn-'+_class+' '+active+'">'+name+'</button>' +
                            '<div class="btn-group pmv__pages-btn-specials">' +
                                '<button class="btn btn-default btn-xs pmv__pages-btn-delete"><span class="glyphicon glyphicon-remove"></span></button>' +
                                '<button class="btn btn-default btn-xs pmv__pages-btn-edit"><span class="glyphicon glyphicon-edit"></span></button>' +
                                '<div class="btn btn-default btn-xs pmv__pages-btn-drag"><span class="glyphicon glyphicon-move"></span></div>' +
                            '</div>' +
                            '</div>';

                        //sub
                        if("sub" in el[i]) {
                            html = recursion(el[i].sub, html+"<ul>")+"</ul>";
                        }
                        //sub (end)

                        html += "</li>";

                    }
                    //li (end)

                    return html;
                })(session.data.globalSession.pages, "");

                $main.append(res);
                refreshNestedEl($(".pmv__pages-sortable"));
                refreshCollapsed($(".pmv__pages-sortable"));
            }

            //Парсинг страниц в json обьект
            function pagesNestedToJson($main) {
                var json = [], previousLevel = 0, stack = {"0":json};

                $main.find(".pmv__pages-item").each(function() {
                    var level = $(this).parents(".pmv__pages-item").length;
                    if(level > previousLevel) {
                        var obj = stack[previousLevel][stack[previousLevel].length-1];
                        if(!("sub" in obj)) {
                            obj.sub = [];
                            stack[level] = obj.sub;
                        }
                        stack[level].push(itemToJson($(this)));
                    } else {
                        stack[level].push(itemToJson($(this)));
                    }
                    previousLevel = level;
                });

                return json;
            }

                function itemToJson($item) {
                    var obj = {};
                    obj.type = $item.attr("data-type");

                    if($item.attr("data-type") == "page") {
                        obj.urn = $item.attr("data-name");
                    } else {
                        obj.name = $item.attr("data-name");
                    }

                    if($item.hasClass("collapsed")) {
                        obj.collapsed = true;
                    }
                    return obj;
                }

            //удаляем пустые тэги ul которые остаються после перестановки
            function clearEmptyUl($main) {
                $main.find(" ul").addClass("not-childrens");
                $main.find(" ul > li").each(function() {
                    $(this).parent().removeClass("not-childrens");
                });
                $main.find(" ul.not-childrens").remove();
            }

            //очитстить от коллапсов
            function clearCollapseNotNested($main) {
                $main.find(" .pmv__pages-item").each(function() {
                    if(!$(this).hasClass("have-nested")) {
                        $(this).removeClass("collapsed");
                    }
                });
            }
            function refreshNestedEl($main) {
                //Вставляем класс для вложенных
                $main.find(" .pmv__pages-item").removeClass("have-nested");
                $main.find(" ul").each(function() {
                    if($(this).parent(".pmv__pages-item").length) {
                        $(this).parent(".pmv__pages-item").addClass("have-nested");
                    }
                });
            }
            function refreshCollapsed($main) {
                //Коллапсируем рассколапсируем
                $main.find(" .pmv__pages-item.collapsed > ul").css({display: "none"});
                $main.find(" .pmv__pages-item > ul").not($main.find(" .pmv__pages-item.collapsed > ul")).css({display: "block"});
            }

            /****************************************************/
            /*Разрешения*/
            /****************************************************/
            //Добавляем разрешение
            $('#pp__modal-add-resolution .btn-select').on('click', function(event){
                var hasError = false;
                var w = $.trim($('#pp__modal-add-resolution .pp__modal-add-resolution-w').val());
                var h = $.trim($('#pp__modal-add-resolution .pp__modal-add-resolution-h').val());

                //Проверяем на ошибки
                if(!(/^[1-9]\w{2,4}$/gim.test(w) && parseInt(w) >= 320 && parseInt(w) <= 99999)) {
                    hasError = true;
                    $('#pp__modal-add-resolution .pp__modal-add-resolution-w-group').addClass("has-error");
                    $('#pp__modal-add-resolution .pp__modal-val-not-digit').css({display: "block"});
                }
                if(!(h == "auto" || (/^[1-9]\w{2,4}$/gim.test(h) && parseInt(h) >= 320 && parseInt(h) <= 99999))) {
                    hasError = true;
                    $('#pp__modal-add-resolution .pp__modal-add-resolution-h-group').addClass("has-error");
                    $('#pp__modal-add-resolution .pp__modal-val-not-digit').css({display: "block"});
                }
                if(!hasError) {
                    for(var i in session.data.globalSession.resolutions) {
                        var one = session.data.globalSession.resolutions[i];
                        if(parseInt(w) === one.w && (h === "auto" || parseInt(h) === one.h)) {
                            hasError = true;
                            $('#pp__modal-add-resolution .pp__modal-add-resolution-w-group').addClass("has-error");
                            $('#pp__modal-add-resolution .pp__modal-add-resolution-h-group').addClass("has-error");
                            $('#pp__modal-add-resolution .pp__modal-val-exists').css({display: "block"});
                            break;
                        }
                    }
                }

                //Добавляем страницу
                if(!hasError) {
                    var html =
                        "<li class='pp__resolutions-list-resolution' data-w='"+w+"' data-h='"+h+"'>" +
                        '<div class="pp__resolutions-list-resolution-content">' +
                        '<button class="btn btn-default btn-xs btn-block pp__resolutionforscreen-name-btn">' +
                        '<span class="pp__resolutionforscreen-name-btn-w">'+w+'</span> | <span class="pp__resolutionforscreen-name-btn-h">'+h+'</span>' +
                        '</button>' +
                        '<div class="btn-group pp__resolutions-specials-btn">' +
                            '<button class="btn btn-default btn-xs pp__resolutions-delete-btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                            '<div class="btn btn-default btn-xs pp__resolutions-drag-btn"><span class="glyphicon glyphicon-move"></span></div>' +
                        '</div>' +
                        '</div>' +
                        '<ul class="pp__resolutions-list-screenshots"></ul>' +
                        '</li>';

                    $(".pp__resolutions-screenshots-list").prepend(html);

                    $('#pp__modal-add-resolution .modal').modal('hide');

                    sendAddResolution();
                }
            });
            $('.pp__add-resolution-btn').on('click', function(){
                $('#pp__modal-add-resolution .pp__modal-val-exists').css({display: ""});
                $('#pp__modal-add-resolution .pp__modal-val-not-digit').css({display: ""});
                $('#pp__modal-add-resolution .pp__modal-add-resolution-w-group').removeClass("has-error");
                $('#pp__modal-add-resolution .pp__modal-add-resolution-h-group').removeClass("has-error");

                $('#pp__modal-add-resolution .modal').modal('show');
            });

            //Удаляем разрешение
            $('.pp__screenshots-menu').on('click', " .pp__resolutions-delete-btn", function(){
                var w = $(this).closest(".pp__resolutions-list-resolution").attr("data-w");
                var h = $(this).closest(".pp__resolutions-list-resolution").attr("data-h");
                $('#pp__modal-delete-resolution .pp__modal-delete-resolution-w')
                    .attr("data-w", w)
                    .text(w);
                $('#pp__modal-delete-resolution .pp__modal-delete-resolution-h')
                    .attr("data-h", h)
                    .text(h);
                $('#pp__modal-delete-resolution .modal').modal('show');
            });
            $('#pp__modal-delete-resolution .btn-select').on('click', function(){
                var w = $('#pp__modal-delete-resolution .pp__modal-delete-resolution-w').attr("data-w");
                var h = $('#pp__modal-delete-resolution .pp__modal-delete-resolution-h').attr("data-h");

                $('.pp__screenshots-menu .pp__resolutions-list-resolution[data-w="'+w+'"][data-h="'+h+'"]').remove();

                $('#pp__modal-delete-resolution .modal').modal('hide');

                sendDeleteResolution();
            });

            //Выбор разрешения
            $(".pp__btn-open-resolutions").on({
                "mouseenter": function() {$(".pp__resolutions-menu-outer").addClass("_open");},
                "mouseleave": function() {$(".pp__resolutions-menu-outer").removeClass("_open");}
            });

            var _temporarilyVisibledTimeout = null;
            $(".pp__resolutions-menu").on("click", " .pp__resolution-name-btn", function(){
                var $li = $(this).closest(".pp__resolutions-list-item");

                handlerSelectResolution($li);
            });
            $('body').on('keydown', handlerSelectResolutionKeyPress);
            pageManagerVisualizator.$container.on( "pmv.load.iframe", function(){
                $('#'+(pageManagerVisualizator._options.nameIFrame)).contents().find("body").on('keydown', handlerSelectResolutionKeyPress);
            });
            function handlerSelectResolutionKeyPress(e) {
                if(mouseKeyPressed) {
                    if((57 >= e.which && e.which >= 48) && !e.ctrlKey && !e.shiftKey && !e.altKey)
                    {
                        var n = e.which - 48;
                        var $li = $(".pp__resolutions-list-item[data-n='"+((n == 0)?10:n)+"']");
                        if($li.length) {
                            //Добавляем класс "active" на 2 сек
                            if(_temporarilyVisibledTimeout !== null) {
                                clearTimeout(_temporarilyVisibledTimeout);
                            }

                            $(".pp__resolutions-menu-outer").addClass("active");

                            _temporarilyVisibledTimeout = setTimeout(function() {
                                $(".pp__resolutions-menu-outer").removeClass("active");
                                _temporarilyVisibledTimeout = null;
                            }, 2000);
                            //

                            handlerSelectResolution($li);

                            e = e || window.e; if (e.stopPropagation) {e.stopPropagation()} else {e.cancelBubble = true} e.preventDefault();
                        }
                    }
                }
            }
            function handlerSelectResolution($li) {
                var w = $li.attr("data-w");
                var h = $li.attr("data-h");

                $(".pp__resolutions-list-item, .pp__resolution-name-btn, .pp__resolutionforscreen-name-btn").removeClass("active");
                $(".pp__resolutions-list-item[data-w='"+(w)+"'][data-h='"+(h)+"']")
                    .addClass("active")
                    .find(" .pp__resolution-name-btn")
                    .addClass("active");
                $(".pp__resolutions-list-resolution[data-w='"+(w)+"'][data-h='"+(h)+"'] .pp__resolutionforscreen-name-btn").addClass("active");

                sendSelectResolution(w, h);

                pageManagerVisualizator.setSizeIFrame(w, h);
                session.onResizeIFrame({w: null, h: null});
                $(".pp__resolution-name-btn").removeClass("bloor");
            }

            //Запись и отправка данных сессии
            function sendAddResolution() {
                session.onChangeResolutions(resolutionsToJson());
                refreshMenuResolutions();
                crossModulesFunctions["refreshCenteredFloatMenu"]();
            }

            function sendDeleteResolution() {
                session.onChangeResolutions(resolutionsToJson());
                refreshMenuResolutions();
                crossModulesFunctions["refreshCenteredFloatMenu"]();

                //обновить скриншоты
                //crossModulesFunctions["pmv.refreshMenuViewScreenshotsForResolutions"]();

                session.onChangeScreenshots(crossModulesFunctions["pp.allScreenshotsForCurPageToJson"]());
                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendSelectResolution(w, h) {
                session.onSelectResolution({
                    w: parseInt(w),
                    h: (h != "auto")?parseInt(h):h
                });

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            crossModulesFunctions["pmv.sendSortableResolutions"] = function() {
                session.onChangeResolutions(resolutionsToJson());
                refreshMenuResolutions();
                //
                crossModulesFunctions["pmv.refreshMenuViewScreenshotsForResolutions"]();
            }

            //Приём данных сессии
            session.responseHandlers["onChangeResolutions"] = function(o) {
                refreshMenuResolutions();
                crossModulesFunctions["refreshCenteredFloatMenu"]();
                //
                crossModulesFunctions["pmv.refreshMenuViewScreenshotsForResolutions"]();
            }
            session.responseHandlers["onSelectResolution"] = function(o) {
                //Получаем сессию без куков потому что м в куках и так будет записано текущее состояние сессии
                var ls = session.getLocalSessionParams(true);
                //Разрешение
                if(ls && "resolutions" in ls && "currentResolution" in ls.resolutions) {
                    $(".pp__resolutions-list-item, .pp__resolution-name-btn, .pp__resolutionforscreen-name-btn").removeClass("active");
                    $(".pp__resolutions-list-item[data-w='"+(o.val.w)+"'][data-h='"+(o.val.h)+"']")
                        .addClass("active")
                        .find(" .pp__resolution-name-btn")
                        .addClass("active");
                    $(".pp__resolutions-list-resolution[data-w='"+(o.val.w)+"'][data-h='"+(o.val.h)+"'] .pp__resolutionforscreen-name-btn").addClass("active");

                    pageManagerVisualizator.setSizeIFrame(ls.resolutions.currentResolution.w, ls.resolutions.currentResolution.h);
                    $(".pp__resolution-name-btn").removeClass("bloor");
                }

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }

            function resolutionsToJson() {
                var resolutions = [];

                $(".pp__screenshots-menu-window .pp__resolutions-list-resolution").each(function() {
                    resolutions.push({
                        w: parseInt($(this).attr("data-w")),
                        h: ($(this).attr("data-h") != "auto")?parseInt($(this).attr("data-h")):"auto"
                    });
                });

                return resolutions;
            }

            refreshMenuResolutions();
            function refreshMenuResolutions() {
                var localSession = session.getLocalSessionParams();
                //dragItemList = false;
                var $main = $(".pp__resolutions-list");
                $main.empty();

                var n = 1;
                var res = (function recursion(resolutions, html) {
                    for(var i in resolutions) {
                        var one = resolutions[i];
                        var w = one.w;
                        var h = one.h;
                        var active = (localSession && "resolutions" in localSession && localSession.resolutions.currentResolution.w === w && localSession.resolutions.currentResolution.h === h)?"active":"";
                        html += "<li class='pp__resolutions-list-item' data-w='"+w+"' data-h='"+h+"' data-n='"+((n > 10)?"":(n == 10)?0:n)+"'>";
                        html += '<div class="pp__resolutions-list-item-content">' +
                            '<button class="btn btn-default btn-xs btn-block pp__resolution-name-btn '+active+'">' +
                                '<span class="badge '+((n > 10)?"badge-hidden":"")+'">'+((n > 10)?"":(n == 10)?0:n)+'</span>' +
                                '<span class="pp__resolution-name-btn-w">'+w+'</span><span class="pp__resolution-name-btn-separator"> | </span><span class="pp__resolution-name-btn-h">'+h+'</span>' +
                            '</button>' +
                            '</div>';

                        html += "</li>";
                        n++;
                    }

                    return html;
                })(session.data.globalSession.resolutions, "");

                $main.append(res);
            }

            /****************************************************/
            /*Айфрейм*/
            /****************************************************/
            //Скролл
            pageManagerVisualizator.$container.on("csif.scroll", sendScrollIFrame);
            pageManagerVisualizator.$container.on("fcar.scroll", sendScrollIFrame);

            //Смена позиции окна Айфрейма
            $('body').on('keydown', handlerChangePosIFrameKeyPress);
            pageManagerVisualizator.$container.on( "pmv.load.iframe", function(){
                $('#'+(pageManagerVisualizator._options.nameIFrame)).contents().find("body").on('keydown', handlerChangePosIFrameKeyPress);
            });
            function handlerChangePosIFrameKeyPress(e) {
                if(mouseKeyPressed) {
                    if((e.which == 87 || e.which == 65 || e.which == 83 || e.which == 68) && !e.ctrlKey && !e.shiftKey && !e.altKey)
                    {
                        pageManagerVisualizator.mapNavigatorIFrame.handlerChangePosIFrameKeyPress(e);
                        e = e || window.e; if (e.stopPropagation) {e.stopPropagation()} else {e.cancelBubble = true} e.preventDefault();
                    }
                }
            }
            pageManagerVisualizator.$container.on("mnif.changePos", sendChangePosIFrame);


            //Ресайз Айфрейма
            var resizeIFrame__timeoutId = null;
            var curSizeIFrame = null;
            var lastSizeIFrame = null;
            pageManagerVisualizator.$container.on("rifStartResize", function() {
                sendResizeIFrame();
                resizeIFrame__timeoutId = setInterval(function() {
                    if(curSizeIFrame !== null && (lastSizeIFrame.w !== curSizeIFrame.w || lastSizeIFrame.h !== curSizeIFrame.h)) {
                        sendResizeIFrame();
                    }
                }, 500);
            });
            pageManagerVisualizator.$container.on("rifResize", function() {
                var $fittingWrap = $("#"+(pageManagerVisualizator._options.nameIFrame)).closest(".pmv-fitting-wrap");
                curSizeIFrame = {
                    w: $fittingWrap.width(),
                    h: $fittingWrap.height()
                };
            });
            pageManagerVisualizator.$container.on("rifStopResize", function() {
                if(resizeIFrame__timeoutId !== null) {
                    clearInterval(resizeIFrame__timeoutId);
                    resizeIFrame__timeoutId = null;
                    curSizeIFrame = null;
                    lastSizeIFrame = null;
                }
                sendResizeIFrame();
            });

            //Запись и отправка данных сессии
            function sendScrollIFrame() {
                if(pageManagerVisualizator._options.nameIFrame in window) {
                    var iframe = document.getElementById(pageManagerVisualizator._options.nameIFrame);
                    var win = iframe.contentWindow || iframe;
                    var doc = iframe.contentDocument || iframe.contentWindow.document;
                    var wWindow, wDocument, leftScroll, l_factor, hWindow, hDocument, topScroll, t_factor;

                    wWindow = $(win).width();
                    wDocument = $(doc).width();
                    hWindow = $(win).height();
                    hDocument = $(doc).height();
                    topScroll = $(win).scrollTop();
                    leftScroll = $(win).scrollLeft();

                    if(wDocument - wWindow == 0){l_factor = 0} else {l_factor = leftScroll / (wDocument - wWindow)}
                    if(hDocument - hWindow == 0){t_factor = 0} else {t_factor = topScroll / (hDocument - hWindow)}

                    session.onScrollIFrame({
                        left: l_factor,
                        top: t_factor
                    });
                }
            }
            function sendChangePosIFrame() {
                var $iframe = $("#" + (pageManagerVisualizator._options.nameIFrame));
                var $fittingWrap;
                var $outerWrap;
                if($iframe.length) {
                    $fittingWrap = $iframe.closest(".pmv-fitting-wrap");
                    $outerWrap = $iframe.closest(".pmv-outer-wrap");
                } else {
                    $fittingWrap = pageManagerVisualizator.$container.find(" .pmv-fitting-wrap");
                    $outerWrap = pageManagerVisualizator.$container.find(" .pmv-outer-wrap");
                }
                var w, h, w_c, h_c, l, t, l_factor, t_factor;

                w = $fittingWrap.width();
                h = $fittingWrap.height();
                t =   $fittingWrap.position().top;
                l =   $fittingWrap.position().left;
                w_c = $outerWrap.width();
                h_c = $outerWrap.height();

                if(w_c - w == 0){l_factor = 0} else {l_factor = l / (w_c - w)}
                if(h_c - h == 0){t_factor = 0} else {t_factor = t / (h_c - h)}

                session.onChangePosIFrame({
                    left: l_factor,
                    top: t_factor
                });
            }
            function sendResizeIFrame() {
                var $fittingWrap;
                if($("#"+(pageManagerVisualizator._options.nameIFrame)).length) {
                    $fittingWrap = $("#"+(pageManagerVisualizator._options.nameIFrame)).closest(".pmv-fitting-wrap");
                } else {
                    $fittingWrap = pageManagerVisualizator.$container.find(" .pmv-fitting-wrap");
                }
                lastSizeIFrame = {
                    w: $fittingWrap.width(),
                    h: $fittingWrap.height()
                };
                session.onResizeIFrame(lastSizeIFrame);

                $(".pp__resolution-name-btn.active").addClass("bloor");
            }

            //Приём данных сессии
            session.responseHandlers["onResizeIFrame"] = function(o) {
                var ls = session.getLocalSessionParams(true);
                if( ls && "iframeSize" in ls && ls.iframeSize.w !== null ) {
                    pageManagerVisualizator.setSizeIFrame(ls.iframeSize.w, ls.iframeSize.h, true);
                    $(".pp__resolution-name-btn.active").addClass("bloor");
                }
            }
            session.responseHandlers["onChangePosIFrame"] = function(o) {
                var ls = session.getLocalSessionParams(true);
                if( ls && "iframePosition" in ls ) {
                    pageManagerVisualizator.setPositionIFrame(ls.iframePosition.left, ls.iframePosition.top);
                }
            }
            session.responseHandlers["onScrollIFrame"] = function(o) {
                var ls = session.getLocalSessionParams(true);
                if( ls && "iframeScroll" in ls ) {
                    pageManagerVisualizator.setScrollIFrame(ls.iframeScroll.left, ls.iframeScroll.top);
                }
            }

            //При загрузке iFrame скрываем всё окно шаблонизатора и показываем анимацию загрузки
            pageManagerVisualizator.$container.on({
                "pmv.prepaste.iframe": function() {
                    $( "#loading" )
                        .css({width: "100%", height: "100%"})
                        .stop().animate({opacity: 1}, 500, "swing");
                },
                "pmv.load.iframe": function() {
                    $( "#loading" )
                        .stop().animate({opacity: 0}, 200, "swing", function() {
                        $( "#loading" ).css({width: "0", height: "0"});
                    });
                }
            });

            pageManagerVisualizator._create();
        })();

        /****************************************************/
        /*Пиксель перфект*/
        /****************************************************/
        var pp__bottomSpaceBtn__stop_recursion = true;
        (function() {
            pixelPerfect = new modules.pixelPerfect($("#wrap_iframe .pmv-fitting-wrap"), {
                dirScrins: "a-pp-design-screenshots",
                nameIFrame: "PP_iframe"
            });

            pageManagerVisualizator.$container.on( "pmv.load.iframe", function(){
                pixelPerfect._destroy();
                pixelPerfect._create();

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());

                var ls = session.getLocalSessionParams(false);
                if(ls && "showPageProofsOrDesign" in ls) {
                    pixelPerfect.showPageProofsOrDesign(ls.showPageProofsOrDesign);
                }

                refreshMenuViewScreenshotsForResolutions();
            });

            //Скроллбар для списка скриншотов привязанных к разрешениям и страницам
            $(".pp__screenshots-menu-scrollwrap, .pp__screenshots-files-menu-scrollwrap, .pp__screenshot-thumbnail-scrollwrap").mCustomScrollbar({
                axis: "y",
                theme: "dark",
                scrollbarPosition: "outside",
                scrollInertia: 100,
                mouseWheel: {
                    scrollAmount: 100
                },
                callbacks: {
                    onUpdate: function() {
                        /*if($(".pmv__pages-sortable-scrollwrap").hasClass("_mCS_1 mCS_no_scrollbar")) {
                            $(".pmv__pages-window").addClass("no-scrollbar");
                        } else {
                            $(".pmv__pages-window").removeClass("no-scrollbar");
                        }*/
                    }
                }
            });

            //Свернуть-развернуть список скриншотов привязанных к разрешениям и страницам
            $(".pp__btn-open-screenshots").on("click", function () {
                if(!$(this).hasClass('active')) {
                    $(".pp__btn-open-screenshots").addClass('active');
                    $(".pp__screenshots-menu-window, .pp__screenshots-menu-window-shadow, .pp__screenshots-files-menu-scrollwrap").addClass('open');
                } else {
                    $(".pp__btn-open-screenshots").removeClass('active');
                    $(".pp__screenshots-menu-window, .pp__screenshots-menu-window-shadow, .pp__screenshots-files-menu-scrollwrap").removeClass('open');
                }
            });
            $("body").on("click click.body.iframe", function (e) {
                if( $(e.target).closest($(".pp__btn-open-screenshots").add($(".pp__screenshots-menu-window, .pp__screenshots-files-menu-scrollwrap, .pp__screenshot-thumbnail-scrollwrap, .pp__resolutions-menu, #pp__modal-add-resolution, #pp__modal-delete-resolution, .pp__deviation"))).length == 0 ) {
                    $(".pp__btn-open-screenshots").removeClass('active');
                    $(".pp__screenshots-menu-window, .pp__screenshots-menu-window-shadow, .pp__screenshots-files-menu-scrollwrap, .pp__screenshot-thumbnail-scrollwrap").removeClass('open');
                }
            });

            //Привязываем скриншот
            $('.pp__screenshots-files-menu-scrollwrap').on('click', " .pp__screenshots-btn-add-screenshot", function(){
                if($(".pp__screenshots-menu-scrollwrap .pp__resolutions-list-resolution").length) {
                    var $li = $(this).closest(".pp__screenshots-item");
                    var urn = $li.attr("data-urn");
                    var $size = $li.find(" .pp__screenshots-btn-size");
                    var w = $size.attr("data-w");
                    var h = $size.attr("data-h");
                    var html = '' +
                        '<li class="pp__resolutions-list-screenshot" data-urn="'+urn+'" data-w="'+w+'" data-h="'+h+'">' +
                            '<div class="pp__screenshot-content">' +
                                '<button class="btn btn-default btn-xs btn-block pp__screenshot-name-btn">' +
                                    '<div class="btn btn-default btn-xs pp__resolutions-screenshots-btn-size" data-w="'+w+'" data-h="'+h+'">' +
                                        '<span class="pp__screenshot-name-btn-w">'+w+'</span> | <span class="pp__screenshot-name-btn-h">'+h+'</span>' +
                                    '</div>' +
                                    urn +
                                '</button>' +
                                '<div class="btn-group pp__resolutions-screenshots-special-btn">' +
                                    '<button class="btn btn-default btn-xs pp__resolutions-screenshots-delete-btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                                    '<div class="btn btn-default btn-xs pp__resolutions-screenshots-drag-btn"><span class="glyphicon glyphicon-move"></span></div>' +
                                    '<button class="pp__resolutions-screenshots-btn-deviation btn btn-default btn-xs"><i class="glyphicon glyphicon-option-vertical" aria-hidden="true"></i></button>' +
                                '</div>' +
                            '</div>' +
                        '</li>';

                    $(".pp__screenshots-menu-scrollwrap .pp__resolutions-list-screenshots")
                        .first()
                        .prepend($(html));

                    sendBindScreenshot();
                }
            });

            //Удаляем (отвязываем) скриншот
            $('.pp__screenshots-menu').on('click', " .pp__resolutions-screenshots-delete-btn", function(e){
                e.stopPropagation();
                $(this).closest(".pp__resolutions-list-screenshot").remove();

                sendUnbindScreenshot();
            });

            //Активируем-деактивируем скриншот
            $('.pp__screenshots-menu').on('click', ' .pp__screenshot-name-btn', function() {
                var $li = $(this).closest(".pp__resolutions-list-screenshot");

                if(!$(this).hasClass("active")) {
                    $(this).addClass("active");
                    $li.addClass("active").data("screenshot").active = true;
                } else {
                    $(this).removeClass("active");
                    $li.removeClass("active").data("screenshot").active = false;
                }

                sendActiveScreenshot();
            });

            //Показываем-скрываем окно "отклонения" для скриншота
            $('.pp__screenshots-menu').on('click', " .pp__resolutions-screenshots-btn-deviation", function(e){
                var _ = $(this).closest(".pp__resolutions-list-screenshot").data("screenshot");
                $(".pp__deviation").data("screenshot", _);
                setParamDeviation($(".pp__deviation"), _.pos, _.l, _.t, _.lpx, _.lper, _.tpx, _.tper);

                $(".pp__btn-open-screenshots").removeClass('active');
                $(".pp__screenshots-menu-window, .pp__screenshots-menu-window-shadow, .pp__screenshots-files-menu-scrollwrap, .pp__screenshot-thumbnail-scrollwrap").removeClass('open');
                $('.pp__deviation').addClass("open");
                deviationWindowBeyondLimit();
            });
            $("body").on("click click.body.iframe", function (e) {
                if( $(e.target).closest($(".pp__resolutions-screenshots-btn-deviation").add($(".pp__deviation"))).length == 0 ) {
                    $('.pp__deviation').removeClass("open");
                }
            });
            //Чтоб окно "pp__deviation" невыходило за границы "shab-right-column"
            $(window).on("resize", deviationWindowBeyondLimit);
            function deviationWindowBeyondLimit() {
                var $el = $('.pp__deviation');
                if($el.css("display").toLowerCase() != "none") {
                    var $cont = $('.shab-right-column');

                    var offset = $el.offset();
                    var el_left =  offset.left;
                    var el_top =  offset.top;
                    var el_w =  $el.outerWidth();
                    var el_h =  $el.outerHeight();

                    offset = $cont.offset();
                    var cont_left =  offset.left;
                    var cont_top =  offset.top;
                    var cont_w =  $cont.outerWidth();
                    var cont_h =  $cont.outerHeight();

                    if(el_left + el_w > cont_left + cont_w) {
                        $el.css({left: cont_left + cont_w - el_w});
                    }

                    if(el_top + el_h > cont_top + cont_h) {
                        $el.css({top: cont_top + cont_h - el_h});
                    }
                }
            }

            //Смена "Static" и "Fixed" в "окне отклонения"
            $('.shab__main-menu-container').on("click", " .pp__deviation-fixed-or-static label", function(){
                if($(".pp__deviation").data("screenshot") !== undefined) {
                    var pos = ($(this).find(" input").val() == 1)?"static":"fixed";
                    var b = $(".pp__deviation").data("screenshot");

                    b.pos = pos;

                    if(b.pos == "static") {
                        b.t = "top";
                    }

                    setParamDeviation__relative($(".pp__deviation"), b.pos, b.l, b.t);

                    sendChangeSOrFScreenshotDeviation();
                }
            });

            //Смена положения в сетке в "окне отклонения"
            $('.shab__main-menu-container').on("click", " .pp__deviation-relative .btn[data-left][data-top]", function(){
                if($(".pp__deviation").data("screenshot") !== undefined) {
                    var b = $(".pp__deviation").data("screenshot");
                    if(!(b.pos == "static" && $(this).attr("data-top") != "top")) {
                        b.l = $(this).attr("data-left");
                        b.t = $(this).attr("data-top");

                        setParamDeviation__relative($(".pp__deviation"), b.pos, b.l, b.t);

                        sendChangeGridScreenshotDeviation();
                    }
                }
            });

            //Изменение значений отклонения в окне "отклонения"
            function startDeviationSpinner(e, ui) {
                sendStartSpinnerScreenshotDeviation(e, ui);
            }
            function spinDeviationSpinner(e, ui) {
                sendSpinSpinnerScreenshotDeviation(e, ui);
            }
            function stopDeviationSpinner(e, ui) {
                sendStopSpinnerScreenshotDeviation(e, ui);
            }

            //Показать верстку или скрины или 50 на 50
            $('.pp__verstka-btn').on('click', function(){
                pixelPerfect.showPageProofsOrDesign(0);
                refreshButtonsPageProofsOrDesign(0);
                sendHTMLOrDesign(0);
            });
            $('.pp__50p-btn').on('click', function(){
                pixelPerfect.showPageProofsOrDesign(1);
                refreshButtonsPageProofsOrDesign(1);
                sendHTMLOrDesign(1);
            });
            $('.pp__design-btn').on('click', function(){
                pixelPerfect.showPageProofsOrDesign(2);
                refreshButtonsPageProofsOrDesign(2);
                sendHTMLOrDesign(2);
            });

            //Горячие клавишы
            $('body').on('keydown', handlerFastChangePageProofsOrDesign);
            pageManagerVisualizator.$container.on( "pmv.load.iframe", function(){
                $('#'+(pageManagerVisualizator._options.nameIFrame)).contents().find("body").on('keydown', handlerFastChangePageProofsOrDesign);
            });
            function handlerFastChangePageProofsOrDesign(e) {
                if(mouseKeyPressed) {
                    if((e.which == 90 || e.which == 88 || e.which == 67) && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                        var mode;
                        switch(e.which) {
                            case 90: mode = 0; break;
                            case 88: mode = 1; break;
                            case 67: mode = 2; break;
                        }
                        pixelPerfect.showPageProofsOrDesign(mode);
                        refreshButtonsPageProofsOrDesign(mode);
                        sendHTMLOrDesign(mode);

                        e = e || window.e; if (e.stopPropagation) {e.stopPropagation()} else {e.cancelBubble = true} e.preventDefault();
                    }
                }
            }

            //Добавление-удаление блока перед закрывающим тегом body
            $(".pp__bottom-space-btn").on("change", function(){
                if(pp__bottomSpaceBtn__stop_recursion) {
                    if($(".pp__bottom-space-btn").prop("checked")) {
                        pixelPerfect.insertBottomSpace();
                    } else {
                        pixelPerfect.deleteBottomSpace();
                    }

                    sendShowBottomSpace($(".pp__bottom-space-btn").prop("checked"));
                }
            });
            pageManagerVisualizator.$container.on( "pmv.load.iframe", function(){
                var ls = session.getLocalSessionParams(false);

                pp__bottomSpaceBtn__stop_recursion = false;
                if(ls && "showBottomSpace" in ls) {
                    if(ls.showBottomSpace) {
                        pixelPerfect.insertBottomSpace();
                        $(".pp__bottom-space-btn").bootstrapToggle('on');
                    } else {
                        pixelPerfect.deleteBottomSpace();
                        $(".pp__bottom-space-btn").bootstrapToggle('off');
                    }
                }
                pp__bottomSpaceBtn__stop_recursion = true;
            });

            crossModulesFunctions["pp.refreshButtonsPageProofsOrDesign"] = function(show) {
                $('.pp__verstka-btn, .pp__50p-btn, .pp__design-btn').removeClass("active btn-primary btn-success btn-info btn-warning btn-danger").addClass("btn-default");
                switch (show) {
                    case 0:
                        $('.pp__verstka-btn').removeClass("btn-default").addClass("active btn-primary");
                        break;
                    case 1:
                        $('.pp__50p-btn').removeClass("btn-default").addClass("active btn-warning");
                        break;
                    case 2:
                        $('.pp__design-btn').removeClass("btn-default").addClass("active btn-danger");
                        break;
                }
            }
            function refreshButtonsPageProofsOrDesign(show) {
                crossModulesFunctions["pp.refreshButtonsPageProofsOrDesign"](show);
            }

            //Запись и отправка данных сессии
            var screenshotsCollectionTemp;
            var screenshotsObjListTemp;
            var allScreenshotsForCurPageToJsonTemp;

            function sendBindScreenshot() {
                session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendUnbindScreenshot() {
                session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendSortableScreenshot() {
                session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendActiveScreenshot() {
                session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendChangeSOrFScreenshotDeviation() {
                session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendChangeGridScreenshotDeviation() {
                session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            function sendStartSpinnerScreenshotDeviation(e, ui) {
                if($(".pp__deviation").data("screenshot") !== undefined) {
                    var b = $(".pp__deviation").data("screenshot");

                    if($(e.currentTarget).hasClass("pp__deviation-left-px")){b.lpx = parseInt($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-left-percent")){b.lper = parseFloat($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-top-px")){b.tpx = parseInt($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-top-percent")){b.tper = parseFloat($(e.currentTarget).val())}

                    allScreenshotsForCurPageToJsonTemp = allScreenshotsForCurPageToJson();
                    session.onChangeScreenshots(allScreenshotsForCurPageToJsonTemp);
                    screenshotsCollectionTemp = session.getCurrentRelatedScreenshotsCollection();
                    screenshotsObjListTemp = session.getScreenshotsObjList();
                    pixelPerfect.refreshScrins(screenshotsCollectionTemp, screenshotsObjListTemp);
                }
            }
            function sendSpinSpinnerScreenshotDeviation(e, ui) {
                if($(".pp__deviation").data("screenshot") !== undefined) {
                    var b = $(".pp__deviation").data("screenshot");

                    if($(e.currentTarget).hasClass("pp__deviation-left-px")){b.lpx = parseInt($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-left-percent")){b.lper = parseFloat($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-top-px")){b.tpx = parseInt($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-top-percent")){b.tper = parseFloat($(e.currentTarget).val())}

                    session.onFastChangeScreenshots(allScreenshotsForCurPageToJsonTemp);//Fast
                    pixelPerfect.refreshScrins(screenshotsCollectionTemp, screenshotsObjListTemp);
                }
            }
            function sendStopSpinnerScreenshotDeviation(e, ui) {
                if($(".pp__deviation").data("screenshot") !== undefined) {
                    var b = $(".pp__deviation").data("screenshot");

                    if($(e.currentTarget).hasClass("pp__deviation-left-px")){b.lpx = parseInt($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-left-percent")){b.lper = parseFloat($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-top-px")){b.tpx = parseInt($(e.currentTarget).val())}
                    else if($(e.currentTarget).hasClass("pp__deviation-top-percent")){b.tper = parseFloat($(e.currentTarget).val())}

                    session.onChangeScreenshots(allScreenshotsForCurPageToJson());

                    var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                    pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
                }
            }

            function sendHTMLOrDesign(state) {
                session.onHTMLOrDesign(state);
            }
            function sendShowBottomSpace(state) {
                session.onShowBottomSpace(state);
            }

            //Приём данных сессии
            session.responseHandlers["onChangeScreenshots"] = function() {
                refreshMenuViewScreenshotsForResolutions();

                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            session.responseHandlers["onFastChangeScreenshots"] = function() {
                //console.time("dd");
                var screenshotsCollection = session.getCurrentRelatedScreenshotsCollection();
                //console.timeEnd("dd");
                pixelPerfect.refreshScrins(screenshotsCollection, session.getScreenshotsObjList());
            }
            session.responseHandlers["onHTMLOrDesign"] = function() {
                var ls = session.getLocalSessionParams(true);
                if(ls && "showPageProofsOrDesign" in ls) {
                    pixelPerfect.showPageProofsOrDesign(ls.showPageProofsOrDesign);
                    crossModulesFunctions["pp.refreshButtonsPageProofsOrDesign"](ls.showPageProofsOrDesign);
                }
            }
            session.responseHandlers["onShowBottomSpace"] = function() {
                var ls = session.getLocalSessionParams(true);

                if(ls && "showBottomSpace" in ls) {
                    pp__bottomSpaceBtn__stop_recursion = false;
                    if(ls.showBottomSpace) {
                        pixelPerfect.insertBottomSpace();
                        $(".pp__bottom-space-btn").bootstrapToggle('on');
                    } else {
                        pixelPerfect.deleteBottomSpace();
                        $(".pp__bottom-space-btn").bootstrapToggle('off');
                    }
                    pp__bottomSpaceBtn__stop_recursion = true;
                }
            }

            //Все скриншоты для текущей страницы в json
            crossModulesFunctions["pp.allScreenshotsForCurPageToJson"] = function () {
                return allScreenshotsForCurPageToJson();
            }
            function allScreenshotsForCurPageToJson() {
                var newScreenshotsForCurPage = {};

                $(".pp__screenshots-menu-window .pp__resolutions-list-screenshot").each(function() {
                    var $liResolution = $(this).closest(".pp__resolutions-list-resolution");
                    var w = $liResolution.attr("data-w");
                    var h = $liResolution.attr("data-h");
                    var w_h = w+"|"+h;

                    if(!(w_h in newScreenshotsForCurPage)) {
                        newScreenshotsForCurPage[w_h] = [];
                    }

                    var newScrinshot;
                    if($(this).data("screenshot") === undefined) {
                        newScrinshot = {
                            urn: $(this).attr("data-urn"),
                            active: false,
                            pos: "static",
                            l: "center",
                            t: "top",
                            lpx: 0,
                            tpx: 0,
                            lper: 0,
                            tper: 0
                        };
                        $(this).data("screenshot", newScrinshot);
                    }
                    newScreenshotsForCurPage[w_h].push($(this).data("screenshot"));
                });

                return newScreenshotsForCurPage;
            }
            //Формируем список разрешений с списком привязанных скриншотов

            $(".pp__screenshots-menu").prepend("<ul class='pp__resolutions-screenshots-list'></ul>");
            refreshMenuViewScreenshotsForResolutions();
            $(".pp__resolutions-screenshots-list").sortable({
                revert: true,
                cursor: 'move',
                axis: 'y',
                items: ' > li',
                distance: 5,
                placeholder: "placeholder",
                forceHelperSize: true,
                forcePlaceholderSize: true,
                /*placeholder: {
                    /!*element: function(currentItem) {
                     return $('<div class="sm-placeholder-media"></div>').height( currentItem.outerHeight() );
                     },*!/
                    update: function(container, p) {
                        return;
                    }
                },*/
                update: crossModulesFunctions["pmv.sendSortableResolutions"]
            });
            var allScreenshotsForCurPageTemp;
            crossModulesFunctions["pmv.refreshMenuViewScreenshotsForResolutions"] = function() {
                refreshMenuViewScreenshotsForResolutions();
            }
            function refreshMenuViewScreenshotsForResolutions() {
                var localSession = session.getLocalSessionParams();
                allScreenshotsForCurPageTemp = [];
                //dragItemList = false;
                var $main = $(".pp__resolutions-screenshots-list");
                $main.empty();

                if(localSession && "pages" in localSession && localSession.pages.currentPage !== null) {
                    var res = (function recursion(resolutions, html) {
                        for(var i in resolutions) {
                            var one = resolutions[i];
                            var w = one.w;
                            var h = one.h;
                            var active = (localSession && "resolutions" in localSession && localSession.resolutions.currentResolution.w === w && localSession.resolutions.currentResolution.h === h)?"active":"";
                            html += "<li class='pp__resolutions-list-resolution' data-w='"+w+"' data-h='"+h+"'>";
                            html += '<div class="pp__resolutions-list-resolution-content">' +
                                '<button class="btn btn-default btn-xs btn-block pp__resolutionforscreen-name-btn '+active+'">' +
                                    '<span class="pp__resolutionforscreen-name-btn-w">'+w+'</span> | <span class="pp__resolutionforscreen-name-btn-h">'+h+'</span>' +
                                '</button>' +
                                '<div class="btn-group pp__resolutions-specials-btn">' +
                                    '<button class="btn btn-default btn-xs pp__resolutions-delete-btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                                    '<div class="btn btn-default btn-xs pp__resolutions-drag-btn"><span class="glyphicon glyphicon-move"></span></div>' +
                                '</div>' +
                                '</div>';


                            html += "<ul class='pp__resolutions-list-screenshots'>" + createScreenshotsList(localSession.pages.currentPage, one, session.data.globalSession.designScreenshotsRelatedResolutionAndPage) + "</ul>";

                            html += "</li>";
                        }

                        return html;
                    })(session.data.globalSession.resolutions, "");

                    $main.append(res);

                    var i = 0;
                    $main.find(" .pp__resolutions-list-screenshot").each(function() {
                        $(this).data("screenshot", allScreenshotsForCurPageTemp[i]);
                        i++;
                    });
                }
                refreshSortableScreensotsInResolutions();
            }

            createDeviation();
            function createDeviation() {
                var html = '' +
                    '<div class="pp__deviation panel panel-primary">' +
                        '<div class="panel-body">' +
                            '<div class="row">' +
                                '<div class="col-xs-6 pp__deviation-col-left">' +
                                    '<form class="pp__deviation-fixed-or-static btn-group-vertical btn-toggle-one-color" data-toggle="buttons">' +
                                        '<label class="btn" data-btn-color="primary">' +
                                            '<input type="radio" name="sm-radio-fixed-or-static" value="1" />Static' +
                                        '</label>' +
                                        '<label class="btn" data-btn-color="danger">' +
                                            '<input type="radio" name="sm-radio-fixed-or-static" value="0" />Fixed' +
                                        '</label>' +
                                    '</form>' +
                                '</div>' +
                                '<div class="col-xs-6 pp__deviation-col-right">' +
                                    '<div class="pp__deviation-relative btn-group-table">' +
                                        '<div class="btn-group btn-group-justified" role="group">' +
                                            '<div class="btn" data-left="left" data-top="top" role="button">&nbsp</div>' +
                                            '<div class="btn" data-left="center" data-top="top" role="button">&nbsp</div>' +
                                            '<div class="btn" data-left="right" data-top="top" role="button">&nbsp</div>' +
                                        '</div>' +
                                        '<div class="btn-group btn-group-justified" role="group">' +
                                            '<div class="btn disabled" data-left="left" data-top="center" role="button">&nbsp</div>' +
                                            '<div class="btn disabled" data-left="center" data-top="center" role="button">&nbsp</div>' +
                                            '<div class="btn disabled" data-left="right" data-top="center" role="button">&nbsp</div>' +
                                        '</div>' +
                                        '<div class="btn-group btn-group-justified" role="group">' +
                                            '<div class="btn disabled" data-left="left" data-top="bottom" role="button">&nbsp</div>' +
                                            '<div class="btn disabled" data-left="center" data-top="bottom" role="button">&nbsp</div>' +
                                            '<div class="btn disabled" data-left="right" data-top="bottom" role="button">&nbsp</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="row row-name-px-percent">' +
                                '<div class="col-xs-6 pp__deviation-col-left">' +
                                    '<p>px</p>' +
                                '</div>' +
                                '<div class="col-xs-6 pp__deviation-col-right">' +
                                    '<p>%</p>' +
                                '</div>' +
                            '</div>' +
                            '<div class="row row-otklonenie-1">' +
                                '<div class="col-xs-6 pp__deviation-col-left">' +
                                    '<div class="input-group">' +
                                        '<input type="text" class="form-control input-sm pp__deviation-input pp__deviation-left-px">' +
                                        '<div class="input-group-addon"><span class="fa fa-long-arrow-right"></span></div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="col-xs-6 pp__deviation-col-right">' +
                                    '<div class="input-group">' +
                                        '<input type="text" class="form-control input-sm pp__deviation-input pp__deviation-left-percent">' +
                                        '<div class="input-group-addon"><span class="fa fa-long-arrow-right"></span></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="row row-otklonenie-2">' +
                                '<div class="col-xs-6 pp__deviation-col-left">' +
                                    '<div class="input-group">' +
                                        '<input type="text" class="form-control input-sm pp__deviation-input pp__deviation-top-px">' +
                                        '<div class="input-group-addon">&nbsp<span class="fa fa-long-arrow-down"></span>&nbsp</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="col-xs-6 pp__deviation-col-right">' +
                                    '<div class="input-group">' +
                                        '<input type="text" class="form-control input-sm pp__deviation-input pp__deviation-top-percent">' +
                                        '<div class="input-group-addon">&nbsp<span class="fa fa-long-arrow-down"></span>&nbsp</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                $(".pp__resolutions-menu-fixed").after(html);
                refreshSpinner($(".pp__deviation"));
                $(".pp__deviation").draggable({containment: ".shab-right-column", scroll: false});
            }
            function setParamDeviation($container, pos, l, t, lpx, lper, tpx, tper) {
                setParamDeviation__relative($container, pos, l, t);
                setParamDeviation__deviation($container, lpx, lper, tpx, tper);
            }
                //Радио кнопки "Static" и "Fixed" и положени в сетке
                function setParamDeviation__relative($container, pos, l, t) {
                    var $static = $container.find(" .pp__deviation-fixed-or-static label").first();
                    var $fixed = $container.find(" .pp__deviation-fixed-or-static label").last();
                    if(pos == "static") {
                        $static.removeClass("btn-default").addClass("btn-primary active");
                        $static.find(" input").prop("checked", true);
                        $fixed.addClass("btn-default").removeClass("btn-danger active");
                        $fixed.find(" input").prop("checked", false);
                    } else {
                        $static.addClass("btn-default").removeClass("btn-primary active");
                        $static.find(" input").prop("checked", false);
                        $fixed.removeClass("btn-default").addClass("btn-danger active");
                        $fixed.find(" input").prop("checked", true);
                    }

                    if(pos == "static") {
                        t = "top";
                    }
                    var $relative = $container.find(" .pp__deviation-relative");
                    if(pos == "static") {
                        $relative.addClass("pp__deviation-static").removeClass("pp__deviation-fixed");
                        $relative.find(" .btn[data-top!='top']").addClass("disabled");
                    } else {
                        $relative.removeClass("pp__deviation-static").addClass("pp__deviation-fixed");
                        $relative.find(" .btn[data-top!='top']").removeClass("disabled");
                    }
                    $relative.find(" .btn").removeClass("active btn-danger").addClass("btn-default");
                    $relative.find(" .btn[data-left='"+l+"'][data-top='"+t+"']").addClass("active btn-danger").removeClass("btn-default");
                }
                //Отклонение заданное в пикселях и процентах
                function setParamDeviation__deviation($container, lpx, lper, tpx, tper) {
                    var deviationInput = $container.find(" .pp__deviation-input");
                    deviationInput.filter(".pp__deviation-left-px").val(lpx);
                    deviationInput.filter(".pp__deviation-left-percent").val(lper);
                    deviationInput.filter(".pp__deviation-top-px").val(tpx);
                    deviationInput.filter(".pp__deviation-top-percent").val(tper);
                }
            //Обновить спиннер
            function refreshSpinner($container) {
                $container.find(" .pp__deviation-left-px").add($container.find(" .pp__deviation-top-px")).spinner({
                    min: -99999,
                    max: 99999,
                    start: startDeviationSpinner,
                    spin: spinDeviationSpinner,
                    stop: stopDeviationSpinner
                });
                $container.find(" .pp__deviation-left-percent").add($container.find(" .pp__deviation-top-percent")).spinner({
                    min: -9999,
                    max: 9999,
                    step: 0.1,
                    start: startDeviationSpinner,
                    spin: spinDeviationSpinner,
                    stop: stopDeviationSpinner
                });
            }

            //Вывод привязанных скриншотов
            function createScreenshotsList(currentPage, resolution, screenshotsRelated) {
                if(currentPage in screenshotsRelated && (resolution.w+"|"+resolution.h) in  screenshotsRelated[currentPage]) {
                    //nestet to object list
                    var screenshotsObjList = session.getScreenshotsObjList();

                    var screenshots = screenshotsRelated[currentPage][resolution.w+"|"+resolution.h];
                    var html = "";
                    for(var key in screenshots) {
                        var s =  screenshots[key];//screenshot

                        if(s.pos == "static") {
                            s.t = "top";
                        }
                        allScreenshotsForCurPageTemp.push(s);

                        html += '' +
                        '<li class="pp__resolutions-list-screenshot '+((s.active)?"active":"")+'" data-urn="'+s.urn+'" data-w="'+screenshotsObjList[s.urn].w+'" data-h="'+screenshotsObjList[s.urn].h+'">' +
                            '<div class="pp__screenshot-content">' +
                                '<button class="btn btn-default btn-xs btn-block pp__screenshot-name-btn '+((s.active)?"active":"")+'">' +
                                    '<div class="btn btn-default btn-xs pp__resolutions-screenshots-btn-size" data-w="'+screenshotsObjList[s.urn].w+'" data-h="'+screenshotsObjList[s.urn].h+'">' +
                                        '<span class="pp__screenshot-name-btn-w">'+screenshotsObjList[s.urn].w+'</span> | <span class="pp__screenshot-name-btn-h">'+screenshotsObjList[s.urn].h+'</span>' +
                                    '</div>' +
                                    s.urn +
                                '</button>' +
                                '<div class="btn-group pp__resolutions-screenshots-special-btn">' +
                                    '<button class="btn btn-default btn-xs pp__resolutions-screenshots-delete-btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                                    '<div class="btn btn-default btn-xs pp__resolutions-screenshots-drag-btn"><span class="glyphicon glyphicon-move"></span></div>' +
                                    '<button class="pp__resolutions-screenshots-btn-deviation btn btn-default btn-xs"><i class="glyphicon glyphicon-option-vertical" aria-hidden="true"></i></button>' +
                                '</div>' +
                            '</div>' +
                        '</li>';
                    }
                    return html;
                }
                return "";
            }
            //Просто обновляем сортировку
            function refreshSortableScreensotsInResolutions() {
                    $(".pp__resolutions-list-screenshots").sortable({
                        revert: true,
                        cursor: 'move',
                        axis: 'y',
                        items: ' > li',
                        distance: 5,
                        connectWith: ".pp__resolutions-list-screenshots",
                        placeholder: "placeholder",
                        forceHelperSize: true,
                        forcePlaceholderSize: true,
                        /*placeholder: {
                            element: function(currentItem) {
                                return $('<div class="panel panel-default sm-placeholder-scrin"></div>').height( currentItem.outerHeight() );
                            },
                            update: function(container, p) {
                                return;
                            }
                        },*/
                        remove: function(event, ui){//"update" заменил на "remove"
                            /*if( ui.item.closest( ".sm-all-scrins" ).size() ) {
                                ui.item.remove();
                            }*/
                        },
                        stop: function(){
                            //$container.trigger("sm.change");
                        },
                        update: sendSortableScreenshot
                    });
                }

            //Список всех скриншотов
            $(".pp__screenshots-files-menu-scrollwrap").prepend('<ul class="pp__screenshots-files-list"></ul>');
            refreshMenuAllScreenshots();
            function refreshMenuAllScreenshots() {
                var localSession = session.getLocalSessionParams();
                //dragItemList = false;
                var $main = $(".pp__screenshots-files-list");
                $main.empty();
                var html = "";

                for(var i in session.data.globalSession.designScreenshots) {
                    var one = session.data.globalSession.designScreenshots[i];
                    html += "<li class='pp__screenshots-item' data-name='"+one.name+"' data-urn='"+one.urn+"'>";
                    html += '<div class="pp__screenshots-item-content">' +
                            '<button class="btn btn-default btn-xs pp__screenshots-btn-collapsed"><span class="glyphicon glyphicon-minus"></span><span class="glyphicon glyphicon-plus"></span></button>' +
                            '<div class="btn btn-default btn-xs btn-block pp__screenshots-btn-name">' +
                                '<div class="btn btn-default btn-xs pp__screenshots-btn-size" data-w="'+one.w+'" data-h="'+one.h+'">' +
                                    '<span class="pp__screenshots-btn-size-w">'+one.w+'</span> | <span class="pp__screenshots-btn-size-h">'+one.h+'</span>' +
                                '</div>' +
                            one.urn +
                            '</div>' +
                            '<button class="btn btn-success btn-xs pp__screenshots-btn-add-screenshot"><span class="glyphicon glyphicon-plus-sign"></span></button>' +
                        '</div>';
                    html += "</li>";
                }

                $main.append(html);
            }

            //Отображаем миниатюрку
            var windowThumbnail__timeoutId = null;
            $(".pp__screenshots-files-menu-scrollwrap").on("mouseenter", " .pp__screenshots-item", function(){
                $(".pp__screenshot-thumbnail")
                    .empty()
                    .append('<img src="'+("/a-pp-design-screenshots/design-thumbnails/"+$(this).attr("data-urn"))+'?a-pp=1" width="320" height="auto" />');
                $(".pp__screenshot-thumbnail-scrollwrap").addClass("open");
                $(".pp__screenshots-files-menu-scrollwrap").addClass("shadow-hidden");
            });
            //Скрываем только при уводе с блоков ".pp__screenshots-files-menu-scrollwrap, .pp__screenshot-thumbnail-scrollwrap" на другой
            $(".pp__screenshots-files-menu-scrollwrap, .pp__screenshot-thumbnail-scrollwrap").on({
                "mouseenter": function() {
                    if(windowThumbnail__timeoutId !== null) {
                        clearTimeout(windowThumbnail__timeoutId);
                    }
                },
                "mouseleave": function() {
                    windowThumbnail__timeoutId = setTimeout(function() {
                        windowThumbnail__timeoutId = null;
                        $(".pp__screenshot-thumbnail-scrollwrap").removeClass("open");
                        $(".pp__screenshots-files-menu-scrollwrap").removeClass("shadow-hidden");
                    }, 10);
                }
            });
        })();

        //Отбражаем главную панель
        pageManagerVisualizator.$container.one("session.apply", function() {//session.apply - при загрузке не всегда есть выбранная страница и фрейм негрузиться но меню надо отобразиить...
            $(".shab__main-menu-container").show(0);

            crossModulesFunctions["refreshCenteredFloatMenu"]();
            $(window).on("resize", crossModulesFunctions["refreshCenteredFloatMenu"]);
        });

        //Первое применение сессии
        crossModulesFunctions["session.applyAllParamsLocalSession"](false);

        /****************************************************/
        /*Для тестов*/
        /****************************************************/
        $(document).ready(function(){
            $("body").on('click', function(e) {
                if(e.altKey && e.ctrlKey && e.shiftKey) {//(e.which == 65 || e.which == 83 || e.which == 68)
                    //socket.emit('modifyStileNotification');
                }
            });
        });

        /****************************************************/
        /*Вспомогательная хрень*/
        /****************************************************/
        $(document).ready(function(){
            //Подсказки
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
            $('.selectpicker').selectpicker();
            $('.bootstrap-toggle').bootstrapToggle();
            //==========
        });
    }
});
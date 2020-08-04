(function() {
    // 显示隐藏功能模块
    function init($ele, callback) { //初始化模块对象
        if ($ele.is(":hidden")) {
            $ele.data("status", "hide");
            if (typeof callback === "function") callback();
        } else {
            $ele.data("status", "show");
        }
    }

    function show($ele, callback) {
        var status = $ele.data("status");
        if (status === "show" || status === "shown") return;
        $ele.data("status", "show").trigger("show");
        callback();
    }

    function hide($ele, callback) {
        var status = $ele.data("status");
        if (status === "hide" || status === "hiden") return;
        $ele.data("status", "hide").trigger("hide");
        callback();
    }
    var silentDisplay = { //普通显示隐藏
        init: init,
        show: function($ele) {
            show($ele, function() {
                $ele.show();
                $ele.data("status", "shown").trigger("shown");
            });
        },
        hide: function($ele) {
            hide($ele, function() {
                $ele.hide();
                $ele.data("status", "hiden").trigger("hiden");
            });
        }
    };
    var cssDisplay = { //基于css3的fade,slide显示隐藏		
        _init: function($ele,className) {
            $ele.addClass("transition");
            init($ele, function() {
                $ele.addClass(className);
            });
        },
        _show: function($ele,className) {
            show($ele, function() {
                $ele.show();
                $ele.off("transitionend").one("transitionend", function() { //使用one避免对此点击多次绑定事件
                    $ele.data("status", "shown").trigger("shown");
                });
                setTimeout(function() {
                    $ele.removeClass(className);
                }, 50);
            })
        },
        _hide: function($ele, className) {
            hide($ele, function() {
                $ele.off("transitionend").one("transitionend", function() { //使用one避免对此点击多次绑定事件
                    $ele.hide();
                    $ele.data("status", "hiden").trigger("hiden");
                });
                $ele.addClass(className);
            });
        },
        fade: { //基于元素transition
            init: function($ele) {
                cssDisplay._init($ele, "fadeOut")
            },
            show: function($ele) {
                cssDisplay._show($ele, "fadeOut")
            },
            hide: function($ele) {
                cssDisplay._hide($ele, "fadeOut")
            }
        },
        slideUpdown: {
            init: function($ele) {
                $ele.height($ele.height());
                cssDisplay._init($ele, "slideDown");
            },
            show: function($ele) {
                cssDisplay._show($ele, "slideDown")
            },
            hide: function($ele) {
                cssDisplay._hide($ele, "slideDown")
            }
        },
        slideLeftright: {
            init: function($ele) {
                $ele.width($ele.width());
                cssDisplay._init($ele, "slideRight");
            },
            show: function($ele) {
                cssDisplay._show($ele, "slideRight")
            },
            hide: function($ele) {
                cssDisplay._hide($ele, "slideRight")
            }
        },
        fadeSlideUpdown: {
            init: function($ele) {
                $ele.height($ele.height());
                cssDisplay._init($ele, "fadeOut slideDown");
            },
            show: function($ele) {
                cssDisplay._show($ele, "fadeOut slideDown")
            },
            hide: function($ele) {
                cssDisplay._hide($ele, "fadeOut slideDown")
            }
        },
        fadeSlideLeftright: {
            init: function($ele) { 
                $ele.width($ele.width());
                cssDisplay._init($ele, "fadeOut slideRight");
            },
            show: function($ele) {
                cssDisplay._show($ele, "fadeOut slideRight")
            },
            hide: function($ele) {
                cssDisplay._hide($ele, "fadeOut slideRight")
            }
        }
    };
    var jsDisplay = { //基于jQuery的fade,slide显示隐藏
        _init: function($ele, callback) {
            $ele.removeClass("transition"); //动画收到transition影响
            init($ele, callback);
        },
        _show: function($ele, mode) {
            show($ele, function() {
                $ele.stop()[mode]();
                setTimeout(function() {
                    $ele.data("status", "shown").trigger("shown");
                }, 50)

            })
        },
        _hide: function($ele, mode) {
            hide($ele, function() {
                $ele.stop()[mode]();
                setTimeout(function() {
                    $ele.data("status", "hiden").trigger("hiden");
                }, 50)
            })
        },
        fade: {
            init: function($ele) {
                jsDisplay._init($ele);
            },
            show: function($ele) {
                jsDisplay._show($ele, "fadeIn");
            },
            hide: function($ele) {
                jsDisplay._hide($ele, "fadeOut");
            }
        },
        slideUpdown: {
            init: function($ele) {
                jsDisplay._init($ele);
            },
            show: function($ele) {
                jsDisplay._show($ele, "slideDown");
            },
            hide: function($ele) {
                jsDisplay._hide($ele, "slideUp");
            }
        },
        slideLeftright: {
            init: function($ele) {
                jsDisplay._customerInit($ele, {
                    'width': 0,
                    'padding-left': 0,
                    'padding-right': 0
                })
            },
            show: function($ele) {
                jsDisplay._customerShow($ele);
            },
            hide: function($ele) {
                jsDisplay._customerHide($ele, {
                    'width': 0,
                    'padding-left': 0,
                    'padding-right': 0
                })
            }
        },
        fadeSlideUpdown: {
            init: function($ele) {
                jsDisplay._customerInit($ele, {
                    'height': 0,
                    'padding-top': 0,
                    'padding-bottom': 0,
                    'opacity': 0
                })
            },
            show: function($ele) {
                jsDisplay._customerShow($ele);
            },
            hide: function($ele) {
                jsDisplay._customerHide($ele, {
                    'height': 0,
                    'padding-top': 0,
                    'padding-bottom': 0,
                    'opacity': 0
                })
            }
        },
        fadeSlideLeftright: {
            init: function($ele) {
                jsDisplay._customerInit($ele, {
                    'width': 0,
                    'padding-left': 0,
                    'padding-right': 0,
                    'opacity': 0
                })
            },
            show: function($ele) {
                jsDisplay._customerShow($ele);
            },
            hide: function($ele) {
                jsDisplay._customerHide($ele, {
                    'width': 0,
                    'padding-left': 0,
                    'padding-right': 0,
                    'opacity': 0
                })
            }
        },
        _customerInit: function($ele, options) {
            var style = {};
            for (var k in options) {
                style[k] = $ele.css(k);
            };
            jsDisplay._init($ele, function() {
                $ele.css(options);
            });
            $ele.data("style", style);
        },
        _customerShow: function($ele) {
            show($ele, function() {
                $ele.show();
                $ele.stop().animate($ele.data("style"), function() {
                    $ele.data("status", "shown").trigger("shown");
                });
            });
        },
        _customerHide: function($ele, options) {
            hide($ele, function() {
                $ele.stop().animate(options, function() {
                    $ele.hide();
                    $ele.data("status", "hiden").trigger("hiden");
                });
            });
        }
    }
    var defaults = { //默认显示隐藏参数
        css: false,
        js: true,
        animation: "fade"
    };
    function showHide($ele,options) {
    	var mode = null;
        if (options.css && window.compatible.transition.isSupport) {
            mode = cssDisplay[options.animation] || cssDisplay[defaults.animation];
        } else if(options.js) {
            mode = jsDisplay[options.animation] || jsDisplay[defaults.animation]
        } else {
            mode = silentDisplay;
        }
        mode.init($ele);
        return {
            show: mode.show,
            hide: mode.hide
        }
    }
    // 全局接口
    // window.module = window.module || {};
    // window.module.showHide = showHide;
    
    // jQuery插件接口
    $.fn.extend({
    	showHide : function(option){
    		return this.each(function(){
	    		var $this = $(this);
	    		var mode =  $this.data("showHide");
	    		if(typeof option === "object" || !mode){
	    		//传入参数为对象或未绑定过模块功能
	    			var options = $.extend({},defaults, typeof option === "object" && option);       
			        $this.data("showHide",mode = showHide($this,options));
	    		}
	    		if(typeof mode[option] === "function"){
	    			mode[option]($this);
	    		}
    		})
    	}
    })
})()
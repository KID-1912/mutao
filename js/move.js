(function($){
	var transition = window.compatible.transition;//兼容不同浏览器transitionend事件前缀
	var init = function($ele){//公共初始化部分
		this.$ele = $ele;
		this.curX = this.$ele.css("left");
		this.curY = this.$ele.css("top");
	}
	var to = function(x,y,callback){
		x = typeof x === "number" ? x : this.curX;
		y = typeof y === "number" ? y : this.curY;
		if(x === this.curX && y === this.curY) return;//过滤重复
		this.$ele.trigger("move");
		if(typeof callback === "function") callback();
		this.curX = x;
		this.curY = y;
	}
	var Slide = function($ele,options){//无效果运动
		init.call(this,$ele)
		this.$ele.removeClass("transition");//防止过渡类导致的附加效果
	};
	Slide.prototype = {
		constructor :　Slide,
		to : function(x,y){
			var self = this;
			to.call(this,x,y,function(){
				self.$ele.css({
					left : x,
					top : y
				});
				self.$ele.trigger("moved");
			})
		},
		x : function(x){//不同的方法，同一功能函数
			this.to(x);
		},
		y : function(y){//不同的方法，同一功能函数
			this.to(null,y);
		}
	};

	var Css3 = function($ele){
		init.call(this,$ele);
		this.$ele.addClass("transition");//Css3运动效果核心
		this.$ele.css({//避免元素未手动设置left,top值
			left : this.curX,
			top : this.curY
		})
	};
	Css3.prototype = {
		constructor :　Css3,
		to : function(x,y){
			var self = this;
			to.call(this,x,y,function(){
				self.$ele.off(transition.transitionEnd).one(transition.transitionEnd,function(){
					self.$ele.trigger("moved");
				})
				self.$ele.css({
					left : x,
					top : y
				})
			});
		},
		x : function(x){
			this.to(x);
		},
		y : function(y){
			this.to(null,y);
		}
	};

	var Js = function($ele){
		init.call(this,$ele)
		this.$ele.removeClass("transition");//避免受到css过渡速度变化影响
	};
	Js.prototype = {
		constructor :　Js,
		to : function(x,y){
			var self = this;
			to.call(this,x,y,function(){
				self.$ele.stop().animate({
					left : x,
					top : y
				},function(){
					self.$ele.trigger("moved");
				});
			})
		},
		x : function(x){
			this.to(x);
		},
		y : function(y){
			this.to(null,y);
		}
	};

	var move = function($ele,options){
		var mode = null;
		if(options.css){
			mode = new Css3($ele);
		}else if(options.js){
			mode = new Js($ele);
		}else{
			mode = new Slide($ele);
		}
		return {//此处不返回整个模块对象，仅返回外部使用的功能方法组合的对外对象
			to : $.proxy(mode,"to"),
			x : $.proxy(mode,"x"),
			y : $.proxy(mode,"y")
		}
	}

	var defaults = {
		css : false,
		js : true,
		slide : true,
	}
	// 对外接口
	$.fn.extend({
		move : function(option,x,y){
    		return this.each(function(){
	    		var $this = $(this);
	    		var mode =  $this.data("move");
	    		if(typeof option === "object" || !mode){
	    			var options = $.extend({},defaults,typeof option === "object" && option);       
			        $this.data("move",mode = move($this,options));
	    		};
	    		if(typeof mode[option] === "function"){
	    			mode[option](x,y);
	    		};
    		})
		}
	})
})(jQuery)
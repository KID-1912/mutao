// 2.轮播切换：整体位移

$.fn.extend({
	slider : function(options){
		return this.each(function(i,v){
			var $ele = $(v);
			var slider = new Slider($ele,options);		
		})
	}
});

function Slider($ele,options){
	this.$ele = $ele;
	this.options = $.extend({},Slider.Default,typeof options === "object" && options);
	this.$control = this.$ele.find(".slider-control");
	this.$container = this.$ele.find(".slider-container");
	this.$sliderItems = this.$ele.find(".slider-item");
	this.$indicators = this.$ele.find(".slider-indicator");
	this.sliderItemWidth = this.$sliderItems.eq(0).width();
	this.maxIndex = this.$sliderItems.length - 1;
	this.activeIndex = this._getCorrectIndex(this.options.activeIndex - 1);
	this._init();
};
Slider.Default = {
	css:true,
	animation:"fade",
	activeIndex:1,
	interval:1000
}
Slider.prototype = {
	constructor:Slider,
	auto : function(){
		var _this = this;
		_this.timer = setInterval(function(){
			_this.switchTo(_this._getCorrectIndex(_this.activeIndex + 1),-1);
		}, _this.options.interval);
	},
	_getCorrectIndex : function(targetIndex){
		if(isNaN(targetIndex) || targetIndex > this.maxIndex) return 0;
		if(this.options.animation == "slide") return targetIndex ;
		if(targetIndex < 0) return this.$sliderItems.length  - 1;
		return targetIndex;
	},
	_indicatorActive : function(targetIndex){
		var activeIndex = this.activeIndex;
		if(this.options.animation == "slide") {//检测是否为start或end,是则改变目标样式
			targetIndex = targetIndex === -1  ? this.maxIndex - 1 : (targetIndex === this.maxIndex ? 0 : targetIndex);
		};
		$(this.$indicators[activeIndex]).removeClass("slider-indicator-active");
		$(this.$indicators[targetIndex]).addClass("slider-indicator-active");
	},
	fadeTo : function(targetIndex){//切换功能函数
		var activeIndex = this.activeIndex;
		if(targetIndex === activeIndex) return;
		$(this.$sliderItems[targetIndex]).showHide("show");
		$(this.$sliderItems[activeIndex]).showHide("hide");
		this._indicatorActive(targetIndex);
		this.activeIndex = targetIndex;
	},
	slideTo : function(targetIndex,direction){
		var _this = this;
		var activeIndex = this.activeIndex;
		this.$container.addClass(_this.transitionClass).move("x",-1 * (targetIndex + 1) * this.sliderItemWidth);
		setTimeout(function(){
			if(_this.activeIndex === _this.maxIndex){//检测是否为start或end,是则直切目标位置
				_this.$container.removeClass(_this.transitionClass).css("left",-1 * _this.sliderItemWidth);
				_this.activeIndex = 0;
			};
			if(_this.activeIndex === -1){
				_this.$container.removeClass(_this.transitionClass).css("left",-1 * _this.maxIndex * _this.sliderItemWidth);
				_this.activeIndex = _this.maxIndex - 1;
			};
		},400);
		this._indicatorActive(targetIndex);
		this.activeIndex = targetIndex;
	},
	_init : function(){
		var _this = this;
		var options = this.options;
		// 匹配动画功能与样式
		if(options.animation === "slide"){//初始化各自轮播项状态
			this.$ele.addClass("slider-slide2");
			this.$sliderItems.eq(0).clone().appendTo(this.$container);
			this.$sliderItems.last().clone().prependTo(this.$container); 
			this.maxIndex += 1;
			this.$container.css({
				width:(this.maxIndex+2)*this.sliderItemWidth,
				left :-1 * (this.activeIndex + 1) * this.sliderItemWidth
			});
			this.$container.move(options);
			this.transitionClass = this.$container.hasClass("transition") ? "transition" : "";
			this.$container.on("move moved",function(e){//订阅按需加载
				if(e.type === "move"){
					$(this).trigger()
				}else{
				}
			});
			this.switchTo = this.slideTo;
		}else{
			this.$ele.addClass("slider-fade");
			this.$sliderItems.showHide(options);
			$(this.$sliderItems).eq(this._getCorrectIndex(this.activeIndex)).showHide("show");
			this.$sliderItems.on("show shown hide hiden",function(e){//订阅各自slider事件并处理
				_this.$ele.trigger("slider-"+e.type,[$sliderItems.index(this),$(this)]);
			});
			this.switchTo = this.fadeTo;
			this.$ele.trigger("slider-show",[this.activeIndex,$(this.$sliderItems.eq(this.activeIndex))]);
		};
		this._indicatorActive(this._getCorrectIndex(this.activeIndex));
		
		this.$ele
			.hover(function(){// control元素显示与隐藏
				_this.$control.showHide("show");
			},function(){
				_this.$control.showHide("hide");
			})
			//事件代理control切换
			.on("click",".slider-control-left",function(e){
				_this.switchTo(_this._getCorrectIndex(_this.activeIndex-1),1);
			})
			.on("click",".slider-control-right",function(e){
				_this.switchTo(_this._getCorrectIndex(_this.activeIndex+1),-1);
			})
			// 事件代理indicator切换
			.on("click",".slider-indicator",function(e){
				_this.switchTo(_this._getCorrectIndex(_this.$indicators.index(this)));
			});
		//定时器初始化
		if(options.interval && !isNaN(options.interval)){//只有当定时参数有效才进行相关操作！
			this.auto();
			//触摸状态(预交互状态)停止,
			this.$ele.hover(function(){clearInterval(_this.timer)},function(){_this.auto();});
		}
	}
};
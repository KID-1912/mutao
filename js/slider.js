// 1.轮播的切换
// 2.切换的触发
// 3.切换的暂停
(function($){
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
			if(targetIndex < 0) return this.$sliderItems.length  - 1;
			return targetIndex;
		},
		_indicatorActive : function(targetIndex){
			var activeIndex = this.activeIndex;
			$(this.$indicators[targetIndex]).addClass("slider-indicator-active");
			$(this.$indicators[activeIndex]).removeClass("slider-indicator-active");
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
			var self = this;
			var activeIndex = this.activeIndex;
			if(targetIndex === activeIndex) return;
			// 动画方向
			if(!direction){
				if(targetIndex > activeIndex) {
					direction = -1;
				}else{
					direction = 1;
				}
			}
			// 初始位置
			this.$sliderItems.eq(targetIndex).removeClass(this.transitionClass).css({left: -1 * direction * this.sliderItemWidth});
			setTimeout(function(){//transition会给初始位置造成延迟。需处理后执行
				// 指定移入，当前移出
				self.$sliderItems.eq(activeIndex).move("x",direction * self.sliderItemWidth);
				self.$sliderItems.eq(targetIndex).addClass(self.transitionClass).move("x",0);
			},20);
			this._indicatorActive(targetIndex);
			this.activeIndex = targetIndex;
		},
		_init : function(){
			var _this = this;
			var options = this.options;
			// 匹配动画功能与样式
			if(options.animation === "slide"){//初始化各自轮播项状态
				this.$ele.addClass("slider-slide");
				this.$sliderItems.eq(this._getCorrectIndex(this.activeIndex)).css("left",0);
				this.$sliderItems.move(options);
				this.transitionClass = this.$sliderItems.eq(0).hasClass("transition") ? "transition" : "";
				this.$sliderItems.on("move moved",function(e){//订阅按需加载
					var index = _this.$sliderItems.index(this);
					if(e.type === "move"){				
						if(index === _this.activeIndex){
							_this.$ele.trigger("slider-show",[index,$(this)]);
						}else{
							_this.$ele.trigger("slider-hide",[index,$(this)]);
						}
					}else{//由于move动画存在延迟，此时activeIndex为已完成后目标索引
						if(index === _this.activeIndex){
							_this.$ele.trigger("slider-shown",[index,$(this)]);
						}else{
							_this.$ele.trigger("slider-hiden",[index,$(this)]);
						}
					}
				});
				this.switchTo = this.slideTo;
			}else{
				this.$ele.addClass("slider-fade");
				this.$sliderItems.showHide(options);
				$(this.$sliderItems).eq(this._getCorrectIndex(this.activeIndex)).showHide("show");
				this.$ele.on("show shown hide hiden",".slider-item",function(e){//订阅按需加载
					_this.$ele.trigger("slider-"+e.type,[_this.$sliderItems.index(this),$(this)]);
				});
				this.switchTo = this.fadeTo;
			};
			$(this.$indicators).eq(this._getCorrectIndex(this.activeIndex)).addClass("slider-indicator-active");
			this.$ele.trigger("slider-show",[this.activeIndex,$(this.$sliderItems.eq(this.activeIndex))]);
			// 显示control元素
			this.$ele
				.hover(function(){
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
})(jQuery)

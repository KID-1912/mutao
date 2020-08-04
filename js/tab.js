;(function($){
	function Tab($ele,options){
		this.$ele = $ele;
		this.options = options;
		this.$items = this.$ele.find(".tab-item");
		this.$panels = this.$ele.find(".tab-panel");
		this.maxIndex = this.$panels.length - 1;
		this.activeIndex = this._getCorrectIndex(this.options.activeIndex - 1);
		this._init();
	};
	Tab.Defaults = {
		css:true,
		animation:"fade",
		event:"mouseenter",
		activeIndex : 1,
		delay:0,
		interval : 0
	}
	Tab.prototype = {
		_getCorrectIndex : function(index){
			if(isNaN(index) || index >  this.maxIndex) return 0;
			return index;
		},
		toggle : function(index){
			var activeIndex = this.activeIndex;
			if(index === activeIndex) return;
			this.$items.eq(activeIndex).removeClass("tab-active");
			this.$items.eq(index).addClass("tab-active");
			this.$panels.eq(activeIndex).showHide("hide");
			this.$panels.eq(index).showHide("show");
			this.activeIndex = index;
		},
		auto : function(){
			var self = this;
			this.timer = setInterval(function(){
				self.toggle(self._getCorrectIndex(self.activeIndex + 1));
			}, this.options.interval);
		},
		_init : function(){
			var self = this;
			this.$panels.showHide(this.options);
			this.$items.eq(this.activeIndex).addClass("tab-active");
			this.$panels.eq(this.activeIndex).showHide("show");
			this.$ele.trigger("tab-show",[this.activeIndex,$(this.$panels[this.activeIndex])]);
			


			// 绑定代理事件	Defaluts默认参只能排除漏传参情况，需要对值
			var event = this.options.event === "click" ? "click" : "mouseenter";
			this.$ele.on(event,".tab-item",function(){
				// 精准交互-延迟切换
				var curEle = this;
				if(self.options.delay && !isNaN(self.options.delay)) {//是否开启延迟
					clearTimeout(self.delayTimer);
					self.delayTimer = setTimeout(function(){
						self.toggle(self._getCorrectIndex(self.$items.index(curEle)));
					},self.options.delay);
				}else{
					self.toggle(self._getCorrectIndex(self.$items.index(this)));
				}
			});

			// 按需加载订阅
			this.$ele.on("show shown hide hiden",".tab-panel",function(e){
				self.$ele.trigger("tab-"+e.type,[self.$panels.index(this),$(this)]);
			});

			// 可选：自动切换tab-panel
			if( this.options.interval && !isNaN(this.options.interval)){
				this.$panels.hover(function(){
					clearInterval(self.timer);
				},$.proxy(self,"auto"));
				this.auto();
			};
		}
	};
	$.fn.extend({
		tab : function(options){
			return this.each(function(){
				var $this = $(this);
				var tab = new Tab($this,$.extend({},Tab.Defaults,typeof options === "object") && options);
			});
		}
	})
})(jQuery);
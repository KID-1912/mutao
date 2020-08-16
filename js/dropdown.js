// 构造函数重写dropdown的js组件
function Dropdown($ele,options){//js组件参数：dom元素,{css:boolean,js:boolean,animation:"动画名",event:"事件名",delay:"延迟触发"}
	this.$ele = $ele;
	this.options = $.extend({},Dropdown.defaults,typeof options === "object" && options);//空参数或参数为API控制参
	this.layer = $ele.find(".dropdown-layer");
	this.init();
}
Dropdown.defaults = {css:true,animation:"fade",delay:150};//默认参
Dropdown.prototype = {
	constructor:Dropdown,
	show:function(){
		if(this.options.delay){
			var _this = this;
			 this.timer = setTimeout(function(){
				_this.layer.showHide("show");
			},this.options.delay);
			return;
		}
		this.layer.showHide("show" );
	},
	hide:function(){
		if(this.timer) clearTimeout(this.timer);
		this.layer.showHide("hide");
	},
	init:function(){//初始化
		this.layer.showHide(this.options);
		var _this = this; 
		// 转发消息
		this.layer.on("show",function(e){//绑定模块的四个事件
			_this.$ele.trigger("lazyLoad");//绑定模块事件触发时对应触发的元素事件
			e.stopPropagation();
		})
		if(this.options.event === "click"){//传入触发事件参数为click
			this.$ele.on("click",function(e){
				$.proxy(_this,"show")();
				e.stopPropagation();
			});
			$(document).on("click",function(){
				$.proxy(_this,"hide")();
			})
		}else{//默认hover触发
			this.$ele.hover($.proxy(this,"show"),$.proxy(this,"hide"));
		}
	}
} 

$.fn.extend({
	dropdown:function(options){
		return this.each(function(){
			var $this = $(this),
				dropdownObj =  $this.data("dropdown");
			if(typeof options === "object" || !dropdownObj){
				var dropdown = new Dropdown($this,options);
				$this.data("dropdown",dropdownObj = dropdown);
			}
			if(dropdownObj[options]){
				dropdownObj[options]()
			}
		})
	}
});
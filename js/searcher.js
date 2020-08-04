// 面向对象构造函数js组件
$.fn.extend({
	search : function(options,value){//value用于一些需要参数的公开方法传入
		return this.each(function(){
			var $this = $(this);
			var searchObj = $this.data("search");
			if(typeof options === "object" || !searchObj){
				var searcher = new Search ($this,options);
				$this.data("search",searchObj = searcher);
			}
			if(searchObj[options]) searchObj[options](value);
		});
	}
})

function Search($ele,options) {
	this.$ele = $ele;
	this.options = $.extend({},Search.Default,typeof options === "object" && options);
	this.$form = $ele.find(".search-form");
	this.$input = this.$form.find(".search-inputbox");
	this.$layer = $ele.find(".search-layer");
	this.loaded = false;
	this.init();
};
Search.Default = {
    css: true,
    animation: "fade",
    autocomplete : true,
    url: "https://suggest.taobao.com/sug?code=utf-8&q=",
    delay: 300
};
Search.prototype = {
    constructor: Search,
    showLayer: function() {
    	if(!this.loaded) return this;
    	this.$layer.showHide("show");
    	return this;
    },
    hideLayer: function() {
    	if(!this.loaded) return this;
    	this.$layer.showHide("hide");
    	return  this;
    },
    autocomplete: function() {
    	var _this = this,
    		timer = null;
    	this.$input.on({
	        input: function(){
	        	clearTimeout(timer);
	        	timer = setTimeout(function(){//200毫秒间隔执行
	        		_this.getData();
	        	},_this.options.delay);
	        },
	        focus: function() {
	             _this.showLayer();
	        },
	        blur: function() {
	             _this.hideLayer();
	        }
	    });
	    this.$layer.on("click",".search-layer-item",function(){
		    _this.$input.val($(this).text());
		    _this.$form.submit();
	    })
    },
    getData : function(){
    	var _this = this;
		var qString = $.trim(this.$input.val());
		if(qString === "") {
			this.$ele.trigger("noData",[this]);
		    return false;
		};
		if(this.jqXHR) this.jqXHR.abort();
		var data = dataCache.data[qString]
		if(data){
			_this.$ele.trigger("dataGet",[data]);
	    	if(_this.$layer.is(":hidden")) _this.showLayer();
			return;
		}
		this.jqXHR = $.ajax({
		    url: this.options.url + encodeURIComponent(qString),
		    dataType: "jsonp",
		    timeout: 1000
		}).done(function(data){
			dataCache.addData(qString,data);//数据缓存
			console.log(data);
	    	_this.$ele.trigger("dataGet",[data]);
	    	if(_this.$layer.is(":hidden")) _this.showLayer();
		}).fail(function(data){
			_this.$ele.trigger("noData",[data]);
		}).always(function(data){
			_this.jqXHR = null;
			_this.$ele.trigger("requestComplete",[data]);
		});
    },
    submit: function() {
    	var _this = this;
    	this.$form.on("submit",function(){
    		var qString = $.trim(_this.$input.val());
	        if (qString === "") {
	            return false;
	        }
    	})
    },
    appendLayer:function(html){
    	this.$layer.html(html);
    	this.loaded = Boolean(html);
    	return this;
    },
    init : function(){
    	this.$layer.showHide(this.options);//初始化显示隐藏
    	if(this.options.autocomplete) {//是否自动完成提示
    		this.autocomplete();
    	};
    	this.submit();//表单提交验证
    }
}

// 数据缓存
var dataCache = {
	count : 0,
	data : {},
	addData : function(key,value){
		this.data[key] = value;
		this.count ++;
	},
	deleteDataByKey : function(key){
		delete this.data[key];
		this.count --;
	},
	deleteDataByOrder : function(num){
		var count = 0;
		for (var key in this.data){
			if(count >= num) break;
			delete this.deleteDataByKey(key);
			this.count --;
			count ++;
		}
	}
}

// (function($) {
//     var $inputBox = $(".header .search-inputbox");
//     var $submitInput = $(".header .search-submitbox");
//     var $searchLayer = $(".header .search-layer");
//     var $searchForm = $(".header .search-form");

//     // 验证
//     $submitInput.on("click", function() {
//         var qString = $.trim(inputBox.val());
//         if (qString === "") {
//             return false;
//         }
//     });

//     // https://suggest.taobao.com/sug?code=utf-8&q=
//     $inputBox.on({
//         input: function() { //input输入事件,不兼容IE6-8
//             //事件:change需要失去焦点触发,
//             //keyup仅监听键盘,无法捕获页面粘贴;
//             //而且上下左右等其他键都会触发，需兼容处理
//             completeInput(this);
//         },
//         focus: function() {
//             if (!$.trim($searchLayer.html())) return; //无内容不显示
//             $searchLayer.showHide("show");
//         },
//         blur: function() {
//             $searchLayer.showHide("hide");
//         }
//     });

//     //自动完成提示功能
//     function completeInput(input) {
//         var $input = $(input);
//         var qString = $.trim($input.val());
//         if (qString === "") { //删除全部文本，清空并不显示
//             $searchLayer.showHide("hide").html("");
//             return false;
//         };
//         var url = "https://suggest.taobao.com/sug?code=utf-8&q=" + encodeURIComponent(qString);
//         // 发送请求
//         $.ajax({
//             url: url,
//             dataType: "jsonp",
//             timeout: 2000, //响应时间限制参数
//             success: function(data) {
//                 // 数据绑定与渲染
//                 var html = "",
//                     data = data.result;
//                 if (data.length === 0) { //无有效数据，清空并不显示
//                     $searchLayer.showHide("hide").html("");
//                     return
//                 };
//                 $.each(data, function(i, v, arr) {
//                     html += '<li class="search-layer-item text-ellipsis">' +
//                         v[0] + '</li>'
//                 });
//                 $searchLayer.html(html);
//                 if ($searchLayer.is(":hidden")) { //切换为显示状态
//                     $searchLayer.showHide("show");
//                 }
//             },
//             error: function(error) {
//                 $searchLayer.showHide("hide").html("");
//             }
//         });
//     }

//     //自动完成提交功能
//     $searchLayer.on("click", ".search-layer-item", function() {
//         $inputBox.val($(this).text());
//         $searchForm.submit();
//     })
// })(jQuery)
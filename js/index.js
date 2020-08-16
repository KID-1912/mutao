
$(function(){
// 工具对象环境

// 智能按需加载函数
	var lazyLoad = {};
	lazyLoad.loadUntil = function(options){
		var items = {},
			loadedItemNum = 0,
			totalItemNum = options.totalItemNum,
			$container = options.$container,
			id = options.id;
		$container.on(id +　"-show",$container.load = function(e,index,elem) {
			if (items[index] !== "loaded"){
				$container.trigger(id + "-loadItem",[index,elem,function(){
					items[index] = "loaded";
				    loadedItemNum++;
					if(loadedItemNum === totalItemNum){
						$container.trigger(id + "-loaded");
					};
				}]);
			}
		});
		$container.on(id + "-loaded",function(e,index,$ele){
			$container.off(id + '-show', $container.load);
		});
	};

//图片请求加载函数
	lazyLoad.loadImgs = function(imgs,success,fail){
		imgs.each(function(_,ele){
			var $img = $(ele);
			lazyLoad.loadImg($img.attr("load-src"),function(url){
				$img.attr("src",url);
			},function(){
				fail($img);
			});
		});
		success();
	};
	lazyLoad.loadImg = function(url,callback,errorCallback){
		//以下写法存在重复创建img导致gif重复问题
		// var img = new Image();
		// img.onload = function(){
		// 	if(typeof callback === "function") callback(url);
		// 	img = null;
		// };
		// img.onerror = function(){
		// 	if(typeof errorCallback === "function") errorCallback();
		// 	img = null;		
		// };
		// img.setAttribute("src",url);
		
		// 原理发现与自己的优化处理代码
		window.img = window.img || $(new Image());
		img.on({//jQuery不断追加‘window.img’的事件处理
			load : function(){
				$(this).off("load");
				if(typeof callback === "function") callback(url);
			}
			//此写法缺点：除非最后一个元素加载失败，否则不会执行任何懒加载img的error事件
			// 解决：不做图片加载失败处理，仅让图片容器的宽高布局/背景图(色)依旧存在避免影响页面布局
		});
		img.attr("src",url);
		//src请求异步执行，但此处还未成功加载window.img以及load事件触发之前
		//就被同步执行的后续js不断重写src，直到最后一个src请求成功并执行之前累加的load事件
	}


// dropdown组件使用实例
	var dropdown = {};
	dropdown.$menu = $(".dropdown.menu");
	dropdown.$menu
	.on("lazyLoad",function(){
		dropdown.loadData.call($(this),"menuData","./json/dropdown.json",dropdown.$menu.renderMenu);
	})
	.dropdown();
	dropdown.$focusCategory = $("#focus-category");
	dropdown.$focusCategory.find(".dropdown")
	.on("lazyLoad",function(){
		dropdown.loadData.call($(this),"categoryData","./json/focus-category.json",dropdown.$focusCategory.renderCategory);
	})
	.dropdown({css:true,animation:"fadeSlideLeftright"});

	dropdown.$menu.renderMenu = function($ele,data){//.menu下拉菜单数据渲染
		var $this = $($ele);
		var dataObj = data[0];
		var curLayer = $this.children(".dropdown-layer");
		var dataKey = curLayer.data("load");
		var html = "";
		$.each(dataObj[dataKey],function(i,v){
			html += '<a class="link" href="'+ v.url +'">'+v.name+'</a>';
		});
		curLayer.html(html);
	}
	dropdown.$focusCategory.renderCategory = function($ele,data){//.menu下拉菜单数据渲染
		var $this = $($ele);
		var curLayer = $this.children(".dropdown-layer");
		var dataKey = curLayer.data("load");
		var dataArr = data[dataKey];
		var html = "";
		$.each(dataArr,function(i,v){
			html += '<dl class="category-details clearfix"><dt class="fl"> <a href="#">'
				 +v.title+'</a></dt><dd class="fl">';
				 $.each(v.items,function(i,v){
				 	html += '<a href="#" class="link">'
				 		 + v +'</a>';
				 });
			html += '</dd></dl>'
		});
		curLayer.html(html);
	};
	dropdown.loadData = function(dataName,url,callback){//加载下拉数据公共函数
		var self = this;
		var curLayer = this.children(".dropdown-layer");
		if(!curLayer.data("load")) return;
		var loadData = curLayer.data("loadData");
		// 触摸请求dropdown数据并绑定一次，之后触摸直接渲染
		if(!Dropdown[dataName]){
			$.ajaxSettings.async = false;//同步执行
			$.getJSON(url,function(data){
			Dropdown[dataName] = Dropdown[dataName] || {};
			Dropdown[dataName] = data;
			}).done(function(){
				callback(self,Dropdown[dataName]);
				curLayer.data("load",null);
			});
			$.ajaxSettings.async = true;
		}else{
			callback(this,Dropdown[dataName]);
			curLayer.data("load",null);
		}
	}

//search组件使用实例
	var search = {};
	search.$headSearch = $(".header .search");
	//组件特性：分离组件的请求处理部分
	search.$headSearch.on({// 发布-订阅执行'自动完成'的请求处理
		dataGet : function(e,data){
		    var html = "",
		    	$this = $(this),
		        data = data.result;
		    if (data.length === 0) {
			    $this.search("hideLayer").search("appendLayer","");
			    return
			};
		    $.each(data, function(i, v, arr) {
		        html += '<li class="search-layer-item text-ellipsis">' +
		            v[0] + '</li>'
		    });
		    $this.search("appendLayer",html);;
		},
		noData : function(e){
			$(this).search("hideLayer").search("appendLayer","");;
		},
		requestComplete : function(e,data){
		}
	})
	search.$headSearch.search();

// 轮播slider组件与按需加载
	var slider = {};
	slider.$focusSlider = $("#focus-slider");
	slider.$todaysSlider = $("#todays-slider");

	// slider们按需加载合并处理函数
	slider.sliderLoadUntial = function($sliderElem){
		// 绑定slider加载的处理事件
		$sliderElem.on("slider-loadItem",function(e,index,$ele,success){
			lazyLoad.loadImgs($ele.find("img"),success,function($img){
				$img.attr("src","../uploads/focus-slider/placeholder.png");
			})
		});
		// 绑定智能按需加载的事件
		lazyLoad.loadUntil({
			$container : $sliderElem,
			totalItemNum : $sliderElem.find(".slider-item").length,
			id : "slider"
		});
	}
	// slider按需加载初始化
	slider.sliderLoadUntial(slider.$focusSlider);
	slider.sliderLoadUntial(slider.$todaysSlider);
	//实例化slider组件
	slider.$focusSlider.slider({
		css:true,
		js:false,
		animation:"fade",
		activeIndex:1,
		interval:5000,
	});
	slider.$todaysSlider.slider({
		css:true,
		js:false,
		animation:"slide",
		activeIndex:2,
		interval:35000,
	});

// tab按需加载与组件化
	var tab = {};//这里应该改成floors
	tab.$floors = $(".floor");
	tab.$floors.each(function(){
		var $this = $(this);
		$this.data("height",$this.height());
		$this.data("top",$this.offset().top);
	});

	// 绑定floor们的tab加载处理事件
	tab.$floors.each(function(){
		var $this = $(this);
	// 绑定按需加载处理事件
		$this.on("tab-loadItem",function(e,index,$ele,success){
			lazyLoad.loadImgs($ele.find("img"),success,function($img){
				$img.attr("src","./uploads/floor/placeholder.png");
			})
		})
	});

// 楼层按需加载
	var brower = {};
	brower.$win = $(window);
	brower.$doc = $(document);

	//：判断元素是否位于window可视区
	tab.$floors.isVisiable = function($ele){
		return $ele.data("top") < brower.$win.height() + brower.$win.scrollTop() 
			&& $ele.data("top") + $ele.data("height") > brower.$win.scrollTop()
	};
	// 构建.floor内部html的工具函数们
	tab.$floors.bulidFloor = function(index,data){
		var html = '';
		html += '<div class="w">';

		html += tab.$floors.bulidFloorHead(data);
		html += tab.$floors.bulidFloorBody(index,data.items);

		html += '</div>';
		return html
	};
	tab.$floors.bulidFloorHead = function(data){
		var html = "";
 		html += '<div class="floor-head clearfix">';
	    html +=     '<h2 class="floor-title fl"><span class="floor-title-num">'+data.num+'F</span><span class="floor-title-text">'+data.text+'</span></h2>'
	    html +=     '<ul class="tab-items-wrap fr">'
	    for(var i = 0,len = data.tabs.length;i < len;i++){
	    	html += '<li class="tab-item fl"><a href="javascript:;">'+data.tabs[i]+'</a></li>'
	    }
	    html +=  '</ul></div>';
		return html;
	};
	tab.$floors.bulidFloorBody = function(index,data){
		var html = "";
 		html += '<div class="floor-body tab-panels-wrap">';
 		for(var i = 0,len = data.length;i < len;i++){
 			html += '<ul class="tab-panel clearfix">';
 			for(var j = 0,len2 = data[i].length;j < len2;j++){
 				html += '<li class="floor-item fl">';
	            html +=        '<p class="floor-item-pic"><a href="###" target="_blank"><img src="./uploads/floor/loading.gif" load-src="./uploads/floor/'+(index+1)+'/'+(i+1)+'/'+(j+1)+'.png"/></a></p>';
	            html +=        '<p class="floor-item-name"><a href="###" target="_blank" class="link">'+data[i][j].name+'</a></p>';
	            html +=        '<p class="floor-item-price">'+data[i][j].price+'</p>';
	            html += '</li>';
 			}
 			html += '</ul>';
 		}
 		html += '</div>';
		return html;
	};
	//设置可见区域的.floor加载
	tab.$floors.timeToShow = function(){
		tab.$floors.each(function(index,ele){
			var $ele = $(this);
			if(tab.$floors.isVisiable($ele)){
				brower.$doc.trigger("floor-show",[index,$ele]);
			}
		});
	}
	
	//绑定加载事件的处理事件
	brower.$doc.on("floor-loadItem",function(e,index,$ele,success){
		$doc = brower.$doc;
		// 请求楼层数据
		if(!$doc.data("loadData")){
			$.ajaxSettings.async = false;//同步执行
			$.getJSON("./json/floor.json",function(data){
				$doc.data("loadData",data);
			});
			$.ajaxSettings.async = true;
		}
		// 绑定数据并渲染
		var curFloorData = $doc.data("loadData")[index];
		var html = tab.$floors.bulidFloor(index,curFloorData);
		$ele.html(html);
		// 楼层tab组件化前绑定智能加载事件
		lazyLoad.loadUntil({
			$container : $ele,
			id : "tab",
			totalItemNum : $ele.find(".tab-panel").length
		})
		// 对当前floor进行tab组件化，使其正确显示
		$ele.tab({
			css:false,
			js:false,
			animation:"fade",
			event:"mouseenter",
			activeIndex : 1,
			delay:250,
			interval:0
		});
		success();
	})
	// 附：追加绑定全部加载完成处理事件
	brower.$doc.on("floor-loaded",function(){
		brower.$win.off("scroll resize",brower.$win.timeShowEvent);
	})

	// 开启floor智能按需加载
	lazyLoad.loadUntil({
		$container : brower.$doc,
		totalItemNum : tab.$floors.length,
		id : "floor"
	})

	// 监听加载trigger时间
	brower.$win.on("scroll resize",brower.$win.timeShowEvent = function(){//监听滑动状态与窗口大小时可视区的.floor
		clearTimeout(tab.$floors.timer);
		tab.$floors.timer = setTimeout(tab.$floors.timeToShow,250);
	});
//elevator电梯
	//选择当前窗口楼层num，默认为-1即窗口无floor
	tab.$floors.elevator = $("#elevator");
	tab.$floors.elevator.items = tab.$floors.elevator.find(".elevator-item");
	tab.$floors.floorWitch = function(){
		var num = -1;
		$(this).each(function(index,ele){
			var $ele = $(ele);
			num = index;//最终项无法达到scroll+height/2,所以直接返回num
			if($ele.data("top") > brower.$win.scrollTop() + brower.$win.height()/2){
				num = index - 1;//因为第一个floor永远符合，所以-1去掉-1楼
				return false;
			}
		});
		return num;
	};
	// 电梯激活器：根据当前窗口的楼层激活电梯item
	tab.$floors.elevator.activer = function(){
		var num = tab.$floors.floorWitch();
		if(num === -1){
			tab.$floors.elevator.fadeOut();
		}else{
			tab.$floors.elevator.fadeIn();
			$(tab.$floors.elevator.items).removeClass("elevator-item-active").eq(num).addClass("elevator-item-active");
		}
	};
	// hove临时激活
	tab.$floors.elevator.items.hover(function(){
		// $(this).toggleClass("elevator-item-active");
	});
	// 点击滑动跳转指定楼层
	tab.$floors.elevator.on("click",".elevator-item",function(){
		var index = tab.$floors.elevator.items.index(this);
		$("html,body").animate({
			scrollTop : tab.$floors.eq(index).data("top")
		});
		$(tab.$floors.elevator.items).removeClass("elevator-item-active").eq(index).addClass("elevator-item-active");
	});
	// 检测楼层是否处于页面对应位置
	brower.$win.on("scroll resize",function(){//监听滑动状态与窗口大小时可视区的.floor
		clearTimeout(tab.$floors.elevator.timer);
		tab.$floors.elevator.timer = setTimeout(tab.$floors.elevator.activer,250);
	});



	// 侧边栏回顶部
	$("#backToTop").on("click",function(){
		$("html,body").animate({
			scrollTop : 0
		});
	});
});

# 组件
## 功能组件
#### 1.showHide.js
##### 组件描述
提供一个shoHide方法于Jquery元素，用于设置元素的显示隐藏动画及控制display状态；为tab，dropdown，slider，search...组件提供控制display功能；
##### js组件结构设计
显示隐藏分为三种不同兼容性、动画的实现方式，分别为无动画silentDisplay对象，css过渡动画cssDisplay对象，基于jQuery的animate动画的jsDisplay对象；  
后两者有动画的对象又分为fade，slideUpdown,slideLeftright,fadeSlideUpdown和fadeSlideLeftright四个二级动画属性对象；  
所以组件功能通过3个单例对象及其二级动画对象的show,hide功能方法实现;
##### 组件实现
外层对象init,show,hide方法  
- init    
共性：根据元素display值设置初始状态(show,hide)  
个性：css动画需为元素添加.transiton过渡类，js动画则需移除避免多余过渡事件  
- show / hide   
共性：检测元素状态为show/shown(hide/hiden)时不执行；执行前更新元素状态并触发元素show/hide(开始显示/隐藏)事件  
个性：css动画先操作对应css样式类，再执行绑定的transitionend事件；js的fade和slide动画直接借助jQuery的动画API，其他动画需要自定义animate实现

动画对象init,show,hide  
css传入css操作类，js传入为animate的css初始状态/目标状态的参数对象  
- 代码问题与优化  
1. 公共函数  
最外层对象的共性方法抽离为公共函数，动画对象的共性方法抽离为外层对象的方法，各个方法自内向外逐层调用  
2. 事件/动画重复  
css的transitionend事件和js的Jquery动画每次设定前清除上一事件/动画，并且通过one只绑定一次  
3. 元素宽高不固定  
css动画slideLeftright和slideUpdown初始化时检测一次元素宽高并设置值，避免元素宽高由内部撑开导致动画失效  
4. 发布-订阅模式
不使用回调函数方式设置show/shown,hide/hiden等状态触发的事件，使用外部发布事件$ele.on({"show/shown" : func,"shown/hiden" : func}),组件内订阅事件$ele.trigger("show/shown...")使其更易维护
##### 组件接口
功能初始化：调用$ele.showHide({css:true,js:false,animation:"fade"});    
组件判断参数对象css,js属性选择单例对象，animation属性选择二级动画对象，然后内部调用选择的二级动画对象init方法初始化$ele,最后返回一个具有该二级动画对象show,hide方法的临时对象并赋值给$ele.data("showHide")。

功能调用：$ele.showHide("show或hide");  
调用存储在$ele.data("showHide")的对象上的参数方法,并将调用元素作为参传入该方法

#### move.js
##### 组件描述
提供一个move方法于Jquery元素，用于对元素进行位置运动功能；
##### js组件结构设计
move分为三种不同兼容性、动画的实现方式，分别为无动画Slide对象，css过渡动画Css3对象，基于jQuery的animate动画的Js对象；每个运动对象包含to()指定位置移动，x()水平移动和y()垂直移动(x,y基于to)；
所以组件功能通过3个类各自to,x,y方法实现;创建一个新组件会根据传入构造函数的参数创建实例，此时进行初始化，返回实例的方法组成的临时对象。
##### 组件实现
构造函数对元素进行初始化，并订阅move,moved事件；
Slide.to(x,y)直接设置css的left,top值实现；
Css3.to(x,y)基于.transition设置css的left,top值实现;
Js.to(x,y)基于animateAPI过渡动画设置left,top值实现  

##### 组件接口
初始化$sliderItems.move(options);
位置运动$sliderItems.move("to","x","y");

##### 组件优化
## 页面组件
#### dropdown.js
##### 组件描述
提供一个dropdown方法于Jquery元素，用于为指定HTML结构(.dropdown>.dropdown-toggle+.dropdown-layer)添加显示隐藏切换效果；
##### js组件结构设计
dropdown构造函数方式返回传入参数后生成的的dropdown类实例
##### 组件实现
- 借助参数用于showHide功能组件初始化，设置元素显示隐藏效果；  
- 通过事件绑定实现切换显示隐藏的基本功能，将元素show/hide分离为独立功能；  
- 独立元素show，hide方法，以便外部通过返回的对象实例单独调用
##### 组件接口
初始化：$ele.dropdown({
        css:true,
        animation:"slideUpdown",
        event : "click"
        delay:"300",
    });
单独控制dropdown元素：$ele.dropdown("show/hide");
##### 组件优化与拓展
1. 自定义动画触发事件
2. 延迟动画 
为动画添加延迟动画执行时间，优化交互
3. 发布消息功能
初始化对象实例时，为其子元素layer绑定show事件，订阅元素的"lazyLoad"；组件外部通过发布该事件实现dropdown的按需加载功能；

#### searcher.js
##### 组件描述
提供一个search方法于Jquery元素，用于为指定HTML结构(.search>.search-form+.search-layer)添加搜索提示功能；
##### js组件结构设计
search构造函数方式返回传入参数后生成的的search类实例
##### 组件实现
- 主要功能：autocomplete
事件绑定：输入框输入状态根据输入字符请求提示数据，并绑定给layer元素实时反馈；
聚焦显示layer，失焦隐藏layer，点击layer子项提交表单；
##### 组件接口
$headSearch.search({
    css:true,
    animation:"fade",
    autocomplete : true,
    url : "https://...",
    delay : 300
});
##### 组件优化
1. 请求优化
输入状态下输入框字符空不请求，返回请求数据为空/失败不绑定数据，设置请求超时时间
2. 减少DOM操作
输入框焦点状态，请求数据成功后数据绑定等等都会调用layer的showHide方法，所以每次我们通过一个loaded属性判断layer内部是否存在html来决定shoeHide是否执行(避免不必要)，loaded初始值为false，每次appendLayer判断html更新loaded；
3. 性能优化
通过延迟请求来减少不必要请求，延迟每次请求的发出操作，若在延迟时间内下一input触发则清除上一请求，下一请求延迟时间内未处于输入状态则按时提交
4. 发布-订阅模式数据绑定
内部getData后执行外部发布的addData/noData(对应数据请求成功和请求失败)，外部只需绑定getData事件内进行数据绑定，noData内进行请求失败处理
5. 附：数据缓存
通过数据缓存对象在每次成功获取数据后缓存数据，每次请求数据前先检测数据缓存；

#### slide.js
##### 组件描述
提供一个slide方法于Jquery元素，用于为指定HTML结构(.slider>.slider-control+.slider-container+.slider-indicator)轮播切换功能；
##### js组件结构设计
search构造函数方式返回传入参数后生成的的search类实例
##### 组件实现
1. slider切换方式
根据参入参数为.slider追加.slider-slide/-fade以初始化对应轮播样式，并设置切换方法switch为对应切换方法为后续解耦
- fadeTo切换
　　接受目标item的索引参数，将当前item隐藏，目标item显示，并更新indicator
- slideTo
　　接受目标item的索引参数以及目标item移动方向，control-left为1，control-right为-1，indicator比较index和目标item的索引，更大则-1，变小则1；根据目标item移动方向反向设置其移动开始位置，再令当前item和目标item向指定方向移动1个slider宽度值即可
2. 切换控制
为.slider-control,.slider-indicator绑定各自切换处理(下一item，上一item，指定item)
##### 组件接口
$focusSlider.slider({
    css:true,
    animation:"slide",//切换动画
    activeIndex:1,//默认起始item
    interval:5000,//是否开启动轮播及其时间间隔
});
##### 组件优化拓展
1. 私有函数
_getCorrectIndex    获取正确有效index,length -> 0,-1 -> length - 1
_indicatorActive    更新indicator
2. 订阅消息
```
this.$ele.on("show shown hide hiden",".slider-item",function(e){
    _this.$ele.trigger("slider-"+e.type,[_this.$sliderItems.index(this),$(this)]);//传入当前item索引与参数
});
```
用于外部按需加载设置时间为.slider-show

#### tab.js
##### 组件描述
提供一个tab方法于Jquery元素，用于为指定HTML结构(.tab-item + .tab-panels)实现tab选项卡功能；
##### js组件结构设计
tab构造函数方式返回传入参数后生成的的tab类实例
##### 组件实现
事件绑定tab-item触发显示隐藏对应tab-panel；toggle方法
##### 组件拓展
1. 订阅消息
用于向外提供show/shown/hide/hiden各自状态的操作，这里用来接受按需加载
2. 自动切换tab
3. 延迟切换

### loadUntil-按需加载事件的封装
说明：本质是为元素绑定加载事件  
　　1. 采用委托传参方式，绑定时不用传入代理子元素参数，而是执行时传参；
　　2. 加载过元素不重新加载，所有按需加载元素完成后清除按需加载事件；
　　3. 外部需要操作：调用loadUntil前,设置具备加载条件时调用id + "show"事件，  　　　　以及绑定id + "loadItem"加载处理事件(都在委托元素上绑定)，可选：追加  
　　　　id + "loaded"事件(即加载元素们全部加载完毕的事件处理)
```
function loadUntil(options){
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
总结按需加载代码步骤：  
1. 绑定$container加载的处理事件(id+loadItem),可选：完成事件(id+"loaded")
2. 绑定智能按需加载的事件(loadUntial)
3. 设置按需加载执行时间(设置trigger)
```

#### 页面楼层/分项的按需加载
1. 将楼层内部包含数据的html内容清空，仅留下每个楼层容器方便后面计算位置
2. 监听可视区事件，如(scroll,resize);事件处理：通过isVisiable对位于可视区floor进行floor-show事件处理(通过事件委托或委托传参，这里使用loadUntil)
3. 执行之前已绑定的按需加载事件，其内部通过bulidFloor功能函数绑定并渲染内部html,再执行其他floor子元素操作(通过loadUntil功能方法执行)  
性能优化：
1. 稀释事件流
　　监听scroll,resize事件会频繁触发，为减少不必要判断，设置定时器延迟事件流执行
```
brower.$win.on("scroll resize",brower.$win.timeShowEvent = function(){//监听滑动状态与窗口大小时可视区的.floor
    clearTimeout(tab.$floors.timer);
    tab.$floors.timer = setTimeout(tab.$floors.timeToShow,250);
});
```
2. DOM访问
　　isVisiable函数每次访问DOM相对位置与高度，可以外部提前获取并存储减少内部访问
```
tab.$floors.each(function(){
    var $this = $(this);
    $this.data("height",$this.height());
    $this.data("top",$this.offset().top);
});
```
#### slider，tab的按需加载
1. 绑定加载处理
主要是图片的加载处理，将img元素的data-src设置为src值；
```
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
    //  if(typeof callback === "function") callback(url);
    //  img = null;
    // };
    // img.onerror = function(){
    //  if(typeof errorCallback === "function") errorCallback();
    //  img = null;     
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
// 解决：不做图片加载失败处理，失败情况仅让图片容器的宽高布局/背景图(色)占位避免影响页面布局
    });
    img.attr("src",url);
    //src请求异步执行，但此处还未成功加载window.img以及load事件触发之前
    //就被同步执行的后续js不断重写src，直到最后一个src请求成功并执行之前累加的load事件
}
```
2.  绑定智能按需加载的事件
lazyLoad.loadUntil({
    $container : $sliderElem,//外部容器即监听事件元素
    totalItemNum : $sliderElem.find(".slider-item").length,//加载完成数量
    id : "slider"//事件标识头，分别绑定触发事件slider-show，加载事件slider-loadItem、加载完成事件slider-loaded；其中slider-loadItem需外部绑定
});
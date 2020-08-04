// 兼容处理
(function(){
	var transitionEndEventName = {//存储兼容的属性名与对应事件名
		transition : "transitionend",
		MozTransition : "transitionend",
		WebkitTransition : "webKitTransitionEnd",
		OTransition : "oTransitionEnd otransitionend"
	}
	var testEle = document.createElement("div"),
		transitionEnd = "",
		isSupport = false;
	for(var name in transitionEndEventName){
		if(testEle.style[name] !== undefined){
			transitionEnd = transitionEndEventName[name];
			isSupport = true;
			break;
		}
	}

	window.compatible = window.compatible || {};
	window.compatible.transition = {
		transitionEnd : transitionEnd,
		isSupport : isSupport
	};
    console.log(window.compatible.transition.isSupport);
})()
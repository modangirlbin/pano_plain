$(document).ready(function(){
  $(".panorama").panorama_viewer({
    repeat: true
  });
});

/* ===========================================================
   * jquery-panorama_viewer.js v1
   * ===========================================================
   * Copyright 2014 Pete Rojwongsuriya.
   * http://www.thepetedesign.com
   *
   * Embed Panorama Photos on your website
   * with Panorama Viewer
   *
   * https://github.com/peachananr/panorama_viewer
   *
   * ========================================================== */

!function($){
  
  var defaults = {
    repeat: false,
    direction: "horizontal",
    animationTime: 700,
    easing: "ease-out",
    overlay: false
  };
  
  function Timer(callback, delay) {
    var timerId, start, remaining = delay;
    
    this.pause = function() {
      window.clearTimeout(timerId);
      remaining -= new Date() - start;
    };
    
    this.resume = function() {
      start = new Date();
      timerId = window.setTimeout(callback, remaining);
    };
    
    this.resume();
  }
  
  // touch이벤트 등록
  function touchHandler(event) {
    var touches = event.changedTouches,
      first = touches[0],
      type = "";
    
    // 마우스이벤트를 터치 이벤트로
    switch(event.type) {
    case "touchstart": type = "mousedown"; break;
    case "touchmove":  type="mousemove"; break;        
    case "touchend":   type="mouseup"; break;
    default: return;
    }
     
    var simulatedEvent = document.createEvent("MouseEvent");
    
    var mult = 2;
    
    if( navigator.userAgent.match(/Android/i) ) {
      mult = 10
    }
    
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                  first.screenX, first.screenY,
                  (first.clientX * mult), (first.clientY * mult), false,
                  false, false, false, 0/*left*/, null);
    first.target.dispatchEvent(simulatedEvent);
  }

  $.fn.panorama_viewer = function(options){
    
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
    
    return this.each(function(){
      var settings = $.extend({}, defaults, options),
        el = $(this);
      
      el.find("> img").load(function () {
        // dom추가
        el.find("> img").addClass("pv-pano");
        el.addClass("pv-container").wrapInner("<div class='pv-inner pv-animating'></div>");
        
        if (settings.direction == "vertical") {
          el.addClass("pv-vertical")
        }
        
        //속도,easing
        el.find(".pv-animating").css({
          "-webkit-transition": "all " + settings.animationTime + "ms " + settings.easing,
          "-moz-transition": "all " + settings.animationTime + "ms " + settings.easing,
          "-ms-transition": "all " + settings.animationTime + "ms " + settings.easing,
          "transition": "all " + settings.animationTime + "ms " + settings.easing
        })
        
        //이미지 w,h,경로
        imgSrc = el.find(".pv-pano").attr("src")
        width = el.find(".pv-pano").width()
        height = el.find(".pv-pano").height()
        var repeat = "no-repeat";

        //이미지 wrapper에 대신 bg이미지설정(실제보여지는 이미지)
        el.find(".pv-inner").css({
          height: height,
          width: width,
          background: "url(" + imgSrc + ") 0 0 " + repeat,
          "background-size": "cover"
        })
        
        // overlay
        if (settings.overlay == true) {
          $("<div class='pv-overlay'><i class='pvicon-overlay'></i></div>").appendTo(el.find(".pv-inner"))
          
          el.find(".pv-inner").bind("mouseenter", function() {
            $(this).find(".pv-overlay ").fadeOut("fast");
          }).bind("mouseleave", function() {
            $(this).find(".pv-overlay ").fadeIn("fast");
          })
        }
        
        //
        var $bg = el.find(".pv-inner"),
          // 실제보여지는 이미지 w,h
          elbounds = {
            w: parseInt($bg.parent().width()),
            h: parseInt($bg.parent().height())
          },
          //(container w,h) - (실제보여지는 이미지 w,h)
          bounds = {w: width - elbounds.w, h: height - elbounds.h},
          origin = {x: 0, y: 0},
          start = {x: 0, y: 0},
          movecontinue = false;//mousedown시 true
        // -------------------------------------------------------
        function move (e){
          
          var inbounds = {x: false, y: false},
              offset = {
                x: start.x - (origin.x - e.clientX),
                //0 - (0- x좌표)
                y: start.y - (origin.y - e.clientY)
              };
            console.log("start.x :" + start.x, "origin.x :" + origin.x,"e.clientX :" + e.clientX)
          // 수평
          if (settings.direction == "horizontal") {
            // repeat옵션 true 
            // -> inbounds.x=true
            if (settings.repeat == true) {
              inbounds.x = true;
            // repeat옵션 false
            // -> offset.x가 0보다 작고 절대값이 bounds.w보다작으면 inbounds.x=true
            } else {
              inbounds.x = offset.x < 0 && (offset.x * -1) < bounds.w;
            }
            
            //mousedown하고 repeat옵션이 true일때
            if (movecontinue && inbounds.x) {
              start.x = offset.x;
              start.y = 0;
            }
          } 
          
          var bgposx = $(this).css('background-position-x');
          var num_bgposx = bgposx.slice(0,-2);
          console.log(num_bgposx);

          $(this).on('mousemove', function(){

            if(num_bgposx<=1){
              $(this).css('background-position', start.x + 'px ' + start.y + 'px');
              console.log("hi");
            }
          });
          // $(this).css('background-position', start.x + 'px ' + start.y + 'px');
          
          
          origin.x = e.clientX;
          origin.y = e.clientY;
          
          e.stopPropagation();
          return false;
        }
        // -------------------------------------------------------
        
        function handle (e){
          movecontinue = false;
          $bg.unbind('mousemove', move);
          
          if (e.type == 'mousedown') {
            origin.x = e.clientX;
            origin.y = e.clientY;
            movecontinue = true;
            $bg.bind('mousemove', move);
          } else {
            $(document.body).focus();
          }
          
          e.stopPropagation();
          return false;
        }
        
        function reset (){
          start = {x: 0, y: 0};
          $(this).css('backgroundPosition', '0px 0px');
        }
        
        
        $bg.bind('mousedown mouseup mouseleave', handle);
        $bg.bind('dblclick', reset);
        
        el.find(".pv-pano").hide()
      })
      
      
    }); 
    
  }
  
}(window.jQuery);
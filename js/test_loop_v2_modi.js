// 20.02.11 v2(hs&gm)

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
    function touchHandler(event) {
      var touches = event.changedTouches,
        first = touches[0],
        type = "";
      
      switch(event.type) {
      case "touchstart": type = "mousedown"; break;
      case "touchmove":  type="mousemove"; break;        
      case "touchend":   type="mouseup"; break;
      default: return;
      }
       
      var simulatedEvent = document.createEvent("MouseEvent");
      
      var mult = 3;
      
      // if( navigator.userAgent.match(/Android/i) ) {
      //   mult = 3;
      // }
      
      simulatedEvent.initMouseEvent(type, true, true, window, 1,
                    first.screenX, first.screenY,
                    (first.clientX * mult), (first.clientY * mult), false,
                    false, false, false, 0, null);
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
          el.find("> img").addClass("pv-pano");
          el.addClass("pv-container").wrapInner("<div class='pv-inner pv-animating'></div>");
          
          if (settings.direction == "vertical") {
            el.addClass("pv-vertical")
          }
          
          el.find(".pv-animating").css({
            "-webkit-transition": "all " + settings.animationTime + "ms " + settings.easing,
            "transition": "all " + settings.animationTime + "ms " + settings.easing
          })
          
          imgSrc = el.find(".pv-pano").attr("src")
          width = el.find(".pv-pano").width()
          height = $(".bg-pano").height()
          var repeat = "no-repeat";
          if (settings.repeat == true) {
              repeat = "repeat"
          }
          
          el.find(".pv-inner").css({
            height: height,
            width: width,
            background: "url(" + imgSrc + ") 0 0 " + repeat,
            "background-size": "auto 100%"
          })
          
          var $bg = el.find(".pv-inner"),
            elbounds = {
              w: parseInt($bg.parent().width()),
              h: parseInt($bg.parent().height())
            },
            bounds = {w: width - elbounds.w, h: height - elbounds.h},
            origin = {x: 0, y: 0},
            start = {x: 0, y: 0},
            movecontinue = false;
  
          function auto(){
            var init_bgX = $bg.css('background-position-x');
            var init_bgX_num = Number(init_bgX.slice(0, -2));
            $bg.css('background-position-x',init_bgX_num-10+"px");
          }          
          
          function move (e){
            
            var inbounds = {x: false, y: false},
                offset = {
                  x: start.x - (origin.x - e.clientX),
                  y: start.y - (origin.y - e.clientY)
                };
            if (settings.direction == "horizontal") {
              if (settings.repeat == true) {
                inbounds.x = true;
              } else {
                inbounds.x = offset.x < 0 && (offset.x * -1) < bounds.w;
              }
              if (movecontinue && inbounds.x) {
                start.x = offset.x;
                start.y = 0;
              }
            } 
            
            var bgposx = $(this).css('background-position-x');
            var num_bgposx = bgposx.slice(0,-2);
  
            $(this).on('mousemove', function(){
  
              if(num_bgposx<=1){
                $(this).css('background-position', start.x + 'px ' + start.y + 'px');
              }
            });
            
            origin.x = e.clientX;
            origin.y = e.clientY;
            
            e.stopPropagation();
            return false;
          }
          
          function handle (e){
            movecontinue = false;
            $bg.unbind('mousemove', move);
            
            if (e.type == 'mousedown') {
              clearInterval(autoPlay);
              origin.x = e.clientX;
              origin.y = e.clientY;
              movecontinue = true;
              $bg.bind('mousemove', move);
            }else {
              $(document.body).focus();
              setTimeout(function(){autoPlay = setInterval(auto, 100);},1500)
            }
            
            e.stopPropagation();
            return false;
          }        
          
          $bg.bind('mousedown mouseup mouseleave', handle);
          var autoPlay = setInterval(auto, 100);
          el.find(".pv-pano").hide()
        })
        
      }); 
    }
    
  }(window.jQuery);
;"use strict";

var Ribbons = (function ( $, Kinetic, window ) {

    var _ribbonCount = 0;
    var _ribbonsAreRunning = false;
    var _ribbonTimerID = -1;

    return {

        initWithOptions: function(options) {

            // curtain options
            this.curtainColor = options.curtainColor || 'white',
            this.curtainOpacity = options.curtainOpacity || 1.0,
            this.curtainSpeed = options.curtainSpeed || 1.0,

            // ribbon options
            this.ribbonColorR = options.ribbonColorR || Math.floor(Math.random() * 255),
            this.ribbonColorG = options.ribbonColorG || Math.floor(Math.random() * 255),
            this.ribbonColorB = options.ribbonColorB || Math.floor(Math.random() * 255),
            this.ribbonWidth = options.ribbonWidth || 200,
            this.ribbonWidthSigma = options.ribbonWidthSigma || 30,
            this.ribbonHeight = options.ribbonHeight || 20,
            this.ribbonHeightSigma = options.ribbonHeightSigma || 14,
            this.ribbonOpacity = options.ribbonOpacity || 1.0,
            this.ribbonSpeed = options.ribbonSpeed || 1.0,
            this.ribbonFrequency = options.ribbonFrequency || .2,
            this.ribbonStrokeColor = options.ribbonStrokeColor || 'black',
            this.ribbonStrokeWidth = options.ribbonStrokeWidth || 0,
            this.ribbonBorderRadius = options.ribbonBorderRadius || 0,
            this.ribbonDirection = options.ribbonDirection || 'right',

            // other options
            this.colorSigma = options.colorSigma || 30,
            this.easing = options.easing || Kinetic.Easings.EaseInOut,
            this.timeBeforeCurtainEnter = options.timeBeforeCurtainEnter || 1500,
            this.zIndex = options.zIndex || 1000,

            this.setElement(options.selector);

            // events
            $(this).on('curtain:Left', function() {
                console.log("curtain is left");
            });

            $(this).on('curtain:Center', function() {
                console.log("curtain is center");
            });

            $(this).on('curtain:Right', function() {
                console.log("curtain is right");
            });

            $(this).on('ribbons:Started', function() {
                console.log("ribbons started");
            });

            $(this).on('ribbons:Stopped', function() {
                console.log("ribbons stopped");
            });
        },



        setElement: function(selector) {
            $("#canvasPlaceholder").remove();

            this.sel = selector;
            var el = $(this.sel);
            this.offset = el.offset();

            this.containerWidth = el.width();
            this.containerHeight = el.height();

            this.containerWidth += parseInt(el.css('border-left-width'), 10);
            this.containerWidth += parseInt(el.css('border-right-width'), 10);
            this.containerHeight += parseInt(el.css('border-top-width'), 10);
            this.containerHeight += parseInt(el.css('border-bottom-width'), 10);

            var placeholder = $('<div/>',{'id': 'canvasPlaceholder'});
            placeholder.css({
                'position': 'absolute',
                'width': this.containerWidth,
                'height': this.containerHeight,
                'top': this.offset.top,
                'left': this.offset.left
            });
            $(document.body).append(placeholder);

            // stage
            this.stage = new Kinetic.Stage({
                container: 'canvasPlaceholder',
                width: this.containerWidth,
                height: this.containerHeight,
            });

            // curtain
            this.curtain = new Kinetic.Rect({
                x: this.containerWidth,
                y: 0,
                width: this.containerWidth,
                height: this.containerHeight,
                fill: this.curtainColor,
                opacity: this.curtainOpacity
            });
            this.curtainLayer = new Kinetic.Layer();
            this.curtainLayer.add(this.curtain);
            this.stage.add(this.curtainLayer);

            // ribbon
            this.ribbonLayer = new Kinetic.Layer();
            this.stage.add(this.ribbonLayer);

            this.setZIndex(this.zIndex);
        },


        setZIndex: function(zIndex) {
            this.zIndex = zIndex;
            $(this.curtainLayer.getCanvas()._canvas).css({'zIndex': zIndex});
            $(this.ribbonLayer.getCanvas()._canvas).css({'zIndex': zIndex + 1});
        },


        isClear: function() {
            if (!this._ribbonsAreRunning && this._ribbonCount == 0) {
                return true;
            };
            return false;
        },



        // curtain methods

        curtainSetLeft: function() {
            this.curtain.setX(-this.curtain.width());
            this.curtainLayer.draw();
        },


        curtainSetRight: function() {
            this.curtain.setX(this.curtain.width());
            this.curtainLayer.draw();
        },


        curtainToLeft: function(callback) {
            var self = this;
            var tween = new Kinetic.Tween({
                node: this.curtain, 
                duration: this.curtainSpeed,
                x: -this.curtain.width(),
                y: 0,
                easing: this.easing,
                onFinish: function() {
                    $(self).trigger('curtain:Left');
                    if (typeof(callback) !== 'undefined') {
                        callback();
                    }
                }
            });
            tween.play();
        },


        curtainToRight: function(callback) {
            var self = this;
            var tween = new Kinetic.Tween({
                node: this.curtain, 
                duration: this.curtainSpeed,
                x: this.curtain.width(),
                y: 0,
                easing: this.easing,
                onFinish: function() {
                    $(self).trigger('curtain:Right');
                    if (typeof(callback) !== 'undefined') {
                        callback();
                    }
                }
            });
            tween.play();
        },


        curtainToCenter: function(callback) {
            var self = this;
            var tween = new Kinetic.Tween({
                node: this.curtain, 
                duration: 1,
                x: 0,
                y: 0,
                easing: this.easing,
                onFinish: function() {
                    $(self).trigger('curtain:Center');
                    if (typeof(callback) !== 'undefined') {
                        callback();
                    }
                }
            });

            tween.play();
        },


        
        // random color methods
        
        randomSample: function(mean, sigma) {
            var dist = Math.sqrt(-1 * Math.log(Math.random()));
            var angle = 2 * Math.PI * Math.random();
            var res = Math.floor(dist*Math.sin(angle) * sigma + mean);
            if (res < 0) return 0;
            return res;
        },
        
        randomSampleClamp: function(mean, sigma) {
            var dist = Math.sqrt(-1 * Math.log(Math.random()));
            var angle = 2 * Math.PI * Math.random();
            var res = Math.floor(dist*Math.sin(angle) * sigma + mean);
            if (res < 0) return 0;
            if (res > 255) return 255;
            return res;
        },


        sampleColor: function() {
            var sr = this.randomSampleClamp(this.ribbonColorR, this.colorSigma);
            var sg = this.randomSampleClamp(this.ribbonColorG, this.colorSigma);
            var sb = this.randomSampleClamp(this.ribbonColorB, this.colorSigma);
            return "rgb("+sr.toString()+","+sg.toString()+","+sb.toString()+")";
        },


        randomizeColorMus: function() {
          this.ribbonColorR = Math.floor(Math.random()*255);
          this.ribbonColorG = Math.floor(Math.random()*255);
          this.ribbonColorB = Math.floor(Math.random()*255);
        },


        
        // ribbon methods
        
        slideRibbon: function() {

            var sampledWidth = this.randomSample(this.ribbonWidth, this.ribbonWidthSigma);
            var sampledHeight = this.randomSample(this.ribbonHeight, this.ribbonHeightSigma);
            // handle direction
            if (this.ribbonDirection == "right") {
                var ribbonStartX = -1 * (sampledWidth + this.ribbonStrokeWidth);
                var ribbonTweenX = ribbonStartX + sampledWidth + this.containerWidth + this.ribbonStrokeWidth;
            } else {
                var ribbonStartX = sampledWidth + this.ribbonStrokeWidth + this.containerWidth;
                var ribbonTweenX = ribbonStartX - (2 * sampledWidth) - this.containerWidth - this.ribbonStrokeWidth;
            }

            // make ribbon
            var rect = new Kinetic.Rect({
                x: ribbonStartX,
                y: this.containerHeight * Math.random(),
                width: sampledWidth,
                height: sampledHeight,
                fill: this.sampleColor(),
                stroke: this.ribbonStrokeWidth > 0 ? this.ribbonStrokeColor : '',
                strokeWidth: this.ribbonStrokeWidth,
                cornerRadius: Math.min(this.ribbonBorderRadius, sampledHeight/2.0, sampledWidth/2.0),
                opacity:this.ribbonOpacity 
            });
            this.ribbonLayer.add(rect);
            this._ribbonCount++;

            // tween ribbon
            var self = this;
            var tween = new Kinetic.Tween({
                node: rect, 
                duration: this.ribbonSpeed,
                x: ribbonTweenX,
                y: rect.y(),
                easing: this.easing,
                onFinish: function() {
                    rect.remove();
                    rect.destroy();
                    delete rect;
                    self._ribbonCount--;
                }
            });

            tween.play();
        },


        startRibbons: function() {
            if (this._ribbonsAreRunning) return;
            this._ribbonsAreRunning = true;
            $(this).trigger('ribbons:Started');
            var that = this;
            this._ribbonTimerID = setInterval(function() {
                if (Math.random() > (1 - that.ribbonFrequency)) {
                  that.slideRibbon();
                }
            }, 10);
        },


        stopRibbons: function() {
            clearInterval(this._ribbonTimerID);
            this._ribbonsAreRunning = false;
            $(this).trigger('ribbons:Stopped');
        },
    };

})( jQuery, Kinetic, window );

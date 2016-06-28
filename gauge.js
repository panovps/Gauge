(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.Gauge = factory();
    }
})(this, function () {
    "use strict";

    /**
     *
     * @param selector
     * @param config
     * @returns {Gauge}
     * @constructor
     */
    var Gauge = function (selector, config) {

        /**
         *  Default gauge configs
         *  @struct
         */
        this.config = {
            values: [],
            initValue: '',

            initAngle: (5/6)*Math.PI,
            deltaAngle: (4/3)*Math.PI,

            handRadius: 10,
            handDelta: 5,
            handColor: 'blue',

            rimBorderWidth: 3,
            rimColor: 'grey',

            titleReverse: false,
            font: '15px arial',

            firstApertureRange: Math.PI/4,
            firstApertureColor: 'orange',
            secondApertureRange: Math.PI/4,
            secondApertureColor: 'red'
        };
        this.config = Object.assign(this.config, config);
        config = this.config;

        if (!~config.values.indexOf(config.initValue)){
            config.initValue = config.values[0];
        }

        try {

            var canvas = document.querySelector(selector);
            this.ctx = canvas.getContext("2d");

            this.radius = Math.round(Math.min(canvas.offsetWidth, canvas.offsetHeight)/2);

        } catch (e) {
            throw new Error("Couldn't create canvas");
        }

        this.ctx.translate(Math.round(canvas.offsetWidth/2), Math.round(canvas.offsetHeight/2));
        this.ctx.rotate(this.config.initAngle);

        this.setValue(this.config.initValue);

        return this;

    };

    Gauge.prototype = Object.assign(Gauge.prototype, {

        /**
         * Clearing the canvas before setting a value
          * @private
         */
        _clear: function () {
            this.ctx.clearRect(-this.radius, -this.radius, 2*this.radius, 2*this.radius);
            return this;
        },

        _drawRim: function () {
            var ctx = this.ctx;

            ctx.beginPath();

            var dAng = this.config.deltaAngle - this.config.firstApertureRange - this.config.secondApertureRange;
            ctx.arc(0, 0, this.radius*0.8, 0, dAng, false);

            ctx.lineWidth = this.config.rimBorderWidth;
            ctx.strokeStyle = this.config.rimColor;
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = this.config.firstApertureColor;
            var dAng2 = dAng + this.config.firstApertureRange;
            ctx.arc(0, 0, this.radius*0.8, dAng, dAng2, false);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = this.config.secondApertureColor;
            ctx.arc(0, 0, this.radius*0.8, dAng2, this.config.deltaAngle, false);
            ctx.stroke();

            ctx.closePath();

            return this;
        },

        /**
         * Drawing a gauge's handing (arrow)
         * @param ang
         * @returns {Gauge}
         * @private
         */
        _drawHand: function (ang) {
            var ctx = this.ctx;

            ctx.beginPath();
            ctx.arc(0, 0, this.config.handRadius, 0, 2*Math.PI, false);

            ctx.strokeStyle = this.config.handColor;
            ctx.fillStyle = this.config.handColor;
            ctx.stroke();

            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.rotate(ang);

            ctx.moveTo(0, -this.config.handDelta);
            ctx.lineTo(this.radius*0.92, 0);
            ctx.lineTo(0, this.config.handDelta);
            ctx.closePath();
            ctx.fill();

            ctx.rotate(-ang);

            return this;
        },

        /**
         * Drawing once title on some angle
         * @param ang
         * @param title
         * @returns {Gauge}
         * @private
         */
        _drawTitle: function (ang, title) {
            var ctx = this.ctx;

            ctx.beginPath();
            ctx.rotate(ang);

            var kefs = !this.config.titleReverse ? [0.85, 0.89] : [0.71, 0.75];

            ctx.moveTo(this.radius * kefs[0], 0);
            ctx.lineTo(this.radius * kefs[1], 0);

            ctx.lineWidth = 2;
            ctx.fillStyle = this.config.rimColor;
            ctx.strokeStyle = this.config.rimColor;

            ctx.closePath();
            ctx.stroke();

            ctx.font = this.config.font;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            var transRadius = this.radius*(!this.config.titleReverse ? 0.95 : 0.65);

            ctx.translate(transRadius, 0);
            ctx.rotate(-this.config.initAngle - ang);
            ctx.fillText(title.toString(), 0, 0);

            ctx.rotate(this.config.initAngle + ang);
            ctx.translate(-transRadius, 0);

            ctx.rotate(-ang);

            return this;
        },

        /**
         * Calculating degree of part N
         * @param n
         * @returns {number}
         * @private
         */
        _calcAngN: function (n) {
            return ( n / ( this.config.values.length-1) )*this.config.deltaAngle;
        },

        /**
         * Drawing the gauge
         * @private
         */
        _drawGauge: function () {
            this._clear()
                ._drawRim();

            this.config.values.forEach(function (value, i) {

                this._drawTitle(this._calcAngN(i), value);

            }.bind(this));

            return this;
        },

        /**
         * Setting value of the gauge. Value have to be in config.values.
         * @param val
         */
        setValue: function (val) {
            var index = this.config.values.indexOf(val);

            this._drawGauge()
                ._drawHand(this._calcAngN(index));
        }

    });

    return Gauge;

});
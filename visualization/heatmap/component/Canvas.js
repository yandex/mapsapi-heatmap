/**
 * Модуль отрисовки тепловой карты на canvas'e. Позволяет получить карту в формате dataURL.
 * @module visualization.heatmap.component.Canvas
 * @requires option.Manager
 * @requires Monitor
 */
ymaps.modules.define('visualization.heatmap.component.Canvas', [
    'option.Manager',
    'Monitor'
],  function (
    provide,
    OptionManager,
    Monitor
) {
    /**
     * @constant DEFAULT_OPTIONS
     * @description Настройки карты по умолчанию.
     */
    var DEFAULT_OPTIONS = {
        // Минимальный радиус точки.
        radius: 10,
        // Множитель для радиуса точки.
        radiusFactor: 1,
        // Прозрачность слоя карты.
        opacity: 0.6,
        // Интенсивность медианной (по весу) точки.
        intensityOfMidpoint: 0.2,
        // Медиана весов точек.
        medianaOfWeights: 1,
        // Градиент, которым будут раскрашены точки.
        gradient: {
            0.1: 'rgba(128, 255, 0, 1)',
            0.2: 'rgba(255, 255, 0, 1)',
            0.7: 'rgba(234, 72, 58, 1)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    };

    /**
     * @public
     * @function Canvas
     * @description Конструктор модуля отрисовки тепловой карты.
     *
     * @param {Number[]} size Размер карты: [width, height].
     */
    var Canvas = function (size) {
        this._canvas = document.createElement('canvas');
        this._canvas.width = size[0];
        this._canvas.height = size[1];

        this._context = this._canvas.getContext('2d');

        this.options = new OptionManager({});

        this._setupDrawTools();
        this._setupOptionMonitor();
    };

    /**
     * @public
     * @function getBrushRadius
     * @description Получение размера кисти, которая используется для отрисовки точек.
     *
     * @returns {Number} margin.
     */
    Canvas.prototype.getBrushRadius = function () {
        return this.options.get('radius', DEFAULT_OPTIONS.radius) *
            this.options.get('radiusFactor', DEFAULT_OPTIONS.radiusFactor);
    };

    /**
     * @public
     * @function generateDataURLHeatmap
     * @description Получение карты в виде dataURL с нанесенными точками.
     *
     * @param {Object[]} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {String} dataURL.
     */
    Canvas.prototype.generateDataURLHeatmap = function (points) {
        this._drawHeatmap(points || []);

        return this._canvas.toDataURL();
    };

    /**
     * @public
     * @function destroy
     * @description Уничтожает внутренние данные.
     */
    Canvas.prototype.destroy = function () {
        this._destroyOptionMonitor();
        this._destroyDrawTools();
    };

    /**
     * @private
     * @function _setupOptionMonitor
     * @description Устанавливает монитор на опции тепловой карты.
     *
     * @returns {Monitor} Монитор опций.
     */
    Canvas.prototype._setupOptionMonitor = function () {
        this._optionMonitor = new Monitor(this.options);

        return this._optionMonitor.add(
            ['radius', 'radiusFactor', 'gradient'],
            this._setupDrawTools,
            this
        );
    };

    /**
     * @private
     * @function _destroyOptionMonitor
     * @description Уничтожает монитор опций.
     */
    Canvas.prototype._destroyOptionMonitor = function () {
        this._optionMonitor.removeAll();
        this._optionMonitor = {};
    };

    /**
     * @private
     * @function _setupDrawTools
     * @description Устанавливает внутренние опции тепловой карты.
     *
     * @returns {Canvas}
     */
    Canvas.prototype._setupDrawTools = function () {
        this._brush = this._createBrush();
        this._gradient = this._createGradient();

        return this;
    };

    /**
     * @private
     * @function _destroyDrawTools
     * @description Уничтожает внутренние опции тепловой карты.
     */
    Canvas.prototype._destroyDrawTools = function () {
        this._brush = null;
        this._gradient = null;
    };

    /**
     * @private
     * @function _createBrush
     * @description Создание кисти, которой будут нарисованы точки.
     *
     * @returns {HTMLElement} brush Канвас с отрисованной тенью круга.
     */
    Canvas.prototype._createBrush = function () {
        var brush = document.createElement('canvas'),
            context = brush.getContext('2d'),

            radius = this.getBrushRadius(),
            gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);

        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
  
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2 * radius, 2 * radius);

        return brush;
    };

    /**
     * @private
     * @function _createGradient
     * @description Создание 256x1 градиента, которым будет раскрашена карта.
     *
     * @returns {Number[]} [r1, g1, b1, a1, r2, ...].
     */
    Canvas.prototype._createGradient = function () {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            gradient = context.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        var gradientOption = this.options.get('gradient', DEFAULT_OPTIONS.gradient);
        for (var i in gradientOption) {
            if (gradientOption.hasOwnProperty(i)) {
                gradient.addColorStop(i, gradientOption[i]);
            }
        }

        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 256);

        return context.getImageData(0, 0, 1, 256).data;
    };

    /**
     * @private
     * @function _drawHeatmap
     * @description Отрисовка тепловой карты.
     *
     * @returns {Canvas}
     */
    Canvas.prototype._drawHeatmap = function (points) {
        var context = this._context,
            radius = this.getBrushRadius(),

            intensityOfMidpoint = this.options.get(
                'intensityOfMidpoint',
                DEFAULT_OPTIONS.intensityOfMidpoint
            ),
            medianaOfWeights = this.options.get(
                'medianaOfWeights',
                DEFAULT_OPTIONS.medianaOfWeights
            ),
            // Множитель для установки медианы интенсивности точек.
            weightFactor = intensityOfMidpoint / medianaOfWeights;

        context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (var i = 0, length = points.length; i < length; i++) {
            context.globalAlpha = Math.min(points[i].weight * weightFactor, 1);
            context.drawImage(
                this._brush,
                points[i].coordinates[0] - radius,
                points[i].coordinates[1] - radius
            );
        }

        var heatmapImage = context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        this._colorize(heatmapImage.data);
        context.putImageData(heatmapImage, 0, 0);

        return this;
    };

    /**
     * @private
     * @function _colorize
     * @description Раскрашивание пикселей карты.
     *
     * @param {Number[]} pixels Бесцветная тепловая карта [r1, g1, b1, a1, r2, ...].
     * @param {Number[]} gradient Градиент [r1, g1, b1, a1, r2, ...].
     */
    Canvas.prototype._colorize = function (pixels) {
        var opacity = this.options.get('opacity', DEFAULT_OPTIONS.opacity) * 255;
        for (var i = 3, length = pixels.length, j; i < length; i += 4) {
            if (pixels[i]) {
                // Получаем цвет в градиенте, по значению прозрачночти.
                j = 4 * pixels[i];
                pixels[i - 3] = this._gradient[j];
                pixels[i - 2] = this._gradient[j + 1];
                pixels[i - 1] = this._gradient[j + 2];

                // Устанавливаем прозрачность слоя.
                pixels[i] = opacity;
            }
        }
    };

    provide(Canvas);
});

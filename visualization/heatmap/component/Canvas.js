/**
 * Модуль отрисовки тепловой карты на canvas'e. Позволяет получить карту в формате dataURL.
 * @module visualization.heatmap.component.Canvas
 * @requires option.Manager
 *
 * @author Morozov Andrew <alt-j@yandex-team.ru>
 */
ymaps.modules.define('visualization.heatmap.component.Canvas', [
    'option.Manager'
],  function (
    provide,
    OptionManager
) {
    /**
     * @constant DEFAULT_OPTIONS
     * @description Настройки карты по умолчанию.
     */
    var DEFAULT_OPTIONS = {
        opacity: 0.75,
        pointRadius: 5,
        pointBlur: 15,
        pointGradient: {
            0.1: 'rgba(128, 255, 0, 1)',
            0.4: 'rgba(255, 255, 0, 1)',
            0.8: 'rgba(234, 72, 58, 1)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    };

    /**
     * @public
     * @function Canvas
     * @description Конструктор модуля отрисовки тепловой карты.
     *
     * @param {Number} width Ширина карты.
     * @param {Number} height Высота карты.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  opacity - прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointGradient - объект задающий градиент.
     */
    var Canvas = function (width, height, options) {
        this._canvas = document.createElement('canvas');
        this._canvas.width = width;
        this._canvas.height = height;

        this._context = this._canvas.getContext('2d');

        this.options = new OptionManager(DEFAULT_OPTIONS);
        this.options.set(options);

        this.options.events.add('change', this._onOptionsChange.bind(this));
        this._onOptionsChange();
    };

    /**
     * @public
     * @function getBrushRadius
     * @description Получение размера кисти, которая используется для отрисовки точек.
     *
     * @returns {Number} margin.
     */
    Canvas.prototype.getBrushRadius = function () {
        return this.options.get('pointRadius') + this.options.get('pointBlur');
    };

    /**
     * @public
     * @function getDataURLHeatmap
     * @description Получение карты в виде dataURL с нанесенными точками.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {String} dataURL.
     */
    Canvas.prototype.getDataURLHeatmap = function (points) {
        this._drawHeatmap(points || []);

        return this._canvas.toDataURL();
    };

    /**
     * @private
     * @function _onOptionsChange
     * @description Обработчик изменений опций тепловой карты.
     */
    Canvas.prototype._onOptionsChange = function () {
        this._pointImage = this._createPointImage();
        this._gradient = this._createGradient();
    };

    /**
     * @private
     * @function _createPointImage
     * @description Создание тени круга, которым будут нарисованы точки.
     *
     * @returns {HTMLElement} pointImage Канвас с отрисованной тенью круга.
     */
    Canvas.prototype._createPointImage = function () {
        var pointImage = document.createElement('canvas'),
            context = pointImage.getContext('2d'),
            radius = this.getBrushRadius();

        pointImage.width = pointImage.height = 2 * radius;

        // Тень смещаем в соседний квадрат.
        context.shadowOffsetX = context.shadowOffsetY = 2 * radius;
        context.shadowBlur = this.options.get('pointBlur');
        context.shadowColor = 'black';

        context.beginPath();
        // Круг рисуем вне зоны видимости, фактически от круга оставляем только тень.
        context.arc(-1 * radius, -1 * radius, this.options.get('pointRadius'), 0, 2 * Math.PI, true);
        context.closePath();
        context.fill();

        return pointImage;
    };

    /**
     * @private
     * @function _createGradient
     * @description Создание 256x1 градиента, которым будет раскрашена карта.
     *
     * @returns {Array} [r1, g1, b1, a1, r2, ...].
     */
    Canvas.prototype._createGradient = function () {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            gradient = context.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        var pointGradientOption = this.options.get('pointGradient');
        for (var i in pointGradientOption) {
            if (pointGradientOption.hasOwnProperty(i)) {
                gradient.addColorStop(i, pointGradientOption[i]);
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
            radius = this.getBrushRadius();

        context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (var i = 0, length = points.length, point; i < length; i++) {
            point = points[i];
            context.drawImage(this._pointImage, point[0] - radius, point[1] - radius);
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
     * @param {Array} pixels Бесцветная тепловая карта [r1, g1, b1, a1, r2, ...].
     * @param {Array} gradient Градиент [r1, g1, b1, a1, r2, ...].
     */
    Canvas.prototype._colorize = function (pixels) {
        var opacity = this.options.get('opacity');
        for (var i = 3, length = pixels.length, j; i < length; i += 4) {
            // Получаем цвет в градиенте, по значению прозрачночти.
            j = 4 * pixels[i];
            if (j) {
                pixels[i - 3] = this._gradient[j];
                pixels[i - 2] = this._gradient[j + 1];
                pixels[i - 1] = this._gradient[j + 2];
            }
            pixels[i] = opacity * pixels[i];
        }
    };

    provide(Canvas);
});

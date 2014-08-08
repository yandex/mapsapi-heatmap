/**
 * @fileOverview Модуль для отрисовки тепловой карты.
 * Позволяет получить карту в формате dataURL.
 */
ymaps.modules.define('visualization.heatmap.component.Canvas', [
    'option.Manager'
],  function (
    provide,
    OptionManager
) {
    /**
     * Настройки карты по умолчанию.
     */
    var DEFAULT_OPTIONS = {
        width: 256,
        height: 256,
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
     * Конструктор модуля отрисовки тепловой карты.
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
        this.options = new OptionManager(options);
        this.options.setParent(Canvas._defaultOptions);

        this._canvas = document.createElement('canvas');
        this._canvas.width = width;
        this._canvas.height = height;

        this._context = this._canvas.getContext('2d');

        this._points = [];

        this._pointImage = this._createPointImage();
        this._gradient = this._createGradient();
    };

    Canvas._defaultOptions = new OptionManager(DEFAULT_OPTIONS);

    /**
     * Установка точек, которые будут нанесены на карту.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Canvas}
     */
    Canvas.prototype.setPoints = function (points) {
        // Префильтрация, чтобы не рисовать точки, которых не будет видно.
        var self = this;
        var offset = this.options.get('pointRadius') + this.options.get('pointBlur');
        var isPointInBounds = function (point) {
            return self._isPointInBounds(point, offset);
        };
        this._points = points.filter(isPointInBounds);
        return this;
    };

    /**
     * Получение карты в виде dataURL.
     *
     * @returns {String} dataURL.
     */
    Canvas.prototype.getDataURL = function () {
        this._drawCanvas();
        return this._canvas.toDataURL();
    };

    /**
     * Проверка попадаения точки в границы карты.
     *
     * @param {Array} point Точка point[0] = x, point[1] = y.
     * @param {Number} offset На сколько надо расширить видимую область.
     * @returns {Boolean} True - попадает.
     */
    Canvas.prototype._isPointInBounds = function (point, offset) {
        offset = offset || 0;
        return (point[0] >= -offset) &&
            (point[0] <= this._canvas.width + offset) &&
            (point[1] >= -offset) &&
            (point[0] <= this._canvas.height + offset);
    };

    /**
     * Отрисовка тепловой карты.
     *
     * @returns {Canvas}
     */
    Canvas.prototype._drawCanvas = function () {
        var context = this._context,
            radius = this.options.get('pointRadius') + this.options.get('pointBlur');

        context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (var i = 0, length = this._points.length, point; i < length; i++) {
            point = this._points[i];
            context.drawImage(
                this._pointImage,
                point[0] - radius,
                point[1] - radius
            );
        }

        var heatmapImage = context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        this._colorize(heatmapImage.data);
        context.putImageData(heatmapImage, 0, 0);

        return this;
    };

    /**
     * Создание тени круга, которым будут нарисованы точки.
     *
     * @returns {HTMLElement} pointImage Канвас с отрисованной тенью круга.
     */
    Canvas.prototype._createPointImage = function () {
        var pointImage = document.createElement('canvas'),
            context = pointImage.getContext('2d'),
            radius = this.options.get('pointRadius') + this.options.get('pointBlur');

        pointImage.width = pointImage.height = 2 * radius;

        // Тень смещаем в соседний квадрат.
        context.shadowOffsetX = context.shadowOffsetY = 1.5 * radius;
        context.shadowBlur = this.options.get('pointBlur');
        context.shadowColor = 'black';

        context.beginPath();
        // Круг рисуем вне зоны видимости, фактически от круга оставляем только тень.
        context.arc(
            -0.5 * radius,
            -0.5 * radius,
            this.options.get('pointRadius'),
            0,
            2 * Math.PI,
            true
        );
        context.closePath();
        context.fill();

        return pointImage;
    };

    /**
     * Создание 256x1 градиента, которым будет раскрашена карта.
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
     * Раскрашивание пикселей карты.
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

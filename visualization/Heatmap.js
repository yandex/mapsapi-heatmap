/**
 * @fileOverview Модуль для отрисовки тепловой карты.
 * Позволяет получить карту в формате dataURL.
 */
ymaps.modules.define('visualization.Heatmap', [
    'util.extend'
],  function (
    provide,
    extend
) {
    /**
     * Конструктор тепловой карты.
     *
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  width - ширина карты;
     *  height - высота карты;
     *  opacity - глобальная прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointOpaicty - прозрачность точки;
     *  gradient - объект задающий градиент.
     */
    var Heatmap = function (options) {
        extend(this._options, options || {});

        this._canvas = document.createElement('canvas');
        this._canvas.width = this._options.width;
        this._canvas.height = this._options.height;

        this._context = this._canvas.getContext('2d');

        this._points = [];

        this._pointImage = this._createPointImage();
        this._gradient = this._createGradient();
    };

    /**
     * Настройки карты по умолчанию.
     */
    Heatmap.prototype._options = {
        width: 256,
        height: 256,
        opacity: 0.75,

        pointRadius: 5,
        pointBlur: 15,
        pointOpaicty: 1,

        gradient: {
            0.1: 'rgba(128, 255, 0, 1)',
            0.4: 'rgba(255, 255, 0, 1)',
            0.8: 'rgba(234, 72, 58, 1)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    };

    /**
     * Установка точек, которые будут нанесены на карту.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.setPoints = function (points) {
        // Префильтрация, чтобы не рисовать точки, которых не будет видно.
        var isPointInBounds = this._isPointInBounds.bind(this);
        this._points = points.filter(isPointInBounds);
        return this;
    };

    /**
     * Получение карты в виде dataURL.
     *
     * @returns {String} dataURL.
     */
    Heatmap.prototype.getDataURL = function () {
        this._drawHeatmap();
        return this._canvas.toDataURL();
    };

    /**
     * Проверка попадаения точки в границы карты.
     *
     * @param {Array} point Точка point[0] = x, point[1] = y.
     * @returns {Boolean} True - попадает.
     */
    Heatmap.prototype._isPointInBounds = function (point) {
        var offset = this._options.pointRadius + this._options.pointBlur;
        return (point[0] >= -offset) &&
            (point[0] <= this._options.width + offset) &&
            (point[1] >= -offset) &&
            (point[0] <= this._options.height + offset);
    };

    /**
     * Отрисовка тепловой карты.
     *
     * @returns {Heatmap}
     */
    Heatmap.prototype._drawHeatmap = function () {
        var context = this._context,
            radius = this._options.pointRadius + this._options.pointBlur;

        context.clearRect(0, 0, this._options.width, this._options.height);

        for (var i = 0, length = this._points.length, point; i < length; i++) {
            point = this._points[i];
            context.globalAlpha = this._options.pointOpaicty;
            context.drawImage(
                this._pointImage,
                point[0] - radius,
                point[1] - radius
            );
        }

        var heatmapImage = context.getImageData(0, 0, this._options.width, this._options.height);
        this._colorize(heatmapImage.data);
        context.putImageData(heatmapImage, 0, 0);

        return this;
    };

    /**
     * Создание тени круга, которым будут нарисованы точки.
     *
     * @returns {HTMLElement} pointImage Канвас с отрисованной тенью круга.
     */
    Heatmap.prototype._createPointImage = function () {
        var pointImage = document.createElement('canvas'),
            context = pointImage.getContext('2d'),
            radius = this._options.pointRadius + this._options.pointBlur;

        pointImage.width = pointImage.height = 2 * radius;

        // Тень смещаем в соседний квадрат.
        context.shadowOffsetX = context.shadowOffsetY = 1.5 * radius;
        context.shadowBlur = this._options.pointBlur;
        context.shadowColor = 'black';

        context.beginPath();
        // Круг рисуем вне зоны видимости, фактически от круга оставляем только тень.
        context.arc(
            -0.5 * radius,
            -0.5 * radius,
            this._options.pointRadius,
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
    Heatmap.prototype._createGradient = function () {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            gradient = context.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (var i in this._options.gradient) {
            if (this._options.gradient.hasOwnProperty(i)) {
                gradient.addColorStop(i, this._options.gradient[i]);
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
    Heatmap.prototype._colorize = function (pixels) {
        for (var i = 3, length = pixels.length, j; i < length; i += 4) {
            // Получаем цвет в градиенте, по значению прозрачночти.
            j = 4 * pixels[i];
            if (j) {
                pixels[i - 3] = this._gradient[j];
                pixels[i - 2] = this._gradient[j + 1];
                pixels[i - 1] = this._gradient[j + 2];
            }
            pixels[i] = this._options.opacity * pixels[i];
        }
    };

    provide(Heatmap);
});

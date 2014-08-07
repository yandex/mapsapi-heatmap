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
     *  radius - радиус точки;
     *  blur - радиус размытия вокруг точки, на тепловой карте;
     *  gradient - объект задающий градиент.
     */
    var Heatmap = function (options) {
        extend(this._options, options || {});

        this._canvas = document.createElement('canvas');
        this._canvas.width = this._options.width;
        this._canvas.height = this._options.height;

        this._context = this._canvas.getContext('2d');

        this._data = [];

        this._circle = this._createCircle();
        this._gradient = this._createGradient();
    };

    /**
     * Настройки карты по умолчанию.
     */
    Heatmap.prototype._options = {
        width: 256,
        height: 256,

        radius: 5,
        blur: 15,

        gradient: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    };

    /**
     * Установка точек, которые будут нанесены на карту.
     *
     * @param {Array} data Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.setData = function (data) {
        // Префильтрация, чтобы не рисовать точки, которых не будет видно.
        var isPointInBounds = this._isPointInBounds.bind(this);
        this._data = data.filter(isPointInBounds);
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
        var offset = this._options.radius + this._options.blur;
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
            radius = this._options.radius + this._options.blur;

        context.clearRect(0, 0, this._options.width, this._options.height);

        for (var i = 0, length = this._data.length, point; i < length; i++) {
            point = this._data[i];
            context.drawImage(
                this._circle,
                point[0] - radius,
                point[1] - radius
            );
        }

        var colored = context.getImageData(0, 0, this._options.width, this._options.height);
        this._colorize(colored.data, this._gradient);
        context.putImageData(colored, 0, 0);

        return this;
    };

    /**
     * Создание тени круга, которым будут нарисованы точки.
     *
     * @returns {HTMLElement} circle Канвас с отрисованной тенью круга.
     */
    Heatmap.prototype._createCircle = function () {
        var circle = document.createElement('canvas'),
            context = circle.getContext('2d'),
            radius = this._options.radius + this._options.blur;

        circle.width = circle.height = 2 * radius;

        // Тень смещаем в соседний квадрат.
        context.shadowOffsetX = context.shadowOffsetY = 1.5 * radius;
        context.shadowBlur = this._options.blur;
        context.shadowColor = 'black';

        context.beginPath();
        // Круг рисуем вне зоны видимости, фактически от круга оставляем только тень.
        context.arc(- 0.5 * radius, -0.5 * radius, this._options.radius, 0, 2 * Math.PI, true);
        context.closePath();
        context.fill();

        return circle;
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
            gradient.addColorStop(i, this._options.gradient[i]);
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
    Heatmap.prototype._colorize = function (pixels, gradient) {
        for (var i = 3, length = pixels.length, j; i < length; i += 4) {
            // Получаем цвет в градиенте, по значению прозрачночти.
            j = 4 * pixels[i];
            if (j) {
                pixels[i - 3] = gradient[j];
                pixels[i - 2] = gradient[j + 1];
                pixels[i - 1] = gradient[j + 2];
            }
        }
    };

    provide(Heatmap);
});

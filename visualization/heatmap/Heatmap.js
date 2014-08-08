/**
 * @fileOverview Модуль, позволяющий наносить слой тепловой карты.
 */
ymaps.modules.define('visualization.Heatmap', [
    'util.math.areEqual',
    'option.Manager',
    'Layer',
    'visualization.heatmap.component.TileUrlsGenerator'
], function (
    provide,
    areEqual,
    OptionManager,
    Layer,
    HeatmapTileUrlsGenerator
) {
    /**
     * Конструктор тепловой карты.
     *
     * @param {Array} points Массив точек в географический координатах.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  opacity - прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointGradient - объект задающий градиент.
     */
    var Heatmap = function (points, options) {
        this._points = JSON.parse(JSON.stringify(points));

        this.options = new OptionManager(options);
        this.options.events.add('change', this._onOptionsChange.bind(this));

        return this;
    };

    /**
     * Задает карту, на которой должна отобразиться тепловая карта.
     *
     * @param {Map} map.
     * @returns {Heatmap}
     */
    Heatmap.prototype.setMap = function (map) {
        if (!this._layer) {
            this._createLayer();
        }
        if (this._map && this._map !== map) {
            this._map.layers.remove(this._layer);
        }
        this._map = map;
        this._map.layers.add(this._layer);

        return this;
    };

    /**
     * Получение позиции точки.
     *
     * @param {Array} point Точка.
     * @param {Number} index Индекс данной точки внутри this._points.
     */
    Heatmap.prototype.getIndexOfPoint = function (point) {
        for (var i = 0, length = this._points.length; i < length; i++) {
            if (areEqual(this._points[i], point)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Добавляет точки, которые будут нанесены на карту.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.addPoints = function (points) {
        for (var i = 0, length = points.length, index; i < length; i++) {
            index = this._points.push(points[i]) - 1;
            if (this._layer) {
                this._tileUrlsGenerator.addPointToIndex(index, points[i]);
            }
        }
        if (this._layer) {
            this._layer.update();
        }
        return this;
    };

    /**
     * Удаляет точки, которые не должны быть отображены на карте.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.removePoints = function (points) {
        for (var i = 0, length = points.length, index; i < length; i++) {
            index = this.getIndexOfPoint(points[i]);
            while (index !== -1) {
                if (this._layer) {
                    this._tileUrlsGenerator.removePointFromIndex(index);
                }
                this._points.splice(index, 1);
                index = this.getIndexOfPoint(points[i]);
            }
        }
        if (this._layer) {
            this._layer.update();
        }
        return this;
    };

    /**
     * Обработчик изменений опций тепловой карты.
     */
    Heatmap.prototype._onOptionsChange = function () {
        if (this._layer) {
            var options = this.options.getAll();
            this._tileUrlsGenerator.setOptions(options);

            this._layer.update();
        }
    };

    /**
     * Создание слоя, в котором будет размещена тепловая карта.
     *
     * @returns {Heatmap}
     */
    Heatmap.prototype._createLayer = function () {
        this._layer = new Layer('', { tileTransparent: true });
        this._tileUrlsGenerator = new HeatmapTileUrlsGenerator(
            this._layer,
            this._points,
            this.options.getAll()
        );
        this._layer.getTileUrl = this._tileUrlsGenerator
            .getTileUrl
            .bind(this._tileUrlsGenerator);

        return this;
    };

    provide(Heatmap);
});

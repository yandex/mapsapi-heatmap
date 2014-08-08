/**
 * @fileOverview Модуль, позволяющий наносить слой тепловой карты.
 */
ymaps.modules.define('visualization.Heatmap', [
    'option.Manager',
    'Layer',
    'visualization.heatmap.component.TileUrlsGenerator'
], function (
    provide,
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
        var self = this;

        this._layer = new Layer('', {
            tileTransparent: true
        });

        this.options = new OptionManager(options);
        this.options.events.add('change', function () {
            self._setTileUrlsGenerator();
        });

        this.setPoints(points);

        return this;
    };

    /**
     * Установка точек, которые будут нанесены на карту.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.setPoints = function (points) {
        this._points = points;
        this._setTileUrlsGenerator();

        return this;
    };

    /**
     * Задает карту, на которой должна отобразиться тепловая карта.
     *
     * @param {Map} map.
     * @returns {Heatmap}
     */
    Heatmap.prototype.setMap = function (map) {
        if (this._map && this._map !== map) {
            this._map.layers.remove(this._layer);
        }
        this._map = map;
        this._map.layers.add(this._layer);

        return this;
    };

    /**
     * Устанавливает для слоя тепловой карты метод getTileUrl
     * исходя из текущих параметров.
     * Перегенерируя весь слой.
     *
     * @param {Map} map.
     * @returns {Heatmap}
     */
    Heatmap.prototype._setTileUrlsGenerator = function () {
        var tileUrlsGenerator = new HeatmapTileUrlsGenerator(
            this._layer,
            this._points,
            this.options.getAll()
        );
        this._layer.getTileUrl = tileUrlsGenerator.getTileUrl.bind(
            tileUrlsGenerator
        );

        this._layer.update();

        return this;
    };

    provide(Heatmap);
});

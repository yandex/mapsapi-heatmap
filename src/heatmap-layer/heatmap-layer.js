/**
 * @fileOverview Модуль, позволяющий наносить слой тепловой карты.
 */
ymaps.modules.define('visualization.HeatmapLayer', [
    'Layer',
    'visualization.Heatmap',
    'projection.wgs84Mercator'
], function (
    provide,
    Layer,
    Heatmap,
    projection
) {
    /**
     * Конструктор слоя тепловой карты.
     *
     * @param {Array} data Массив точек в географический координатах.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  radius - радиус точки;
     *  blur - радиус размытия вокруг точки, на тепловой карте;
     *  gradient - объект задающий градиент.
     */
    var HeatmapLayer = function (data, options) {
        options = options || {};
        // Размер tile'ов.
        options.width = 256;
        options.height = 256;

        this._heatmap = new Heatmap(options);

        this._data = data;

        this._layer = new Layer('', {
            tileTransparent: true
        });

        this._layer.getTileUrl = this._getTileUrl.bind(this);
    };

    /**
     * Возвращает ссылку на текущую карту.
     *
     * @returns {Map} map Карта.
     */
    HeatmapLayer.prototype.getMap = function () {
        return this._map || null;
    };

    /**
     * Задает карту, на которой должен отобразиться слой тепловой карты.
     *
     * @param {Map} map Карта.
     */
    HeatmapLayer.prototype.setMap = function (map) {
        if (this._map && this._map !== map) {
            this._map.layers.remove(this._layer);
        }
        if (map) {
            this._map = map;
            this._map.layers.add(this._layer);
        }
    };

    /**
     * Возвращает массив точек в глобальных координатах для zoom'а.
     * Для каждого zoom'а данные кэшируются.
     *
     * @returns {Array} Массив точек в глобальных координатах.
     */
    HeatmapLayer.prototype._getData = function (zoom) {
        this._dataPerZoom = this._dataPerZoom || {};

        if (!this._dataPerZoom[zoom]) {
            this._dataPerZoom[zoom] = this._data.map(function (point) {
                return projection.toGlobalPixels(point, zoom);
            });
        }
        return this._dataPerZoom[zoom];
    };

    /**
     * Возвращает URL тайла по его номеру и уровню масштабирования.
     *
     * @param {Array} tileNumber Номер тайла [x, y].
     * @param {Number} zoom Зум тайла.
     * @returns {String} dataUrl.
     */
    HeatmapLayer.prototype._getTileUrl = function (tileNumber, zoom) {
        var layer = this._layer;
        var tileBounds = layer.numberToClientBounds(tileNumber, zoom);
        var data = this._getData(zoom)
            .map(function (point) {
                point = layer.toClientPixels(point);
                return [point[0] - tileBounds[0][0], point[1] - tileBounds[0][1]];
            });
        this._heatmap.setData(data)
        return this._heatmap.getDataURL();
    };

    provide(HeatmapLayer);
});

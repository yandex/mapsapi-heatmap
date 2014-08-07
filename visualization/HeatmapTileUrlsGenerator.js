/**
 * @fileOverview Модуль, позволяющий генерировать тайлы для тепловой карты.
 */
ymaps.modules.define('visualization.HeatmapTileUrlsGenerator', [
    'visualization.Heatmap',
    'projection.wgs84Mercator',
    'util.extend'
], function (
    provide,
    Heatmap,
    projection,
    extend
) {
    /**
     * Конструктов генератора.
     *
     * @param {Layer} layer Слой тепловой карты.
     * @param {Array} points Массив точек в географический координатах.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointOpaicty - прозрачность точки;
     *  gradient - объект задающий градиент.
     */
    var HeatmapTileUrlsGenerator = function (layer, points, options) {
        options = extend(options || {}, {
            width: 256,
            height: 256
        });
        this._heatmap = new Heatmap(options);

        this._points = points || [];

        this._layer = layer;
    };

    /**
     * Возвращает URL тайла по его номеру и уровню масштабирования.
     *
     * @param {Array} tileNumber Номер тайла [x, y].
     * @param {Number} zoom Зум тайла.
     * @returns {String} dataUrl.
     */
    HeatmapTileUrlsGenerator.prototype.getTileUrl = function (tileNumber, zoom) {
        var layer = this._layer,
            tileBounds = layer.numberToClientBounds(tileNumber, zoom),
            points = this._getPoints(zoom);

        points = points.map(function (point) {
            point = layer.toClientPixels(point);
            return [
                point[0] - tileBounds[0][0],
                point[1] - tileBounds[0][1]
            ];
        });
        this._heatmap.setPoints(points);

        return this._heatmap.getDataURL();
    };

    /**
     * Возвращает массив точек в глобальных координатах для zoom'а.
     * Для каждого zoom'а данные кэшируются.
     *
     * @returns {Array} Массив точек в глобальных координатах.
     */
    HeatmapTileUrlsGenerator.prototype._getPoints = function (zoom) {
        this._pointsPerZoom = this._pointsPerZoom || {};

        if (!this._pointsPerZoom[zoom]) {
            this._pointsPerZoom[zoom] = this._points.map(function (point) {
                return projection.toGlobalPixels(point, zoom);
            });
        }
        return this._pointsPerZoom[zoom];
    };

    provide(HeatmapTileUrlsGenerator);
});

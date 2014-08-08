/**
 * @fileOverview Модуль, позволяющий генерировать тайлы для тепловой карты.
 */
ymaps.modules.define('visualization.heatmap.component.TileUrlsGenerator', [
    'projection.wgs84Mercator',
    'visualization.heatmap.component.Canvas'
], function (
    provide,
    projection,
    HeatmapCanvas
) {
    /**
     * Конструктов генератора url тайлов тепловой карты.
     *
     * @param {Layer} layer Слой тепловой карты.
     * @param {Array} points Массив точек в географический координатах.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  opacity - прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointGradient - объект задающий градиент.
     */
    var TileUrlsGenerator = function (layer, points, options) {
        this._points = points || [];
        this._layer = layer;
        this._heatmapCanvas = new HeatmapCanvas(256, 256, options);

        this._cache = [];
    };

    /**
     * Возвращает URL тайла по его номеру и уровню масштабирования.
     *
     * @param {Array} tileNumber Номер тайла [x, y].
     * @param {Number} zoom Зум тайла.
     * @returns {String} dataUrl.
     */
    TileUrlsGenerator.prototype.getTileUrl = function (tileNumber, zoom) {
        var cacheKey = tileNumber[0] + '-' + tileNumber[1] + '-' + zoom;
        if (this._cache[cacheKey]) {
            return this._cache[cacheKey];
        }

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
        this._heatmapCanvas.setPoints(points);

        this._cache[cacheKey] = this._heatmapCanvas.getDataURL();
        return this._cache[cacheKey];
    };

    /**
     * Возвращает массив точек в глобальных координатах для zoom'а.
     * Для каждого zoom'а данные кэшируются.
     *
     * @returns {Array} Массив точек в глобальных координатах.
     */
    TileUrlsGenerator.prototype._getPoints = function (zoom) {
        this._pointsPerZoom = this._pointsPerZoom || {};

        if (!this._pointsPerZoom[zoom]) {
            this._pointsPerZoom[zoom] = this._points.map(function (point) {
                return projection.toGlobalPixels(point, zoom);
            });
        }
        return this._pointsPerZoom[zoom];
    };

    provide(TileUrlsGenerator);
});

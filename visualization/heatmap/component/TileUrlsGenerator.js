/**
 * @fileOverview Модуль, позволяющий генерировать тайлы для тепловой карты.
 */
ymaps.modules.define('visualization.heatmap.component.TileUrlsGenerator', [
    'util.math.areEqual',
    'projection.wgs84Mercator',
    'visualization.heatmap.component.Canvas'
], function (
    provide,
    areEqual,
    projection,
    HeatmapCanvas
) {
    /**
     * Рзамер тайла карты.
     */
    var TILE_SIZE = [256, 256];

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
        this._layer = layer;

        this._points = JSON.parse(JSON.stringify(points || []));
        for (var i = 0, length = this._points.length; i < length; i++) {
            this._points[i] = projection.toGlobalPixels(this._points[i], 0);
        }

        this._heatmapCanvas = new HeatmapCanvas(TILE_SIZE[0], TILE_SIZE[1], options);
        this.options = this._heatmapCanvas.options;
    };

    /**
     * Получение позиции точки.
     *
     * @param {Array} point Точка.
     * @param {Number} index Индекс данной точки внутри this._points.
     */
    TileUrlsGenerator.prototype.getIndexOfPoint = function (point) {
        point = projection.toGlobalPixels(point, 0);
        for (var i = 0, length = this._points.length; i < length; i++) {
            if (areEqual(this._points[i], point)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Добавления новой точки.
     *
     * @param {Number} index Позиция (внутри this._points), на которую необходимо добавить точку.
     * @param {Array} point Точка.
     * @returns {TileUrlsGenerator}
     */
    TileUrlsGenerator.prototype.addPointToIndex = function (index, point) {
        point = projection.toGlobalPixels(point, 0);
        if (index || index === 0) {
            this._points[index] = point;
        } else {
            this._points.push(point);
        }
        return this;
    };

    /**
     * Удаление точки.
     *
     * @param {Number} index Позиция (внутри this._points), где находится точка,
     * которую надо удалить.
     * @returns {TileUrlsGenerator}
     */
    TileUrlsGenerator.prototype.removePointFromIndex = function (index) {
        if (this._points[index]) {
            this._points.splice(index, 1);
        }
        return this;
    };

    /**
     * Возвращает URL тайла по его номеру и уровню масштабирования.
     *
     * @param {Array} tileNumber Номер тайла [x, y].
     * @param {Number} zoom Зум тайла.
     * @returns {String} dataUrl.
     */
    TileUrlsGenerator.prototype.getTileUrl = function (tileNumber, zoom) {
        var tileBounds = [
                [
                    tileNumber[0] * TILE_SIZE[0],
                    tileNumber[1] * TILE_SIZE[1]
                ], [
                    (tileNumber[0] + 1) * TILE_SIZE[0],
                    (tileNumber[1] + 1) * TILE_SIZE[1]
                ]
            ],
            tileMargin = this._heatmapCanvas.getBrushRadius(),

            zoomFactor = Math.pow(2, zoom),
            points = [];

        for (var i = 0, length = this._points.length, point; i < length; i++) {
            point = [
                zoomFactor * this._points[i][0],
                zoomFactor * this._points[i][1],
            ];
            if (this._isPointInBounds(point, tileBounds, tileMargin)) {
                points.push([
                    point[0] - tileBounds[0][0],
                    point[1] - tileBounds[0][1]
                ]);
            }
        }
        this._heatmapCanvas.setPoints(points);

        return this._heatmapCanvas.getDataURL();
    };

    /**
     * Проверка попадаения точки в границы карты.
     *
     * @param {Array} point Точка point[0] = x, point[1] = y.
     * @param {Array} bounds Область, в которую попадание проверяется.
     * @param {Number} margin Необязательный параметр, если нужно расширисть bounds.
     * @returns {Boolean} True - попадает.
     */
    TileUrlsGenerator.prototype._isPointInBounds = function (point, bounds, margin) {
        return (point[0] >= bounds[0][0] - margin) &&
            (point[0] <= bounds[1][0] + margin) &&
            (point[1] >= bounds[0][1] - margin) &&
            (point[1] <= bounds[1][1] + margin);
    };

    provide(TileUrlsGenerator);
});

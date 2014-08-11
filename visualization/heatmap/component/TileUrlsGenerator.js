/**
 * Модуль для генерации тайлов тепловой карты.
 * @module visualization.heatmap.component.TileUrlsGenerator
 * @requires util.math.areEqual
 * @requires projection.wgs84Mercator
 * @requires visualization.heatmap.component.Canvas
 *
 * @author Morozov Andrew <alt-j@yandex-team.ru>
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
     * @public
     * @function TileUrlsGenerator
     * @description Конструктов генератора url тайлов тепловой карты.
     *
     * @param {Layer} layer Слой тепловой карты.
     * @param {Array} points Массив точек в географический координатах.
     * @param {option.Manager} optionManager Менеджер с опциями отображения тепловой карты:
     *  opacity - прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointGradient - объект задающий градиент.
     */
    var TileUrlsGenerator = function (layer, points, optionManager) {
        this._layer = layer;

        this._points = [];
        if (points) {
            this.addPoints(points);
        }

        this._heatmapCanvas = new HeatmapCanvas(TILE_SIZE[0], TILE_SIZE[1], optionManager);
    };

    /**
     * @public
     * @function addPoints
     * @description Добавляет точки, которые будут нанесены на карту.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {TileUrlsGenerator}
     */
    TileUrlsGenerator.prototype.addPoints = function (points) {
        for (var i = 0, length = points.length, point; i < length; i++) {
            point = projection.toGlobalPixels(points[i], 0);
            this._points.push(point);
        }
        return this;
    };

    /**
     * @public
     * @function removePoints
     * @description Удаляет точки, которые не должны быть отображены на карте.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {TileUrlsGenerator}
     */
    TileUrlsGenerator.prototype.removePoints = function (points) {
        for (var i = 0, length = points.length, index; i < length; i++) {
            index = this._getIndexOfPoint(points[i]);
            while (index !== -1) {
                this._points.splice(index, 1);
                index = this._getIndexOfPoint(points[i]);
            }
        }
        return this;
    };

    /**
     * @public
     * @function getTileUrl
     * @description Возвращает URL тайла по его номеру и уровню масштабирования.
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

        return this._heatmapCanvas.getDataURLHeatmap(points);
    };

    /**
     * @private
     * @function _getIndexOfPoint
     * @description Получение позиции точки.
     *
     * @param {Array} point Точка в географических координатах.
     * @param {Number} index Индекс данной точки внутри this._points.
     */
    TileUrlsGenerator.prototype._getIndexOfPoint = function (point) {
        point = projection.toGlobalPixels(point, 0);
        for (var i = 0, length = this._points.length; i < length; i++) {
            if (areEqual(this._points[i], point)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * @private
     * @function _isPointInBounds
     * @description Проверка попадаения точки в границы карты.
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

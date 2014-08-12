/**
 * Модуль для генерации тайлов тепловой карты.
 * @module visualization.heatmap.component.TileUrlsGenerator
 * @requires util.math.areEqual
 * @requires option.Manager
 * @requires visualization.heatmap.component.Canvas
 */
ymaps.modules.define('visualization.heatmap.component.TileUrlsGenerator', [
    'util.math.areEqual',
    'option.Manager',
    'visualization.heatmap.component.Canvas'
], function (
    provide,
    areEqual,
    OptionManager,
    HeatmapCanvas
) {
    /**
     * Размер тайла карты.
     */
    var TILE_SIZE = [256, 256];

    /**
     * @public
     * @function TileUrlsGenerator
     * @description Конструктор генератора url тайлов тепловой карты.
     *
     * @param {Layer} layer Слой тепловой карты.
     * @param {Array} points Массив точек в географических координатах.
     */
    var TileUrlsGenerator = function (layer, points) {
        this._layer = layer;
        this._projection = this._layer.options.get('projection');

        this._points = [];
        if (points) {
            this.addPoints(points);
        }

        this._canvas = new HeatmapCanvas(TILE_SIZE);

        this.options = new OptionManager({});
        this._canvas.options.setParent(this.options);
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
            point = this._projection.toGlobalPixels(points[i], 0);
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
            if (index !== -1) {
                this._points.splice(index, 1);
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
            tileMargin = this._canvas.getBrushRadius(),

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

        return this._canvas.generateDataURLHeatmap(points);
    };

    /**
     * @public
     * @function destroy
     * @description Уничтожает внутренние данные генератора.
     */
    TileUrlsGenerator.prototype.destroy = function () {
        this._canvas.destroy();
        this._canvas = {};

        this.options.unsetAll();
        this.options = {};

        this._projection = {};
        this._layer = {};
        this._points = [];
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
        point = this._projection.toGlobalPixels(point, 0);
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

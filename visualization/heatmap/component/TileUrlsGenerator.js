/**
 * Модуль для генерации тайлов тепловой карты.
 * @module visualization.heatmap.component.TileUrlsGenerator
 * @requires option.Manager
 * @requires visualization.heatmap.component.Canvas
 */
ymaps.modules.define('visualization.heatmap.component.TileUrlsGenerator', [
    'option.Manager',
    'visualization.heatmap.component.Canvas'
], function (
    provide,
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
     * @param {IProjection} projection Проекция.
     * @param {Object[]} points Массив точек в географических координатах.
     */
    var TileUrlsGenerator = function (projection, points) {
        this._projection = projection;

        this._canvas = new HeatmapCanvas(TILE_SIZE);
        this.options = new OptionManager({});
        this._canvas.options.setParent(this.options);

        this.setPoints(points || []);
    };

    /**
     * @public
     * @function setPoints
     * @description Устанавливает точки, которые будут нанесены на карту.
     *
     * @param {Object[]} points Массив точек в географических координатах.
     * @returns {TileUrlsGenerator}
     */
    TileUrlsGenerator.prototype.setPoints = function (points) {
        this._points = [];

        var weights = [];
        for (var i = 0, length = points.length; i < length; i++) {
            this._points.push({
                coordinates: this._projection.toGlobalPixels(points[i].coordinates, 0),
                weight: points[i].weight
            });
            weights.push(points[i].weight);
        }
        this._canvas.options.set('medianaOfWeights', findMediana(weights));

        return this;
    };

    /**
     * @public
     * @function getPoints
     * @description Отдает точки в географических координатах.
     *
     * @returns {Object[]} points Массив точек в географических координатах.
     */
    TileUrlsGenerator.prototype.getPoints = function () {
        var points = [];
        for (var i = 0, length = this._points.length; i < length; i++) {
            points.push({
                coordinates: this._projection.fromGlobalPixels(this._points[i].coordinates, 0),
                weight: this._points[i].weight
            });
        }
        return points;
    };

    /**
     * @public
     * @function getTileUrl
     * @description Возвращает URL тайла по его номеру и уровню масштабирования.
     *
     * @param {Number[]} tileNumber Номер тайла [x, y].
     * @param {Number} zoom Зум тайла.
     * @returns {String} dataUrl.
     */
    TileUrlsGenerator.prototype.getTileUrl = function (tileNumber, zoom) {
        if (
            this.options.get('dissipating') &&
            this._canvas.options.get('radiusFactor') != zoom
        ) {
            this._canvas.options.set('radiusFactor', zoom / 10);
        }
        var zoomFactor = Math.pow(2, zoom),

            tileBounds = [[
                tileNumber[0] * TILE_SIZE[0] / zoomFactor,
                tileNumber[1] * TILE_SIZE[1] / zoomFactor
            ], [
                (tileNumber[0] + 1) * TILE_SIZE[0] / zoomFactor,
                (tileNumber[1] + 1) * TILE_SIZE[1] / zoomFactor
            ]],
            tileMargin = this._canvas.getBrushRadius(),

            points = [];
        for (var i = 0, length = this._points.length, point; i < length; i++) {
            point = this._points[i].coordinates;
            if (this._contains(tileBounds, point, tileMargin)) {
                points.push({
                    coordinates: [
                        (point[0] - tileBounds[0][0]) * zoomFactor,
                        (point[1] - tileBounds[0][1]) * zoomFactor
                    ],
                    weight: this._points[i].weight
                });
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
        this._canvas = null;

        this._projection = null;
    };

    /**
     * @private
     * @function _isPointInBounds
     * @description Проверка попадаения точки в границы карты.
     *
     * @param {Number[][]} bounds Область, в которую попадание проверяется.
     * @param {Number[]} point Точка в географических координатах.
     * @param {Number} margin Необязательный параметр, если нужно расширисть bounds.
     * @returns {Boolean} True - попадает.
     */
    TileUrlsGenerator.prototype._contains = function (bounds, point, margin) {
        return (point[0] >= bounds[0][0] - margin) &&
            (point[0] <= bounds[1][0] + margin) &&
            (point[1] >= bounds[0][1] - margin) &&
            (point[1] <= bounds[1][1] + margin);
    };

    /**
     * @function findMediana
     * @description Ищет медиану в переданной выборке.
     */
    function findMediana (selection) {
        var sortSelection = selection.sort(comparator),
            center = sortSelection.length / 2;
        if (center !== Math.floor(center)) {
            return sortSelection[Math.floor(center)];
        } else {
            return (sortSelection[center - 1] + sortSelection[center]) / 2;
        }
    }

    /**
     * @function comparator
     * @description Сравнивает два числа.
     */
    function comparator (a, b) {
        return a - b;
    }

    provide(TileUrlsGenerator);
});

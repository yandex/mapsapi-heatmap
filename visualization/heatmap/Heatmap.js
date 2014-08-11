/**
 * Модуль для нанесения слоя тепловой карты.
 * @module visualization.Heatmap
 * @requires util.math.areEqual
 * @requires option.Manage
 * @requires Layer
 * @requires visualization.heatmap.component.TileUrlsGenerator
 *
 * @author Morozov Andrew <alt-j@yandex-team.ru>
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
     * @public
     * @function Heatmap
     * @description Конструктор тепловой карты.
     *
     * @param {Array} points Массив точек в географический координатах.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  opacity - прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointGradient - объект задающий градиент.
     */
    var Heatmap = function (points, options) {
        // Поскольку слой будет создан только после setMap, до установки карты
        // точки будут хранится во временном хранилище.
        this._temporary = { points: [] };
        if (points) {
            this.addPoints(points);
        }

        this.options = new OptionManager(options);
        this.options.events.add('change', this._onOptionsChange.bind(this));
    };

    /**
     * @public
     * @function addPoints
     * @description Добавляет точки, которые будут нанесены на карту.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.addPoints = function (points) {
        if (this._tileUrlsGenerator) {
            this._tileUrlsGenerator.addPoints(points);
            this._layer.update();
        } else {
            for (var i = 0, length = points.length; i < length; i++) {
                this._temporary.points.push(points[i]);
            }
        }
        return this;
    };

    /**
     * @public
     * @function removePoints
     * @description Удаляет точки, которые не должны быть отображены на карте.
     *
     * @param {Array} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {Heatmap}
     */
    Heatmap.prototype.removePoints = function (points) {
        if (this._tileUrlsGenerator) {
            this._tileUrlsGenerator.removePoints(points);
            this._layer.update();
        } else {
            for (var i = 0, length = points.length, index; i < length; i++) {
                index = this._getIndexOfPoint(points[i]);
                while (index !== -1) {
                    this._temporary.points.splice(index, 1);
                    index = this._getIndexOfPoint(points[i]);
                }
            }
        }
        return this;
    };

    /**
     * @public
     * @function setMap
     * @description Устанавливает карту, на которой должна отобразиться тепловая карта.
     *
     * @param {Map} map Инстанция ymaps.Map, на которую будет добавлен слой тепловой карты.
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
     * @private
     * @function _onOptionsChange
     * @description Обработчик изменений опций тепловой карты.
     */
    Heatmap.prototype._onOptionsChange = function () {
        if (this._tileUrlsGenerator) {
            var options = this.options.getAll();
            this._tileUrlsGenerator.options.set(options);

            this._layer.update();
        }
    };

    /**
     * @private
     * @function _getIndexOfPoint
     * @description Получение позиции точки во временном хранилище.
     *
     * @param {Array} point Точка.
     * @param {Number} index Индекс данной точки внутри this._temporary.points.
     */
    Heatmap.prototype._getIndexOfPoint = function (point) {
        if (!this._temporary || !this._temporary.points) {
            return -1;
        }
        for (var i = 0, length = this._temporary.points.length; i < length; i++) {
            if (areEqual(this._temporary.points[i], point)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * @private
     * @function _createLayer
     * @description Создание слоя, в котором будет размещена тепловая карта.
     *
     * @returns {Heatmap}
     */
    Heatmap.prototype._createLayer = function () {
        this._layer = new Layer('', { tileTransparent: true });
        this._tileUrlsGenerator = new HeatmapTileUrlsGenerator(
            this._layer,
            this._temporary.points,
            this.options.getAll()
        );
        this._layer.getTileUrl = this._tileUrlsGenerator
            .getTileUrl
            .bind(this._tileUrlsGenerator);

        this._temporary = null;

        return this;
    };

    provide(Heatmap);
});

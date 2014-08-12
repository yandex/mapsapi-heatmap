/**
 * Модуль для нанесения слоя тепловой карты.
 * @module visualization.Heatmap
 * @requires util.math.areEqual
 * @requires geoQuery
 * @requires option.Manager
 * @requires Monitor
 * @requires Layer
 * @requires visualization.heatmap.component.TileUrlsGenerator
 */
ymaps.modules.define('visualization.Heatmap', [
    'util.math.areEqual',
    'geoQuery',
    'option.Manager',
    'Monitor',
    'Layer',
    'visualization.heatmap.component.TileUrlsGenerator'
], function (
    provide,
    areEqual,
    geoQuery,
    OptionManager,
    Monitor,
    Layer,
    TileUrlsGenerator
) {
    /**
     * @public
     * @function Heatmap
     * @description Конструктор тепловой карты.
     *
     * @param {Object} data Источник геообъектов.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки на тепловой карте;
     *  opacity - прозрачность карты;
     *  gradient - объект, задающий градиент.
     */
    var Heatmap = function (data, options) {
        this._geoObjects = [];
        this.addData(data);

        this.options = new OptionManager(options);
    };

    /**
     * @public
     * @function addData
     * @description Добавляет данные (точки), которые будут нанесены
     * на карту. Если слой уже отрисован, то любые последующие манипуляции с
     * данными приводят к его перерисовке.
     *
     * @param {Object} data Источник геообъектов.
     * @returns {Heatmap}
     */
    Heatmap.prototype.addData = function (data) {
        var iterator = geoQuery(data).getIterator(),
            points = [],

            geoObject;
        while ((geoObject = iterator.getNext()) !== iterator.STOP_ITERATION) {
            if (
                this._geoObjects.indexOf(geoObject) === -1 &&
                geoObject.geometry.getType() === 'Point'
            ) {
                this._geoObjects.push(geoObject);
                points.push(geoObject.geometry.getCoordinates());
            }
        }
        if (this._tileUrlsGenerator && points.length > 0) {
            this._tileUrlsGenerator
                .addPoints(points);
            this._refresh();
        }
        return this;
    };

    /**
     * @public
     * @function removeData
     * @description Удаляет данные (точки), которые не должны быть
     * отображены на карте. Если слой уже отрисован, то любые последующие
     * манипуляции с данными приводят к его перерисовке.
     *
     * @param {Object} data Источник геообъектов.
     * @returns {Heatmap}
     */
    Heatmap.prototype.removeData = function (data) {
        var iterator = geoQuery(data).getIterator(),
            points = [],

            geoObject,
            indexOfGeoObject;
        while ((geoObject = iterator.getNext()) !== iterator.STOP_ITERATION) {
            indexOfGeoObject = this._geoObjects.indexOf(geoObject);
            if (
                indexOfGeoObject !== -1 &&
                geoObject.geometry.getType() === 'Point'
            ) {
                this._geoObjects.splice(indexOfGeoObject, 1);
                points.push(geoObject.geometry.getCoordinates());
            }
        }
        if (this._tileUrlsGenerator && points.length > 0) {
            this._tileUrlsGenerator
                .removePoints(points);
            this._refresh();
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
        if (this._map !== map) {
            if (this._layer) {
                this._map.layers.remove(this._layer);
                this._destroyLayer();
            }
            this._map = map;
            if (map) {
                this._setupLayer();
                this._map.layers.add(this._layer);
            }
        }
        return this;
    };

    /**
     * @public
     * @function destroy
     * @description Уничтожает внутренние данные слоя тепловой карты.
     */
    Heatmap.prototype.destroy = function () {
        this.setMap(null);
        this._geoObjects = [];

        this.options.unsetAll();
        this.options = {};
    };

    /**
     * @private
     * @function _refresh
     * @description Перегенерирует слой тепловой карты.
     *
     * @returns {Monitor} Монитор опций.
     */
    Heatmap.prototype._refresh = function () {
        if (this._layer) {
            this._layer.update();
        }
        return this;
    };

    /**
     * @private
     * @function _setupLayer
     * @description Установка слоя, в котором будет размещена тепловая карта.
     *
     * @returns {Layer} Слой тепловой карты.
     */
    Heatmap.prototype._setupLayer = function () {
        this._layer = new Layer('', {
            projection: this._map.options.get('projection'),
            tileTransparent: true
        });

        this._setupTileUrlsGenerator();
        this._setupOptionMonitor();

        var getTileUrl = this._tileUrlsGenerator.getTileUrl.bind(this._tileUrlsGenerator);
        this._layer.getTileUrl = getTileUrl;

        return this._layer;
    };

    /**
     * @private
     * @function _destroyLayer
     * @description Уничтожает this._layer.
     */
    Heatmap.prototype._destroyLayer = function () {
        this._destroyOptionMonitor();
        this._destroyTileUrlsGenerator();
        this._layer = null;
    };

    /**
     * @private
     * @function _setupTileUrlsGenerator
     * @description Устанавливает генератор для тайлов тепловой карты.
     *
     * @returns {TileUrlsGenerator} Генератор тайлов.
     */
    Heatmap.prototype._setupTileUrlsGenerator = function () {
        var points = [];
        for (var i = 0, length = this._geoObjects.length; i < length; i++) {
            points.push(this._geoObjects[i].geometry.getCoordinates());
        }
        this._tileUrlsGenerator = new TileUrlsGenerator(this._layer, points);

        this._tileUrlsGenerator.options.setParent(this.options);

        return this._tileUrlsGenerator;
    };

    /**
     * @private
     * @function _destroyTileUrlsGenerator
     * @description Уничтожает this._tileUrlsGenerator.
     */
    Heatmap.prototype._destroyTileUrlsGenerator = function () {
        this._tileUrlsGenerator.destroy();
        this._tileUrlsGenerator = null;
    };

    /**
     * @private
     * @function _setupOptionMonitor
     * @description Устанавливает монитор на опции тепловой карты.
     *
     * @returns {Monitor} Монитор опций.
     */
    Heatmap.prototype._setupOptionMonitor = function () {
        this._optionMonitor = new Monitor(this.options);

        return this._optionMonitor.add(
            ['pointRadius', 'pointBlur', 'opacity', 'gradient'],
            this._refresh,
            this
        );
    };

    /**
     * @private
     * @function _destroyOptionMonitor
     * @description Уничтожает this._optionMonitor.
     */
    Heatmap.prototype._destroyOptionMonitor = function () {
        this._optionMonitor.removeAll();
        this._optionMonitor = {};
    };

    provide(Heatmap);
});

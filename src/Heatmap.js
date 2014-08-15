/**
 * Модуль для нанесения слоя тепловой карты.
 * @module Heatmap
 * @requires option.Manager
 * @requires Monitor
 * @requires Layer
 * @requires heatmap.component.dataConverter
 * @requires heatmap.component.TileUrlsGenerator
 */
ymaps.modules.define('Heatmap', [
    'option.Manager',
    'Monitor',
    'Layer',
    'heatmap.component.dataConverter',
    'heatmap.component.TileUrlsGenerator'
], function (
    provide,
    OptionManager,
    Monitor,
    Layer,
    dataConverter,
    TileUrlsGenerator
) {
    /**
     * @public
     * @function Heatmap
     * @description Конструктор тепловой карты.
     *
     * @param {Object} data Точки в одном из форматов:
     *  IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  radius - радиус влияния (в пикселях) для каждой точки данных;
     *  dissipating - указывает, следует ли рассредоточивать данные тепловой карты при
     *  уменьшении масштаба, если указано true, то радиус точки для n'го масштаба будет
     *  равен (radius * zoom / 10). По умолчанию опция отключена.
     *  opacity - прозрачность карты;
     *  intensityOfMidpoint - интенсивность медианной (по весу) точки;
     *  gradient - объект, задающий градиент.
     */
    var Heatmap = function (data, options) {
        this._unprocessedPoints = [];
        if (data) {
            this.setData(data);
        }

        this.options = new OptionManager(options);
    };

    /**
     * @public
     * @function getData
     * @description Отдает ссылку на объект данных, который был передан
     *  в конструктор или в метод setData.
     * @returns {Object|null}
     */
    Heatmap.prototype.getData = function () {
        return this._data || null;
    };

    /**
     * @public
     * @function setData
     * @description Устанавливает данные (точки), которые будут нанесены
     *  на карту. Если слой уже отрисован, то любые последующие манипуляции с
     *  данными приводят к его перерисовке.
     *
     * @param {Object} data Точки в одном из форматов:
     * IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @returns {Heatmap}
     */
    Heatmap.prototype.setData = function (data) {
        this._data = data;

        var points = dataConverter.convert(data);
        if (this._tileUrlsGenerator) {
            this._tileUrlsGenerator.setPoints(points);
            this._refresh();
        } else {
            this._unprocessedPoints = points;
        }
        return this;
    };

    /**
     * @public
     * @function setMap
     * @description Получение текущей карты, на которой отображена тепловая карта.
     *
     * @returns {Map} map Инстанция ymaps.Map.
     */
    Heatmap.prototype.getMap = function () {
        return this._map;
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
        if (this._map != map) {
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
        this._data = null;
        this.setMap(null);
    };

    /**
     * @private
     * @function _refresh
     * @description Перегенерирует слой тепловой карты.
     *
     * @returns {Heatmap}
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
        this._setupTileUrlsGenerator();
        var getTileUrl = this._tileUrlsGenerator.getTileUrl.bind(this._tileUrlsGenerator);

        this._layer = new Layer(getTileUrl, { tileTransparent: true });
        this._setupOptionMonitor();

        return this._layer;
    };

    /**
     * @private
     * @function _destroyLayer
     * @description Уничтожает this._layer.
     */
    Heatmap.prototype._destroyLayer = function () {
        this._destroyTileUrlsGenerator();
        this._destroyOptionMonitor();
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
        this._tileUrlsGenerator = new TileUrlsGenerator(
            this._map.options.get('projection'),
            this._unprocessedPoints
        );
        this._unprocessedPoints = null;

        this._tileUrlsGenerator.options.setParent(this.options);

        return this._tileUrlsGenerator;
    };

    /**
     * @private
     * @function _destroyTileUrlsGenerator
     * @description Уничтожает this._tileUrlsGenerator.
     */
    Heatmap.prototype._destroyTileUrlsGenerator = function () {
        this._unprocessedPoints = this._tileUrlsGenerator.getPoints();
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
            ['radius', 'dissipating', 'opacity', 'intensityOfMidpoint', 'gradient'],
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

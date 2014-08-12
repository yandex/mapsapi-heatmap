/**
 * Модуль для нанесения слоя тепловой карты.
 * @module visualization.Heatmap
 * @requires util.math.areEqual
 * @requires option.Manager
 * @requires Monitor
 * @requires Layer
 * @requires visualization.heatmap.component.TileUrlsGenerator
 */
ymaps.modules.define('visualization.Heatmap', [
    'util.math.areEqual',
    'option.Manager',
    'Monitor',
    'Layer',
    'visualization.heatmap.component.TileUrlsGenerator'
], function (
    provide,
    areEqual,
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
     *  pointRadius - радиус точки для 1-го зума (на n'ом zoom'е будет равен pointRadius * zoom);
     *  opacity - прозрачность карты;
     *  medianaOfGradient - медиана цвета, которая должна быть среди точек на карте
     *  (значение от 0 до 1 - уровень в gradient'е).
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
     * @function setData
     * @description Добавляет данные (точки), которые будут нанесены
     * на карту. Если слой уже отрисован, то любые последующие манипуляции с
     * данными приводят к его перерисовке.
     *
     * @param {Object} data Источник геообъектов.
     * @returns {Heatmap}
     */
    Heatmap.prototype.setData = function (data) {
        var points = this._convertDataToPointsArray(data);

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
        this.setMap(null);
    };

    /**
     * @private
     * @function _convertDataToPointsArray
     * @description Создает массив взвешенных точек из входящих данных.
     *
     * @param {Object} data Точки в одном из форматов:
     * IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @returns {Array} points Массив взвешенных точек.
     */
    Heatmap.prototype._convertDataToPointsArray = function (data) {
        var points = [];

        if (typeof object == 'string') {
            data = JSON.parse(data);
        }

        if (this._isGeoQueryResult(data)) {
            points = this._convertGeoQueryResultToPoints(data);
        } else if (this._isJsonFeature(data) && data.geometry.type == 'Point') {
            points = this._convertJsonFeatureToPoint(data);
        } else if (this._isJsonFeatureCollection(data)) {
            for (var i = 0, l = data.features.length; i < l; i++) {
                points = points.concat(this._convertDataToPointsArray(data.features[i]));
            }
        } else {
            data = [].concat(data);
            for (var i = 0, l = data.length, item; i < l; i++) {
                item = data[i];
                if (this._isCoordinates(item)) {
                    points.push(this._convertCoordinatesToPoint(item));
                } else if (this._isJsonGeometry(item)) {
                    points.push(this._convertCoordinatesToPoint(item.coordinates));
                } else if (this._isGeoObject(item) && item.geometry.getType() == 'Point') {
                    points.push(this._convertGeoObjectToPoint(item));
                } else if (this._isCollection(item)) {
                    var iterator = item.getIterator(),
                        geoObject;
                    while ((geoObject = iterator.getNext()) != iterator.STOP_ITERATION) {
                        // Выполняем рекурсивно на случай вложенных коллекций.
                        points = points.concat(
                            this._convertDataToPointsArray(geoObject)
                        );
                    }
                }
            }
        }
        return points;
    };

    /**
     * @private
     * @function _isGeoQueryResult
     * @description Проверяет является ли переданный объект GeoQueryResult'ом.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isGeoQueryResult = function (object) {
        return !!object.then && !!object.getIterator;
    };

    /**
     * @private
     * @function _convertGeoQueryResultToPoints
     * @description Конвертирует geoQueryResult в массив взвешенных точек.
     *
     * @param {GeoQueryResult} geoQueryResult Объект с точками.
     * @returns {Array} points Массив взвешенных точек.
     */
    Heatmap.prototype._convertGeoQueryResultToPoints = function (geoQueryResult) {
        var points = [],
            iterator = geoQueryResult.getIterator(),
            geoObject;
        while ((geoObject = iterator.getNext()) != iterator.STOP_ITERATION) {
            if (geoObject.geometry.getType() == 'Point') {
                points.push({
                    coordinates: geoObject.geometry.getCoordinates(),
                    weight: geoObject.properties.get('weight') || 1
                });
            }
        }
        return points;
    };

    /**
     * @private
     * @function _isJsonFeature
     * @description Проверяет является ли переданный объект JSON-описанием сущности.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isJsonFeature = function (object) {
        return object.type == 'Feature';
    };

    /**
     * @private
     * @function _convertJsonFeatureToPoint
     * @description Конвертирует jsonFeature в взвешенную точку.
     *
     * @param {Object} jsonFeature JSON, описывающий точки.
     * @returns {Object} point Взвешенная точка.
     */
    Heatmap.prototype._convertJsonFeatureToPoint = function (jsonFeature) {
        var weight = 1;
        if (jsonFeature.properties && jsonFeature.properties.weight) {
            weight = jsonFeature.properties.weight;
        }
        return {
            coordinates: jsonFeature.geometry.coordinates,
            weight: weight
        };
    };

    /**
     * @private
     * @function _isJsonFeatureCollection
     * @description Проверяет является ли переданный объект JSON-описанием коллекции сущностей.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isJsonFeatureCollection = function (object) {
        return object.type == 'FeatureCollection';
    };

    /**
     * @private
     * @function _isCoordinates
     * @description Проверяет является ли переданный объект координатами точки ([x1, y1]).
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isCoordinates = function (object) {
        return Object.prototype.toString.call(object) == '[object Array]' &&
            typeof object[0] == 'number' &&
            typeof object[1] == 'number';
    };

    /**
     * @private
     * @function _convertCoordinatesToPoint
     * @description Конвертирует geoObject в взвешенную точку.
     *
     * @param {Number[]} coordinates Координаты точки.
     * @returns {Object} point Взвешенная точка.
     */
    Heatmap.prototype._convertCoordinatesToPoint = function (coordinates) {
        return {
            coordinates: coordinates,
            weight: 1
        };
    };

    /**
     * @private
     * @function _isJsonGeometry
     * @description Проверяет является ли переданный объект JSON-описанием геометрии.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isJsonGeometry = function (object) {
        return !!(object.type && object.coordinates);
    };

    /**
     * @private
     * @function _isGeoObject
     * @description Проверяет является ли переданный объект инстанцией геообъекта.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isGeoObject = function (object) {
        return !!object.geometry;
    };

    /**
     * @private
     * @function _convertGeoObjectToPoint
     * @description Конвертирует geoObject в взвешенную точку.
     *
     * @param {GeoObject} geoObject Объект с геометрией Point.
     * @returns {Object} point Взвешенная точка.
     */
    Heatmap.prototype._convertGeoObjectToPoint = function (geoObject) {
        return {
            coordinates: geoObject.geometry.getCoordinates(),
            weight: geoObject.properties.get('weight') || 1
        };
    };

    /**
     * @private
     * @function _isCollection
     * @description Проверяет является ли переданный объект инстанцией коллекции.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    Heatmap.prototype._isCollection = function (object) {
        return !!object.getIterator;
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
        this._layer = new Layer('', { tileTransparent: true });

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

        return this._optionMonitor.add(['pointRadius', 'opacity', 'gradient'], this._refresh, this);
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

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
     *  radius - радиус влияния (в пикселях) для каждой точки данных;
     *  dissipating - указывает, следует ли рассредоточивать данные тепловой карты при
     *  уменьшении масштаба, если указано true, то радиус точки для n'го масштаба будет
     *  равен (radius * zoom / 10). По умолачнию опция отключена.
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
     * в конструктов или в метод setData.
     * @returns {Object|null}
     */
    Heatmap.prototype.getData = function () {
        return this._data || null;
    };

    /**
     * @public
     * @function setData
     * @description Добавляет данные (точки), которые будут нанесены
     * на карту. Если слой уже отрисован, то любые последующие манипуляции с
     * данными приводят к его перерисовке.
     *
     * @param {Object} data Точки в одном из форматов:
     * IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @returns {Heatmap}
     */
    Heatmap.prototype.setData = function (data) {
        var points = this._convertDataToPointsArray(data);
        this._data = data;

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
     * @description Получение текущей карты карту, на которой отображена тепловая карта.
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

        if (isJsonFeature(data) && data.geometry.type == 'Point') {
            points.push(convertJsonFeatureToPoint(data));
        } else if (isJsonFeatureCollection(data)) {
            for (var i = 0, l = data.features.length; i < l; i++) {
                points = points.concat(this._convertDataToPointsArray(data.features[i]));
            }
        } else if (isCoordinates(data)) {
            points.push(convertCoordinatesToPoint(data));
        } else {
            var dataArray = [].concat(data);
            for (var i = 0, l = dataArray.length, item; i < l; i++) {
                item = dataArray[i];
                if (isCoordinates(item)) {
                    points.push(convertCoordinatesToPoint(item));
                } else if (isJsonGeometry(item) && item.type == 'Point') {
                    points.push(convertCoordinatesToPoint(item.coordinates));
                } else if (isGeoObject(item) && item.geometry.getType() == 'Point') {
                    points.push(convertGeoObjectToPoint(item));
                } else if (isCollection(item)) {
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

    /**
     * @function isJsonFeature
     * @description Проверяет является ли переданный объект JSON-описанием сущности.
     */
    function isJsonFeature (object) {
        return object.type == 'Feature';
    }

    /**
     * @function convertJsonFeatureToPoint
     * @description Конвертирует jsonFeature в взвешенную точку.
     */
    function convertJsonFeatureToPoint (jsonFeature) {
        var weight = 1;
        if (jsonFeature.properties && jsonFeature.properties.weight) {
            weight = jsonFeature.properties.weight;
        }
        return {
            coordinates: jsonFeature.geometry.coordinates,
            weight: weight
        };
    }

    /**
     * @function isJsonFeatureCollection
     * @description Проверяет является ли переданный объект JSON-описанием коллекции сущностей.
     */
    function isJsonFeatureCollection (object) {
        return object.type == 'FeatureCollection';
    }

    /**
     * @function isCoordinates
     * @description Проверяет является ли переданный объект координатами точки ([x1, y1]).
     */
    function isCoordinates (object) {
        return (Object.prototype.toString.call(object) == '[object Array]') &&
            (typeof object[0] == 'number') &&
            (typeof object[1] == 'number');
    }

    /**
     * @function convertCoordinatesToPoint
     * @description Конвертирует geoObject в взвешенную точку.
     */
    function convertCoordinatesToPoint (coordinates) {
        return {
            coordinates: coordinates,
            weight: 1
        };
    }

    /**
     * @function isJsonGeometry
     * @description Проверяет является ли переданный объект JSON-описанием геометрии.
     */
    function isJsonGeometry (object) {
        return !!(object.type && object.coordinates);
    }

    /**
     * @function isGeoObject
     * @description Проверяет является ли переданный объект инстанцией геообъекта.
     *
     * @param {Object} object Произвольный объект.
     * @returns {Boolean}
     */
    function isGeoObject (object) {
        return !!(object.geometry && object.getOverlay);
    }

    /**
     * @function convertGeoObjectToPoint
     * @description Конвертирует geoObject типа Point в взвешенную точку.
     */
    function convertGeoObjectToPoint (geoObject) {
        return {
            coordinates: geoObject.geometry.getCoordinates(),
            weight: geoObject.properties.get('weight') || 1
        };
    }

    /**
     * @function isCollection
     * @description Проверяет является ли переданный объект инстанцией коллекции.
     */
    function isCollection (object) {
        return !!object.getIterator;
    }

    provide(Heatmap);
});

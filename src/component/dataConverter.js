/**
 * Модуль для преобразования точек из разных форматов в массив взвешенных точек.
 * @module heatmap.component.dataConverter
 */
ymaps.modules.define('heatmap.component.dataConverter', [], function (provide) {
    var dataConverter = {};

    /**
     * @public
     * @function convert
     * @description Создает массив взвешенных точек из входящих данных.
     *
     * @param {Object} data Точки в одном из форматов:
     *  IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @returns {Array} points Массив взвешенных точек.
     */
    dataConverter.convert = function (data) {
        var points = [];

        if (typeof object == 'string') {
            data = JSON.parse(data);
        }

        if (this._isJsonFeature(data) && data.geometry.type == 'Point') {
            points.push(this._convertJsonFeatureToPoint(data));
        } else if (this._isJsonFeatureCollection(data)) {
            for (var i = 0, l = data.features.length; i < l; i++) {
                points = points.concat(
                    this.convert(data.features[i])
                );
            }
        } else if (this._isCoordinates(data)) {
            points.push(this._convertCoordinatesToPoint(data));
        } else {
            var dataArray = [].concat(data);
            for (var i = 0, l = dataArray.length, item; i < l; i++) {
                item = dataArray[i];
                if (this._isCoordinates(item)) {
                    points.push(this._convertCoordinatesToPoint(item));
                } else if (this._isJsonGeometry(item) && item.type == 'Point') {
                    points.push(
                        this._convertCoordinatesToPoint(item.coordinates)
                    );
                } else if (this._isGeoObject(item) && item.geometry.getType() == 'Point') {
                    points.push(this._convertGeoObjectToPoint(item));
                } else if (this._isCollection(item)) {
                    var iterator = item.getIterator(),
                        geoObject;
                    while ((geoObject = iterator.getNext()) != iterator.STOP_ITERATION) {
                        // Выполняем рекурсивно на случай вложенных коллекций.
                        points = points.concat(
                            this.convert(geoObject)
                        );
                    }
                }
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
    dataConverter._isJsonFeature = function (object) {
        return object.type == 'Feature';
    };

    /**
     * @private
     * @function _convertJsonFeatureToPoint
     * @description Конвертирует jsonFeature в взвешенную точку.
     *
     * @param {JSON} jsonFeature Описание точки в JSON-формате.
     * @returns {Object} Взвешенная точка.
     */
    dataConverter._convertJsonFeatureToPoint = function (jsonFeature) {
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
    dataConverter._isJsonFeatureCollection = function (object) {
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
    dataConverter._isCoordinates = function (object) {
        return (Object.prototype.toString.call(object) == '[object Array]') &&
            (typeof object[0] == 'number') &&
            (typeof object[1] == 'number');
    };

    /**
     * @private
     * @function _convertCoordinatesToPoint
     * @description Конвертирует geoObject в взвешенную точку.
     *
     * @param {Number[]} coordinates Координаты точки.
     * @returns {Object} Взвешенная точка.
     */
    dataConverter._convertCoordinatesToPoint = function (coordinates) {
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
    dataConverter._isJsonGeometry = function (object) {
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
    dataConverter._isGeoObject = function (object) {
        return !!(object.geometry && object.getOverlay);
    };

    /**
     * @private
     * @function _convertGeoObjectToPoint
     * @description Конвертирует geoObject типа Point в взвешенную точку.
     *
     * @param {IGeoObject} geoObject Геообъект с геометрией Point.
     * @returns {Object} Взвешенная точка.
     */
    dataConverter._convertGeoObjectToPoint = function (geoObject) {
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
    dataConverter._isCollection = function (object) {
        return !!object.getIterator;
    };

    provide(dataConverter);
});

/**
 * Модуль для нанесения слоя тепловой карты.
 * @module Heatmap
 * @requires option.Manager
 * @requires Monitor
 * @requires Layer
 * @requires heatmap.component.TileUrlsGenerator
 */
ymaps.modules.define('Heatmap', [
    'option.Manager',
    'Monitor',
    'Layer',
    'heatmap.component.TileUrlsGenerator'
], function (
    provide,
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
     * @param {Object} data Точки в одном из форматов:
     * IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
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
     * в конструктор или в метод setData.
     * @returns {Object|null}
     */
    Heatmap.prototype.getData = function () {
        return this._data || null;
    };

    /**
     * @public
     * @function setData
     * @description Устанавливает данные (точки), которые будут нанесены
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
                points = points.concat(
                    this._convertDataToPointsArray(data.features[i])
                );
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

/**
 * Модуль отрисовки тепловой карты на canvas'e. Позволяет получить карту в формате dataURL.
 * @module heatmap.component.Canvas
 * @requires option.Manager
 * @requires Monitor
 */
ymaps.modules.define('heatmap.component.Canvas', [
    'option.Manager',
    'Monitor'
],  function (
    provide,
    OptionManager,
    Monitor
) {
    /**
     * @constant DEFAULT_OPTIONS
     * @description Настройки карты по умолчанию.
     */
    var DEFAULT_OPTIONS = {
        // Радиус точки.
        radius: 10,
        // Множитель для радиуса точки.
        radiusFactor: 1,
        // Прозрачность слоя карты.
        opacity: 0.8,
        // Интенсивность медианной (по весу) точки.
        intensityOfMidpoint: 0.2,
        // Медиана весов точек.
        medianaOfWeights: 1,
        // Градиент, которым будут раскрашены точки.
        gradient: {
            0.1: 'rgba(128, 255, 0, 0.7)',
            0.2: 'rgba(255, 255, 0, 0.8)',
            0.7: 'rgba(234, 72, 58, 0.9)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    };

    /**
     * @public
     * @function Canvas
     * @description Конструктор модуля отрисовки тепловой карты.
     *
     * @param {Number[]} size Размер карты: [width, height].
     */
    var Canvas = function (size) {
        this._canvas = document.createElement('canvas');
        this._canvas.width = size[0];
        this._canvas.height = size[1];

        this._context = this._canvas.getContext('2d');

        this.options = new OptionManager({});

        this._setupDrawTools();
        this._setupOptionMonitor();
    };

    /**
     * @public
     * @function getBrushRadius
     * @description Получение размера кисти, которая используется для отрисовки точек.
     *
     * @returns {Number} margin.
     */
    Canvas.prototype.getBrushRadius = function () {
        return this.options.get('radius', DEFAULT_OPTIONS.radius) *
            this.options.get('radiusFactor', DEFAULT_OPTIONS.radiusFactor);
    };

    /**
     * @public
     * @function generateDataURLHeatmap
     * @description Получение карты в виде dataURL с нанесенными точками.
     *
     * @param {Number[][]} points Массив точек [[x1, y1], [x2, y2], ...].
     * @returns {String} dataURL.
     */
    Canvas.prototype.generateDataURLHeatmap = function (points) {
        this._drawHeatmap(points || []);

        return this._canvas.toDataURL();
    };

    /**
     * @public
     * @function destroy
     * @description Уничтожает внутренние данные.
     */
    Canvas.prototype.destroy = function () {
        this._destroyOptionMonitor();
        this._destroyDrawTools();
    };

    /**
     * @private
     * @function _setupOptionMonitor
     * @description Устанавливает монитор на опции тепловой карты.
     *
     * @returns {Monitor} Монитор опций.
     */
    Canvas.prototype._setupOptionMonitor = function () {
        this._optionMonitor = new Monitor(this.options);

        return this._optionMonitor.add(
            ['radius', 'radiusFactor', 'gradient'],
            this._setupDrawTools,
            this
        );
    };

    /**
     * @private
     * @function _destroyOptionMonitor
     * @description Уничтожает монитор опций.
     */
    Canvas.prototype._destroyOptionMonitor = function () {
        this._optionMonitor.removeAll();
        this._optionMonitor = {};
    };

    /**
     * @private
     * @function _setupDrawTools
     * @description Устанавливает внутренние опции тепловой карты.
     *
     * @returns {Canvas}
     */
    Canvas.prototype._setupDrawTools = function () {
        this._brush = this._createBrush();
        this._gradient = this._createGradient();

        return this;
    };

    /**
     * @private
     * @function _destroyDrawTools
     * @description Уничтожает внутренние опции тепловой карты.
     */
    Canvas.prototype._destroyDrawTools = function () {
        this._brush = null;
        this._gradient = null;
    };

    /**
     * @private
     * @function _createBrush
     * @description Создание кисти, которой будут нарисованы точки.
     *
     * @returns {HTMLElement} brush Канвас с отрисованной тенью круга.
     */
    Canvas.prototype._createBrush = function () {
        var brush = document.createElement('canvas'),
            context = brush.getContext('2d'),

            radius = this.getBrushRadius(),
            gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);

        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
  
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2 * radius, 2 * radius);

        return brush;
    };

    /**
     * @private
     * @function _createGradient
     * @description Создание 256x1 градиента, которым будет раскрашена карта.
     *
     * @returns {Number[]} [r1, g1, b1, a1, r2, ...].
     */
    Canvas.prototype._createGradient = function () {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            gradient = context.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        var gradientOption = this.options.get('gradient', DEFAULT_OPTIONS.gradient);
        for (var i in gradientOption) {
            if (gradientOption.hasOwnProperty(i)) {
                gradient.addColorStop(i, gradientOption[i]);
            }
        }

        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 256);

        return context.getImageData(0, 0, 1, 256).data;
    };

    /**
     * @private
     * @function _drawHeatmap
     * @description Отрисовка тепловой карты.
     *
     * @returns {Canvas}
     */
    Canvas.prototype._drawHeatmap = function (points) {
        var context = this._context,
            radius = this.getBrushRadius(),

            intensityOfMidpoint = this.options.get(
                'intensityOfMidpoint',
                DEFAULT_OPTIONS.intensityOfMidpoint
            ),
            medianaOfWeights = this.options.get(
                'medianaOfWeights',
                DEFAULT_OPTIONS.medianaOfWeights
            ),
            // Множитель для установки медианы интенсивности точек.
            weightFactor = intensityOfMidpoint / medianaOfWeights;

        context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (var i = 0, length = points.length; i < length; i++) {
            context.globalAlpha = Math.min(points[i].weight * weightFactor, 1);
            context.drawImage(
                this._brush,
                points[i].coordinates[0] - radius,
                points[i].coordinates[1] - radius
            );
        }

        var heatmapImage = context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        this._colorize(heatmapImage.data);
        context.putImageData(heatmapImage, 0, 0);

        return this;
    };

    /**
     * @private
     * @function _colorize
     * @description Раскрашивание пикселей карты.
     *
     * @param {Number[]} pixels Бесцветная тепловая карта [r1, g1, b1, a1, r2, ...].
     * @param {Number[]} gradient Градиент [r1, g1, b1, a1, r2, ...].
     */
    Canvas.prototype._colorize = function (pixels) {
        var opacity = this.options.get('opacity', DEFAULT_OPTIONS.opacity);
        for (var i = 3, length = pixels.length, j; i < length; i += 4) {
            if (pixels[i]) {
                // Получаем цвет в градиенте, по значению прозрачночти.
                j = 4 * pixels[i];
                pixels[i - 3] = this._gradient[j];
                pixels[i - 2] = this._gradient[j + 1];
                pixels[i - 1] = this._gradient[j + 2];

                // Устанавливаем прозрачность слоя.
                pixels[i] = opacity * (this._gradient[j + 3] || 255);
            }
        }
    };

    provide(Canvas);
});

/**
 * Модуль для генерации тайлов тепловой карты.
 * @module heatmap.component.TileUrlsGenerator
 * @requires option.Manager
 * @requires heatmap.component.Canvas
 */
ymaps.modules.define('heatmap.component.TileUrlsGenerator', [
    'option.Manager',
    'heatmap.component.Canvas'
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
     * @param {Number[][]} points Массив точек в географических координатах.
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
     * @param {Number[][]} points Массив точек в географических координатах.
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
     * @returns {Number[][]} points Массив точек в географических координатах.
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
        var radiusFactor = this._canvas.options.get('radiusFactor');
        if (this.options.get('dissipating')) {
            if (radiusFactor != zoom) {
                this._canvas.options.set('radiusFactor', zoom / 10);
            }
        } else if (radiusFactor) {
            this._canvas.options.unset('radiusFactor');
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
     * @param {Number[]} point Точка в глобальных пиксельных координатах.
     * @param {Number} margin Необязательный параметр, если нужно расширить bounds.
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

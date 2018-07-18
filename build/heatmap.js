/**
 * Heatmap module.
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
     * @description Heatmap constructor.
     *
     * @param {Object} [data] Points described using one of following formats:
     *  IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @param {Object} [options] Object describing rendering options:
     *  {Number} [options.radius] - radius of point influence (px);
     *  {Boolean|Function} [options.dissipating=false] - true - disperse points
     *   on higher zoom levels according to radius, false - don't disperse;
     *  {Number} [opacity.options] - Heatmap opacity (from 0 to 1);
     *  {Number} [opacity.intensityOfMidpoint] - Intensity of median point (from 0 to 1);
     *  {Object} [opacity.gradient] - JSON description of gradient.
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
     * @description Returns reference to data provided to constructor or {@link Heatmap.setData} method.
     *
     * @returns {Object|null}
     */
    Heatmap.prototype.getData = function () {
        return this._data || null;
    };

    /**
     * @public
     * @function setData
     * @description Sets points. If `Heatmap` instance is already rendered, it will be re-rendered.
     *
     * @param {Object} data Points described using one of following formats:
     * IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @returns {Heatmap} Self-reference.
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
     * @function getMap
     *
     * @returns {Map} reference to Map instance.
     */
    Heatmap.prototype.getMap = function () {
        return this._map;
    };

    /**
     * @public
     * @function setMap
     * @description Sets Map instance to render `Heatmap` object over it.
     *
     * @param {Map} map Map instance.
     * @returns {Heatmap} Self-reference.
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
     * @description Destructs Heatmap instance.
     */
    Heatmap.prototype.destroy = function () {
        this._data = null;
        this.setMap(null);
    };

    /**
     * @private
     * @function _refresh
     * @description Re-renders Heatmap.
     *
     * @returns {Heatmap} Self-reference.
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
     * @description Sets up associated map layer.
     *
     * @returns {Layer} Layer instance.
     */
    Heatmap.prototype._setupLayer = function () {
        this._setupTileUrlsGenerator();
        var getTileUrl = this._tileUrlsGenerator.getTileUrl.bind(this._tileUrlsGenerator);

        this._layer = new Layer(getTileUrl, {tileTransparent: true});
        this._setupOptionMonitor();

        return this._layer;
    };

    /**
     * @private
     * @function _destroyLayer
     * @description Destroys associated layer instance.
     */
    Heatmap.prototype._destroyLayer = function () {
        this._destroyTileUrlsGenerator();
        this._destroyOptionMonitor();
        this._layer = null;
    };

    /**
     * @private
     * @function _setupTileUrlsGenerator
     * @description Sets up tile URL generator.
     *
     * @returns {TileUrlsGenerator} Tile URL generator.
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
     * @description Destroys tile URL generator.
     */
    Heatmap.prototype._destroyTileUrlsGenerator = function () {
        this._unprocessedPoints = this._tileUrlsGenerator.getPoints();
        this._tileUrlsGenerator.destroy();
        this._tileUrlsGenerator = null;
    };

    /**
     * @private
     * @function _setupOptionMonitor
     * @description Sets up options monitor.
     *
     * @returns {Monitor} Options monitor.
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
     * @description Destroys options monitor.
     */
    Heatmap.prototype._destroyOptionMonitor = function () {
        this._optionMonitor.removeAll();
        this._optionMonitor = {};
    };

    provide(Heatmap);
});

/**
 * Making weighted points array from input data module.
 * @module heatmap.component.dataConverter
 */
ymaps.modules.define('heatmap.component.dataConverter', [], function (provide) {
    var dataConverter = {};

    /**
     * @public
     * @function convert
     * @description Make weighted points array from input data.
     *
     * @param {Object} data Points described using one of following formats:
     *  IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
     * @returns {Array} points Weighted points array.
     */
    dataConverter.convert = function (data) {
        var points = [];

        if (typeof object == 'string') {
            data = JSON.parse(data);
        }

        if (this._isJsonFeatureCollection(data)) {
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
                } else if (this._isJsonFeature(item) && item.geometry.type == 'Point') {
                    points.push(this._convertJsonFeatureToPoint(item));
                } else if (this._isGeoObject(item) && item.geometry.getType() == 'Point') {
                    points.push(this._convertGeoObjectToPoint(item));
                } else if (this._isCollection(item)) {
                    var iterator = item.getIterator();
                    var geoObject;
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
     * @description Checks whether object is a JSON-description or not.
     *
     * @param {Object} object Some object.
     * @returns {Boolean}
     */
    dataConverter._isJsonFeature = function (object) {
        return object.type == 'Feature';
    };

    /**
     * @private
     * @function _convertJsonFeatureToPoint
     * @description Converts JSON "Feature" object to weighted point.
     *
     * @param {JSON} jsonFeature JSON "Feature" object.
     * @returns {Object} Weighted point.
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
     * @description Checks whether JSON object is a correct Feature collection description.
     *
     * @param {Object} object Some object.
     * @returns {Boolean}
     */
    dataConverter._isJsonFeatureCollection = function (object) {
        return object.type == 'FeatureCollection';
    };

    /**
     * @private
     * @function _isCoordinates
     * @description Checks whether object is a pair of coordinates.
     *
     * @param {Object} object Some object.
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
     * @description Converts coordinates into weighted point.
     *
     * @param {Number[]} coordinates Coordinates.
     * @returns {Object} Weighted point.
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
     * @description Checks whether JSON object is a correct geometry description.
     *
     * @param {Object} object Some object.
     * @returns {Boolean}
     */
    dataConverter._isJsonGeometry = function (object) {
        return Boolean(object.type && object.coordinates);
    };

    /**
     * @private
     * @function _isGeoObject
     * @description Checks whether object implements IGeoObjectInterface.
     *
     * @param {Object} object Some object.
     * @returns {Boolean}
     */
    dataConverter._isGeoObject = function (object) {
        return Boolean(object.geometry && object.getOverlay);
    };

    /**
     * @private
     * @function _convertGeoObjectToPoint
     * @description Converts IGeoObject of Point type into weighted point.
     *
     * @param {IGeoObject} geoObject IGeoObject of Point type.
     * @returns {Object} Weighted point.
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
     * @description Checks whether object implements ICollection interface.
     *
     * @param {Object} object Some object.
     * @returns {Boolean}
     */
    dataConverter._isCollection = function (object) {
        return Boolean(object.getIterator);
    };

    provide(dataConverter);
});

/**
 * Heatmap tiles generator module.
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
     * Heatmap tile size.
     */
    var TILE_SIZE = [256, 256];

    /**
     * @public
     * @function TileUrlsGenerator
     * @description Heatmap tiles generator constructor.
     *
     * @param {IProjection} projection Projection.
     * @param {Number[][]} points Points provided as geographical coordinates.
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
     * @description Sets array points to render.
     *
     * @param {Number[][]} points Array of points provided as geographical coordinates.
     * @returns {TileUrlsGenerator} Tile URLs generator.
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
     * @description Returns points.
     *
     * @returns {Number[][]} points Points provided as geographical coordinates.
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
     * @description Returns tile URL according to given number and zoom level.
     *
     * @param {Number[]} tileNumber Tile number [x, y].
     * @param {Number} zoom Zoom level.
     * @returns {String} Data URL.
     */
    TileUrlsGenerator.prototype.getTileUrl = function (tileNumber, zoom) {
        var radiusFactor = this._canvas.options.get('radiusFactor');
        if (this.options.get('dissipating')) {
            var newRadiusFactor = calculateRadiusFactor(zoom);
            if (radiusFactor != newRadiusFactor) {
                this._canvas.options.set('radiusFactor', newRadiusFactor);
            }
        } else if (radiusFactor) {
            this._canvas.options.unset('radiusFactor');
        }

        var zoomFactor = Math.pow(2, zoom);

        var tileBounds = [
            [
                tileNumber[0] * TILE_SIZE[0] / zoomFactor,
                tileNumber[1] * TILE_SIZE[1] / zoomFactor
            ],
            [
                (tileNumber[0] + 1) * TILE_SIZE[0] / zoomFactor,
                (tileNumber[1] + 1) * TILE_SIZE[1] / zoomFactor
            ]
        ];
        var tileMargin = this._canvas.getBrushRadius() / zoomFactor;

        var points = [];
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
     * @description Destroys generator.
     */
    TileUrlsGenerator.prototype.destroy = function () {
        this._canvas.destroy();
        this._canvas = null;

        this._projection = null;
    };

    /**
     * @private
     * @function _isPointInBounds
     * @description Checks whether point is located inside given area.
     *
     * @param {Number[][]} bounds Area.
     * @param {Number[]} point Point.
     * @param {Number} margin Area extension.
     * @returns {Boolean} True - point lies inside area, false - otherwise.
     */
    TileUrlsGenerator.prototype._contains = function (bounds, point, margin) {
        return (point[0] >= bounds[0][0] - margin) &&
            (point[0] <= bounds[1][0] + margin) &&
            (point[1] >= bounds[0][1] - margin) &&
            (point[1] <= bounds[1][1] + margin);
    };

    /**
     * @function сalculateRadiusFactor
     * @description Calculates a radius factor for zoom level.
     *
     * @param {Number} zoom Current zoom level.
     * @returns {Number} radius factor.
     */
    function calculateRadiusFactor(zoom) {
        return Math.pow(zoom / 10, 1.1);
    }

    /**
     * @function findMediana
     * @description Calculates a median of provided array of data.
     */
    function findMediana(selection) {
        var sortSelection = selection.sort(comparator);
        var center = sortSelection.length / 2;
        if (center !== Math.floor(center)) {
            return sortSelection[Math.floor(center)];
        } else {
            return (sortSelection[center - 1] + sortSelection[center]) / 2;
        }
    }

    /**
     * @function comparator
     * @description Compares two numbers.
     */
    function comparator(a, b) {
        return a - b;
    }

    provide(TileUrlsGenerator);
});

/**
 * Heatmap rendering onto canvas module. Allows to get Headmap as Data URL.
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
     * @description Default Heatmap options.
     */
    var DEFAULT_OPTIONS = {
        // Point radius.
        radius: 10,
        // Radius factor.
        radiusFactor: 1,
        // Map layer opacity.
        opacity: 0.8,
        // Median point intencity.
        intensityOfMidpoint: 0.2,
        // Median of points weights.
        medianaOfWeights: 1,
        // Gradient.
        gradient: {
            0.1: 'rgba(128, 255, 0, 0.7)',
            0.2: 'rgba(255, 255, 0, 0.8)',
            0.7: 'rgba(234, 72, 58, 0.9)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    };

    /**
     * @constant EMPTY_PNG
     * @description Empty transparent png
     */
    var EMPTY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABFUlEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBPAABPO1TCQAAAABJRU5ErkJggg==';

    /**
     * @public
     * @function Canvas
     * @description Heatmap rendering module constructor.
     *
     * @param {Number[]} size Heatmap size, [width, height].
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
     * @description Returns brush size to use for points drawing.
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
     * @description Returns Generates Heatmap and returns as Data URL
     *
     * @param {Number[][]} points Array of points [[x1, y1], [x2, y2], ...].
     * @returns {String} Data URL.
     */
    Canvas.prototype.generateDataURLHeatmap = function (points) {
        if (points && points.length > 0) {
            this._drawHeatmap(points);
            return this._canvas.toDataURL();
        } else {
            return EMPTY_PNG;
        }
    };

    /**
     * @public
     * @function destroy
     * @description Destroys module.
     */
    Canvas.prototype.destroy = function () {
        this._destroyOptionMonitor();
        this._destroyDrawTools();
    };

    /**
     * @private
     * @function _setupOptionMonitor
     * @description Sets up Heatmap options monitor.
     *
     * @returns {Monitor} Options monitor.
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
     * @description Destroys options monitor.
     */
    Canvas.prototype._destroyOptionMonitor = function () {
        this._optionMonitor.removeAll();
        this._optionMonitor = {};
    };

    /**
     * @private
     * @function _setupDrawTools
     * @description Sets up internal components.
     *
     * @returns {Canvas} Canvas instanse.
     */
    Canvas.prototype._setupDrawTools = function () {
        this._brush = this._createBrush();
        this._gradient = this._createGradient();

        return this;
    };

    /**
     * @private
     * @function _destroyDrawTools
     * @description Destroys internal components.
     */
    Canvas.prototype._destroyDrawTools = function () {
        this._brush = null;
        this._gradient = null;
    };

    /**
     * @private
     * @function _createBrush
     * @description Creates brush to draw points.
     *
     * @returns {HTMLElement} brush Canvas with brush pattern.
     */
    Canvas.prototype._createBrush = function () {
        var brush = document.createElement('canvas');
        var context = brush.getContext('2d');

        var radius = this.getBrushRadius();
        var gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);

        brush.width = 2 * radius;
        brush.height = 2 * radius;

        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 2 * radius, 2 * radius);

        return brush;
    };

    /**
     * @private
     * @function _createGradient
     * @description Creates 256x1 px gradient to draw Heatmap.
     *
     * @returns {Number[]} Image data.
     */
    Canvas.prototype._createGradient = function () {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var gradient = context.createLinearGradient(0, 0, 0, 256);

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
     * @description Draws Heatmap.
     *
     * @returns {Canvas} Canvas.
     */
    Canvas.prototype._drawHeatmap = function (points) {
        var context = this._context;
        var radius = this.getBrushRadius();

        var intensityOfMidpoint = this.options.get(
            'intensityOfMidpoint',
            DEFAULT_OPTIONS.intensityOfMidpoint
        );
        var medianaOfWeights = this.options.get(
            'medianaOfWeights',
            DEFAULT_OPTIONS.medianaOfWeights
        );
        // Factor to set median intensity.
        var weightFactor = intensityOfMidpoint / medianaOfWeights;

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
     * @description Paints Heatmap pixels.
     *
     * @param {Number[]} pixels Colorless Heatmap as pixel data.
     * @param {Number[]} gradient Gradient as pixel data.
     */
    Canvas.prototype._colorize = function (pixels) {
        var opacity = this.options.get('opacity', DEFAULT_OPTIONS.opacity);
        for (var i = 3, length = pixels.length, j; i < length; i += 4) {
            if (pixels[i]) {
                // Obtain a color in gradient by transparency.
                j = 4 * pixels[i];
                pixels[i - 3] = this._gradient[j];
                pixels[i - 2] = this._gradient[j + 1];
                pixels[i - 1] = this._gradient[j + 2];

                // Sets layer opacity.
                pixels[i] = opacity * (this._gradient[j + 3] || 255);
            }
        }
    };

    provide(Canvas);
});

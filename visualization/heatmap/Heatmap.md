Heatmap
===

Модуль для нанесения слоя тепловой карты.

Heatmap(data, options) 
-----------------------------
Конструктор тепловой карты.

**Parameters**

**data**: Object, Источник геообъектов.

**options**: Object, Объект с опциями отображения тепловой карты:
 pointRadius - радиус точки для 1-го зума (на n'ом zoom'е будет равен pointRadius * zoom);
 opacity - прозрачность карты;
 medianaOfGradient - медиана цвета, которая должна быть среди точек на карте
 (значение от 0 до 1 - уровень в gradient'е).
 gradient - объект, задающий градиент.


setData(data) 
-----------------------------
Добавляет данные (точки), которые будут нанесены
на карту. Если слой уже отрисован, то любые последующие манипуляции с
данными приводят к его перерисовке.

**Parameters**

**data**: Object, Источник геообъектов.

**Returns**: Heatmap, Добавляет данные (точки), которые будут нанесены
на карту. Если слой уже отрисован, то любые последующие манипуляции с
данными приводят к его перерисовке.

setMap(map) 
-----------------------------
Устанавливает карту, на которой должна отобразиться тепловая карта.

**Parameters**

**map**: Map, Инстанция ymaps.Map, на которую будет добавлен слой тепловой карты.

**Returns**: Heatmap, Устанавливает карту, на которой должна отобразиться тепловая карта.

destroy() 
-----------------------------
Уничтожает внутренние данные слоя тепловой карты.


_convertDataToPointsArray(data) 
-----------------------------
Создает массив взвешенных точек из входящих данных.

**Parameters**

**data**: Object, Точки в одном из форматов:
IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.

**Returns**: Array, points Массив взвешенных точек.

_isGeoQueryResult(object) 
-----------------------------
Проверяет является ли переданный объект GeoQueryResult'ом.

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект GeoQueryResult'ом.

_convertGeoQueryResultToPoints(geoQueryResult) 
-----------------------------
Конвертирует geoQueryResult в массив взвешенных точек.

**Parameters**

**geoQueryResult**: GeoQueryResult, Объект с точками.

**Returns**: Array, points Массив взвешенных точек.

_isJsonFeature(object) 
-----------------------------
Проверяет является ли переданный объект JSON-описанием сущности.

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект JSON-описанием сущности.

_convertJsonFeatureToPoint(jsonFeature) 
-----------------------------
Конвертирует jsonFeature в взвешенную точку.

**Parameters**

**jsonFeature**: Object, JSON, описывающий точки.

**Returns**: Object, point Взвешенная точка.

_isJsonFeatureCollection(object) 
-----------------------------
Проверяет является ли переданный объект JSON-описанием коллекции сущностей.

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект JSON-описанием коллекции сущностей.

_isCoordinates(object) 
-----------------------------
Проверяет является ли переданный объект координатами точки ([x1, y1]).

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект координатами точки ([x1, y1]).

_convertCoordinatesToPoint(coordinates) 
-----------------------------
Конвертирует geoObject в взвешенную точку.

**Parameters**

**coordinates**: Array.&lt;Number&gt;, Координаты точки.

**Returns**: Object, point Взвешенная точка.

_isJsonGeometry(object) 
-----------------------------
Проверяет является ли переданный объект JSON-описанием геометрии.

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект JSON-описанием геометрии.

_isGeoObject(object) 
-----------------------------
Проверяет является ли переданный объект инстанцией геообъекта.

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект инстанцией геообъекта.

_convertGeoObjectToPoint(geoObject) 
-----------------------------
Конвертирует geoObject в взвешенную точку.

**Parameters**

**geoObject**: GeoObject, Объект с геометрией Point.

**Returns**: Object, point Взвешенная точка.

_isCollection(object) 
-----------------------------
Проверяет является ли переданный объект инстанцией коллекции.

**Parameters**

**object**: Object, Произвольный объект.

**Returns**: Boolean, Проверяет является ли переданный объект инстанцией коллекции.

_refresh() 
-----------------------------
Перегенерирует слой тепловой карты.

**Returns**: Heatmap, Перегенерирует слой тепловой карты.

_setupLayer() 
-----------------------------
Установка слоя, в котором будет размещена тепловая карта.

**Returns**: Layer, Слой тепловой карты.

_destroyLayer() 
-----------------------------
Уничтожает this._layer.


_setupTileUrlsGenerator() 
-----------------------------
Устанавливает генератор для тайлов тепловой карты.

**Returns**: TileUrlsGenerator, Генератор тайлов.

_destroyTileUrlsGenerator() 
-----------------------------
Уничтожает this._tileUrlsGenerator.


_setupOptionMonitor() 
-----------------------------
Устанавливает монитор на опции тепловой карты.

**Returns**: Monitor, Монитор опций.

_destroyOptionMonitor() 
-----------------------------
Уничтожает this._optionMonitor.

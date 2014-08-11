TileUrlsGenerator
===

Модуль для генерации тайлов тепловой карты.

TileUrlsGenerator(layer, points, optionManager) 
-----------------------------
Конструктов генератора url тайлов тепловой карты.

**Parameters**

**layer**: Layer, Слой тепловой карты.

**points**: Array, Массив точек в географический координатах.

**optionManager**: option.Manager, Менеджер с опциями отображения тепловой карты:
 opacity - прозрачность карты;
 pointRadius - радиус точки;
 pointBlur - радиус размытия вокруг точки, на тепловой карте;
 pointGradient - объект задающий градиент.


addPoints(points) 
-----------------------------
Добавляет точки, которые будут нанесены на карту.

**Parameters**

**points**: Array, Массив точек [[x1, y1], [x2, y2], ...].

**Returns**: TileUrlsGenerator, Добавляет точки, которые будут нанесены на карту.


removePoints(points) 
-----------------------------
Удаляет точки, которые не должны быть отображены на карте.

**Parameters**

**points**: Array, Массив точек [[x1, y1], [x2, y2], ...].

**Returns**: TileUrlsGenerator, Удаляет точки, которые не должны быть отображены на карте.


getTileUrl(tileNumber, zoom) 
-----------------------------
Возвращает URL тайла по его номеру и уровню масштабирования.

**Parameters**

**tileNumber**: Array, Номер тайла [x, y].

**zoom**: Number, Зум тайла.

**Returns**: String, dataUrl.


_getIndexOfPoint(point, index) 
-----------------------------
Получение позиции точки.

**Parameters**

**point**: Array, Точка в географических координатах.

**index**: Number, Индекс данной точки внутри this._points.


_isPointInBounds(point, bounds, margin) 
-----------------------------
Проверка попадаения точки в границы карты.

**Parameters**

**point**: Array, Точка point[0] = x, point[1] = y.

**bounds**: Array, Область, в которую попадание проверяется.

**margin**: Number, Необязательный параметр, если нужно расширисть bounds.

**Returns**: Boolean, True - попадает.

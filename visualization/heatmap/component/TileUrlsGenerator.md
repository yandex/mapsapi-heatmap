TileUrlsGenerator
===

Модуль для генерации тайлов тепловой карты.

TileUrlsGenerator(layer, points) 
-----------------------------
Конструктор генератора url тайлов тепловой карты.

**Parameters**

**layer**: Layer, Слой тепловой карты.

**points**: Array, Массив точек в географических координатах.


setPoints(points) 
-----------------------------
Устанавливает точки, которые будут нанесены на карту.

**Parameters**

**points**: Array, Массив точек [[x1, y1], [x2, y2], ...].

**Returns**: TileUrlsGenerator, Устанавливает точки, которые будут нанесены на карту.

getPoints() 
-----------------------------
Отдает точки в географических координатах.

**Returns**: Array, points Массив точек [[x1, y1], [x2, y2], ...].

getTileUrl(tileNumber, zoom) 
-----------------------------
Возвращает URL тайла по его номеру и уровню масштабирования.

**Parameters**

**tileNumber**: Array.&lt;Number&gt;, Номер тайла [x, y].

**zoom**: Number, Зум тайла.

**Returns**: String, dataUrl.

destroy() 
-----------------------------
Уничтожает внутренние данные генератора.


_isPointInBounds(point, bounds, margin) 
-----------------------------
Проверка попадаения точки в границы карты.

**Parameters**

**point**: Array.&lt;Number&gt;, Точка в географических координатах.

**bounds**: Array, Область, в которую попадание проверяется.

**margin**: Number, Необязательный параметр, если нужно расширисть bounds.

**Returns**: Boolean, True - попадает.

TileUrlsGenerator
===

Модуль для генерации тайлов тепловой карты.

TileUrlsGenerator(projection, points) 
-----------------------------
Конструктор генератора url тайлов тепловой карты.

**Parameters**

**projection**: IProjection, Проекция.

**points**: Array.&lt;Object&gt;, Массив точек в географических координатах.


setPoints(points) 
-----------------------------
Устанавливает точки, которые будут нанесены на карту.

**Parameters**

**points**: Array.&lt;Object&gt;, Массив точек в географических координатах.

**Returns**: TileUrlsGenerator, Устанавливает точки, которые будут нанесены на карту.

getPoints() 
-----------------------------
Отдает точки в географических координатах.

**Returns**: Array.&lt;Object&gt;, points Массив точек в географических координатах.

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


_isPointInBounds(bounds, point, margin) 
-----------------------------
Проверка попадаения точки в границы карты.

**Parameters**

**bounds**: Number[][], Область, в которую попадание проверяется.

**point**: Array.&lt;Number&gt;, Точка в географических координатах.

**margin**: Number, Необязательный параметр, если нужно расширисть bounds.

**Returns**: Boolean, True - попадает.

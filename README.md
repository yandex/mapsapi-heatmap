# Heatmap

Модуль для создания слоя тепловой карты (теплокарта).

**Теплокарта** — это графическое представление данных, где дополнительные переменные отображаются при помощи цвета.
Позволяет по заданному набору географических координат сгенерировать слой тепловой карт.

## Подключение

1. Сохраните себе исходный код модуля [Heatmap.min.js](https://github.com/yandex/mapsapi-heatmap/blob/master/build/Heatmap.min.js).

2. Прежде чем использовать функции модуля, необходимо загрузить в браузер JavaScript-файл, в котором этот модуль определен. Для этого добавьте в заголовок head HTML-страницы строку следующего вида:
```
<head>
    ...
    <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
    <script src="Heatmap.min.js" type="text/javascript"></script>
    ...
</head>
```
При необходимости, исправьте путь к файлу Heatmap.min.js.

3. Внешние модули не дописываются в неймспейс ymaps, поэтому доступ к ним можно получить асинхронно через метод [ymaps.modules.require](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/modules.require.xml)
```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var heatmap = new Heatmap();
});
```

## Конструктор

| Параметр| Значение по умолчанию | Описание |
|---------|-----------------------|----------|
| data | - | Тип: Object.<br>Точки в одном из форматов:<ul><li>Number[][] - массив координат;</li><li>[IGeoObject](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml) - объект, реализующий соответствующий интерфейс;</li><li>[IGeoObject](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml)[] - массив объектов, реализующих соответствующий интерфейс;</li><li>[ICollection](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ICollection.xml) - коллекция объектов, реализующих интерфейс [IGeoObject](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml);</li><li>[ICollection](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ICollection.xml)[] - массив коллекций объектов, реализующих интерфейс IGeoObject;</li><li>[GeoQueryResult](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) - объект класса GeoQueryResult;</li><li>String &#124; Object - строка или объект с JSON-описанием объектов.</li> |
|  options |  - | Тип: Object.<br>Настройки отображения тепловой карты. |
|  options.radius |  10 | Тип: Number.<br>Радиус влияния (в пикселях) для каждой точки данных. |
|  options.dissipating |  false | Тип: Boolean.<br>Указывает, следует ли рассредоточивать данные тепловой карты при уменьшении масштаба, если указано true, то радиус точки для n'го масштаба будет равен (radius * zoom / 10). По умолчанию опция отключена. |
|  options.opacity |  0.6 | Тип: Number.<br>Прозрачность слоя карты (от 0 до 1). |
|  options.intensityOfMidpoint |  0.2 | Тип: Number.<br>Интенсивность медианной (по весу) точки (от 0 до 1). |
|  options.gradient |  {0.1:'rgba(128,255,0,1)',<br>0.2:'rgba(255,255,0,1)',<br>0.7:'rgba(234,72,58,1)',<br>1.0:'rgba(162,36,25,1)'} | Тип: Object.<br>Объект, задающий градиент. |

## Поля

| Имя| Тип | Описание |
|----|-----|----------|
| options | [option.Manager](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.Manager.xml) | Менеджер опций тепловой карты. |

## Методы

| Имя| Возвращает | Описание |
|----|------------|----------|
| [getData](#getdata) | Object &#124; null | Возвращает ссылку на объект данных, который был передан в конструктор или в метод [setData](#setdata). |
|  [setData](#setdata) |  Heatmap | Добавляет данные (точки), которые будут нанесены на карту. Если слой уже отрисован, то любые последующие манипуляции с данными приводят к его перерисовке. |
|  [getMap](#getmap) |  Map &#124; null | Возвращает ссылку на карту. |
|  [setMap](#setmap) |  Heatmap | Устанавливает карту, на которой должна отобразиться тепловая карта. |
|  [destroy](#destroy) |  - | Уничтожает внутренние данные слоя тепловой карты. |


### getData
Отдает ссылку на объект данных, который был передан в конструктор или в метод setData.

#### Возвращает:
Отдает ссылку на объект данных, который был передан в конструктор или в метод setData.


### setData
Устанавливает данные (точки), которые будут нанесены на карту. Если слой уже отрисован, то любые последующие манипуляции с
данными приводят к его перерисовке.

#### Возвращает:
Cсылку на себя.

#### Параметры:
| Параметр | Значение по умолчанию | Описание |
|----------|-----------------------|----------|
| data | - | Тип: Object.<br>Точки в одном из форматов:<ul><li>Number[][] - массив координат;</li><li>[IGeoObject](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml) - объект, реализующий соответствующий интерфейс;</li><li>[IGeoObject](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml)[] - массив объектов, реализующих соответствующий интерфейс;</li><li>[ICollection](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ICollection.xml) - коллекция объектов, реализующих интерфейс [IGeoObject](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml);</li><li>[ICollection](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ICollection.xml)[] - массив коллекций объектов, реализующих интерфейс IGeoObject;</li><li>[GeoQueryResult](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) - объект класса GeoQueryResult;</li><li>String &#124; Object - строка или объект с JSON-описанием объектов.</li> |


### getMap
Получение текущей карты, на которой отображена тепловая карта.

#### Возвращает:
Инстанцию ymaps.Map.


### setMap
Устанавливает карту, на которой должна отобразиться тепловая карта.

#### Возвращает:
Heatmap, Устанавливает карту, на которой должна отобразиться тепловая карта.

#### Параметры:
| Параметр | Значение по умолчанию | Описание |
|----------|-----------------------|----------|
| map | - | Инстанция ymaps.Map, на которую будет добавлен слой тепловой карты. |


### destroy
Уничтожает внутренние данные слоя тепловой карты.

## Примеры

* Нанесение слоя на карту.

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    heatmap.setMap(myMap);
});
```

* Обновление данных на тепловой карте.

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    heatmap.setMap(myMap);

    var newData = [[37.774546, -122.433523], [37.784546, -122.433523]];
    heatmap.setData(newData);
});
```

* Изменение параметров отображения тепловой карты.

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    // Тепловая карта станет непрозрачной.
    heatmap.options.set('opacity', 1);
    heatmap.setMap(myMap);
});
```

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    // Изменение градиента.
    heatmap.options.set('gradient', {
        '0.1': 'lime',
        '0.9': 'red'
    });
    heatmap.setMap(myMap);
});
```


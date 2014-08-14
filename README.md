# Yandex Maps API Heatmap module

**Heatmap** is a graphical representation of some spatial data where density values are indicated with different colors.
`Heatmap` class allows to construct and display such representations over geographical maps.

## Loading

1. Put module source code ([Heatmap.min.js](https://github.com/yandex/mapsapi-heatmap/blob/master/build/Heatmap.min.js)) on your CDN.

2. Load both Yandex Maps API and module source code by adding following code into &lt;head&gt; section of your page
```
<head>
    ...
    <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
    <script src="http://my.cdn.tld/Heatmap.min.js" type="text/javascript"></script>
    ...
</head>
```
Change path to Heatmap.min.js according to your CDN host name.

3. Get access to module functions by using `modules.require` method
[ymaps.modules.require](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/modules.require.xml)
```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var heatmap = new Heatmap();
});
```

## Heatmap constructor

| Parameter | Default value | Decription |
|---------|-----------------------|----------|
| data | - | Type: Object.<br>Points descirption in one of following formats:<ul><li>Number[][] - coordinates array;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml) - object implementing `IGeoObject` interface;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml)[] - array of objects implementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml) - collection of objects imlementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml)[] - array of collection of objects implementing `IGeoObject` interface;</li><li>[GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) - result of [geoQuery](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/geoQuery.xml) execution;</li><li>Any - JSON representation of data according to [GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) input data format.</li> |
|  options |  - | Type: Object.<br>Heatmap representation options. |
|  options.radius |  10 | Type: Number.<br>Point radius of influence (px). |
|  options.dissipating |  false | Type: Boolean.<br>`true` - disperse points on higher zoom levels according to radius (point radius equals `radius * zoom / 10`), `falsa` - doesn't disperse. Default value is `false`. |
|  options.opacity |  0.6 | Type: Number.<br>Heatmap opacity (from 0 to 1). |
|  options.intensityOfMidpoint |  0.2 | Type: Number.<br>Intensity of median point (from 0 to 1). |
|  options.gradient | {0.1:'rgba(128,255,0,1)',<br>0.2:'rgba(255,255,0,1)',<br>0.7:'rgba(234,72,58,1)',<br>1.0:'rgba(162,36,25,1)'} | Type: Object.<br>JSON description of gradient. |

## Properties

| Name| Type| Description|
|----|-----|----------|
| options | [option.Manager](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/option.Manager.xml) | `Heatmap` object options manager. |

## Methods

| Name| Returns | Description |
|----|------------|----------|
| [getData](#getdata) | Object &#124; null | Returns reference to data provided to constructor or [setData](#setdata) method. |
| [setData](#setdata) | Heatmap | Adds new points. If `Heatmap` instance is already rendered, it will be re-rendered. |
| [getMap](#getmap) |  Map &#124; null | Returns reference to [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) object. |
| [setMap](#setmap) |  Heatmap | Sets [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) instance to render `Heatmap` object over it. |
| [destroy](#destroy) | - | Destroys `Heatmap` object. |


### getData
####Returns:
reference to data provided to constructor or [setData](#setdata) method.

### setData
Adds new points. If `Heatmap` instance is already rendered, it will be re-rendered.

#### Returns:
Self-reference.

#### Параметры:
| Parameter | Default value | Description |
|---------|-----------------------|----------|
| data | - | Type: Object.<br>Points descirption in one of following formats:<ul><li>Number[][] - coordinates array;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml) - object implementing `IGeoObject` interface;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml)[] - array of objects implementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml) - collection of objects imlementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml)[] - array of collection of objects implementing `IGeoObject` interface;</li><li>[GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) - result of [geoQuery](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/geoQuery.xml) execution;</li><li>Any - JSON representation of data according to [GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) input data format.</li> |


### getMap
#### Returns:
reference to [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) object.

### setMap
Sets [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) instance to render `Heatmap` object over it.

#### Returns:
self-reference.

#### Параметры:
| Parameter | Default value | Description |
|----------|-----------------------|----------|
| map | - | Type:Map<br/>[Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) instance to render `Heatmap` object over it. |


### destroy
Destroys `Heatmap` object

## Examples

* Displaying heatmap over geographical map:

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    heatmap.setMap(myMap);
});
```

* Updating heatmap data:

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    heatmap.setMap(myMap);

    var newData = [[37.774546, -122.433523], [37.784546, -122.433523]];
    heatmap.setData(newData);
});
```

* Changing heatmap representation options.

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    // Heatmap becomes opaque
    heatmap.options.set('opacity', 1);
    heatmap.setMap(myMap);
});
```

```
ymaps.modules.require(['Heatmap'], function (Heatmap) {
    var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
        heatmap = new Heatmap(data);
    // Changing gradient
    heatmap.options.set('gradient', {
        '0.1': 'lime',
        '0.9': 'red'
    });
    heatmap.setMap(myMap);
});
```


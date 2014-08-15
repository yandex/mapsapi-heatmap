moved to [github.com/yandex/mapsapi-heatmap](https://github.com/yandex/mapsapi-heatmap)

# Yandex Maps API Heatmap Module

**Heatmap** is a graphical representation of some spatial data where density values are indicated with different colors.
`Heatmap` class allows to construct and display such representations over geographical maps.

## Loading

1. Put module source code ([Heatmap.min.js](https://github.com/alt-j/ymaps-heatmap/blob/master/build/Heatmap.min.js)) on your CDN.

2. Load both [Yandex Maps JS API 2.1](http://api.yandex.com/maps/doc/jsapi/) and module source code by adding following code into &lt;head&gt; section of your page
   ```html
   <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
   <!-- Change my.cdn.tld to your CDN host name -->
   <script src="http://my.cdn.tld/Heatmap.min.js" type="text/javascript"></script>
   ```

3. Get access to module functions by using [ymaps.modules.require](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/modules.require.xml) method
   ```js
   ymaps.modules.require(['Heatmap'], function (Heatmap) {
        var heatmap = new Heatmap();
   });
   ```

## Heatmap constructor

| Parameter | Default value | Decription |
|---------|-----------------------|----------|
| data | - | Type: Object.<br>Points described using of following formats:<ul><li>Number[][] - coordinates array;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml) - object implementing `IGeoObject` interface;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml)[] - array of objects implementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml) - collection of objects implementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml)[] - array of collection of objects implementing `IGeoObject` interface;</li><li>[GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) - result of [geoQuery](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/geoQuery.xml) execution;</li><li>Any - JSON representation of data according to [GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) input data format.</li> |
|  options |  - | Type: Object.<br>Heatmap representation options. |
|  options.radius |  10 | Type: Number.<br>Point radius of influence (px). |
|  options.dissipating |  false | Type: Boolean.<br>`true` - disperse points on higher zoom levels according to radius (point radius equals `radius * zoom / 10`), `false` - doesn't disperse. |
|  options.opacity |  0.6 | Type: Number.<br>Heatmap opacity (from 0 to 1). |
|  options.intensityOfMidpoint |  0.2 | Type: Number.<br>Intensity of median point (from 0 to 1). |
|  options.gradient | {<br>&nbsp;&nbsp;&nbsp;&nbsp;0.1:&nbsp;'rgba(128,&nbsp;255,&nbsp;0,&nbsp;1)',<br>&nbsp;&nbsp;&nbsp;&nbsp;0.2:&nbsp;'rgba(255,&nbsp;255,&nbsp;0,&nbsp;1)',<br>&nbsp;&nbsp;&nbsp;&nbsp;0.7:&nbsp;'rgba(234,&nbsp;72,&nbsp;58,&nbsp;1)',<br>&nbsp;&nbsp;&nbsp;&nbsp;1.0:&nbsp;'rgba(162,&nbsp;36,&nbsp;25,&nbsp;1)'<br>} | Type: Object.<br>JSON description of gradient. |

## Properties

| Name| Type| Description|
|----|-----|----------|
| options | [option.Manager](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/option.Manager.xml) | `Heatmap` instance options manager. |

## Methods

| Name| Returns | Description |
|----|------------|----------|
| [getData](#getdata) | Object&nbsp;&#124;&nbsp;null | Returns reference to data provided to constructor or [setData](#setdata) method. |
| [setData](#setdata) | Heatmap | Adds new points. If `Heatmap` instance is already rendered, it will be re-rendered. |
| [getMap](#getmap) |  Map&nbsp;&#124;&nbsp;null | Returns reference to [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) object. |
| [setMap](#setmap) |  Heatmap | Sets [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) instance to render heatmap layer over it. |
| [destroy](#destroy) | - | Destroys `Heatmap` instance. |


### getData
####Returns:
reference to data provided to constructor or [setData](#setdata) method.

### setData
Sets points. If `Heatmap` instance is already rendered, it will be re-rendered.

#### Returns:
Self-reference.

#### Parameters:
| Parameter | Default value | Description |
|---------|-----------------------|----------|
| data | - | Type: Object.<br>Points descibed using one of following formats:<ul><li>Number[][] - coordinates array;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml) - object implementing `IGeoObject` interface;</li><li>[IGeoObject](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/IGeoObject.xml)[] - array of objects implementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml) - collection of objects imlementing `IGeoObject` interface;</li><li>[ICollection](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/ICollection.xml)[] - array of collection of objects implementing `IGeoObject` interface;</li><li>[GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) - result of [geoQuery](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/geoQuery.xml) execution;</li><li>Any - JSON representation of data according to [GeoQueryResult](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml) input data format.</li> |


### getMap
#### Returns:
reference to [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) object.

### setMap
Sets [Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) instance to render `Heatmap` object over it.

#### Returns:
self-reference.

#### Parameters:
| Parameter | Default value | Description |
|----------|-----------------------|----------|
| map | - | Type:Map<br/>[Map](http://api.yandex.com/maps/doc/jsapi/2.1/ref/reference/Map.xml) instance to render `Heatmap` object over it. |


### destroy
Destroys `Heatmap` instance

## Examples

* Displaying heatmap over geographical map:

  ```js
  ymaps.modules.require(['Heatmap'], function (Heatmap) {
       var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
           heatmap = new Heatmap(data);
       heatmap.setMap(myMap);
  });
  ```

  ```js
  ymaps.modules.require(['Heatmap'], function (Heatmap) {
       var data = {
                type: 'FeatureCollection',
                features: [{
                    id: 'id1',
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [37.782551, -122.445368]
                    }
                }, {
                    id: 'id2',
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [37.782745, -122.444586]
                    }
                }]
            },
           heatmap = new Heatmap(data);
       heatmap.setMap(myMap);
  });
  ```

* Updating heatmap data:

  ```js
  ymaps.modules.require(['Heatmap'], function (Heatmap) {
      var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
          heatmap = new Heatmap(data);
      heatmap.setMap(myMap);

      var newData = [[37.774546, -122.433523], [37.784546, -122.433523]];
      heatmap.setData(newData);
  });
  ```

* Changing heatmap representation options.

  ```js
  ymaps.modules.require(['Heatmap'], function (Heatmap) {
      var data = [[37.782551, -122.445368], [37.782745, -122.444586]],
          heatmap = new Heatmap(data);
      // Heatmap becomes opaque
      heatmap.options.set('opacity', 1);
      heatmap.setMap(myMap);
  });
  ```

  ```js
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

* [Demo](http://alt-j.github.io/ymaps-heatmap/)


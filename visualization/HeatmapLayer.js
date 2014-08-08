/**
 * @fileOverview Модуль, позволяющий наносить слой тепловой карты.
 */
ymaps.modules.define('visualization.HeatmapLayer', [
    'Layer',
    'visualization.HeatmapTileUrlsGenerator'
], function (
    provide,
    Layer,
    HeatmapTileUrlsGenerator
) {
    /**
     * Хелпер к созданию слоя "тепловая карта".
     *
     * @param {Array} points Массив точек в географический координатах.
     * @param {Object} options Объект с опциями отображения тепловой карты:
     *  opacity - глобальная прозрачность карты;
     *  pointRadius - радиус точки;
     *  pointBlur - радиус размытия вокруг точки, на тепловой карте;
     *  pointOpaicty - прозрачность точки;
     *  gradient - объект задающий градиент.
     *  @returns {Layer}
     */
    var HeatmapLayer = function (points, options) {
        var layer = new Layer('', { tileTransparent: true }),
            tileUrlsGenerator = new HeatmapTileUrlsGenerator(
                layer, points, options
            );
        layer.getTileUrl = tileUrlsGenerator.getTileUrl.bind(tileUrlsGenerator);

        return layer;
    };

    provide(HeatmapLayer);
});

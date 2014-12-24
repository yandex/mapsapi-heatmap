var should = chai.should();
var modules = ymaps.modules;

describe('dataConverter', function () {
    before(function (done) {
        ymaps.ready(function () {
            done();
        })
    });

    describe('#convert()', function () {
        it('convert from JsonFeature[]', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = [{
                    id: 'id',
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [21, 21]
                    }
                }];
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql(data[0].geometry.coordinates);
            });
        });

        it('convert from JsonFeatureCollection', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = {
                    type: 'FeatureCollection',
                    features: [{
                        id: 'id',
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [21, 21]
                        }
                    }]
                };
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql(data.features[0].geometry.coordinates);
            });
        });

        it('convert from Number[]', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = [21, 21];
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql(data);
            });
        });

        it('convert from Number[][]', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = [[21, 21]];
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql(data[0]);
            });
        });

        it('convert from JsonGeometry', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = {
                    type: 'Point',
                    coordinates: [21, 21]
                };
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql(data.coordinates);
            });
        });

        it('convert from GeoObject', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = new ymaps.Placemark([21, 21]);
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql([21, 21]);
            });
        });

        it('convert from IGeoObject[]', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = [new ymaps.Placemark([21, 21])];
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql([21, 21]);
            });
        });

        it('convert from IGeoObjectCollection', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = new ymaps.GeoObjectCollection(
                    new ymaps.Placemark([21, 21])
                );
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql([21, 21]);
            });
        });

        it('convert from nested IGeoObjectCollection', function () {
            modules.require('heatmap.component.dataConverter', function (dataConverter) {
                var data = new ymaps.GeoObjectCollection(
                    new ymaps.GeoObjectCollection(
                        new ymaps.Placemark([21, 21])
                    )
                );
                var points = dataConverter.convert(data);
                chai.expect(points[0].coordinates)
                    .to.eql([21, 21]);
            });
        });
    });
});

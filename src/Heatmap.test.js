var should = chai.should(),
    modules = ymaps.modules;

describe('Heatmap', function () {
    before(function (done) {
        ymaps.ready(function () {
            done();
        })
    });

    describe('convert different types of data to array of points', function () {
        it('convert from JsonFeature', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = {
                        id: 'id',
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [21,21]
                        }
                    },
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql(data.geometry.coordinates);
            });
        });

        it('convert from JsonFeatureCollection', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = {
                        type: 'FeatureCollection',
                        features: [{
                            id: 'id',
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [21,21]
                            }
                        }]
                    },
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql(data.features[0].geometry.coordinates);
            });
        });

        it('convert from Number[]', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = [21,21],
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql(data);
            });
        });

        it('convert from Number[][]', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = [[21,21]],
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql(data[0]);
            });
        });

        it('convert from JsonGeometry', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = { type: 'Point', coordinates: [21,21] },
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql(data.coordinates);
            });
        });

        it('convert from GeoObject', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = new ymaps.Placemark([21,21]),
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql([21,21]);
            }); 
        });

        it('convert from IGeoObject[]', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = [new ymaps.Placemark([21,21])],
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql([21,21]);
            }); 
        });

        it('convert from IGeoObjectCollection', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = new ymaps.GeoObjectCollection(
                        new ymaps.Placemark([21,21])
                    ),
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql([21,21]);
            }); 
        });

        it('convert from nested IGeoObjectCollection', function () {
            modules.require(['Heatmap'], function (Heatmap) {
                var data = new ymaps.GeoObjectCollection(
                        new ymaps.GeoObjectCollection(
                            new ymaps.Placemark([21,21])
                        )
                    ),
                    heatmap = new Heatmap(data);
                chai.expect(heatmap._unprocessedPoints[0].coordinates)
                    .to.eql([21,21]);
            }); 
        });
    });
});
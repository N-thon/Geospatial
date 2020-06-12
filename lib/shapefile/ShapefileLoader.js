class ShapefileLoader {
  constructor() {
    this.transform = null;
  }

  async load(path) {
    const matLine = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 3, // in pixels
      resolution: new THREE.Vector2(1000, 1000),
      dashed: false,
    });

    const features = await this.loadShapefileFeatures(path);
    const node = new THREE.Object3D();

    for (const feature of features) {
      const fnode = this.featureToSceneNode(feature, matLine);
      node.add(fnode);
    }

    let setResolution = (x, y) => {
      matLine.resolution.set(x, y);
    };

    const result = {
      features: features,
      node: node,
      setResolution: setResolution,
    };

    return result;
  }

  featureToSceneNode(feature, matLine) {
    let geometry = feature.geometry;

    let color = new THREE.Color(1, 1, 1);

    let transform = this.transform;
    if (transform === null) {
      transform = { forward: (v) => v };
    }


    if (feature.geometry.type === 'PointZ') {
      let coordinates = [];

      coordinates.push(
        new THREE.Vector3(
          geometry.coordinates[0],
          geometry.coordinates[1],
          geometry.coordinates[2]
        )
      );

      var particle_geom = new THREE.Geometry().setFromPoints(coordinates);
      var particle_material = new THREE.PointsMaterial({color: 0x80FFFF});

      var particle = new THREE.Points(particle_geom, particle_material);
      return particle;



    } else if (geometry.type === 'LineStringZ') {
      let coordinates = [];

      let min = new THREE.Vector3(Infinity, Infinity, Infinity);
      for (let i = 0; i < geometry.coordinates.length; i++) {

        coordinates.push(
          new THREE.Vector3(
            geometry.coordinates[i][0],
            geometry.coordinates[i][1],
            geometry.coordinates[i][2]
          )
        );
      }

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        coordinates
      );

      const line = new THREE.Line(lineGeometry, matLine);
      return line;


    } else {
      console.log('unhandled feature: ', feature);
    }
  }

  async loadShapefileFeatures(file) {
    let features = [];

    let source = await shapefile.open(file);

    while (true) {
      let result = await source.read();

      if (result.done) {
        break;
      }

      if (
        result.value &&
        result.value.type === 'Feature' &&
        result.value.geometry !== undefined
      ) {
        features.push(result.value);
      }
    }

    return features;
  }
}

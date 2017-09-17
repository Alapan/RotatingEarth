const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ASPECT = WIDTH / HEIGHT;

const onRenderFcts = [];
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, ASPECT, 0.1, 1500);
camera.position.z = 1.5;

scene.add(new THREE.AmbientLight(0x333333));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);

const earthMaterial = new THREE.MeshPhongMaterial({
  bumpScale: 0.015,
  specular: new THREE.Color('grey')
});
const renderer = new THREE.WebGLRenderer();

const textureMaps = [
  {
    uri: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthmap1k.jpg',
    property: 'map'
  },
  {
    uri: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthbump1k.jpg',
    property: 'bumpMap'
  },
  {
    uri: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthspec1k.jpg',
    property: 'specularMap'
  }
];


function loadTexture(textureMap) {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureMap.uri, (texture) => {
      resolve(texture);
    },
    () => {},
    (error) => {
    	reject(error);
    });
  });
}

function createCloudMesh() {
  const cloudGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    opacity: 0.4,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const cloudTextureMap = {
    uri: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg',
    property: 'map'
  };

  return loadTexture(cloudTextureMap).then((texture) => {
    cloudMaterial.map = texture;
    cloudMaterial.needsUpdate = true;
    return new THREE.Mesh(cloudGeometry, cloudMaterial);
  }, (error) => {
    console.log('ERROR: ', error);
  });
}

function createEarthMesh(earthMaterial) {
  earthMaterial = earthMaterial[earthMaterial.length - 1];
  const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

  return createCloudMesh().then((cloudMesh) => {
    earthMesh.add(cloudMesh);
    return earthMesh;
  }, (error) => {
    console.log('ERROR: ', error);
  });
}

function createStarMesh() {
  const starGeometry = new THREE.SphereGeometry(90, 32, 32);
  const starMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide
  });

  const starTextureMap = {
    uri: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/starfield.png',
    property: 'map'
  };

  return loadTexture(starTextureMap).then((texture) => {
    starMaterial.map = texture;
    starMaterial.needsUpdate = true;
    return new THREE.Mesh(starGeometry, starMaterial);
  },(error) => {
    console.log('ERROR: ', error);
  });
}

let earth = '';

Promise.all(textureMaps.map((textureMap) => {
  return loadTexture(textureMap).then((texture) => {
    earthMaterial[textureMap.property] = texture;
    earthMaterial.needsUpdate = true;
    return earthMaterial;
  }, (error) => {
    console.log('ERROR: ', error);
  });
})).then((earthMaterial) => {
  createEarthMesh(earthMaterial).then((earthMesh) => {
    earth = earthMesh;
    document.body.appendChild(renderer.domElement);

    createStarMesh().then((starMesh) => {
      scene.add(earthMesh);
      scene.add(starMesh);
      renderer.setSize(WIDTH, HEIGHT);
      render();
    }, (error) => {
      console.log('ERROR: ', error);
    });
  });

}, (error) => {
  console.log('ERROR: ', error);
});

function render() {
  requestAnimationFrame(render);
  earth.rotation.y = +new Date() /10000;
  renderer.render(scene, camera);
}

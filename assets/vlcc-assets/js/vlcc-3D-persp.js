window.ocean = (function (w, d, $) {

    params = {
        color: '#eeffff',
        scale: 4,
        flowX: .1,
        flowY: .4,
        flowSpeed: 0.02,
        bottomSpeedX: 0,
        bottomSpeedY: 0.0003,
        bottomScrollFactor: 0.05,
        width: window.innerWidth * 4,
        height: window.innerHeight * 4,
        heightAspect: 25,
        wavesImageSize: { x: 625, y: 3055 },
        shipToWakeOffset: 625,
        wakeImage: '/Assets/vlcc-assets/images/chevron-ship-wake-01a.png',
        waterBottomImage: '/Assets/vlcc-assets/js/lib/threejs/textures/water/water-arial-1024.jpg',
        waterNormalTexture1: '/Assets/vlcc-assets/js/lib/threejs/textures/water/Water_1_M_Normal.jpg',
        waterNormalTexture2: '/Assets/vlcc-assets/js/lib/threejs/textures/water/Water_2_M_Normal.jpg',
        portWavesImage: '/Assets/vlcc-assets/images/port-waves.png'
    };
    var wakePhases = { large: "large", small: "small", reverse: "reverse" };
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse
    var canvas, scene, renderer, clock, textureLoader, bottom, water, waves, portWaves, wakePhase, bottomSpeedX, bottomSpeedY, bottomScrollFactor, zooming = false;

    function resizeRendererToDisplaySize(renderer) {
        //const canvas = renderer.domElement;
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        var shipImg = d.getElementById("ship-image");
        var needResize = canvas.width !== width || canvas.height !== height;
        if (shipImg !== null) {
            needResize = needResize || shipImg.naturalWidth !== shipImg.height || shipImg.naturalHeight !== shipImg.height;
        }
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            if (wakePhase === wakePhases.large) {
                matchShipSize();
            } else if (wakePhase === wakePhases.small) {
                matchSmallShipSize();
            } else if (wakePhase === wakePhases.reverse) {
                matchReverseShipSize();
            }

        }

        if (wakePhase === wakePhases.large) {
            matchShipPosition();
            updateBottom();
        } else if (wakePhase === wakePhases.small) {
            matchSmallShipPosition();
            updateBottom();
        } else if (wakePhase === wakePhases.reverse) {
            matchReverseShipPosition();
            updateBottomReverse();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function getBottomSpeed() {
        return $(window).scrollTop() * bottomScrollFactor;
    }

    function updateBottom() {
        //var delta = clock.getDelta();
        bottom.position.z = getBottomSpeed();

        //animate the waves
        var map = bottom.material.map;
        if (map == undefined) return;
        //map.offset.x += 0.00002;
        //map.offset.y += 0.0003;
        map.offset.x += bottomSpeedX;
        map.offset.y += bottomSpeedY;

    }

    function updateBottomReverse() {
        bottom.position.z = getBottomSpeed();
        //animate the waves
        var map = bottom.material.map;
        if (map == undefined) return;
        map.offset.x += bottomSpeedX;
        map.offset.y += bottomSpeedY;
    }


    function matchShipPosition() {
        if (zooming) {
            waves.position.x = -10000;
            return;
        }
        //match position
        var rect = $("#ship-image")[0].getBoundingClientRect();
        shiph = (rect.height + params.shipToWakeOffset * (rect.height / $("#ship-image")[0].naturalHeight));
        var relX = rect.left + rect.width / 2;
        var relY = rect.top + shiph / 2;

        vec.set((relX / canvas.width) * 2 - 1, - (relY / canvas.height) * 2 + 1, 0.5);
        vec.unproject(camera);
        vec.sub(camera.position).normalize();

        var distance = - camera.position.y / vec.y;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));

        waves.position.x = pos.x;
        waves.position.z = pos.z;
        return pos;
    }

    function matchShipSize() {
         var rect = $("#ship-image")[0].getBoundingClientRect();
        imageW = (rect.width) / window.devicePixelRatio;
        imageH = (rect.height + params.shipToWakeOffset * (rect.width / $("#ship-image")[0].naturalWidth)) / window.devicePixelRatio;

        //console.log("w:" + imageW + " h:" + imageH);
        //console.log("w:" + ((imageW / canvas.width)- 1) + " h:" + (imageH / canvas.height) + 1);
        vec.set(imageW, - imageH, 0.5);

        //console.log("img:" + vec.x + ', ' + vec.y + ', ' + vec.z);

        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        var distance = - camera.position.y / vec.y;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));

        //console.log(pos);
        waves.scale.x = pos.x / canvas.width * window.devicePixelRatio * 2.1;
        waves.scale.y = pos.z / canvas.height * window.devicePixelRatio * 2.1;
        //console.log("waves.scale.x:" + waves.scale.x + ", waves.scale.y:" + waves.scale.x);
    }


    function matchSmallShipPosition() {
        //match position
        var rect = $("#ship-image-mobile-small")[0].getBoundingClientRect();
        shiph = (rect.height + params.shipToWakeOffset * (rect.height / $("#ship-image-mobile-small")[0].naturalHeight));
        var relX = rect.left + rect.width / 2;
        var relY = rect.top + shiph / 2;

        vec.set((relX / canvas.width) * 2 - 1, - (relY / canvas.height) * 2 + 1, 0.5);
        vec.unproject(camera);
        vec.sub(camera.position).normalize();

        var distance = - camera.position.y / vec.y;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));

        waves.position.x = pos.x;
        waves.position.z = pos.z;
        return pos;
    }

    function matchSmallShipSize() {
        var rect = $("#ship-image-mobile-small")[0].getBoundingClientRect();
        imageW = (rect.width) / window.devicePixelRatio;
        imageH = (rect.height + params.shipToWakeOffset * (rect.width / $("#ship-image-mobile-small")[0].naturalWidth)) / window.devicePixelRatio;

        //console.log("w:" + imageW + " h:" + imageH);
        //console.log("w:" + ((imageW / canvas.width)- 1) + " h:" + (imageH / canvas.height) + 1);
        vec.set(imageW, - imageH, 0.5);

        //console.log("img:" + vec.x + ', ' + vec.y + ', ' + vec.z);

        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        var distance = - camera.position.y / vec.y;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));

        //console.log(pos);
        waves.scale.x = pos.x / canvas.width * window.devicePixelRatio * 2;
        waves.scale.y = pos.z / canvas.height * window.devicePixelRatio * 2;
        //console.log("waves.scale.x:" + waves.scale.x + ", waves.scale.y:" + waves.scale.x);
    }



    function matchReverseShipPosition() {
        if ($("#port-container").offset().top - $(window).scrollTop() > 0) {
            waves.position.x = - 3000;
            return;
        }
        //match position
        var rect = $("#ship-small-image")[0].getBoundingClientRect();
        shiph = (rect.height - params.shipToWakeOffset * (rect.height / $("#ship-small-image")[0].naturalHeight));
        var relX = rect.left + rect.width / 2;
        var relY = rect.top + shiph / 2;

        vec.set((relX / canvas.width) * 2 - 1, - (relY / canvas.height) * 2 + 1, 0.5);
        vec.unproject(camera);
        vec.sub(camera.position).normalize();

        var distance = - camera.position.y / vec.y;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));

        waves.position.x = pos.x;
        waves.position.z = pos.z;
        return pos;
    }

    function matchReverseShipSize() {
        var rect = $("#ship-small-image")[0].getBoundingClientRect();
        imageW = (rect.width) / window.devicePixelRatio;
        imageH = (rect.height + params.shipToWakeOffset * (rect.width / $("#ship-small-image")[0].naturalWidth)) / window.devicePixelRatio;

        //console.log("w:" + imageW + " h:" + imageH);
        //console.log("w:" + ((imageW / canvas.width)- 1) + " h:" + (imageH / canvas.height) + 1);
        vec.set(imageW, - imageH, 0.5);

        //console.log("img:" + vec.x + ', ' + vec.y + ', ' + vec.z);

        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        var distance = - camera.position.y / vec.y;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));

        //console.log(pos);

        waves.scale.x = pos.x / canvas.width * window.devicePixelRatio * 2;
        waves.scale.y = pos.z / canvas.height * window.devicePixelRatio * 2;
    }

    function drawDot(pos) {

        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        var dotMaterial = new THREE.PointsMaterial({ size: 50, sizeAttenuation: false, color: "#f00" });
        var dot = new THREE.Points(dotGeometry, dotMaterial);
        dot.position.x = pos.x;
        dot.position.y = pos.y;
        dot.position.z = pos.z;
        scene.add(dot);
    }

    function main() {
        //flag indicating the orientation of the wake
        wakePhase = wakePhases.large;
        bottomSpeedX = params.bottomSpeedX;
        bottomSpeedY = params.bottomSpeedY;
        bottomScrollFactor = params.bottomScrollFactor;

        canvas = document.querySelector('#canvas-1');
        renderer = new THREE.WebGLRenderer({ canvas: canvas });
        clock = new THREE.Clock();
        textureLoader = new THREE.TextureLoader();

        //scene
        scene = new THREE.Scene();
        scene.fog = false;

        // camera
        camera = new THREE.PerspectiveCamera(28, params.width / params.height, 0.1, 10000);
        camera.position.set(0, 1000, 0);
        camera.aspect = canvas.clientWidth, canvas.clientHeight;
        camera.lookAt(scene.position);


        // light
        var ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, .8);
        directionalLight.position.set(0, 1000, -1200);
        scene.add(directionalLight);

        // bottom
        var bottomGeometry = new THREE.PlaneBufferGeometry(params.width, params.heightAspect * params.height);
        var bottomMaterial = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.5 });
        bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottom.rotation.x = Math.PI * - 0.5;
        bottom.position.y = -10;
        bottom.position.z = 0;
        scene.add(bottom);

        textureLoader.load(params.waterBottomImage, function (map) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 0;
            map.repeat.set(2, params.heightAspect * 4);
            bottomMaterial.map = map;
            bottomMaterial.needsUpdate = true;
            bottomMaterial.fog = false;
        });

        //sky
        var skyGeometry = new THREE.PlaneBufferGeometry(params.width * 4, params.height * 4);
        var skyMaterial = new THREE.MeshStandardMaterial({ color: 0xadddff });
        sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.rotation.x = Math.PI * + 0.25;
        sky.position.y = 1000;
        sky.position.z = 0;
        scene.add(sky);


        //waves and wake
        var wavesGeometry = new THREE.PlaneBufferGeometry(1, 1);
        var wavesMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.4, transparent: true });
        waves = new THREE.Mesh(wavesGeometry, wavesMaterial);
        waves.position.x = 0;
        waves.position.y = 0;
        waves.position.z = 0;
        waves.rotation.x = Math.PI * - 0.5;
        scene.add(waves);

        textureLoader.load(params.wakeImage, function (map) {
            map.repeat.set(1, 1);
            wavesMaterial.map = map;
            wavesMaterial.needsUpdate = true;
            matchShipSize();
        });

        // water
        var waterGeometry = new THREE.PlaneBufferGeometry(params.width, params.height);
        water = new THREE.Water(waterGeometry, {
            color: params.color,
            scale: params.scale,
            flowDirection: new THREE.Vector2(params.flowX, params.flowY),
            flowSpeed: params.flowSpeed,
            normalMap0: textureLoader.load(params.waterNormalTexture1),
            normalMap1: textureLoader.load(params.waterNormalTexture2),
            sunDirection: new THREE.Vector3(0, 0, 0),
            distortionScale: 1,
            textureWidth: 1024,
            textureHeight: 1024,
            reflectivity: 0.3,
            fog: false
        });

        water.position.y = 10;
        water.position.z = 0;
        water.rotation.x = Math.PI * - 0.5;
        scene.add(water);

        //var controls = new THREE.OrbitControls(camera, renderer.domElement);

        //var axesHelper = new THREE.AxesHelper(500);
        //scene.add(axesHelper);


        requestAnimationFrame(render);
    }

    function isScrolledIntoView(elem) {
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = elem.offset().top;
        var elementBottom = elementTop + elem.height();
        var visible = ((elementTop <= pageBottom) && (elementBottom >= pageTop));
        //console.log("visible:" + visible);
        return visible;
    }


    function enterLargePhase() {
        //console.log("enter large wake");
        wakePhase = wakePhases.large;
        matchShipSize();
        matchShipPosition();
    }

    function exitLargePhase() {
       //console.log("exit large wake");
        wakePhase = wakePhases.small;
        matchSmallShipSize();
        matchSmallShipPosition();
    }

    function enterSmallPhase() {
       //console.log("enter small wake");
        wakePhase = wakePhases.small;
        matchSmallShipSize();
        matchSmallShipPosition();
    }

    function exitSmallPhase() {
        console.log("exit small wake");
        wakePhase = wakePhases.large;
        matchSmallShipSize();
        matchSmallShipPosition();
    }

    function enterReversePhase() {
        console.log("enter reverse wake");
        //waves.rotateZ(Math.PI);
        waves.rotation.z = Math.PI;
        wakePhase = wakePhases.reverse;
        matchReverseShipSize();
        matchReverseShipPosition();
    }

    function exitReversePhase() {
        console.log("exit reverse wake");
        //waves.rotateZ(-Math.PI);
        waves.rotation.z = 0;
        wakePhase = wakePhases.large;
        matchShipSize();
        matchShipPosition();
    }


    function zoomProgress(progress) {
        //var zoomFactor = Math.min(progress, .5);
        var zoomFactor = progress;
        if (zoomFactor >= 0 && zoomFactor < 1) {
            camera.position.y = 1000 + 1000 * zoomFactor;
            //zooming = true;
        } else {
            //zooming = false;
        }
        //water.scale = params.scale - 2 * zoomFactor;
        //water.flowSpeed = params.flowSpeed * zoomFactor/30;
        //console.log("progress:" + progress + " zoomFactor:" + zoomFactor + " camera.position.y:" + camera.position.y);
    }

    function enterZoom() {
        zooming = true;
    }
    function exitZoom() {
        zooming = false;
    }
    function setScrollSpeed(speed) {
        bottomScrollFactor = speed;
    }

    $(document).ready(function () {
        main();
    });

    return {
        enterLargePhase: enterLargePhase,
        exitLargePhase: exitLargePhase,
        enterReversePhase: enterReversePhase,
        exitReversePhase: exitReversePhase,
        enterSmallPhase: enterSmallPhase,
        exitSmallPhase: exitSmallPhase,
        enterZoom: enterZoom,
        exitZoom: exitZoom,
        zoomProgress: zoomProgress,
        setScrollSpeed: setScrollSpeed
    };

})(window, document, jQuery);
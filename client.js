// TODO: Add back Android Icons
// TODO: Implement Time Slider
// TODO: Capture new video

// Config Wide Parameters
let HOSTNAME_TEST = '34.66.201.87:8282';
let PORTNUM = 8282;
let START_TIME = "now";
let END_TIME = '2020-05-01';
let SYNC = false;
let TIMEOUT = 4000;
let REPLAY_FACTOR = 999999;
let USEFFMPEGWORKERS = true;
let DS_PROTOCOL = "ws";
let WEBSOCKET_PROTOCOL = 'ws';
let SOS = "SOS";
let HISTORY_DEPTH_MILLIS = 3 * 24 * 3600 * 1000;

let TEST_SOS_ENDPOINT = HOSTNAME_TEST + "/sensorhub/sos";
let TEST_SPS_ENDPOINT = HOSTNAME_TEST + "/sensorhub/sps";

let cesiumView;
let treeItems = [];
let menuItems = [];
let treeMenuId = "tree-menu-";
let mapMenuId = "map-menu-";
let menuGroupId = "allmenus";
let dataReceiverController = {};
let contextCircularMenuId = 'menu-' + OSH.Utils.randomUUID();
let stackMenuID = 'menu-' + OSH.Utils.randomUUID();
let circMenuItems = [
    {
        name: "Item 1",
        viewId: 'viewId1',
        css: 'cmenu-test1'
    },
    {
        name: 'Item 2',
        viewId: 'viewId2',
        css: 'cmenu-test1'
    }];
let customLayers = {orthos: {}, boundaries: {}, addressPoints: {}};
let locStylerToEntities = {};
let zoomOnSelect = false;


function init() {
    let tableDialog = OSH.UI.DialogView('avl', {
        draggable: true,
        css: "video-dialog",
        name: 'AVL Table',
        show: true,
        dockable: false,
        closeable: true,
        connectionIds: [],
        keepRatio: true
    });

    // Main Data Source Controller
    dataReceiverController = new OSH.DataReceiver.DataReceiverController({
        replayFactor: REPLAY_FACTOR
    });

    window.CESIUM_BASE_URL = 'vendor/';
    window.OSH.BASE_WORKER_URL = "js/workers";


    // Misc Cameras
    // Sensors.addCamSource('Dahua-Mini', 'Dahua Mini PTZ', 'urn:dahua:cam:1G0215CGAK00046', {
    //     spsID: 'urn:dahua:cam:1G0215CGAK00046',
    //     videoType: 'h264',
    //     reverseTilt: true
    // });
    // Sensors.addCamSource('Axis-Cam', 'Axis PTZ', 'urn:axis:cam:00408CA0FF1C', {
    //     spsID: 'urn:axis:cam:00408CA0FF1C',
    //     videoType: 'mjpeg'
    // });
    // Sensors.addCamSource('GeoCam-0102', 'GeoCam 0102', 'urn:osh:system:geocam:0102-sos', {
    //     videoType: 'mjpeg'
    // });
    Sensors.addCamSource('TVS-ROP', 'TVS-ROP', 'urn:osh:sensor:rtpcam:tvs-rop-1-sos', {
        sosEndpoint: '34.66.201.87:8282/sensorhub/sos',
        videoType: 'h264'
    });


    // Create Tree View
    let entityTree = createEntityTree(treeItems);
    // add context to folder child nodes
    // console.debug(entityTree);
    let childNodes = entityTree.view.tree.childNodes;
    for (let node of childNodes) {
        let nodeDiv = document.getElementById(node.id);
        // console.debug(nodeDiv);
        // console.debug(node.text);
        switch (node.text) {
            case 'Traffic Cams':
                // create context menu
                let ctxtMenu = MarkerLayers.trafficCamContext();
                node.contextMenu = ctxtMenu.id;
                break;
            case 'USGS Stream Gages':
                let usgsMenu = MarkerLayers.usgsContext();
                node.contextMenu = usgsMenu.id;
                console.log('USGS CONTEXT MENU', usgsMenu);
                break;
            case 'NOAA Buoys':
                let noaaMenu = MarkerLayers.noaaContext();
                node.contextMenu = noaaMenu.id;
                break;
            case 'AVL Fleet Data':
                let avlMenu = MarkerLayers.avlContext();
                node.contextMenu = avlMenu.id;
                break;
            case 'Smart Hubs':
                let androidMenu = MarkerLayers.androidContext();
                node.contextMenu = androidMenu.id;
                break;
            case 'Mesonet':
                let mesonetMenu = MarkerLayers.mesonetContext();
                node.contextMenu = mesonetMenu.id;
                break;
            case 'UAV':
                let uavMenu = MarkerLayers.uavContext();
                node.contextMenu = uavMenu.id;
                break;
            default:
                break;
        }
    }

    // Connect DataSources after all other initialization
    dataReceiverController.connectAll();

    // Remove loading text
    let loadingText = document.getElementById('preload-txt');
    loadingText.parentNode.removeChild(loadingText);
}

function createEntityTree(treeEntities) {
    let entityTreeDialog = new OSH.UI.DialogView("entity-disp", {
        css: "entity-tree-1",
        name: "Entities",
        show: true,
        draggable: true,
        dockable: false,
        closeable: true
    });

    let entityTreeView = new OSH.UI.EntityTreeView(entityTreeDialog.popContentDiv.id, treeEntities,
        {
            css: "tree-container"
        }
    );
    // let treeDiv = document.getElementById('entity-disp');
    // let treeInner = treeDiv.childNodes;
    // treeInner[0].classList.add('tree-inner');
    // console.log(treeInner[0]);
    return {dialog: entityTreeDialog, view: entityTreeView};
}


function createPMStyler(entityName, targetModel, gpsSource, options) {
    let model = "./images/drawhelper/glyphicons_242_google_maps.png";
    if (targetModel != null) {
        model = targetModel;
    }

    let styler = new OSH.UI.Styler.PointMarker({
        locationFunc: {
            dataSourceIds: [gpsSource.getId()],
            handler: function (rec) {
                console.log(rec);
                return {
                    x: rec.lon,
                    y: rec.lat,
                    z: rec.alt
                };
            }
        },
        icon: model,
        label: entityName
    });

    if (options !== undefined && options !== null) {
        styler.location = {
            x: options.lon,
            y: options.lat,
            z: options.alt
        }
    }

    return styler;
}

/**
 *
 * @param parentDialog - OSH Dialog that we're parenting this view to
 * @param dataSource - DataSource for the y value of the chart (vertical)
 * @param yDataPath - path from rec to get to the data ex: "yDataPathA.yDataPathB" yields rec["yDataPathA"]["yDataPathB"]
 * @param yLabel - label for yValue
 */
function simpleChartViewAndStyler(parentDialog, dataSource, yDataPath, yLabel) {
    console.log(parentDialog);
    // create a new element to hold latest value
    let newElem = document.createElement('div');
    let title = document.createElement('h5');
    title.innerText = yLabel + ': ';
    title.style.display = 'inline-block';
    let result = document.createElement('p');
    result.innerText = 'NO RECENT DATA';
    result.style.display = 'inline-block';
    newElem.appendChild(title);
    newElem.appendChild(result);

    let chartView = new OSH.UI.Nvd3CurveChartView(parentDialog.popContentDiv.id,
        [{
            styler: new OSH.UI.Styler.Curve({
                color: "#FF0000",
                valuesFunc: {
                    dataSourceIds: [dataSource.getId()],
                    handler: function (rec, timeStamp) {
                        // console.log(rec);
                        result.innerText = rec[yDataPath.toString()];
                        return {
                            x: timeStamp,
                            y: rec[yDataPath.toString()]
                        };
                    }
                }
            })
        }],
        {
            dataSourceId: dataSource.getId(),
            yLabel: yLabel,
            xLabel: 'Time',
            xTickFormat: function (d) {
                return d3.time.format.utc('%d/%m %H:%MZ')(new Date(d))
            },
            showLegend: false,
            maxPoints: 50,
            css: "chart-view",
            cssSelected: "video-selected"
        });

    parentDialog.popContentDiv.appendChild(newElem);
    return chartView
}

function layerTreeContextMenu(mapView) {

    let orthosLayer = {
        name: 'Show/Hide',
        viewId: '',
        css: 'fa fa-eye',
        clickOverride: orthosOverride
    };
    let boundariesLayer = {
        name: 'Show/Hide',
        viewId: '',
        css: 'fa fa-eye',
        clickOverride: boundariesOverride
    };

    let apLayer = {
        name: 'Show/Hide',
        viewId: '',
        css: 'fa fa-eye',
        clickOverride: apOverride
    };

    let menuItems = [orthosLayer, boundariesLayer, apLayer];

    let stackMenu = {
        orthos: null,
        boundaries: null,
        addrPoints: null
    };
    let orthosStk = new OSH.UI.ContextMenu.StackMenu({
        id: 'menu-' + OSH.Utils.randomUUID(),
        groupId: '',
        items: [orthosLayer]
    });

    let boundStk = new OSH.UI.ContextMenu.StackMenu({
        id: 'menu-' + OSH.Utils.randomUUID(),
        groupId: '',
        items: [boundariesLayer]
    });

    let addrStk = new OSH.UI.ContextMenu.StackMenu({
        id: 'menu-' + OSH.Utils.randomUUID(),
        groupId: '',
        items: [apLayer]
    });

    stackMenu.orthos = orthosStk;
    stackMenu.boundaries = boundStk;
    stackMenu.addrPoints = addrStk;

    return stackMenu;

    function orthosOverride(event) {
        layerController(customLayers.orthos);
    }

    function boundariesOverride(event) {
        layerController(customLayers.boundaries);
    }

    function apOverride(event) {
        layerController(customLayers.addressPoints);
    }

    function layerController(layer) {
        // console.debug(layer.idx);
        let layers = mapView.viewer.imageryLayers;
        // console.debug(layers);
        // If layer is not visible, show
        if (layers['_layers'][layer.idx].show === true) {
            layers['_layers'][layer.idx].show = false;
        } else {
            layers['_layers'][layer.idx].show = true;
        }
        // else hide layer
    }
}

function keyByValue(object, value) {
    // console.debug('Object:', object);
    // console.log('Value:', value);
    return Object.keys(object).find(key => object[key] === value);
}


let Sensors = {
    createJSONReceiver: function (recName, offeringID, observedProp, options) {
        let dataRecProps = {
            // protocol: WEBSOCKET_PROTOCOL,
            protocol: WEBSOCKET_PROTOCOL,
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: observedProp,
            startTime: 'now',
            // replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 500,
            timeOut: TIMEOUT
        };

        if (options.hasOwnProperty('startTime')) {
            dataRecProps.startTime = options.startTime;
        }
        if (options.hasOwnProperty('endTime')) {
            dataRecProps.endTime = options.endTime;
        }
        if (options.hasOwnProperty('connect')) {
            dataRecProps.connect = options.connect;
        }
        if (options.hasOwnProperty('foi')) {
            dataRecProps.foiURN = options.foi;
        }
        if (options.hasOwnProperty('replaySpeed')) {
            dataRecProps.replaySpeed = options.replaySpeed;
        }
        // console.log(dataRecProps);
        return new OSH.DataReceiver.JSON(name, dataRecProps);
    },
    addAndroidPhoneSensor(entityId, entityName, offeringID, mapView, options) {
        let now = Date.now();
        let dRecOptions = {
            startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            endTime: new Date(now).toISOString(),
            connect: true,
            replaySpeed: 1
        };

        let locData = new OSH.DataReceiver.JSON('Location', {
            protocol: WEBSOCKET_PROTOCOL,
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/Location',
            startTime: 'now',
            // endTime: new Date(now).toISOString(),
            endTime: '2020-01-01',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: false
        });

        let orientation = new OSH.DataReceiver.OrientationQuaternion('Orientation', {
            protocol: WEBSOCKET_PROTOCOL,
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/OrientationQuaternion',
            startTime: 'now',
            endTime: '2020-01-01',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: false
        });

        let video = new OSH.DataReceiver.VideoMjpeg("Video", {
            protocol: WEBSOCKET_PROTOCOL,
            service: SOS,
            endpointUrl: SCIRA_SOS_ENDPT,
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: 'now',
            endTime: '2020-01-01',
            replaySpeed: "1",
            timeShift: 0,
            syncMasterTime: SYNC,
            bufferingTime: 0,
            timeOut: 4000,
            connect: false
        });

        let entity = {
            id: entityId,
            name: entityName,
            dataSources: [locData, orientation, video]
        };
        dataReceiverController.addEntity(entity);
        let ctxtDS = {
            locData: locData,
            orientation: orientation,
            video: video
        };
        let contextMenus = Context.createAndroidContextMenu(entity, {}, ctxtDS);
        entity.contextMenus = contextMenus;

        treeItems.push({
            entity: entity,
            entityId: entity.id,
            path: 'Smart Hubs',
            treeIcon: './images/light/2x/android2x.png',
            contextMenuId: contextMenus.stack.id
        });

        let styler = new OSH.UI.Styler.PointMarker({
            location: {
                x: 0,
                y: 0,
                z: 0
            },
            locationFunc: {
                dataSourceIds: [locData.getId()],
                handler: function (rec) {
                    // console.log(rec);
                    return {
                        x: rec.location.lon,
                        y: rec.location.lat,
                        // z: rec.location.alt
                        z: 0
                    };
                }
            },
            orientationFunc: {
                dataSourceIds: [orientation.getId()],
                handler: function (rec) {
                    // console.log('Heading: ', rec.heading);
                    return {heading: -rec.heading + 180};
                }
            },
            icon: './images/light/2x/android2x.png',
            // icon: './images/light/2x/android.png',

            label: entityName
        });
        entity.locStyler = styler;
        console.log(mapView);
        mapView.addViewItem({
            name: entity.name,
            entityId: entity.id,
            styler: styler,
            contextMenuId: contextMenus.circle.id
        });
        entity.sensorType = 'Android';
        // locStylerToEntities[entity.locStyler.id] = entity;
        return entity;
    },
    addCamSource(entityId, entityName, offeringID, options) {
        let now = Date.now();
        let dRecOptions = {
            startTime: new Date(now - HISTORY_DEPTH_MILLIS).toISOString(),
            endTime: new Date(now).toISOString(),
            connect: true,
            replaySpeed: 1
        };

        // TODO: change when for demo
        let sosEP = TEST_SOS_ENDPOINT;
        let spsEP = TEST_SPS_ENDPOINT;

        // TODO: point these to a different endpoint
        let locData = new OSH.DataReceiver.JSON('Location', {
            protocol: WEBSOCKET_PROTOCOL,
            service: SOS,
            endpointUrl: sosEP,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/Location',
            startTime: 'now',
            // endTime: new Date(now).toISOString(),
            endTime: '2020-01-01',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: false
        });

        let orientation = new OSH.DataReceiver.EulerOrientation('Orientation', {
            protocol: WEBSOCKET_PROTOCOL,
            service: SOS,
            endpointUrl: sosEP,
            offeringID: offeringID,
            observedProperty: 'http://sensorml.com/ont/swe/property/OrientationQuaternion',
            startTime: 'now',
            endTime: '2020-01-01',
            replaySpeed: 1,
            syncMasterTime: SYNC,
            bufferingTime: 100,
            timeOut: 4000,
            connect: false
        });

        if(options.hasOwnProperty('sosEndpoint')){
            sosEP = options.sosEndpoint;
        }

        let video;
        if (options.hasOwnProperty('videoType')) {
            console.log('Video is h264');
            if (options.videoType === 'h264') {
                video = new OSH.DataReceiver.VideoH264("Video", {
                    protocol: WEBSOCKET_PROTOCOL,
                    service: SOS,
                    endpointUrl: sosEP,
                    offeringID: offeringID,
                    observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
                    startTime: 'now',
                    endTime: END_TIME,
                    replaySpeed: 1,
                    timeShift: 0,
                    syncMasterTime: SYNC,
                    bufferingTime: 0,
                    // timeOut: 4000,
                    connect: false
                });
            } else if (options.videoType === 'mp4') {
                video = new OSH.DataReceiver.VideoMp4("Video", {
                    protocol: WEBSOCKET_PROTOCOL,
                    service: SOS,
                    endpointUrl: sosEP,
                    offeringID: offeringID,
                    observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
                    startTime: 'now',
                    endTime: END_TIME,
                    replaySpeed: "1",
                    timeShift: 0,
                    syncMasterTime: SYNC,
                    bufferingTime: 0,
                    timeOut: 4000,
                    connect: false
                });
            } else {
                console.log('Video is MJPEG');
                video = new OSH.DataReceiver.VideoMjpeg("Video", {
                    protocol: WEBSOCKET_PROTOCOL,
                    service: SOS,
                    endpointUrl: sosEP,
                    offeringID: offeringID,
                    observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
                    startTime: 'now',
                    endTime: END_TIME,
                    replaySpeed: 1,
                    timeShift: 0,
                    syncMasterTime: SYNC,
                    bufferingTime: 0,
                    timeOut: 4000,
                    connect: false
                });
            }
        }

        let ptzTasking;
        if (options.hasOwnProperty('spsID')) {
            ptzTasking = new OSH.DataSender.PtzTasking("video-tasking", {
                protocol: "http",
                service: "SPS",
                version: "2.0",
                endpointUrl: spsEP,
                offeringID: options.spsID,
                reverseTilt: options.reverseTilt
            });
        }

        let entity = {
            id: entityId,
            name: entityName,
            dataSources: [locData, orientation, video]
        };
        dataReceiverController.addEntity(entity);
        let ctxtDS = {
            locData: locData,
            orientation: orientation,
            video: video,
            sps: ptzTasking
        };
        let contextMenus = Context.createCamContextMenu(entity, {}, ctxtDS, options.videoType);
        entity.contextMenus = contextMenus;

        treeItems.push({
            entity: entity,
            entityId: entity.id,
            path: 'Cameras',
            treeIcon: './images/cameralook.png',
            contextMenuId: contextMenus.stack.id
        });

        let styler = new OSH.UI.Styler.PointMarker({
            location: {
                x: 0,
                y: 0,
                z: 0
            },
            locationFunc: {
                dataSourceIds: [locData.getId()],
                handler: function (rec) {
                    // console.log(rec);
                    return {
                        x: rec.location.lon,
                        y: rec.location.lat,
                        // z: rec.location.alt
                        z: 0
                    };
                }
            },
            orientationFunc: {
                dataSourceIds: [orientation.getId()],
                handler: function (rec) {
                    // console.log('Heading: ', rec.heading);
                    return {heading: -rec.heading + 180};
                }
            },
            icon: './images/cameralook.png',
            label: entityName
        });
        entity.locStyler = styler;
        // console.log(cesiumView);
        // cesiumView.addViewItem({
        //     name: entity.name,
        //     entityId: entity.id,
        //     styler: styler,
        //     contextMenuId: contextMenus.circle.id
        // });
        entity.sensorType = 'Android';
        // locStylerToEntities[entity.locStyler.id] = entity;
        return entity;
    }

};


let UI = {
    createMultiDialog: (containerElemId, dataSources, name, showView) => {
        let multiDialog;
        multiDialog = new OSH.UI.MultiDialogView(containerElemId, {
            draggable: true,
            css: "video-dialog",
            name: name,
            show: showView,
            dockable: false,
            closeable: true,
            connectionIds: dataSources,
            //swapId: "main-container", //TODO: make sure this is the proper elem id
            keepRatio: false
        });
        return multiDialog;
    },

    createUSGSDialog: (dataSources, name) => {
        return UI.createMultiDialog('usgs-chart', dataSources, name, true);
    },

    createNOAABuoyDialog: (dataSources, name) => {
        return UI.createMultiDialog('buoy-chart', dataSources, name, true);
    },

    createAVLDialog: (dataSources, name) => {
        return UI.createMultiDialog('avl-chart', dataSources, name, true);
    }
};

let Context = {
    /**
     *
     * @param parentEntity
     * @param entityIds ID values of the view entities associated with menu choices
     * @param dataSources
     */
    createStreamGaugeContextMenu: function (parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            temp: {},
            discharge: {},
            height: {},
        };
        let tempChart = {
            name: 'Water Temp',
            viewId: entityIds.waterTemp,
            css: 'fa fa-line-chart',
            clickOverride: tempChartOCH
        };
        let dischargeChart = {
            name: 'Discharge',
            viewId: entityIds.discharge,
            css: 'fa fa-line-chart',
            clickOverride: dischargeChartOCH
        };
        let heightChart = {
            name: 'Gage Height',
            viewId: entityIds.height,
            css: 'fa fa-line-chart',
            clickOverride: heightChartOCH
        };
        menuItems.push(tempChart, dischargeChart, heightChart);
        let streamGageCircCtxtMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let sgStackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(streamGageCircCtxtMenu);
        // console.log(sgStackCtxtMenu);
        return {
            circle: streamGageCircCtxtMenu,
            stack: sgStackCtxtMenu
        };

        function tempChartOCH(event) {
            console.log(event);
            dialogAndDSController('tempChart', dataSources.temp);
        }

        function dischargeChartOCH(event) {
            console.log(event);
            dialogAndDSController('dischargeChart', dataSources.discharge);
        }

        function heightChartOCH(event) {
            console.log(event);
            dialogAndDSController('heightChart', dataSources.height);
        }

        function dialogAndDSController(callerType, dataSource) {
            console.log(callerType);
            console.log(chartMap);
            let chartDialog;

            if (callerType === 'tempChart') {
                console.log(chartMap.hasOwnProperty('dialog'));
                if (!chartMap.temp.hasOwnProperty('dialog')) {
                    chartDialog = UI.createUSGSDialog([dataSource.getId()], parentEntity.name + ' - Water Temp.');
                    chartMap.temp.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'water_temp', 'Temperature (Celsius)')
                } else {
                    console.log('Temp Chart exists');
                    console.log(chartMap.temp);
                    let dia = document.getElementById(chartMap.temp.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'dischargeChart') {
                if (!chartMap.discharge.hasOwnProperty('dialog')) {
                    chartDialog = UI.createUSGSDialog([dataSource.getId()], parentEntity.name + ' - Discharge');
                    chartMap.discharge.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'discharge', 'Discharge (ft³/s)')
                } else {
                    let dia = document.getElementById(chartMap.discharge.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            } else if (callerType === 'heightChart') {
                if (!chartMap.height.hasOwnProperty('dialog')) {
                    chartDialog = UI.createUSGSDialog([dataSource.getId()], parentEntity.name + ' - Gage Height');
                    chartMap.height.dialog = chartDialog;
                    let chartView = simpleChartViewAndStyler(chartDialog, dataSource, 'gage_height', 'Gage Height (ft)')
                } else {
                    let dia = document.getElementById(chartMap.height.dialog.id);
                    dia.style.visibility = 'visible';
                    dia.style.display = 'block';
                }
            }

            dataSource.connect();
        }
    },
    /**
     *
     * @param entityIds ID values of the view entities associated with menu choices
     */
    createAndroidContextMenu(parentEntity, entityIds, dataSources) {
        let menuItems = [];
        let chartMap = {
            video: {},
            marker: {},
        };
        let video = {
            name: 'Video Feed',
            viewId: entityIds.videoData,
            css: 'fa fa-video-camera',
            clickOverride: connectVideo
        };
        let locationIcon = {
            name: 'Show Map Icon',
            css: 'fa fa-map-marker',
            clickOverride: pointMarkerConnector,
            locationDatasource: dataSources.locData
        };
        let locationIconHide = {
            name: 'Hide Map Icon',
            css: 'fa fa-map-marker',
            clickOverride: pointMarkerDisconnector,
            locationDatasource: dataSources.locData
        };
        menuItems.push(video, locationIcon, locationIconHide);
        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(stackCtxtMenu);
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function connectVideo() {
            console.debug('Show Video for:', parentEntity);
            dialogAndDSController('video', dataSources.video);
        }

        function pointMarkerConnector(event) {
            console.debug('Show Android sensor:', parentEntity);
            let locDataSource = dataSources.locData;
            let hdgDataSource = dataSources.orientation;
            if (locDataSource.connected === false) {
                locDataSource.connect();
                hdgDataSource.connect();
            }

            // Use Portion of Top Level Show Function Here
            for (let csEntity of cesiumView.viewer.entities._entities._array) {
                if (csEntity._dsid === cesiumView.stylerToObj[parentEntity.locStyler.id]) {
                    csEntity.show = true;
                    break;
                }
            }

            // HACK to zoom to vehicle entity
            let prevSelected = cesiumView.viewer.selectedEntity;
            let zoomToSelected = function () {
                let selected = cesiumView.viewer.selectedEntity;
                if (typeof (selected) !== "undefined" && selected !== prevSelected) {
                    cesiumView.viewer.zoomTo(cesiumView.viewer.selectedEntity,
                        new Cesium.HeadingPitchRange(0.0, -90, 3000));
                } else {
                    setTimeout(zoomToSelected, 100);
                }
            };
            setTimeout(zoomToSelected, 100);
        }

        function pointMarkerDisconnector(event) {
            let locDataSource = dataSources.locData;
            let hdgDataSource = dataSources.orientation;
            if (locDataSource.connected === true) {
                locDataSource.disconnect();
                hdgDataSource.disconnect();
            }

            for (let csEntity of cesiumView.viewer.entities._entities._array) {
                if (csEntity._dsid === cesiumView.stylerToObj[parentEntity.locStyler.id]) {
                    csEntity.show = false;
                    break;
                }
            }
        }

        function dialogAndDSController(callerType, dataSource) {
            let videoDialog;

            if (callerType === 'video') {
                if (!chartMap.video.hasOwnProperty('dialog')) {
                    videoDialog = UI.createMultiDialog('android-video', [video], parentEntity.name + ' Video', true);
                    chartMap.video.dialog = videoDialog;
                    let videoView = new OSH.UI.MjpegView(videoDialog.popContentDiv.id, {
                        dataSourceId: [dataSources.video.getId()],
                        entityId: parentEntity.id,
                        css: "video",
                        cssSelected: "video-selected",
                        width: 360,
                        height: 300
                    });
                    chartMap.video.view = videoView;
                }
                let dialogElem = document.getElementById(chartMap.video.dialog.id);
                console.log(dialogElem);
                dialogElem.style.visibility = 'visible';
                dialogElem.style.display = 'block';
            }
            dataSource.connect();
        }
    },
    createCamContextMenu(parentEntity, entityIds, dataSources, videoType) {
        let menuItems = [];
        let chartMap = {
            video: {},
            marker: {},
        };

        let video = {
            name: 'Video Feed',
            viewId: entityIds.videoData,
            css: 'fa fa-video-camera',
            clickOverride: connectVideo
        };
        let locationIcon = {
            name: 'Show Map Icon',
            css: 'fa fa-map-marker',
            clickOverride: pointMarkerConnector,
            locationDatasource: dataSources.locData
        };
        let locationIconHide = {
            name: 'Hide Map Icon',
            css: 'fa fa-map-marker',
            clickOverride: pointMarkerDisconnector,
            locationDatasource: dataSources.locData
        };
        menuItems.push(video, locationIcon, locationIconHide);
        let circContextMenu = new OSH.UI.ContextMenu.CircularMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        let stackCtxtMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        // console.log(stackCtxtMenu);
        return {
            circle: circContextMenu,
            stack: stackCtxtMenu
        };

        function connectVideo() {
            console.debug('Show Video for:', parentEntity);
            console.log(dataSources);
            dialogAndDSController('video', dataSources.video);
        }

        function pointMarkerConnector(event) {
            console.debug('Show Camera sensor:', parentEntity);
            let locDataSource = dataSources.locData;
            let hdgDataSource = dataSources.orientation;
            if (locDataSource.connected === false) {
                locDataSource.connect();
                hdgDataSource.connect();
            }

            // Use Portion of Top Level Show Function Here
            for (let csEntity of cesiumView.viewer.entities._entities._array) {
                if (csEntity._dsid === cesiumView.stylerToObj[parentEntity.locStyler.id]) {
                    csEntity.show = true;
                    break;
                }
            }

            // HACK to zoom to vehicle entity
            let prevSelected = cesiumView.viewer.selectedEntity;
            let zoomToSelected = function () {
                let selected = cesiumView.viewer.selectedEntity;
                if (typeof (selected) !== "undefined" && selected !== prevSelected) {
                    cesiumView.viewer.zoomTo(cesiumView.viewer.selectedEntity,
                        new Cesium.HeadingPitchRange(0.0, -90, 3000));
                } else {
                    setTimeout(zoomToSelected, 100);
                }
            };
            setTimeout(zoomToSelected, 100);
        }

        function pointMarkerDisconnector(event) {
            let locDataSource = dataSources.locData;
            let hdgDataSource = dataSources.orientation;
            if (locDataSource.connected === true) {
                locDataSource.disconnect();
                hdgDataSource.disconnect();
            }

            for (let csEntity of cesiumView.viewer.entities._entities._array) {
                if (csEntity._dsid === cesiumView.stylerToObj[parentEntity.locStyler.id]) {
                    csEntity.show = false;
                    break;
                }
            }
        }

        function dialogAndDSController(callerType, dataSource) {
            let videoDialog;

            // TODO: change to a different container if necessary
            if (callerType === 'video') {
                console.log(dataSources.video);
                if (!chartMap.video.hasOwnProperty('dialog')) {
                    let videoView;
                    videoDialog = new OSH.UI.MultiDialogView('camera-view', {
                        draggable: true,
                        css: "video-dialog",
                        name: parentEntity.name + ' Video',
                        show: true,
                        dockable: false,
                        closeable: true,
                        keepRatio: false,
                        connectionIds: [dataSources.video.getId()]
                    });
                    chartMap.video.dialog = videoDialog;
                    if (videoType === 'h264') {
                        console.log('Creating h264 view');

                        videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
                            dataSourceId: [dataSources.video.getId()],
                            css: "video",
                            cssSelected: "video-selected",
                            name: parentEntity.name,
                            // useWorker:useFFmpegWorkers,
                            useWorker: true,
                            width: 800,
                            height: 600
                        });
                    } else if (videoType === 'mjpeg' || typeof videoType === "undefined") {
                        console.log('Creating mjpeg view');
                        videoView = new OSH.UI.MjpegView(videoDialog.popContentDiv.id, {
                            dataSourceId: [dataSources.video.getId()],
                            entityId: parentEntity.id,
                            css: "video",
                            cssSelected: "video-selected",
                            width: 704,
                            height: 480
                        });
                    } else if (videoType === 'mp4') {
                        videoView = new OSH.UI.Mp4View(videoDialog.popContentDiv.id, {
                            dataSourceId: [dataSources.video.getId()],
                            entityId: parentEntity.id,
                            css: "video",
                            cssSelected: "video-selected",
                            width: 800,
                            height: 600
                        });
                    }
                    if (typeof (dataSources.sps) !== "undefined") {
                        // Note: make sure to check the server's authentication settings if SPS isn't working
                        taskingView = new OSH.UI.PtzTaskingView(videoDialog.popContentDiv.id, {
                            dataSenderId: dataSources.sps.getId(),
                            ptIncrement: 1,
                            zIncrement: 0.05,
                            // presets: dahuaPresets,
                            // taskers: dahuaTaskers,
                            panRotFactor: -1.0          // TODO: See that this value is correct, might need to be a parameter if we add a lot of other cameras
                        });
                    }
                    chartMap.video.view = videoView;

                }
                let dialogElem = document.getElementById(chartMap.video.dialog.id);
                console.log(chartMap);
                console.log(dialogElem);
                dialogElem.style.visibility = 'visible';
                dialogElem.style.display = 'block';
            }
            dataSource.connect();
        }
    }
};

let MarkerLayers = {
    test: function () {
        console.debug('Show/Hide the Icon Set Selected!');
    },
    trafficCamShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'TrafficCam') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    trafficCamHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'TrafficCam') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    trafficCamContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.trafficCamShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.trafficCamHide
        };
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    usgsShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'StreamGage') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    usgsHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'StreamGage') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    usgsTable() {
        let elem = document.getElementById(usgsTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let usgsTable = tableGroup[0];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('usgs')) {
                usgsTable.updateOrAddData(evt.data.usgs);
                usgsTable.redraw(true);
            }
        };
        worker.postMessage('usgs');
    },
    usgsContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.usgsShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.usgsHide
        };
        /*let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.usgsTable
        };*/
        // menuItems = [show, hide, table];
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    noaaShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Buoy') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }

    },
    noaaHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Buoy') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    noaaTable() {
        let elem = document.getElementById(noaaTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let buoyTable = tableGroup[1];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('noaa')) {
                // console.log(evt.data.noaa);
                for (let result of evt.data.noaa) {
                    // console.log(result);
                    let temp;
                    let depth;

                    let newData = {id: result.station, name: 'NOAA Buoy Station ' + result.station};
                    if (result.depth !== 'NaN' && result.depth !== undefined) {
                        depth = Number.parseFloat(result.depth).toFixed(4);
                        newData.depth = depth;
                    }
                    if (result.sea_water_temperature !== 'NaN' && result.sea_water_temperature !== undefined) {
                        temp = Number.parseFloat(result.sea_water_temperature).toFixed(4);
                        newData.temp = temp;
                    }
                    buoyTable.updateOrAddData([newData]);
                    buoyTable.redraw(true);
                }
            }
        };
        worker.postMessage('noaa');
    },
    noaaContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.noaaShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.noaaHide
        };
        let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.noaaTable
        };
        menuItems = [show, hide, table];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    avlShow() {
        console.log(locStylerToEntities);
        // console.log(cesiumView.stylerToObj);
        for (let entity in locStylerToEntities) {
            // console.log(entity);
            if (locStylerToEntities[entity].sensorType === 'AVL') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    avlHide() {
        console.log("HIDING AVL MARKERS");
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'AVL') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    // console.log('csEntity', csEntity);
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        console.log('Found Entity...');
                        console.log(entity);
                        console.log(csEntity);
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    avlTable() {
        let elem = document.getElementById(avlTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let avlTable = tableGroup[3];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('avl')) {
                avlTable.updateOrAddData(evt.data.avl);
                avlTable.redraw(true);
            }
        };
        worker.postMessage('avl');
    },
    avlContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.avlShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.avlHide
        };
        let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.avlTable
        };
        menuItems = [show, hide, table];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    androidShow() {
        console.log(locStylerToEntities);
        console.log(cesiumView);
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Android') {
                console.log('Found Android: ', entity);
                console.log(cesiumView.stylerToObj[entity]);
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        console.log('Showing Android: ', locStylerToEntities[entity]);
                        csEntity.show = true;
                        locStylerToEntities[entity].dataSources[0].connect();
                        locStylerToEntities[entity].dataSources[1].connect();
                        break;
                    }
                }
            }
        }
    },
    androidHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Android') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    androidContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.androidShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.androidHide
        };
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    mesonetShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Mesonet') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    mesonetHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Mesonet') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    mesonetTable() {
        let elem = document.getElementById(mesoTDialog.id);
        elem.style.visibility = 'visible';
        elem.style.display = 'block';
        let worker = Workers.table();
        let mesonetTable = tableGroup[2];
        worker.onmessage = (evt) => {
            if (evt.data.hasOwnProperty('mesonet')) {
                console.log(evt.data);
                for (let mnData of evt.data.mesonet) {
                    let newData = {id: mnData.stationId, name: 'Mesonet Station: ' + mnData.stationName};
                    for (let col in mesonetColumnsID2Name) {
                        newData[col] = typeof (mnData[col]) === 'number' ? Number.parseFloat(mnData[col]).toFixed(4) : mnData[col];
                    }
                    mesonetTable.updateOrAddData([newData]);
                }
                mesonetTable.redraw(true);
            }
        };
        worker.postMessage('mesonet');
    },
    mesonetContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.mesonetShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.mesonetHide
        };
        let table = {
            name: 'Show Table',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.mesonetTable
        };
        menuItems = [show, hide, table];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
    uavShow() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'UAV') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = true;
                        break;
                    }
                }
            }
        }
    },
    uavHide() {
        for (let entity in locStylerToEntities) {
            if (locStylerToEntities[entity].sensorType === 'Android') {
                for (let csEntity of cesiumView.viewer.entities._entities._array) {
                    if (csEntity._dsid === cesiumView.stylerToObj[entity]) {
                        csEntity.show = false;
                        break;
                    }
                }
            }
        }
    },
    uavContext() {
        let menuItems;
        let show = {
            name: 'Show Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.uavShow
        };
        let hide = {
            name: 'Hide Icons',
            viewId: '',
            css: 'fa fa-eye',
            clickOverride: MarkerLayers.uavHide
        };
        menuItems = [show, hide];
        let stackMenu = new OSH.UI.ContextMenu.StackMenu({
            id: 'menu-' + OSH.Utils.randomUUID(),
            groupId: '',
            items: menuItems
        });
        return stackMenu;
    },
};

let Utilities = {
    getHubOfferings: () => {
        let xhr = new XMLHttpRequest();
        let url = 'http://' + SCIRA_SOS_ENDPT + '?service=SOS&version=2.0&request=GetCapabilities';
        let offerings;
        xhr.open('GET', url, false);
        xhr.withCredentials = true;
        xhr.onload = () => {
            let parser = new OSH.SWEXmlParser(xhr.responseText);
            let capabilities = parser.toJson();
            offerings = capabilities.Capabilities.contents.offering;
            console.log(offerings);
        };
        xhr.send();
        return offerings;
    }
};


let Workers = {
    table: () => {
        let worker = new Worker('table-workers.js');
        return worker;
    }
};

function CesiumSelectionChgListener() {
    console.log("Selected Entity Changed");
    // get selected marker position
    let camera = cesiumView.viewer.camera;
    let selectedEntity = cesiumView.viewer.selectedEntity;
    // console.log(selectedEntity);
    if (zoomOnSelect && cesiumView.viewer.selectedEntity !== 'undefined' && selectedEntity._position._value.x !== 6378137) {
        console.log(selectedEntity);
        cesiumView.viewer.zoomTo(selectedEntity, new Cesium.Cartesian3(0, 0, 1000))
    }
}

function ZoomSelectionToggle() {
    let btn = document.getElementById('zoom-toggle-btn');
    if (zoomOnSelect) {
        zoomOnSelect = false;
        btn.className = 'btn-inactive'
    } else {
        zoomOnSelect = true;
        btn.className = 'btn-active'
    }
}

OSH.UI.Styler.AreaMarker = OSH.UI.Styler.extend({
    initialize: function (properties) {
        this._super(properties);
        this.properties = properties;
        this.location = null;
        this.orientation = {heading: 0};
        this.icon = null;
        this.iconAnchor = [16, 16];
        this.label = null;
        this.color = "#000000";
        this.circle = null;
        // TODO: make sure to integrate into Toolkit Source
        this.description = null;

        this.options = {};

        if (typeof (properties.location) != "undefined") {
            this.location = properties.location;
        }

        if (typeof (properties.orientation) != "undefined") {
            this.orientation = properties.orientation;
        }

        if (typeof (properties.icon) != "undefined") {
            this.icon = properties.icon;
        }

        if (typeof (properties.iconAnchor) != "undefined") {
            this.iconAnchor = properties.iconAnchor;
        }

        if (typeof (properties.label) != "undefined") {
            this.label = properties.label;
        }

        if (typeof (properties.color) != "undefined") {
            this.color = properties.color;
        }

        // TODO: Remove if not needed later
        if (properties.hasOwnProperty('options')) {
            this.options = properties.options;
        }

        if (typeof (properties.locationFunc) != "undefined") {
            var fn = function (rec, timeStamp, options) {
                this.location = properties.locationFunc.handler(rec, timeStamp, options);
            }.bind(this);
            this.addFn(properties.locationFunc.dataSourceIds, fn);
        }

        if (typeof (properties.orientationFunc) != "undefined") {
            var fn = function (rec, timeStamp, options) {
                this.orientation = properties.orientationFunc.handler(rec, timeStamp, options);
            }.bind(this);
            this.addFn(properties.orientationFunc.dataSourceIds, fn);
        }

        if (typeof (properties.iconFunc) != "undefined") {
            var fn = function (rec, timeStamp, options) {
                this.icon = properties.iconFunc.handler(rec, timeStamp, options);
            }.bind(this);
            this.addFn(properties.iconFunc.dataSourceIds, fn);
        }

        if (typeof (properties.labelFunc) != "undefined") {
            var fn = function (rec, timeStamp, options) {
                this.label = properties.labelFunc.handler(rec, timeStamp, options);
            }.bind(this);
            this.addFn(properties.labelFunc.dataSourceIds, fn);
        }

        if (typeof (properties.colorFunc) != "undefined") {
            var fn = function (rec, timeStamp, options) {
                this.color = properties.colorFunc.handler(rec, timeStamp, options);
            }.bind(this);
            this.addFn(properties.colorFunc.dataSourceIds, fn);
        }

        // TODO: add to Source Files
        if (typeof (properties.description) != "undefined") {
            this.description = properties.description;
        }

        if (typeof (properties.grouped) != 'undefined') {
            this.grouped = properties.grouped;
            this.idList = properties.idList;
        }

        if (typeof (properties.circleFunc) != "undefined") {
            var fn = function (rec, timeStamp, options) {
                this.circleFunc = properties.circleFunc.handler(rec, timeStamp, options);
            }.bind(this);
            this.addFn(properties.circleFunc.dataSourceIds, fn);
        }
    },

    /**
     *
     * @param $super
     * @param view
     * @memberof OSH.UI.Styler.AreaMarker
     * @instance
     */
    init: function (view) {
        this._super(view);
        if (typeof (view) != "undefined" && this.location != null) {
            view.updateMarker(this, 0, {});
        }
    },

    /**
     *
     * @param $super
     * @param dataSourceId
     * @param rec
     * @param view
     * @param options
     * @memberof OSH.UI.Styler.AreaMarker
     * @instance
     */
    setData: function (dataSourceId, rec, view, options) {
        if (this._super(dataSourceId, rec, view, options)) {
            if (typeof (view) != "undefined" && this.location != null) {
                view.updateMarker(this, rec.timeStamp, options);
            }
        }
    },

    /**
     *
     * @param $super
     * @memberof OSH.UI.Styler.AreaMarker
     * @instance
     */
    clear: function ($super) {
    }
});
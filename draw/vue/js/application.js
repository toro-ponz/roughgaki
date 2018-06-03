var application = new Vue({
  el: '#roughgaki',
  components: {
    'pen-settings': penSettings,
    'layers-settings': layersSettings,
    'layers-canvas': layersCanvas,
  },
  data() {
    return {
      layers: [],
      currentLayer: null,
      history: [],
      width: 1000,
      height: 600,
      pen: {
        mode: 'pen',
        nib: 'round',
        size: 5,
      },
    };
  },
  methods: {
    switchLayer(layer) {
      this.currentLayer = layer;
    },
    changePen(pen) {
      this.pen = pen;
    }
  },
  computed: {},
});

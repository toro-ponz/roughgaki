var penSettings = Vue.extend({
  props: [],
  template: `
    <div>
      <div class="pen-color-menu">
        <h5>ペン色</h5>
        <div class="pen-colorpicker">
          <input type="text" id="color-picker">
        </div>
      </div>
      <div class="pen-mode-menu">
        <h5>ペンモード</h5>
        <div class="row">
          <div v-for="(m, k) in modes" class="col-lg-4 col">
            <button
              v-on:click="changeMode(k)"
              :value="k"
              :class="{ 'active-pen-mode' : k === mode }"
              class="pen-mode-button"
              type="button"
            >{{m}}</button>
          </div>
        </div>
      </div>
      <div class="pen-nib-menu">
        <h5>ペン先</h5>
        <div class="row">
          <div v-for="(n, k) in nibs" class="col-lg-4 col">
            <button
              v-on:click="changeNib(k)"
              :value="k"
              :class="{ 'active-pen-nib' : k === nib }"
              class="pen-nib-button"
              type="button"
            >{{n}}</button>
          </div>
        </div>
      </div>
      <div class="pen-size-menu">
        <h5>ペンサイズ</h5>
        <div class="row">
          <div v-for="s in sizes" class="col-lg-3 col">
            <button
              v-on:click="changeSize(s)"
              :value="s"
              :class="{ 'active-pen-size' : s === size }"
              class="pen-size-button"
              type="button"
            >{{s}}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      mode: 'pen',
      nib: 'round',
      size: 5,
      modes: {
        pen: 'ペン',
        eraser: '消しゴム',
      },
      nibs: {
        round: '丸',
        square: '四角',
        butt: '棒',
      },
      sizes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750],
    };
  },
  methods: {
    changeMode(mode) {
      this.mode = mode;
    },
    changeNib(nib) {
      this.nib = nib;
    },
    changeSize(size) {
      this.size = size;
    },
  },
});

var layersSettings = Vue.extend({
  props: [],
  template: `
    <div>
      <h5>レイヤー</h5>
      <div>
        <button v-on:click="addLayer" id="add-layer-button" type="button">+</button>
      </div>
      <div id="layer-buttons">
        <button v-for="(layer, index) in layers" class="layer-button" :id="'layer-button-' + layer" :data-layer-id="layer">
          <img class="layer-preview-image" :id="'layer-preview-image-' + layer">
          <a v-on:click="removeLayer(index)" class="remove-layer-button" :data-layer-id="layer">×</a>
          <p>レイヤー{{layer}}</p>
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      increments: 0,
      layers: [],
    };
  },
  created() {
    this.addLayer();
  },
  methods: {
    addLayer() {
      this.increments++;
      this.layers.unshift(this.increments);
    },
    removeLayer(index) {
      this.layers.splice(index, 1);
    },
  },
  computed: {
    count() {
      return this.layers.length;
    },
  },
});

var layersCanvas = Vue.extend({
  props: [
    'layers'
  ],
  template: `
    <div id="canvases">
      <div class="absolute center-absolute" id="layer-canvases">
        <canvas class="layer" id="layer-0"></canvas>
        <canvas v-for="layer in reversedLayers" class="layer" :id="'layer-' + layer" :data-layer-id="layer"></canvas>
      </div>
      <canvas class="absolute" id="canvas"></canvas>
    </div>
  `,
  data() {
    return {};
  },
  methods: {},
  computed: {
    reversedLayers() {
      return this.layers.slice().reverse();
    },
  },
});

var application = new Vue({
  el: '#roughgaki',
  components: {
    'pen-settings': penSettings,
    'layers-settings': layersSettings,
    'layers-canvas': layersCanvas,
  },
  data: {
    layers: [],
  },
  methods: {},
  computed: {},
});


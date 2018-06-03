var layersSettings = Vue.extend({
  props: [
    'layers',
    'prop-current-layer',
  ],
  template: `
    <div>
      <h5>レイヤー</h5>
      <div>
        <button v-on:click="addLayer" id="add-layer-button" type="button">+</button>
      </div>
      <div id="layer-buttons">
        <button
          v-for="(layer, index) in layers"
          v-on:click="switchLayer(index)"
          class="layer-button"
          :class="{ 'active-layer': layer == currentLayer }"
          :id="'layer-button-' + layer">
          <img class="layer-preview-image" :id="'layer-preview-image-' + layer">
          <button v-on:click="removeLayer(index)" class="remove-layer-button">×</button>
          <p>レイヤー{{layer}}</p>
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      increments: 0,
      currentLayer: this.propCurrentLayer,
    };
  },
  created() {
    this.addLayer();
    this.switchLayer(this.increments - 1);
  },
  methods: {
    addLayer() {
      this.increments++;
      this.layers.unshift(this.increments);
    },
    removeLayer(index) {
      this.layers.splice(index, 1);
    },
    switchLayer(index) {
      this.currentLayer = this.layers[index];
      this.$emit('switch-layer', this.currentLayer);
    }
  },
  computed: {
    count() {
      return this.layers.length;
    },
  },
});

var layersCanvas = Vue.extend({
  props: [
    'layers',
    'pen',
    'width',
    'height',
    'prop-current-layer',
  ],
  template: `
    <div id="canvases" v-on:mouseup="end">
      <div
        class="absolute center-absolute"
        id="layer-canvases"
        :style="{ padding: paddingY + 'px ' + paddingX + 'px' }">
        <canvas
          class="layer"
          id="layer-0"
          :width="width"
          :height="height">
        </canvas>
        <canvas
          v-for="layer in reversedLayers"
          class="layer"
          :id="'layer-' + layer"
          :width="width"
          :height="height">
        </canvas>
      </div>
      <canvas
        v-on:mousemove="draw"
        v-on:mouseleave="draw"
        v-on:mousedown="start"
        class="absolute"
        id="canvas"
        :width="width * 2"
        :height="height * 2">
      </canvas>
    </div>
  `,
  data() {
    return {
      drawing: false,
      mouse: {
        begin_x: 0,
        begin_y: 0,
        end_x: 0,
        end_y: 0,
        reset(e) {
          this.begin_x = e.offsetX;
          this.begin_y = e.offsetY;
        },
        draw(e) {
          this.end_x = e.offsetX;
          this.end_y = e.offsetY;
        },
      },
    };
  },
  methods: {
    draw(event) {
      if (!this.drawing) {
        return;
      }

      this.applyPen();

      this.mouse.draw(event);

      this.context.beginPath();
      this.context.moveTo(this.mouse.begin_x - this.paddingX, this.mouse.begin_y - this.paddingY);
      this.context.lineTo(this.mouse.end_x - this.paddingX, this.mouse.end_y - this.paddingY);
      this.context.stroke();
      this.context.closePath();

      this.mouse.reset(event);
    },
    start(event) {
      this.drawing = true;
      this.mouse.reset(event);
      this.draw(event);
    },
    end(event) {
      this.drawing = false;
    },
    applyPen() {
      this.applyPenMode();
      this.applyPenSize();
      this.applyPenNib();
    },
    applyPenMode() {
      switch (this.pen.mode) {
        case 'eraser':
          this.context.globalCompositeOperation = 'destination-out';
          break;
        default:
          this.context.globalCompositeOperation = 'source-over';
          break;
      }
    },
    applyPenSize() {
      this.context.lineWidth = this.pen.size;
    },
    applyPenNib() {
      this.context.lineCap = this.pen.nib;
    },
  },
  computed: {
    reversedLayers() {
      return this.layers.slice().reverse();
    },
    paddingX() {
      return this.width / 2;
    },
    paddingY() {
      return this.height / 2;
    },
    context() {
      return document.getElementById('layer-' + this.propCurrentLayer).getContext('2d');
    }
  },
});

var penSettings = Vue.extend({
  props: [
    'pen',
  ],
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
              type="button">
              <span>{{ m }}</span>
            </button>
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
              <span>{{ n }}</span>
            </button>
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
              <span>{{ s }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      mode: this.pen.mode,
      nib: this.pen.nib,
      size: this.pen.size,
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
      this.notify();
    },
    changeNib(nib) {
      this.nib = nib;
      this.notify();
    },
    changeSize(size) {
      this.size = size;
      this.notify();
    },
    notify() {
      var pen = this.pen;
      pen.mode = this.mode;
      pen.nib = this.nib;
      pen.size = this.size;
      this.$emit('change-pen', this.pen);
    }
  },
});

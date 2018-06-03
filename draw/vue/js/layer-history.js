var layersHistory = Vue.extend({
  props: [
    'history',
  ],
  template: `
    <div class="history-buttons">
      <button id="undo-button">
        <img src="icon/undo.svg" alt="元に戻す">
      </button>
      <button id="redo-button">
        <img src="icon/redo.svg" alt="やり直し">
      </button>
    </div>
  `,
  data() {
    return {};
  },
  created() {},
  methods: {
    undo() {

    },
    redo() {

    }
  },
  computed: {
    undoable() {

    },
    redoable() {
      
    }
  },
});
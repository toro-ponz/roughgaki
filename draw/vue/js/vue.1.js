new Vue({
  el: '#roughg88aki',
  data: {
    // プレビュー領域のキャンバス
    preview_canvas: $('#preview-canvas'),
    // プレビュー領域のキャンバスコンテキスト
    preview_canvas_context: preview_canvas.get(0).getContext('2d'),
    // 現在のレイヤー
    current_layer: null,
    // レイヤーの操作用コンテキスト
    layer_context: null,
    // レイヤーの親要素
    layer_canvases = $('#layer-canvases'),
    // レイヤーの総数(削除含む)
    layer_increments = 0,
    // レイヤーの数
    layer_count = 0,
    // マウスの情報
    mouse: {
      begin_x: 0,
      begin_y: 0,
      end_x: 0,
      end_y: 0,
      reset: function (e) {
        this.begin_x = e.offsetX;
        this.begin_y = e.offsetY;
      },
      draw: function (e) {
        this.end_x = e.offsetX;
        this.end_y = e.offsetY;
      },
    },
    // ペンの情報
    pen: {
      mode: 'pen',
      color: 'rgba(0, 0, 0, 1)',
      width: 5,
      nib: 'round',
      change: function () {
        this.changeMode();
        this.changeColor();
        this.changeWidth();
        this.changeNib();
      },
      changeMode: function (mode = null) {
        if (mode) {
          this.mode = mode;
        }

        switch (this.mode) {
          case 'eraser':
            layer_context.globalCompositeOperation = 'destination-out';
            break;
          default:
            layer_context.globalCompositeOperation = 'source-over';
            break;
        }
      },
      changeColor: function (color = null) {
        if (color) {
          this.color = color;
        }
        layer_context.strokeStyle = this.color;
      },
      changeWidth: function (width = null) {
        if (width) {
          this.width = width;
        }
        layer_context.lineWidth = this.width;
      },
      changeNib: function (nib = null) {
        if (nib) {
          this.nib = nib;
        }
        layer_context.lineCap = this.nib;
      },
    },
    // 編集履歴
    history: {
      undo_stack: [],
      redo_stack: [],
      draw: function () {
        this.stack(this.undo_stack, {
          id: current_layer.attr('id'),
          data: current_layer.get(0).toDataURL(),
        });
        this.redo_stack = [];
      },
      stack: function (stack, item) {
        stack.push(item);

        if (stack.length > 50) {
          stack.shift();
        }
      },
      undo: function () {
        this.restore(this.undo_stack, this.redo_stack);
      },
      redo: function () {
        this.restore(this.redo_stack, this.undo_stack);
      },
      restore: function (pop, push) {
        if (pop.length < 1) {
          return;
        }

        var item = pop.pop();
        var layer = $('#' + item.id);

        this.stack(push, {
          id: layer.attr("id"),
          data: layer.get(0).toDataURL(),
        });

        this.restoreLayer(layer, item.data);
      },
      restoreLayer: function (layer, data) {
        var img = new Image();
        img.src = data;
        img.onload = function () {
          clearCanvas(layer);

          var context = layer.get(0).getContext('2d');

          // 一時的にペンモードを描画に変える
          var pen_mode = context.globalCompositeOperation;
          context.globalCompositeOperation = 'source-over';

          // レイヤーのリストア
          context.drawImage(img, 0, 0);

          // 描画後にモードを戻す
          context.globalCompositeOperation = pen_mode;

          preview(layer.data('layer-id'), layer);
        };
      },
    },
    // キャンバス
    canvases: {
      object: $('#canvases'),
      scale: 1.0,
      canvas: {
        object: $('#canvas'),
        drawing: false,
        size: {
          width: 1000,
          height: 800
        },
        padding: {
          x: parseInt($('#layer-canvases').css('padding-left'), 10),
          y: parseInt($('#layer-canvases').css('padding-top'), 10)
        },
        layers: {
          object: $('.layer'),
          changeSize: function (width, height) {
            this.object.each(function () {
              $(this).get(0).width = width;
              $(this).get(0).height = height;
            });
          }
        },
        previewCanvas: {
          object: $('#preview-canvas'),
          changeSize: function (width, height) {
            this.object.get(0).width = width;
            this.object.get(0).height = height;
          }
        },
        draw: function () {
          this.drawing = true;
        },
        drawed: function () {
          this.drawing = false;
        },
        changeSize: function (width = this.size.width, height = this.size.height) {
          this.layers.changeSize(width, height);
          this.previewCanvas.changeSize(width, height);

          // 左右に500pxのpadding
          this.object.get(0).width = width + 1000;
          // 上下に300pxのpadding
          this.object.get(0).height = height + 600;
        },
      },
      scaleUp: function () {
        this.scaling(this.scale + 0.2);
      },
      scaleDown: function () {
        this.scaling(this.scale - 0.2);
      },
      scaling: function (scale) {
        this.scale = scale;
        this.object.css('transform', 'scale(' + scale + ', ' + scale + ')');
      }
    },
  },
  methods: {
    addLayer: function () {
      this.layer_increments++;
      this.layer_count++;
    },
  },
});

new Vue({
  el: '.layers-vue',
  data: {
    increments: 0,
    layers: [],
  },
  methods: {
    addLayer: function () {
      this.increments++;
      this.layers.push(this.increments);
    },
  },
  computed: {
    count: function () {
      return this.layers.length;
    },
  },
});
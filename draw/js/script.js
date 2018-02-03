$(function () {
  'use strict';

  // プレビュー領域のキャンバス
  var preview_canvas = $('#preview-canvas');
  // プレビュー領域のキャンバスコンテキスト
  var preview_canvas_context = preview_canvas.get(0).getContext('2d');
  // 現在のレイヤー
  var current_layer = null;
  // レイヤーの操作用コンテキスト
  var layer_context = null;
  // マウスの座標情報
  var mouse = {
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
  };
  // ペンの情報
  var pen = {
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
  };
  // 編集履歴
  var history = {
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
    undo: function() {
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
  };
  // キャンバス
  var canvases = {
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
  };

  // レイヤーの親要素
  var layer_canvases = $('#layer-canvases');
  // レイヤーの総数(削除含む)
  var layer_increments = 0;
  // レイヤーの数
  var layer_count = 0;

  // 初期化
  initialize();

  // ショートカットキー
  $(window).on('keydown', function (e) {
    switch (e.keyCode) {
      // delete
      case 46:
        clearCanvas(current_layer);
        preview(current_layer.data('layer-id'));
        break;
      // X
      case 88:
        if (e.ctrlKey) {
          history.redo();
        }
        break;
      // Z
      case 90:
        if (e.ctrlKey) {
          history.undo();
        }
        break;
      // ,
      case 188:
        canvases.scaleDown();
        break;
      // .
      case 190:
        canvases.scaleUp();
        break;
    }
  });

  // キャンバス上での描画
  canvases.canvas.object.on('mousemove mouseleave', function (e) {
    if(!canvases.canvas.drawing) {
      return;
    }
    // 描画
    draw(e);
  });

  // キャンバス上でのクリック
  canvases.canvas.object.on('mousedown', function (e) {
    mouse.reset(e);
    history.draw();
    canvases.canvas.draw();
    draw(e);
  });

  // クリックが終わった判定はdocumentで取る
  $(document).on('mouseup', function () {
    var id = current_layer.data('layer-id');
    preview(id);
    canvases.canvas.drawed();
  });

  // ペン色選択コンポーネント
  $("#color-picker").spectrum({
    color: "#000000",
    flat: true,
    showInput: true,
    showAlpha: false,
    disabled: false,
    showPalette: true,
    showButtons: false,
    maxSelectionSize: 30,
    clickoutFiresChange: true,
    preferredFormat: "rgb",
    change: function(color) {
      pen.changeColor(color);
    },
    move: function(color){
      pen.changeColor(color);
    },
  });

  // ペンモードボタンのクリック
  $('.pen-mode-button').on('click', function () {
    $('.pen-mode-button').removeClass('active-pen-mode');
    $(this).addClass('active-pen-mode');
    pen.changeMode($(this).val());
  });

  // ペン先ボタンのクリック
  $('.pen-nib-button').on('click', function () {
    $('.pen-nib-button').removeClass('active-pen-nib');
    $(this).addClass('active-pen-nib');
    pen.changeNib($(this).val());
  });

  // ペンサイズボタンのクリック
  $('.pen-size-button').on('click', function () {
    $('.pen-size-button').removeClass('active-pen-size');
    $(this).addClass('active-pen-size');
    pen.changeWidth($(this).val());
  });

  // レイヤー追加ボタンのクリック
  $('#add-layer-button').on('click', addLayer);

  // レイヤー削除ボタンのクリック
  $('#layer-buttons').on('click', '.remove-layer-button', function () {
    removeLayer($(this).data('layer-id'));
    preview();
    return false;
  });

  // レイヤー切り替えボタンのクリック
  $('#layer-buttons').on('click', '.layer-button', function () {
    changeLayer($(this).data('layer-id'));
  });

  // 画像の保存ダイアログの表示
  $('#save-button').on('click', save);

  // 元に戻す
  $('#undo-button').on('click', function () {
    history.undo();
  });

  // やり直し
  $('#redo-button').on('click', function () {
    history.redo();
  });

  /**
   * 画像の保存
   */
  function save() {
    var preview_canvas_0 = preview_canvas.get(0);
    if (preview_canvas_0.toBlob) {
      preview_canvas_0.toBlob(downloadFromBlob);
    } else if (preview_canvas_0.msToBlob) {
      downloadFromBlob(preview_canvas_0.msToBlob());
    } else {
      alert('未対応ブラウザです。\r\nプレビューエリアの右クリック等で保存してください。');
    }
  }

  /**
   * ダウンロード
   * 
   * @param {*} blob 
   */
  function downloadFromBlob(blob) {
    var a = $('<a>', {
      type: 'hidden',
      download: 'image.png',
      target: '_blank',
      href: URL.createObjectURL(blob)
    });

    $('body').append(a);

    a.get(0).click();
    a.remove();

    URL.revokeObjectURL(blob);
  }

  /**
   * 新規レイヤーの追加
   */
  function addLayer() {
    layer_increments++;
    layer_count++;

    $('#layer-canvases').append(createLayerCanvas(layer_increments));
    $('#layer-buttons').prepend(createLayerButton(layer_increments));

    changeLayer(layer_increments);
  }

  /**
   * layerの削除
   * 
   * @param {*} id 
   */
  function removeLayer(id) {
    $('#layer-' + id).remove();
    $('#layer-button-' + id).remove();

    layer_count--;
  }

  /**
   * レイヤーのキャンバスを生成する
   * 
   * @param {*} id 
   */
  function createLayerCanvas(id) {
    return '<canvas class="layer" id="layer-' + id + '" width="' + canvases.canvas.size.width + '" height="' + canvases.canvas.size.height + '" data-layer-id="' + id + '"></canvas>';
  }

  /**
   * レイヤーのボタンを生成する
   * 
   * @param {*} id 
   */
  function createLayerButton(id) {
    return '<button class="layer-button" id="layer-button-' + id + '" data-layer-id="' + id + '">' +
        '<img class="layer-preview-image" id="layer-preview-image-' + id + '">' +
        '<a href="" class="remove-layer-button" data-layer-id="' + id + '">×</a>' +
        '<p>レイヤー' + id + '</p>' +
      '</button>';
  }

  /**
   * 描画
   * 
   * @param {*} e 
   */
  function draw(e) {
    mouse.draw(e);
    
    layer_context.beginPath();
    layer_context.moveTo(mouse.begin_x - canvases.canvas.padding.x, mouse.begin_y - canvases.canvas.padding.y);
    layer_context.lineTo(mouse.end_x - canvases.canvas.padding.x, mouse.end_y - canvases.canvas.padding.y);
    layer_context.stroke();
    layer_context.closePath();

    mouse.reset(e);
  }  

  /**
   * 初期化
   */
  function initialize() {
    addLayer();
    canvases.canvas.changeSize();
    pen.change();
    scrollCenter($('#canvases-scrollable'));
  }
  
  /**
   * スクロール位置を中心にする
   * 
   * @param {*} item 
   */
  function scrollCenter(item) {
    var top = (item.get(0).scrollHeight - item.height()) / 2;
    var left = (item.get(0).scrollWidth - item.width()) / 2;

    item.scrollTop(top).scrollLeft(left);
  }

  /**
   * レイヤー変更
   * 
   * @param {*} id 
   */
  function changeLayer(id) {
    current_layer = $('#layer-' + id);
    layer_context = current_layer.get(0).getContext("2d");

    $('.layer-button').removeClass('active-layer');
    $('#layer-button-' + id).addClass('active-layer');

    pen.change();
  }

  /**
   * プレビューエリアに反映する
   * 
   * @param {*} id 
   * @param {*} layer 
   */
  function preview(id = null, layer = null) {
    if (id) {
      // レイヤーのプレビューエリアに反映
      if (layer) {
        $('#layer-preview-image-' + id).attr('src', layer.get(0).toDataURL());
      } else {
        $('#layer-preview-image-' + id).attr('src', current_layer.get(0).toDataURL());
      }
    }

    clearCanvas(preview_canvas);
    // 全体のプレビューエリアに反映
    $('.layer').each(function () {
      preview_canvas_context.drawImage($(this).get(0), 0, 0);
    });
  }

  /**
   * キャンバスをクリア
   * 
   * @param {*} c 
   */
  function clearCanvas(c) {
    c.get(0).getContext('2d').clearRect(0, 0, c.get(0).width, c.get(0).height);
  }
});


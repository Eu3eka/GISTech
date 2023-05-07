//定义当前绘制模式
var drawMode = undefined;
//定义选择物体模式
var isSelectMode = false;//是否在选择物体模式
var wktPoints=[];
var currentPolyline=null;//折线对象
var currentPolygon=null;//多边形对象
var finished=false;//多点对象是否绘制完成
var added=false;//多点对象是否已经添加监听器

//创建多点对象的绘图工具
polylineManager = new BMapLib.DrawingManager(map, {
  isOpen: false, // 暂不开启绘制模式
  enableDrawingTool: false, // 不显示绘制工具栏
  drawingMode: BMAP_DRAWING_POLYLINE, // 绘制模式（线）
  polylineOptions: {strokeColor: 'blue', strokeWeight: 6, strokeOpacity: 0.5} ,// 线的样式
  enableCalculate: true // 启用拐点自动计算功能
});

polygonManager = new BMapLib.DrawingManager(map, {
  isOpen: false, // 暂不开启绘制模式
  enableDrawingTool: false, // 不显示绘制工具栏
  drawingMode: BMAP_DRAWING_POLYGON, // 绘制模式（面）
  polygonOptions: {strokeColor: 'blue', strokeWeight: 3, strokeOpacity: 0.5, fillColor: 'yellow', fillOpacity: 0.3},  // 线的样式 enableCalculate: true // 启用拐点自动计算功能
  enableCalculate: true // 启用拐点自动计算功能
});

function openPolylineManager() {
  polylineManager.open(); // 打开绘制工具
}

// 定义关闭绘制工具的函数
function closePolylineManager() {
  // polylineManager.isOpen = false; // 关闭绘制工具
  polylineManager.close(); // 关闭绘制工具栏
  console.log("线工具已经关闭!");
}

function openPolygonManager() {
  polygonManager.open(); // 打开绘制工具
}

// 定义关闭绘制工具的函数
function closePolygonManager() {
  // polygonManager.isOpen = false; // 关闭绘制工具
  polygonManager.close(); // 关闭绘制工具栏
  console.log("面工具已经关闭!");
}

// 绑定按钮点击事件
document.getElementById("drawpoint").onclick = function() {
// 进入绘制点模式
  console.log("准备好绘制");
  drawMode = "point";
// 监听地图点击事件
  map.addEventListener("click", onMapClick);
}

document.getElementById("drawline").onclick = function() {
  console.log("准备好绘制");
  drawMode = "line";
  openPolylineManager();
  if(polylineManager.isOpen) console.log("线工具开启!");
}


polylineManager.addEventListener('overlaycomplete', function(e) {
    console.log("绘制结束!");
    var polyline = e.overlay;
    currentPolyline = polyline;
    polyline.setStrokeColor("blue");
    polyline.setStrokeWeight(6);
    polyline.setStrokeOpacity(0.5);
    var path = polyline.getPath();
    var points = [];
    for (var i = 0; i < path.length; i++) {
      var point = path[i];
      points.push({lat: point.lat, lng: point.lng});
    }
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      console.log("wktPoints的类型和值:" + typeof wktPoints+ "  " + wktPoints);
      wktPoints.push(point.lng + ' ' + point.lat);
    }
    polyline.addEventListener('click', function(e) {
      // 在点击位置弹出窗口
      var infoWindow = new BMap.InfoWindow(
        "<div style='display: flex;'>" +
        "<div style='flex: 1;'>" +
        "<input type='text' id='input_text' placeholder='请输标记名称'>" +
        "</div>" +
        "<div style='margin-left: 10px;'>" +
        "<input type='button' onclick='savePolyline(currentPolyline, document.getElementById(\"input_text\").value)' value='保存'></button>" +
        "</div>" +
        "</div>" +
        "<div style='clear: both;'></div>"
      );
      map.openInfoWindow(infoWindow, e.point);
      wktPoints=[];
    });
   closePolylineManager();
});

document.getElementById("drawpolygon").onclick = function() {
  // 进入绘制多边形模式
  console.log("准备好绘制");
  drawMode = "polygon";
  openPolygonManager();
  if(polygonManager.isOpen) console.log("多边形工具开启!");
}

polygonManager.addEventListener('overlaycomplete', function(e) {
    console.log("绘制结束!");
    var polygon = e.overlay;
    currentPolygon = polygon;
    var path = polygon.getPath();
    var points = [];
    for (var i = 0; i < path.length; i++) {
      var point = path[i];
      points.push({lat: point.lat, lng: point.lng});
    }
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      wktPoints.push(point.lng + ' ' + point.lat);
    }
    polygon.addEventListener('click', function(e) {
      // 在点击位置弹出窗口
      var infoWindow = new BMap.InfoWindow(
        "<div style='display: flex;'>" +
        "<div style='flex: 1;'>" +
        "<input type='text' id='input_text' placeholder='请输标记名称'>" +
        "</div>" +
        "<div style='margin-left: 10px;'>" +
        "<input type='button' onclick='savePolygon(currentPolygon, document.getElementById(\"input_text\").value)' value='保存'></button>" +
        "</div>" +
        "</div>" +
        "<div style='clear: both;'></div>"
      );
      map.openInfoWindow(infoWindow, e.point);
      wktPoints=[];
    });
 closePolygonManager();
});

document.getElementById("exitdraw").onclick = function() {
  console.log("准备好退出");
  drawMode = null;
  // 监听地图点击事件
  polylineManager.close();
  polygonManager.close();
  map.removeEventListener("click", onMapClick);
}

document.getElementById("selectObject").addEventListener("click", function() {
  // 进入选择物体模式
  isSelectMode = true;
  console.log("进入选择物体模式");
});


// 地图双击事件处理函数
function onMapDblClick(e) {
  drawMode = null;
  points=[];
}

function saveMarker(input){
  console.log("input:"+input);
  var marker = window.marker;
  if (!marker){
    console.log("Marker未定义!");
    return;
  }
  console.log(marker);
  if(!(marker instanceof BMap.Marker)) {
    console.log("Marker不是一个有效的标记对象!");
    return;
  }
  map.addOverlay(marker);
  if(input === ""){
    alert("请输入标记名再保存!");
    return;
  }
  console.log("开始提交");
  marker.type="Marker";
  var position = marker.point;
  var wktPoint = position.lng + " " + position.lat;
  marker.wkt = "POINT(" + wktPoint + ")";
  // 将输入框中的值保存到marker对象中
  marker.title = input.value;
  // 关闭信息窗口
  console.log("marker的标题是:" + marker.title);
  console.log("marker的类型是:" + marker.type);
  console.log("marker的经度是:" + marker.point.lng);
  console.log("marker的纬度是:" + marker.point.lat);
  console.log("marker的wkt是:" + marker.wkt);
  var data = {
    feature_name: marker.title,
    type: marker.type,
    lon: marker.point.lng,
    lat: marker.point.lat,
    wkt: marker.wkt
  };
  if (typeof data !== 'object') {
    console.log("data参数无效");
    return;
  }
  var url = "save_data.jsp";
  $.ajax({
      url: url,
      type: "POST",
      data: data,
      dataType: "json",
      success: function(res) {
          alert("保存成功！");
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("请求失败：" + textStatus, errorThrown);
      }
  });
    map.closeInfoWindow();
}


function savePolyline(polyline, title) {
  console.log("Polyline在save函数处的类型和值"+typeof polyline+"  "+polyline);
  var path = polyline.getPath();
  var wktPoints = [];
  for (var i = 0; i < path.length; i++) {
    var point = path[i];
    wktPoints.push(point.lng + ' ' + point.lat);
  }
  var wkt = 'POLYLINE(' + wktPoints.join(',') + ')';
  var data = {
    feature_name: title,
    type: "Polyline",
    lon: path[0].lng,
    lat: path[0].lat,
    wkt: wkt
  };
  if (typeof data !== 'object') {
    console.log("data参数无效");
    return;
  }
  var url = "save_data.jsp";
  $.ajax({
      url: url,
      type: "POST",
      data: data,
      dataType: "json",
      success: function(res) {
          alert("保存成功！");
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("请求失败：" + textStatus, errorThrown);
      }
  });
}


function savePolygon(polygon, title) {
  var path = polygon.getPath();
  var wktPoints = [];
  for (var i = 0; i < path.length; i++) {
    var point = path[i];
    wktPoints.push(point.lng + ' ' + point.lat);
  }
  var wkt = 'POLYGON((' + wktPoints.join(',') + '))';
  var data = {
    feature_name: title,
    type: "Polygon",
    lon: path[0].lng,
    lat: path[0].lat,
    wkt: wkt
  };
  if (typeof data !== 'object') {
    console.log("data参数无效");
    return;
  }
  var url = "save_data.jsp";
  $.ajax({
      url: url,
      type: "POST",
      data: data,
      dataType: "json",
      success: function(res) {
          alert("保存成功！");
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("请求失败：" + textStatus, errorThrown);
      }
  });
}



function onMapClick(e) {
  if (drawMode === "point") {
    marker = new BMap.Marker(e.point, {position: e.point});
    console.log("绘制了点:");
    console.log(marker);
    console.log(typeof marker);
    window.marker = marker;
    // 给marker对象添加click事件监听器,这个监听器是只对这个marker并且永久对这个marker有效的。
    marker.addEventListener("click", function(event) {
      map.addOverlay(marker);
      if(isSelectMode) {
        if(marker === undefined) console.log("infowindow创建前,Marker未定义!");
        else console.log("infowindow创建前,Marker已定义!");
        var infoWindow = new BMap.InfoWindow(
          "<div style='display: flex;'>" +
          "<div style='flex: 1;'>" +
          "<input type='text' id='input_text' placeholder='请输标记名称'>" +
          "</div>" +
          "<div style='margin-left: 10px;'>" +
          "<input type='button' onclick='saveMarker(document.getElementById(\"input_text\"))' value='保存'></button>" +
          "</div>" +
          "</div>" +
          "<div style='clear: both;'></div>"
        );
        map.openInfoWindow(infoWindow, e.point);
        console.log("准备提交");
      } else console.log("不在选择模式中");
    });
    map.addOverlay(marker);
  }
}
//显示数据库中的图形
function display(){
  var url ="get_data.jsp";
  $.post(url, function(json){
    var res = undefined;
    console.log("返回结果：" + JSON.stringify(json));
    res = json.aaData;
    console.log("res[0]:"+res[0]);
    console.log("res[1]:"+res[1]);
    console.log("res[2]:"+res[2]);
    console.log("res的长度:"+res.length);
    for(var i=0;i<res.length;i++){
      console.log("现在循环到了res数组的第"+i+"个元素");
      var json=res[i];
      var type=json.feature_type;
      var title=json.feature_name;
      var lon=json.longitude;
      var lat=json.latitude;
      var wkt=json.geometry;
      console.log("当前对象的各个属性:");
      console.log(type+"  "+title+"  "+lon+"  "+lat+"  "+wkt);
      if(type === "Marker"){
        pointReg = /POINT\((\d+\.\d+)\s+(\d+\.\d+)\)/;
        var matches = pointReg.exec(wkt);
        console.log("匹配到的wkt是:"+matches);
        var lng = parseFloat(matches[1]);
        var lat = parseFloat(matches[2]);
        
        // 在地图上创建点对象并添加到地图上
        var point = new BMap.Point(lng, lat);
        var mark = new BMap.Marker(point);
        console.log("准备显示点!");
        map.addOverlay(mark);
        console.log("显示了点!");
      } else if(type === "Polyline"){
        var lineReg = /POLYLINE\((.+)\)/;
        var matches = lineReg.exec(wkt);
        console.log("匹配到的wkt是:"+matches);
        var pointsStr = matches[1].split(',');
        var nodes = [];
        for (var i = 0; i < pointsStr.length; i++) {
          var coords = pointsStr[i].split(' ');
          var lng = parseFloat(coords[0]);
          var lat = parseFloat(coords[1]);
          var point = new BMap.Point(lng, lat);
          nodes.push(point);
        }
        // 在地图上创建线对象并添加到地图上
        var polyline = new BMap.Polyline(nodes, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        map.addOverlay(polyline);
        console.log("显示了线!");
      } else if(type === "Polygon"){
        console.log("准备显示多边形!");
        var polygonReg = /POLYGON\(\((.+)\)\)/;
        var matches = polygonReg.exec(wkt);
        console.log("匹配到的wkt是:"+matches);
        var pointsStr = matches[1].split(',');
        var nodes = [];
        for (var i = 0; i < pointsStr.length; i++) {
          var coords = pointsStr[i].split(' ');
          var lng = parseFloat(coords[0]);
          var lat = parseFloat(coords[1]);
          var point = new BMap.Point(lng, lat);
          nodes.push(point);
        }
        // 在地图上创建面对象并添加到地图上
        var polygon = new BMap.Polygon(nodes, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5, fillColor:"red", fillOpacity:0.3});
        map.addOverlay(polygon);
        console.log("显示了多边形!");
      }
    }
  });
}
display();

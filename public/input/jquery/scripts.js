// JavaScript Document
//初始化
//变量申明
let flag = 0;
let imgData = null, text_content = null, checked = null, note2 = null, count, a = 0.7;
let url = "http://datagrading.learnable.ai/";
let image = new Image();
let image_name;
let canvas_view = document.getElementById("view");
let ctx_view = canvas_view.getContext('2d');
let lastX = 0, lastY = 0, x = 0, y = 0, line_width = 20, erase_r = 10
let highest_layer_idx = 1, threshold = 0;
let isDrawing = false, isErasing = false, isIn = false, fullName = new String(), imgName = new String(), islev = false;
let allDataArray = [], reginDic = {};


//greyArc鼠标跟随
$(document).on('mousemove', function (e) {
	let r = line_width, x = e.pageX, y = e.pageY;
	let l = $('#origin').offsetLeft, ri = l + $("#origin").offsetWidth, t = $("#origin").offsetTop, b = t + $("#origin").offsetY;
	if (!isErasing) {
		$("#arc").css({
			"position": "absolute",
			"left": e.pageX - line_width / 2,
			"top": e.pageY - line_width / 2,
			"z-index": "10000",
			"width": line_width,
			"height": line_width,
			"border-radius": line_width / 2
		});
	} else {
		$("#arc").css({
			"position": "absolute", "left": e.pageX - erase_r, "top": e.pageY - erase_r, "z-index": "10000",
			"width": erase_r * 2, "height": erase_r * 2, "border-radius": erase_r
		});
	}
});

//图像加载
start();
function start() {
	$.get(url + "api/grading/v1/ocr?amount=all&page=60", function (idata) {
		//获取所有图片ID
		imgData = idata.data;
		let data = [];
		for (let i = 0; i < imgData.length; i++) {
			let splited = imgData[i].split("_");
			data.push(splited);
		}
		//把所有图片ID拆分成树的的格式，方便检索
		function make_dict_tree(data_list) {
			let l_size = data_list[0].length;
			if (l_size == 1) {
				let dd = {};
				for (let i = 0; i < data_list.length; i++) {
					dd[data_list[i][0]] = false;
				}
				return dd;
			} else {
				let dd = {};
				for (let i = 0; i < data_list.length; i++) {
					let l_item = data_list[i];
					let keyy = l_item[0];
					let values = l_item.slice(1, l_item.length);
					if (!(keyy in dd)) {
						dd[keyy] = [];
					}
					dd[keyy].push(values);
				}
				for (let key in dd) {
					dd[key] = make_dict_tree(dd[key]);
				}
				return dd;
			}
		}

		//填充选项function
		let ddd = make_dict_tree(data);

		function fillOption(key, n) {
			let optnum = 0, strHTMLArray = [], optnam;
			strHTMLArray.push('<option value="please select" style="display: none">' + "请选择" + "</option>>");
			for (let i = 0; i < key.length; i++) {
				optnam = key[i];
				if (n == 3) {
					strHTMLArray.push('<option value="' + optnam + '">' + optnam + '</option>')
				} else {
					strHTMLArray.push('<option value="' + optnum + '">' + optnam + '</option>');
					optnum += 1;
				}
			}
			$("#" + n).html(strHTMLArray.join(''));
		}

		//1号搜索框选项填充
		let text3_ori;
		let keys = Object.keys(ddd), keyss = [], keysss = [];
		fillOption(keys, 1);
		//搜索框内容级连变化
		$("#1").on('change', function () {
			$("#2").empty();
			let option1 = $(this).find('option:selected').val();
			keyss = Object.keys(ddd[keys[option1]]);
			fillOption(keyss, 2);
			$("#3").empty();//清空3级选框
			clearAll();//清空界面
		});
		$("#2").on('change', function () {
			$("#3").empty();
			let option1 = $("#1").find('option:selected').val();
			let option2 = $(this).find('option:selected').val();
			keysss = Object.keys(ddd[keys[option1]][keyss[option2]]);
			fillOption(keysss, 3);
			clearAll();//清空界面
			text3_ori = $("#3").find("option:selected").val();//保留3号选框原始选项
		});
		$("#3").on('change', function () {
			clearAll();
			let option = $('select').find('option:selected').val();
			let text1 = $("#1").find("option:selected").text();
			let text2 = $("#2").find("option:selected").text();
			let text3 = $("#3").find("option:selected").text();
			if (option !== "please select") {
				image_name = text1 + "_" + text2 + "_" + text3;
				let imgsrc = url + "gradingdata/solution/" + image_name + ".png";
				image.src = imgsrc;
				image.onload = function () {

					//获取本image_name相关的所有信息
					$.get(url + "api/grading/v1/ocr/" + image_name, function (data) {
						// 将所有图片信息赋值至应属变量中
						imgData = data.data;
						text_content = imgData.text_content;
						$("#checked").innerHTML = imgData.checked;
						text3_ori = text3;
						$("textarea").val("");
						$("#text").val(text_content);

						$.get(url + "api/grading/v1/ocr/" + image_name + "/images", function (data) {
							let imagesData = data.data;
							let subimage_list = [];
							let subimage_idx = [];
							for (let i = 0; i < imagesData.length; i++) {
								// 获取所有用c开头的小图片
								let subimage_name = imagesData[i].original_filename.slice(0, -4).split("_")[3];
								if (subimage_name[0] == "c") {
									subimage_list.push(subimage_name);
									subimage_idx.push(i);
								}
							}
							if (subimage_idx == 0) {
								$("#3").val(text3_ori);
								alert("该图片没有合适的图片需要处理");
								return 0;
							}
							//获取oldimage并画在canvas上
							for (let i = 0; i < subimage_idx.length; i++) {
								let subimageData = imagesData[subimage_idx[i]];
								let layer_name = subimage_list[i];
								let loc = subimageData.note1;
								let xval, yval;
								if (loc.length > 0) {
									xval = loc.split('_')[0];
									yval = loc.split('_')[1];
								} else {
									xval = 0;
									yval = 0;
									console.log(layer_name + ' is empty');
								}
								// 增加新的layer给subimage
								addSubimageLayer(layer_name, xval, yval);
								addSubimageButton(layer_name);

								// 把图片放在的应属layer上
								let oldImg = new Image();
								oldImg.crossOrigin = "Anonymous";
								oldImg.src = subimageData.scan_path;
								oldImg.onload = function () {
									$('#' + layer_name).drawImage({
										source: oldImg,
										x: xval,
										y: yval,
										fromCenter: false
									});
								}
								render_canvas();
								render_alphaLayer();
							}
						});
					});
				}
			}
		});
	});
}

function clearAll() {

	ctx_view.clearRect(0, 0, canvas_view.width, canvas_view.height);
	image.src = "";
	$("textarea").val("");

	var canvas_layer_list = document.getElementsByClassName("canvas_layers");
	var container_node = document.getElementsByClassName("canvas")[0];
	for (let i = 1; i < canvas_layer_list.length; i++) {
		container_node.removeChild(canvas_layer_list[i]);
	}

	var select_node = document.getElementById("select");
	var option_list = document.getElementsByClassName("select_option");
	for (let i = 1; i < option_list.length; i++) {
		select_node.removeChild(option_list[i]);
	}

	canvas_layer_list = document.getElementsByClassName("canvas_layers");
	option_list = document.getElementsByClassName("select_option");
	while (canvas_layer_list.length > 2) {
		clearAll();
	}
	while (option_list.length > 1) {
		clearAll();
	}

	console.log(container_node);
	console.log(select_node);
}


//重置画布function
function render_canvas() {
	console.log('working');
	$('.canvas_layers').clearCanvas();
	let c = $(".canvas_layers");
	if (c.length > 0) {
		for (let i = 0; i < c.length; i++) {
			ctx = c[i].getContext('2d');
			ctx.canvas.width = image.width;
			ctx.canvas.height = image.height;
		}
	}

	let canvas_view = document.getElementById("view");
	let ctx_view = canvas_view.getContext('2d');
	ctx_view.canvas.width = image.width;
	ctx_view.canvas.height = image.height;
	ctx_view.canvas.height = image.height;
	$('#origin').drawImage({ source: image, x: 0, y: 0, fromCenter: false });
}

//显示所有应该被显示的涂层
function render_alphaLayer() {
	let c = $(".canvas_layers");
	ctx_view.clearRect(0, 0, canvas_view.width, canvas_view.height);
	ctx_view.globalAlpha = a;
	for (let i = 1; i < c.length; i++) {
		if (c[i].style["z-index"] > threshold) {
			ctx_view.drawImage(c[i], 0, 0)
			sub_id = c[i].id;
			xval = c[i].getAttribute('valx');
			yval = c[i].getAttribute('valy');
			ctx_view.drawImage(c[i], 0, 0);
			ctx_view.font = '16px';
			ctx_view.fillText(sub_id, xval, yval);
		}
	}
}

function displayLayer(node_) {
	var display_id = node_.id;
	var canvas_layer = document.getElementById(display_id.split("_")[1]);
	var layer_color = canvas_layer.getAttribute('color');

	node_.parentNode.style["background-color"] = layer_color;
	highest_layer_idx += 1;
	canvas_layer.style["z-index"] = highest_layer_idx;
	render_alphaLayer(0);
}

function displaySubLayer(node_) {
	var dropdown_node = document.getElementById('select');
	var selected_id = dropdown_node.options[dropdown_node.selectedIndex].id;
	var selected_node = document.getElementById(selected_id);
	displayLayer(selected_node);
}

function hideLayer() {
	threshold = highest_layer_idx - 1;
	render_alphaLayer();
}

function displayAll() {
	temp = threshold;
	threshold = -100;
	render_alphaLayer();
	threshold = temp;
}



//checked选择
function check(check__) {
	document.getElementById("checked").innerHTML = check__;
}

//content分行标记
$("#text").on('scroll', function (e) {
	count = $(this).scrollTop();
	$("#left").scrollTop(count);
})

//提交文本文件
$("#submit").on('click', function () {
	let option = $('select').find('option:selected').val();
	//获取submit格式
	if (option != "please select") {
		$.get(url + "api/grading/v1/ocr/" + image_name, function (data) {
			imgData = data.data;
			imgData.text_content = $("#text").val();
			if ($("#checked").innerHTML == "true") { imgData.checked = true };
			if ($("#checked").innerHTML == "false") { imgData.checked = false };
			let textData = JSON.stringify(imgData);
			$.ajax({
				type: "POST",
				url: url + "api/grading/v1/ocr/" + image_name,
				data: textData,
				headers: { 'Content-Type': 'application/json' },
				success: success,
				dataType: 'json',
			});
			function success() {
				alert("success");
			};
		});
	}
});

//保存图层
$(".save").on('click', function () {
	let save_id = $("#select").val();
	let layer_name = 'c' + save_id;
	let save_cvs = document.getElementById(layer_name);
	let color = save_cvs.getAttribute('color');
	color = color.slice(5, -1);
	let color_lst = color.split(",");
	let r = color_lst[0], g = color_lst[1], b = color_lst[2];
	let ctx = save_cvs.getContext("2d");
	let original_width = save_cvs.width, original_height = save_cvs.height;
	let x_left = y_top = 10000, x_right = y_bottom = 0;
	let img = ctx.getImageData(0, 0, original_width, original_height);
	let imgData = img.data;
	for (let i = 0; i < imgData.length; i += 4) {
		if ((imgData[i] == r && imgData[i + 1] == g && imgData[i + 2] == b) || (imgData[i] == 0 && imgData[i + 1] == 255 && imgData[i + 2] == 0)) {
			let y_cor = (i / 4) / original_width;
			let x_cor = (i / 4) % original_width;
			if (x_cor < x_left) {
				x_left = x_cor;
			}
			if (x_cor > x_right) {
				x_right = x_cor;
			}
			if (y_cor < y_top) {
				y_top = y_cor;
			}
			if (y_cor > y_bottom) {
				y_bottom = y_cor;
			}
		}
	}

	render_alphaLayer();
	let width = x_right - x_left;
	let height = y_bottom - y_top;
	let canvas = document.createElement('canvas');
	canvas.setAttribute("id", "canvas");
	canvas.setAttribute("style", "position: absolute;z-index = -1000;");
	let ctx1 = canvas.getContext("2d");
	ctx1.canvas.width = width;
	ctx1.canvas.height = height;
	let val1 = canvas.toDataURL();
	img = ctx.getImageData(x_left, y_top, width, height);
	ctx1.putImageData(img, 0, 0);
	let val2 = canvas.toDataURL();
	ctx1.canvas.width = original_width;
	ctx1.canvas.height = original_height;
	ctx1.clearRect(0, 0, canvas.width, canvas.height);

	let blobBin = atob(val2.split(',')[1]);
	let array = [];
	for (let i = 0; i < blobBin.length; i++) {
		array.push(blobBin.charCodeAt(i));
	}
	let file = new File([new Uint8Array(array)], image_name + "_" + layer_name + '.png', { type: 'image/png', lastModified: Date.now() });
	let formdata = new FormData();
	formdata.append("images", file);
	let position = x_left + '_' + y_top;
	let pos_obj = {
		note1: position
	};
	formdata.append("data", JSON.stringify(pos_obj));
	//检查是否存在image，若有，删除
	$.get(url + "api/grading/v1/ocr/" + image_name + "/images", function (data) {
		let imagesData = data.data;
		for (let i = 0; i < imagesData.length; i++) {
			if (imagesData[i].original_filename == image_name + "_" + layer_name + ".png") {
				$.ajax({
					type: "DELETE",
					url: url + "api/grading/v1/ocr/" + image_name + "/images/" +
						imagesData[i].image_id,
					headers: { 'Content-Type': 'application/json' },
					success: delete_success,
				});
				function delete_success() {
					console.log('Deleted');
				}
			}
		}
	});
	//post最新image
	$.ajax({
		url: url + "api/grading/v1/ocr/" + image_name + "/images",
		type: "POST",
		data: formdata,
		processData: false,
		contentType: false,
		mimeType: "image/png"
	}).done(function (respond) {
		//					  Access-Control-Allow-Origin: *;
		alert("done");
	}).fail(function (res) { alert("fail") });
});

//圆形笔擦function
function clearArcFun(x, y, r, ctx) {
	let stepClear = 1;
	clearArc(x, y, r);
	function clearArc(x, y, radius) {
		let calcWidth = radius - stepClear;
		let calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);

		let posX = x - calcWidth;
		let posY = y - calcHeight;

		let widthX = 2 * calcWidth;
		let heightY = 2 * calcHeight;

		if (stepClear <= radius) {
			ctx.clearRect(posX, posY, widthX, heightY);
			stepClear += 1;
			clearArc(x, y, radius);
		}
	}
}
//取消鼠标右键默认事件防止干扰检验操作
document.oncontextmenu = function (event) {
	event.preventDefault();
};

//水平画线判断
$(document).keydown(function (e) {
	if (e.keyCode == 32) {
		if (isIn) {
			e.preventDefault();
			islev = true;
		}
	}
});
$(document).keyup(function (e) {
	if (e.keyCode == 32) {
		e.preventDefault();
		islev = false;
	}
})
//画笔&擦除&Arc尺寸
$(document).mousewheel(function (e, delta) {

	if (!isErasing) {
		if (isDrawing) {
			e.preventDefault();
			let dir = delta > 0 ? 'Up' : 'Down';
			if (dir == 'Up') {
				line_width += 3;
			} else {
				line_width -= 3;
			}
		}
		$("#arc").css({
			"position": "absolute", "left": e.pageX - line_width / 2, "top": e.pageY - line_width / 2, "z-index": "10000",
			"width": line_width, "height": line_width, "border-radius": line_width / 2
		});
	}
	else {
		if (isDrawing) {
			e.preventDefault();
			let dir = delta > 0 ? 'Up' : 'Down';
			if (dir == 'Down' && erase_r > 6) {
				erase_r -= 3;
			} else {
				erase_r += 3;
			}
		}
		$("#arc").css({
			"position": "absolute", "left": e.pageX - erase_r, "top": e.pageY - erase_r, "z-index": "10000",
			"width": erase_r * 2, "height": erase_r * 2, "border-radius": erase_r
		});
	}
});
//擦除状态选择
$("#Erase").on('click', function () {
	if (isErasing) {
		$(this).css("background-color", "white");
		isErasing = false;
	}
	else {
		$(this).css("background-color", "red")
		isErasing = true;
	}
})


//创建dictionary
function CreatUpLoadArray() {
	reginDic = {};
	for (let i = 0; i < allDataArray.length; i++) {
		reginDic[i] = allDataArray[i];
	}
}

function addSubimageLayer(layer_name, xval, yval) {
	var temp = document.getElementsByTagName("template")[0];
	var newDiv = temp.content.cloneNode(true);
	var subDiv = newDiv.querySelectorAll('canvas')[0];
	subDiv.setAttribute('id', layer_name);
	subDiv.setAttribute('style', "position: absolute; z-index: " + -parseInt(layer_name.replace('c', '')).toString() + ";");
	subDiv.setAttribute('onMouseEnter', "mouseEnter()");
	subDiv.setAttribute('onMouseUp', "mouseUp()");
	subDiv.setAttribute('onMouseOut', "mouseOut()");
	subDiv.setAttribute('onMouseMove', "mouseMove(this, event)");
	subDiv.setAttribute('onmousedown', "mouseDown(event)");
	subDiv.setAttribute('valx', xval);
	subDiv.setAttribute('valy', yval);

	temp.parentNode.appendChild(newDiv);
}

function mouseDown(event) {
	isDrawing = true;
	[lastX, lastY] = [event.offsetX, event.offsetY];
}

function mouseEnter() {
	isIn = true;
}

function mouseMove(canvas, event) {
	let ctx = canvas.getContext('2d');
	if (isDrawing && canvas.id != 'origin') {
		x = event.offsetX;
		y = event.offsetY;
		if (!isErasing) {
			//原图
			ctx.lineWidth = line_width;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.strokeStyle = canvas.getAttribute('color');
			ctx.beginPath();
			ctx.moveTo(lastX, lastY);
			if (islev == true) {
				ctx.lineTo(x, lastY);
				ctx.stroke();
				[lastX, lastY] = [x, lastY];
			}
			else if (islev == false) {
				ctx.lineTo(x, y);
				ctx.stroke();
				[lastX, lastY] = [x, y];
			}
		}
		else {
			clearArcFun(x, y, erase_r, ctx);
			// ctx_prev.clearRect(x,y,100,100);
		}
		render_alphaLayer();
	}
}


function mouseUp() {
	isDrawing = false;
}

function mouseOut() {
	isDrawing = false;
	isIn = false;
}

function addSubimageButton(layer_name) {
	var temp = document.getElementsByTagName("template")[1];
	var newDiv = temp.content.cloneNode(true);
	var subDiv = newDiv.querySelectorAll('option')[0];
	subDiv.setAttribute('id', 'display_' + layer_name);
	subDiv.innerHTML = parseInt(layer_name.replace('c', ''))
	temp.parentNode.appendChild(newDiv);
}

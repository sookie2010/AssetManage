appcan.ready(function() {
var vm = new Vue({
    el : "#Page",
    data : {
        zcList : [],
        selectItemIndex : null,
        operateId : null
    },
    created : function() {
        //二维码信息中包含 operateType 和 operateId
        ///*
        var jsonStr = appcan.locStorage.getVal("QrcodeContent");
        appcan.locStorage.remove("QrcodeContent");
        if(!jsonStr) {
            return;
        }
        //*/
        // ----TEST----
        //var jsonStr = '{"operateId":"4c3fc663-2b9d-4044-8fe8-6a6c3d279916","operateType":"1"}';
        // ------------
        var operateId = JSON.parse(jsonStr).operateId;
        appcan.locStorage.setVal("operateId", operateId);
        appcan.ajax({
            type : "POST",
            url : sys_common.rootPath + sys_common.contextPath + "zichan/getByOperateId",
            data : {
                operateId : operateId
            },
            success : function(res) {
                if (Array.isArray(res)) {
                    vm.$data.zcList = res;
                } else {
                    vm.$data.zcList = JSON.parse(res);
                }
            }
        });
    },
    methods : {
        /**
         * 表格行 点击事件
         * @param {Object} index 该行索引(从0开始)
         */
        trSelect : function(item,index) {
            var target = $(event.currentTarget);
            target.parent("div").children().removeClass("selected");
            target.addClass("selected");
            vm.$data.selectItemIndex = index;
        },
        /**
         * 调用摄像头拍照
         */
        takePhoto : function() {
            // 调用摄像头拍照
            uexCamera.open(0, 60, function(picPath) {//获取到图片的路径
                //创建图片上传器
                var uploader = uexUploaderMgr.create({
                    url : sys_common.rootPath + sys_common.contextPath + "lz/uploadPhoto",
                    type : 0
                });
                //设置请求消息头
                var headJson = {"Content-Type" : "multipart/form-data"};
                uexUploaderMgr.setHeaders(uploader, JSON.stringify(headJson));
                
                //执行文件上传
                uexUploaderMgr.uploadFile(uploader, picPath, "uploadPhoto", 2, 700,function(packageSize, percent, responseString, status){
                    switch (status) {
                    case 0: //上传中
                        //document.getElementById('percentage').innerHTML = "上传包大小:"+packageSize+"<br>上传进度:"+percent+"%";
                        break;
                    case 1: //上传成功
                        alert("上传成功,服务器response:"+responseString);
                        break;
                    case 2: //上传失败
                        alert("上传失败");
                        break;
                    }
                });
                appcan.alert({
                    title : "图片路径",
                    content : picPath,
                    buttons : ['确定']
                });
            });
        },
        /**
         * 点击"上传图片"
         */
        uploadPic : function() {
            if (this.selectItemIndex == null) {
                appcan.window.openToast('请选择要添加照片的资产', '2000');
                return;
            }
            $("#uploadPhoto").click();
        },
        /**
         * 选择文件之后的回调函数
         */
        selectFile : function() {
            var fileInput = event.target;
            // 检查文件是否选择:
            if (!fileInput.value) {
                return;
            }
            // 获取File引用:
            var file = fileInput.files[0];
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
                appcan.alert({
                    title : "提示",
                    content : "不是有效的图片文件!",
                    buttons : ['确定'],
                });
                return;
            }
            // 读取文件:
            var reader = new FileReader();
            var vm = this;
            reader.onload = function(e) {//生成图片预览
                var data = e.target.result;
                // base64编码
                var img_preview = $(".table-striped tbody tr").find(".img-preview").eq(vm.selectItemIndex);
                img_preview.css("background-image", 'url(' + data + ')');
                // vm.zcList[vm.selectItemIndex].imageSrc = 'url(' + data + ')';
            };
            // 以DataURL的形式读取文件:
            reader.readAsDataURL(file);
            var formData = new FormData(document.getElementById("uploadForm"));
            formData.append("operateId",appcan.locStorage.getVal("operateId"));
            formData.append("zcId",this.zcList[this.selectItemIndex].uuid);
            appcan.ajax({
                url : sys_common.rootPath + sys_common.contextPath + "lz/uploadPhoto",
                type : "POST",
                data : formData,
                processData : false,
                contentType : false,
                success : function() {
                    appcan.window.openToast('文件上传成功', '2000');
                },
                error : function() {
                    appcan.window.openToast('文件上传失败', '2000');
                }
            });
        },
        /**
         * 完成
         */
        finished : function() {
            //跳转至接收方确认页面
            
            appcan.openWinWithUrl('zcck_confirm','zcck_confirm.html');
        },
        /**
         * 取消
         */
        cancel : function() {
            uexWindow.close();//关闭当前页面
        }
    }
});
}); 
(function(){
    var q = sys_common.getQueryString("q");
    var search = null;
    if(q) { //判断是否接收到传递的参数
        search = JSON.parse(unescape(q));
    }
    var vm = new Vue({
        el : "#Page",
        mounted : function(){
            if(!search) {
                return;
            }
            $.ajax({
                url : sys_common.rootPath + sys_common.contextPath + 'zichan/list',
                type : 'GET',
                data : search,
                success : function(res) {
                    vm.$data.resultList = res;
                }
            });
        },
        data : {
            resultList : null
        },
        methods : {
            /**
             * 选中/取消选中当前行 
             */
            trSelect : function(item) {
                item.isSelected = !item.isSelected;
                var target = $(event.currentTarget);
                target.toggleClass("selected");
            },
            /**
             * 取消按钮/导航条返回 
             */
            reback : function() {
                uexWindow.close();//关闭当前视图
            },
            /**
             * 将选中的行添加到清单 
             */
            addToList : function() {
                var selectedIds = vm.$data.resultList.filter(function(item){
                    return item.isSelected;
                }).map(function(item){
                    return item.uuid;
                });
                if(selectedIds.length == 0) {
                    appcan.window.openToast('请选择加入到清单的资产', '2000');
                    return;
                }
                //由于可以多次添加, 需要获取到上次添加的列表
                var oldList = localStorage.getItem("selectedIds");
                if(!oldList) {
                    //第一次添加
                    localStorage.setItem("selectedIds", JSON.stringify(selectedIds));
                } else {
                    //不是第一次添加
                    oldList = JSON.parse(oldList);
                    localStorage.setItem("selectedIds", JSON.stringify(selectedIds.concat(oldList)));
                }
                appcan.window.openToast('添加成功', '2000');
            },
            /**
             * 查看清单
             */
            showList : function() {
                var operate = sys_common.getQueryString("operate");
                switch(operate) {
                    case "1" : appcan.openWinWithUrl('zcck_list','zcck/zcck_list.html?operate='+operate);break;
                    case "2" : 
                    case "3" : 
                    case "4" :
                    default : 
                }
            }
        }
    });
})();
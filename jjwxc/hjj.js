// ==UserScript==
// @name         hjj工具
// @namespace    http://tampermonkey.net/
// @version      0.7.3
// @description  去刷屏，楼层无图
// @author       miaomiao
// @match        *://bbs.jjwxc.net/board.php?board=*&type=*&page=*
// @match        *://bbs.jjwxc.net/showmsg.php?board=*&boardpagemsg=*&id=*
// @match        *://bbs.jjwxc.net/board.php?board=*&page=*
// @match        *://bbs.jjwxc.net/showmsg.php?board=*&id=*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==


function main() {
    let mainElements = $("[id=topic]");
    window.topicWidth = mainElements.width();
    $("a[class^='quotereply']").hide();
    GM_addStyle("#toolbar{opacity:0.6;z-index:999999;position:fixed;top:20px;left:80%;border:1px solid #a38a54;width:180px;background-color:#eddec2;border-radius:3px;}")
    ShowToolBar();
    mainElements.each(function(index) {
        let element = $(this);
        Spam(index, element);
        HidePictures(index, element);
    });
}

function Spam(index, element) {
    //console.log(element);
    let height = element.height();
    let lineHeight = parseInt(element.css("line-height"));
    let picHeight = CalPicHeight(element);
    let rowsCount = (height - picHeight) / lineHeight;
    let maxRowsCount = 40;
    let flag = rowsCount > maxRowsCount ? true : false;
    if (flag) {
        var rowNum = 0;
        var picHtml = "";
        element.find("img").each(function() {
            picHtml += $(this).prop("outerHTML");
        });

        var allText = element.text().split("\n");
        var shownText = "";
        var hidenText = "";
        $.each(allText, function(index, value) {
            let partTextWidth = GetTextWidth(value);
            // console.log(partTextWidth);
            let rowNumInOnePart = 0;

            if (partTextWidth > topicWidth) {
                rowNumInOnePart += partTextWidth / topicWidth + 1;
            } else {
                rowNumInOnePart = 1;
            }

            if (rowNum + rowNumInOnePart > maxRowsCount) {
                rowNum += rowNumInOnePart;
                return true;
            }
            rowNum += rowNumInOnePart;
        });

        let elementText = element[0].innerHTML;
        element.html("");
        element.append("<p>本楼共" + parseInt(rowsCount) + "行</p><a href='javascript:;' class='shownText' data-index='" + index + "' textHidden='true'>点击显示全部</a> <span class='hideText' data-index='" + index + "' style='display:none'><br>" + elementText + "<a href='javascript:;' class='hideTextHref' data-index='" + index + "'>隐藏</a></span>" + picHtml);
    }
}

function HidePictures(index, element) {
    let hideHtml = "<p><a href='javascript:;' class='hidePic' data-index='" + index + "' picHidden='true'>显示此楼图片</a></p>";
    let picHtml = "";
    let picNode = element.find("img");
    if (picNode.length !== 0) {
        element.html(hideHtml + element.html());
        picNode = element.find("img").hide();
    }
}

function ShowToolBar() {
    $("body").append(`<div id='toolbar' style="display:flex;flex-direction:column ">
                        <div style="margin:2px auto">
                            <a id="top" style="margin:auto">回到顶部</a>
                        </div>
                        <div style="margin:2px auto">
                             <a id="showAllImg" ImgHidden='true'>显示全部图片</a>
                        </div>
                        <div style="margin:2px auto">
                            <a id="prePage" style="margin:auto">上一页</a>
                            <a id="nextPage" style="margin:auto">下一页</a>
                         </div>
                        <div style="margin:2px auto">
                            <input style="font-size:15px;width:70px;height:20px" placeholder="楼层转跳"><a id="top" >确定</a>
                        </div>
                        <div style="margin:2px auto">
                             <input style="font-size:15px;width:70px;height:20px" placeholder="页码转跳"><a id="top" >确定</a>
                        </div>
                        <div style="margin:2px auto">
                             <input style="font-size:15px;width:90px;height:20px" placeholder="屏蔽字添加"><a id="top" >确定</a>                        
                        </div>
                    </div>`);


}

function CalPicHeight(element) {
    let height = 0;
    element.find("img").each(function() {
        height += $(this).height();
    });
    return height;
}

function GetTextWidth(str) {
    let width = $('body').append($('<span stlye="display:none;" id="textWidth"/>')).find('#textWidth').html(str).width();
    $('#textWidth').remove();
    return width;
}

function GetPage(){
    const totalPage=$("#pager_top").text().replace(/共(\d*)页.*/,"$1");
    const pageIndex=location.search.indexOf("page=?");
    if(pageIndex<0){
        return -1;
    }
    const page=parseInt(location.search.substring(pageIndex+5));
    return [page,totalPage]
}

$(document).on("click", ".shownText", function(event) {
    console.log(event)
    let index = $(event.target).attr('data-index');
    let flag = $(event.target).attr('textHidden');
    if (flag == 'true') {
        $(".shownText[data-index=" + index + "]").text("隐藏");
        $(".hideText[data-index=" + index + "]").show();
        $(event.target).attr('textHidden', "false")
    } else {
        $(".shownText[data-index=" + index + "]").text("点击显示全部");
        $(".hideText[data-index=" + index + "]").hide();
        $(event.target).attr('textHidden', "true")
    }
});

$(document).on("click", ".hideTextHref", function(event) {
    let index = $(event.target).attr('data-index');
    $(".shownText[data-index=" + index + "]").text("点击显示全部");
    $(".hideText[data-index=" + index + "]").hide();
});

$(document).on("click", "#showAllImg", function() {
    if ($("#showAllImg").attr("ImgHidden") == "true") {
        $("img").show();
        $("#showAllImg").html("隐藏全部图片")
        $("#showAllImg").attr("ImgHidden", "false")
        $(".hidePic").text("隐藏此楼图片")
        $(".hidePic").attr("picHidden", "false")
    } else {
        $("img").hide();
        $("#showAllImg").html("显示全部图片")
        $(".hidePic").text("显示此楼图片")
        $(".hidePic").attr("picHidden", "true")
        $("#showAllImg").attr("ImgHidden", "true")
    }
});

$(document).on("click", ".hidePic", function(event) {
    const node = $(event.target)
    let flag = node.attr('picHidden');
    let index = node.attr('data-index');
    if (flag == "true") {
        $(".hidePic[data-index=" + index + "]").text("隐藏此楼图片");
        node.parent().parent().find("img").show()
        $(event.target).attr('picHidden', "false")
    } else {
        $(".hidePic[data-index=" + index + "]").text("显示此楼图片");
        node.parent().parent().find("img").hide()
        $(event.target).attr('picHidden', "true")
    }
});

$(document).on("click", "#top", function() {
    $('html, body').animate({ scrollTop: 0 }, 1000);
})

$(document).on("click", "#prePage", function() {
    let [page,totalPage]=GetPage();
    if(page==-1||page==0){
        alert("当前为第一页");
        return;
    }

    
})

$(document).on("click", "#nextPage", function() {
    $('html, body').animate({ scrollTop: 0 }, 1000);
})
main();
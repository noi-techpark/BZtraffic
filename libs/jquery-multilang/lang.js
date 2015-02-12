var langs = ['en', 'it', 'de'];
var langCode = '';
var langJS = null;


/*var translate = function (jsdata)
{
    $("[tkey]").each (function (index) {
        var strTr = jsdata [$(this).attr ('tkey')];
        $(this).html (strTr);
    });
}*/

function translate(jsdata) {
    $("[tkey]").each (function (index) {
        var strTr = jsdata [$(this).attr ('tkey')];
        $(this).html (strTr);
    });
}


function setTranslate() {
    // Verifico se ho impostato una lingua nei cookies
    var ck= document.cookie;
    var ckIndex= ck.indexOf("lang=");
    if(ckIndex > -1) {
        langCode= ck.substring(ckIndex+5,ckIndex+7);
    }else{
        langCode = navigator.language.substr (0, 2);
    }
    langCode= langCode.toLowerCase();

    if(langs.indexOf(langCode) > -1) {
        $.getJSON('libs/jquery-multilang/lang/'+langCode+'.json', translate);
    }else{
        $.getJSON('libs/jquery-multilang/lang/en.json', translate);
    }
}

setTranslate();

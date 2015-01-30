var langs = ['en', 'it'];
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
    if(ck.search("lang") > -1) {
        if(ck.search("lang=IT") > -1) {
            langCode= "it";
        }else{
            langCode= "en";
        }
    }else{
        langCode = navigator.language.substr (0, 2);
    }


    if(langs.indexOf(langCode) > -1) {
        $.getJSON('libs/jquery-multilang/lang/'+langCode+'.json', translate);
    }else{
        $.getJSON('libs/jquery-multilang/lang/en.json', translate);
    }
}

setTranslate();

var appId = "eservice";
function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
}

String.prototype.startWith=function(str){
    var reg=new RegExp("^"+str);
    return reg.test(this);
}

String.prototype.endWith=function(str){
    var reg=new RegExp(str+"$");
    return reg.test(this);
}

String.prototype.urlPath=function(){
    var  url=this;
    while(url.endWith("//")){
        url=url.substring(0,url.length-1);
    }

    if(url.endWith("/")){
        return url;
    }else{
        return url+"/"
    }
}


function encryptByDES(message, key) {

    if(message==null){
        return null;
    }

    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function _calcDataObjectFromExpandsArrayObject(expandsArrayObject){
    if(typeof(expandsArrayObject)!='object'){
        return expandsArrayObject;
    }

    if(expandsArrayObject==null){
        return null;
    }

    var dataObject=null;

    for(field in expandsArrayObject){
        var fieldValue=expandsArrayObject[field];
        if(field.startWith('_array_prefix_')){
            var arrayFieldName=field.substring("_array_prefix_".length);
            if(dataObject==null) {
                dataObject = {};
            }
            dataObject[arrayFieldName]=_calcDataObjectFromExpandsArrayObject(fieldValue);
        }else if(field.startWith('_array_element_')){
            if(dataObject==null){
                dataObject=[];
            }
            dataObject.push(_calcDataObjectFromExpandsArrayObject(fieldValue));
        }else{
            if(dataObject==null){
                dataObject={};
            }
            dataObject[field]=_calcDataObjectFromExpandsArrayObject(fieldValue);
        }
    }
    return dataObject;

}



var PlatformContext= {
    config:{},
    appURLConfig:{},
    beans:{},
    eventListeners:{},
    suspendRequestQueue:[],
    addEventListener: function (listener) {
        if(listener==null||listener.eventName==null||listener.fire==null){
            return ;
        }
        var list=PlatformContext.eventListeners[listener.eventName] ;
        if(list==null){
            list=[];
            PlatformContext.eventListeners[listener.eventName]=list;
        }
        list.push(listener);
    },
    clearEventListener:function(eventName){
    	PlatformContext.eventListeners[listener.eventName]=null;
    },
    replaceEventListener:function(listener){
    	if(listener==null||listener.eventName==null||listener.fire==null){
            return ;
        }
        var  list=[];
        PlatformContext.eventListeners[listener.eventName]=list;
        list.push(listener);
    },
    getJSONBean:function(name,appId){
        if(appId!=null)
        {
            return PlatformContext.beans[appId+"."+name];
        }else
        {
            return PlatformContext.beans[name];
        }

    },
    defineJSONBean:function(beanInfo){
        if(beanInfo==null||beanInfo.beanName==null||beanInfo.methods==null){
            return ;
        }

        if(PlatformContext.beans[beanInfo.appId+"."+beanInfo.beanName]!=null){
            return ;
        }


        var defaultBeanInfo={
            url:"",
            crossDomain:false
        };

        for(var f in defaultBeanInfo){
            if(beanInfo[f]==null){
                beanInfo[f]=defaultBeanInfo[f];
            }
        }

        PlatformContext.appURLConfig[beanInfo.appId]=beanInfo.url;


        var bean={};
        for(var i=0;i<beanInfo.methods.length;i++){
            var methodInfo={
                methodName:beanInfo.methods[i],
                methodTimout:61000,
                beanInfo:beanInfo
            }

            if(beanInfo.methodTimeout!=null&&beanInfo.methodTimeout[beanInfo.methods[i]]!=null){
                methodInfo.methodTimout=beanInfo.methodTimeout[beanInfo.methods[i]];
            }

            bean[beanInfo.methods[i]]=PlatformContext.buildJSONFunction(methodInfo);
        }

        PlatformContext.beans[beanInfo.appId+"."+beanInfo.beanName]=bean;
        if(beanInfo.crossDomain==false){
            PlatformContext.beans[beanInfo.beanName]=bean;
        }
    },
    buildJSONFunction:function(methodInfo){

        var func=function(){

            var args={};
            for(i=0;i<arguments.length;i++){
                args[i+""]=arguments[i];
            }

            var invoke={
                request:{
                    bean:methodInfo.beanInfo.beanName,
                    method:methodInfo.methodName,
                    arguments:JSON.stringify(args)
                },
                url:methodInfo.beanInfo.url.urlPath()+'skeleton/' + methodInfo.beanInfo.beanName+"/"+methodInfo.methodName,
                crossDomain:methodInfo.beanInfo.crossDomain,
                timeout:methodInfo.methodTimout
            }

            return PlatformContext.invoke(invoke);
        }
        return func;
    },
    invoke:function(invokeInfo){

        invokeInfo.request.random=Math.random();

        if(invokeInfo.dtd==null){
            invokeInfo.dtd=jQuery.Deferred();
            invokeInfo.dtd.durianinitflag=true;
        }

        var ajaxParams={
            url :invokeInfo.url,
            data :invokeInfo.request ,
            cache : false,
            async : true,
            timeout:invokeInfo.timeout,
            success : function(event,textStatus, request) {
                event.invokeInfo=invokeInfo;
                var listeners=PlatformContext.eventListeners[event.eventName];
                if(listeners!=null&&listeners.length>0){
                    for(var i in listeners){
                        try{
                            listeners[i].fire(event);
                        }catch(e){
                            alert(e);
                        }
                    }
                }else{
                    alert("No "+event.eventName+" Event Listener");
                }
            },
            error : function(XMLHttpRequest, textStatus, errorThrown) {
                var event={
                    eventName:'ExceptionEvent',
                    errorMessage:textStatus,
                    invokeInfo:invokeInfo
                };
                var listeners=PlatformContext.eventListeners[event.eventName];
                if(listeners!=null&&listeners.length>0){
                    for(var i in listeners){
                        try{
                            listeners[i].fire(event);
                        }catch(e){
                            alert(e);
                        }
                    }
                }else {
                    alert("No " + event.eventName + " Event Listener");
                }
            }
        };

        if(invokeInfo.crossDomain){
            ajaxParams.dataType='jsonp';
            ajaxParams.jsonp='callback';
        }else{
            ajaxParams.type='POST';
            ajaxParams.dataType='json';
        }

        jQuery.ajax(ajaxParams);

        if(invokeInfo.dtd.durianinitflag==true){
            invokeInfo.dtd.durianinitflag=false;
            return invokeInfo.dtd.promise();
        }

    },
    onPlatformReady:function(func)
    {
        if(func==null){
            return ;
        }
        $(document).ready(function(){
            func();
        });
    },
    getHtmlDataObject:function(name)
    {

        var expandsArrayObject={};
        var expandsElementMap={};
        expandsElementMap[""]=expandsArrayObject;

        $("[dataObject='"+name+"']").each(function(){
            var dataObjectFieldPath=$(this).attr('dataObjectFieldPath');
            var dataObjectFieldValue=$(this).attr('dataObjectFieldValue')
            if(dataObjectFieldValue==null){
                if(this.tagName.toLowerCase()=='input'||this.tagName.toLowerCase()=='select'){
                    dataObjectFieldValue=$(this).val();
                }else{
                    dataObjectFieldValue=$(this).text();
                }

            }

            if(dataObjectFieldPath!=null){
                var fields=dataObjectFieldPath.split(".");
                //对数组字段名称进行展开
                var expandsArrayFields=[];
                for(i in fields){
                    var field=fields[i];
                    if(field.indexOf('[')==-1){
                        expandsArrayFields.push(field);
                    }else{
                        var arrayArguments=null;
                        if(field.indexOf('[')>0){
                            var arrayFieldPrefix=field.substring(0,field.indexOf('['));
                            expandsArrayFields.push("_array_prefix_"+arrayFieldPrefix);
                            arrayArguments=field.substring(field.indexOf('['));
                        }else{
                            arrayArguments=field;
                        }
                        if(arrayArguments.lastIndexOf("]")==(arrayArguments.length-1))
                        {
                            arrayArguments=arrayArguments.substring(0,arrayArguments.length-1);
                        }
                        var arrayArgumentFields=arrayArguments.split(']');
                        for(var j in arrayArgumentFields){
                            var arrayArgumentField=arrayArgumentFields[j].replace("[","");
                            expandsArrayFields.push("_array_element_"+arrayArgumentField);
                        }

                    }
                }

                var parentPath="";

                //对象字段值,插入到数组展开后的对象
                for(i in expandsArrayFields){
                    var expandField=expandsArrayFields[i];
                    var parentObject=expandsElementMap[parentPath];
                    if(i==(expandsArrayFields.length-1)){
                        //最后一个字段,赋值
                        parentObject[expandField]=dataObjectFieldValue;
                    }else{

                        if(i>0){
                            parentPath=parentPath+"."+expandField;
                        }else{
                            parentPath=expandField;
                        }

                        if(parentObject[expandField]==null){
                            parentObject[expandField]={};
                            if(expandsElementMap[parentPath]==null){
                                expandsElementMap[parentPath]=parentObject[expandField];
                            }
                        }

                    }


                }


            }
        });

        //归并数组
        return _calcDataObjectFromExpandsArrayObject(expandsArrayObject);

    }
}



PlatformContext.loadJs=function(urls){
    var dtd=jQuery.Deferred();

    if((urls  instanceof Array)==false){
        var tmp=[];
        tmp.push(urls);
        urls=tmp;
    }

    var forEachLoadFunc=function(i){
        jQuery.getScript(urls[i],function(){
            i=i+1;
            if(i==urls.length){
                dtd.resolve();
            }else{
                forEachLoadFunc(i);
            }
        });
    }

    forEachLoadFunc(0);

    return dtd.promise();
}



PlatformContext.addEventListener({
    eventName:'ExceptionEvent',
    fire:function(event){
        event.invokeInfo.dtd.reject(event.errorMessage);
    }
});


PlatformContext.addEventListener({
    eventName:'RpcReponseEvent',
    fire:function(event){
        event.invokeInfo.dtd.resolve(event.data);
    }
});


PlatformContext.addEventListener({
    eventName:'UserIdentityRequiredEvent',
    fire:function(event){
        PlatformContext.config.ajaxLoginModel=true;
        PlatformContext.config.bindUserIdentityType=event.identityType;
        PlatformContext.appURLConfig['Login']=event.appLoginRequest.loginServerInfo.loginUrl;

        var LoginAutoLoginInvoke={
            request:{
                bean:'Login',
                method:'autoLogin',
                arguments:JSON.stringify({"0":event.appLoginRequest.params})
            },
            url:event.appLoginRequest.loginServerInfo.loginUrl.urlPath()+'skeleton/Login/autoLogin',
            crossDomain:true,
            timeout:61000
        }

        PlatformContext.invoke(LoginAutoLoginInvoke)
            .done(function(result){
                if(result.state==false&&result.loginPageInfo!=null){
                    PlatformContext.suspendRequest(event.invokeInfo);
                    PlatformContext.showLoginWindow(result.loginPageInfo);
                }else{
                    if(result.state==false){
                        alert(result.errorMessage);
                    }else{
                        PlatformContext.suspendRequest(event.invokeInfo);
                        PlatformContext.showUserIdentityBindWindow(result.userIdentityPageInfo);
                    }
                }
            })
            .fail(function(err){
                alert(err);
            });


    }
});


PlatformContext.addEventListener({
    eventName:'NoLoginEvent',
    fire:function(event){
        PlatformContext.config.ajaxLoginModel=true;
        PlatformContext.appURLConfig['Login']=event.appLoginRequest.loginServerInfo.loginUrl;

        var LoginAutoLoginInvoke={
            request:{
                bean:'Login',
                method:'autoLogin',
                arguments:JSON.stringify({"0":event.appLoginRequest.params})
            },
            url:event.appLoginRequest.loginServerInfo.loginUrl.urlPath()+'skeleton/Login/autoLogin',
            crossDomain:true,
            timeout:61000
        }


        PlatformContext.invoke(LoginAutoLoginInvoke)
            .done(function(result){
                if(result.state==false&&result.loginPageInfo!=null){
                    PlatformContext.suspendRequest(event.invokeInfo);
                    PlatformContext.showLoginWindow(result.loginPageInfo);
                }else{
                    if(result.state==false){
                        alert(result.errorMessage);
                    }else{

                        var AppLoginLoginInvoke={
                            request:{
                                bean:'AppLogin',
                                method:'login',
                                arguments:JSON.stringify({"0":result.appLoginInfo})
                            },
                            url:event.appLoginRequest.params.appUrl.urlPath()+'skeleton/AppLogin/login',
                            crossDomain:false,
                            timeout:61000
                        }


                        PlatformContext.invoke(AppLoginLoginInvoke)
                            .done(function(appResult){
                                if(appResult.status==true){
                                    PlatformContext.invoke(event.invokeInfo) ;
                                }else{
                                    alert(appResult.errorMessage);
                                }
                            })
                            .fail(function(err){
                                alert(err);
                            });
                    }
                }
            })
            .fail(function(err){
                alert(err);
            });

    }
});

PlatformContext.suspendRequest=function (event){
    PlatformContext.suspendRequestQueue.push(event);
}
PlatformContext.resumeAllSuspendRequest=function (){
    var queue= PlatformContext.suspendRequestQueue;
    PlatformContext.suspendRequestQueue=[];
    if(queue!=null&&queue.length>0){
        for(var i in queue){
            PlatformContext.invoke(queue[i]) ;
        }
    }
}


PlatformContext.showUserIdentityBindWindow=function(userIdentityPageInfo){

    if(PlatformContext.config.userIdentityBindHtmlResourceInited==null){
        if(userIdentityPageInfo.css!=null){
            var head = document.getElementsByTagName('HEAD').item(0);
            for(var i in userIdentityPageInfo.css){
                var style = document.createElement('link');
                style.href = PlatformContext.appURLConfig['Login'].urlPath()+userIdentityPageInfo.css[i];
                style.rel = 'stylesheet';
                style.type = 'text/css';
                head.appendChild(style);
            }

        }

        var jsUrls=[];
        for(var i in userIdentityPageInfo.js){
            jsUrls.push( PlatformContext.appURLConfig['Login'].urlPath()+userIdentityPageInfo.js[i]);
        }
        PlatformContext.loadJs(jsUrls).done(function(){

            PlatformContext.config.userIdentityBindHtmlResourceInited=true;

            $(document.body).trigger( "BindEvent_BindUserIdentityType", [{identityType:PlatformContext.config.bindUserIdentityType}] );

            if( PlatformContext.config.ajaxLoginModel==true){
                $(document.body).trigger( "BindEvent_ShowUserIdentityBindWindow", [{
                    model:'ajax'
                }] );
            }else{
                $(document.body).trigger( "BindEvent_ShowUserIdentityBindWindow", [{
                    model:'normal'
                }] );
            }
        });


    }else{

        $(document.body).trigger( "BindEvent_BindUserIdentityType", [{identityType:PlatformContext.config.bindUserIdentityType}] );

        if( PlatformContext.config.ajaxLoginModel==true){
            $(document.body).trigger( "BindEvent_ShowUserIdentityBindWindow", [{
                model:'ajax'
            }] );
        }else{
            $(document.body).trigger( "BindEvent_ShowUserIdentityBindWindow", [{
                model:'normal'
            }] );
        }
    }

}

PlatformContext.showLoginWindow=function(loginPageInfo){

    var showLoginWindow=function(){

        if(PlatformContext.config.loginHtmlResourceInited==null){
            if(loginPageInfo.css!=null){
                var head = document.getElementsByTagName('HEAD').item(0);
                for(var i in loginPageInfo.css){
                    var style = document.createElement('link');
                    style.href = PlatformContext.appURLConfig['Login'].urlPath()+loginPageInfo.css[i];
                    style.rel = 'stylesheet';
                    style.type = 'text/css';
                    head.appendChild(style);
                }

            }

            var jsUrls=[];
            for(var i in loginPageInfo.js){
                jsUrls.push( PlatformContext.appURLConfig['Login'].urlPath()+loginPageInfo.js[i]);
            }
            PlatformContext.loadJs(jsUrls).done(function(){

                PlatformContext.config.loginHtmlResourceInited=true;

                if( PlatformContext.config.ajaxLoginModel==true){
                    $(document.body).trigger( "LoginEvent_ShowLoginWindow", [{
                        model:'ajax'
                    }] );
                }else{
                    $(document.body).trigger( "LoginEvent_ShowLoginWindow", [{
                        model:'normal'
                    }] );
                }
            });


        }else{

            if( PlatformContext.config.ajaxLoginModel==true){
                $(document.body).trigger( "LoginEvent_ShowLoginWindow", [{
                    model:'ajax'
                }] );
            }else{
                $(document.body).trigger( "LoginEvent_ShowLoginWindow", [{
                    model:'normal'
                }] );
            }
        }

    }

    PlatformContext.logout().done(showLoginWindow).fail(showLoginWindow);

}


PlatformContext.login=function(params){
    var dtd=jQuery.Deferred();

    var LoginGetTokenInvoke={
        request:{
            bean:'Login',
            method:'getToken',
            arguments:JSON.stringify({})
        },
        url: PlatformContext.appURLConfig['Login'].urlPath()+'skeleton/Login/getToken',
        crossDomain:true,
        timeout:61000
    }


    PlatformContext.invoke(LoginGetTokenInvoke).done(function(token){
        params.userId=encryptByDES(params.userId,token);
        params.password=encryptByDES(params.password,token);

        var LoginLoginInvoke={
            request:{
                bean:'Login',
                method:'login',
                arguments:JSON.stringify({"0":params})
            },
            url: PlatformContext.appURLConfig['Login'].urlPath()+'skeleton/Login/login',
            crossDomain:true,
            timeout:120000
        }

        PlatformContext.invoke(LoginLoginInvoke).done(
            function(result){

                if(result.state){
                    try{
                        dtd.resolve();
                    }catch(e) {
                        alert(e);
                    }
                    if(PlatformContext.config.ajaxLoginModel==true){
                        PlatformContext.resumeAllSuspendRequest();
                    }else{
                        PlatformContext.resumeLastHttpRequest();
                    }

                }else{
                    dtd.reject(result.message);
                }
            }
        ).fail(
            function(err){
                dtd.reject(err);
            }
        );


    }).fail(function (err) {
        dtd.reject(err);
    });




    return dtd.promise();
}


PlatformContext.bindUserIdentity=function(params){
    var dtd=jQuery.Deferred();

    var LoginBindUserIdentityInvoke={
        request:{
            bean:'UserIdentity',
            method:'bind',
            arguments:JSON.stringify({"0":params})
        },
        url: PlatformContext.appURLConfig['Login'].urlPath()+'skeleton/UserIdentity/bind',
        crossDomain:true,
        timeout:61000
    }


    PlatformContext.invoke(LoginBindUserIdentityInvoke).done(function(result){

        if(result.state){
            try{
                dtd.resolve();
            }catch(e) {
                alert(e);
            }
            
            if(PlatformContext.config.ajaxLoginModel==true){
                PlatformContext.resumeAllSuspendRequest();
            }else{
                PlatformContext.resumeLastHttpRequest();
            }

        }else{
            dtd.reject(result.message);
        }


    }).fail(function (err) {
        dtd.reject(err);
    });




    return dtd.promise();
}


PlatformContext.scanBarCodeLogin=function(params){
    var dtd=jQuery.Deferred();

    var LoginScanBarCodeLoginInvoke={
        request:{
            bean:'Login',
            method:'scanBarCodeLogin',
            arguments:JSON.stringify({}),
            invokeId:params.invokeId
        },
        url: PlatformContext.appURLConfig['Login'].urlPath()+'skeleton/Login/scanBarCodeLogin',
        crossDomain:true,
        timeout:61000
    }

    PlatformContext.invoke(LoginScanBarCodeLoginInvoke).done(
        function(result){

            if(result.state){
                try{
                    dtd.resolve();
                }catch(e) {
                    alert(e);
                }

                if(PlatformContext.config.ajaxLoginModel==true){
                    PlatformContext.resumeAllSuspendRequest();
                }else{
                    PlatformContext.resumeLastHttpRequest();
                }

            }else{
                dtd.reject(result.message);
            }
        }
    ).fail(
        function(err){
            dtd.reject(err);
        }
    );


    return dtd.promise();
}


PlatformContext.resumeLastHttpRequest=function(){
    var AppLogin=PlatformContext.getJSONBean("AppLogin",PlatformContext.getURLParams().appId);
    var Login=PlatformContext.getJSONBean('Login','Login');

    AppLogin.getAppLoginRequest().done(function(appLoginRequest){
        if(appLoginRequest==null){
            var params= PlatformContext.getURLParams();
            if(params.url!=null){
                window.location.replace(params.url.urlPath()+"AppLoginRSB/recover");
            }else{
                window.location.replace(params.url);
            }
        }else{

            Login.autoLogin(appLoginRequest.params)
                .done(function(result){
                    if(result.state==false&&result.loginPageInfo!=null){
                        window.location.reload();
                    }else{
                        if(result.state==false){
                            alert(result.errorMessage);
                        }else{
                            AppLogin.login(result.appLoginInfo)
                                .done(function(appResult){
                                    if(appResult.status==true){

                                        var params= PlatformContext.getURLParams();
                                        if(params.url!=null){
                                            window.location.replace(params.url.urlPath()+"AppLoginRSB/recover");
                                        }else{
                                            window.location.replace(params.url);
                                        }

                                    }else{
                                        alert(appResult.errorMessage);
                                    }
                                })
                                .fail(function(err){
                                    alert(err);
                                });
                        }
                    }
                })
                .fail(function(err){
                    alert(err);
                });
        }

    }).fail(function(err){
        alert(err);
    });


}

PlatformContext.logout=function(){

    var dtd=jQuery.Deferred();


    var doLogout=function(logoutUrl){

        var LoginLogoutInvoke={
            request:{
                bean:'Login',
                method:'logout',
                arguments:JSON.stringify({})
            },
            url: logoutUrl.urlPath()+'skeleton/Login/logout',
            crossDomain:true,
            timeout:61000
        }

        PlatformContext.invoke(LoginLogoutInvoke).done(function(AppSessionList){

            if(AppSessionList!=null&&AppSessionList.length>0) {


                var logoutCount=0;

                for(var i in AppSessionList){

                    var AppLoginLogoutInvoke={
                        request:{
                            bean:'AppLogin',
                            method:'logout',
                            arguments:JSON.stringify({})
                        },
                        url: AppSessionList[i].url.urlPath()+'skeleton/AppLogin/logout',
                        crossDomain:true,
                        timeout:61000
                    }

                    PlatformContext.invoke(AppLoginLogoutInvoke).done(function(){
                        logoutCount++;
                        if(logoutCount==AppSessionList.length){
                            dtd.resolve();
                        }

                    }).fail(function(){
                        logoutCount++;
                        if(logoutCount==AppSessionList.length){
                            dtd.resolve();
                        }

                    });

                }

            }else{
                dtd.resolve();
            }

        }).fail(function(err){
            dtd.reject(err);
        });

    }


    if(PlatformContext.appURLConfig['Login']!=null)
    {
        doLogout(PlatformContext.appURLConfig['Login']);

    }else{

        var url=window.location.href;
        url=url.substring(0,url.lastIndexOf("/"));

        var AppLoginGetLogoutServerInfoInvoke={
            request:{
                bean:'AppLogin',
                method:'getLogoutServerInfo',
                arguments:JSON.stringify({})
            },
            url: url.urlPath()+'skeleton/AppLogin/getLogoutServerInfo',
            crossDomain:false,
            timeout:61000
        }

        PlatformContext.invoke(AppLoginGetLogoutServerInfoInvoke).done(function(logoutServerInfo){

            doLogout(logoutServerInfo.logoutUrl);

        }).fail(function(err){
            dtd.reject(err);
        });
    }



    return dtd.promise();

}



PlatformContext.getURLParams=function()
{
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

PlatformContext.getPageRequest = function() {
	var request = PlatformContext.getRequest();
	var paramStr = request['SDK_PARAM'];
	if (paramStr != null) {
		var jsonStr = decodeURIComponent(paramStr);
		var option = JSON.parse(jsonStr);
		for ( var p in request) {
			option[p] = request[p];
		}
		return option;
	} else {
		return request;
	}
}
PlatformContext.getRequest = function() {
	var url = location.href;
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.split("?")[1];
		strs = str.split("&");
		for (var i = 0; i < strs.length; i++) {
			if (strs[i].split("=")[0] == 'SDK_PARAM') {
				theRequest[strs[i].split("=")[0]] = strs[i].split("=")[1];
			} else {
				theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i]
						.split("=")[1]);
			}

		}
	}
	return theRequest;
}
PlatformContext.generateRequest = function(url, option, ctrl) {
	if (option == null) {
		option = {};
	}
	if (ctrl != null && ctrl.callerPageURLRequired == true) {

		if (ctrl.callerPageSdkParamRequired != null
				&& ctrl.callerPageSdkParamRequired == true) {
			option.callerPageURL = window.location.href;
		} else {
			if (window.location.href.indexOf('?SDK_PARAM') != -1) {
				option.callerPageURL = window.location.href.substring(0,
						window.location.href.indexOf('?SDK_PARAM'));
			} else {
				option.callerPageURL = window.location.href;
			}
		}
	}
	if (ctrl != null && ctrl.callerPageURL != null) {
		option.callerPageURL = ctrl.callerPageURL;
	}

	var jsonStr = JSON.stringify(option);
	var paramStr = encodeURIComponent(jsonStr);

	var targetURL = PlatformContext.getAbsoluteUrl(url);
	if (url.indexOf("?") == -1) {
		if (ctrl != null && ctrl.wechat != null
				&& ctrl.wechat.accessTokenRequired != null) {
			targetURL = targetURL
					+ '?WeChatAware=true&AccessTokenRequired=true';
			for ( var p in option) {
				targetURL = targetURL + "&" + p + "=" + option[p];
			}
			var redirect_uri = encodeURIComponent(targetURL);
			targetURL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='
					+ ctrl.wechat.appid
					+ '&redirect_uri='
					+ redirect_uri
					+ '&response_type=code&scope=snsapi_userinfo&state=hd#wechat_redirect'

		} else if (ctrl != null && ctrl.wechat != null) {
			targetURL = targetURL + '?WeChatAware=true';
			for ( var p in option) {
				targetURL = targetURL + "&" + p + "=" + option[p];
			}
			var redirect_uri = encodeURIComponent(targetURL);
			targetURL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='
					+ ctrl.wechat.appid
					+ '&redirect_uri='
					+ redirect_uri
					+ '&response_type=code&scope=snsapi_base&state=hd#wechat_redirect'

		} else {
			targetURL = targetURL + '?SDK_PARAM=' + paramStr;
		}

	} else {
		if (ctrl != null && ctrl.wechat != null
				&& ctrl.wechat.accessTokenRequired != null) {
			targetURL = targetURL
					+ '&WeChatAware=true&AccessTokenRequired=true';
			for ( var p in option) {
				targetURL = targetURL + "&" + p + "=" + option[p];
			}
			var redirect_uri = encodeURIComponent(targetURL);
			targetURL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='
					+ ctrl.wechat.appid
					+ '&redirect_uri='
					+ redirect_uri
					+ '&response_type=code&scope=snsapi_userinfo&state=hd#wechat_redirect'

		} else if (ctrl != null && ctrl.wechat != null) {
			targetURL = targetURL + '&WeChatAware=true';
			for ( var p in option) {
				targetURL = targetURL + "&" + p + "=" + option[p];
			}
			var redirect_uri = encodeURIComponent(targetURL);
			targetURL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='
					+ ctrl.wechat.appid
					+ '&redirect_uri='
					+ redirect_uri
					+ '&response_type=code&scope=snsapi_base&state=hd#wechat_redirect'

		} else {
			targetURL = targetURL + '&SDK_PARAM=' + paramStr;
		}

	}
	return targetURL;
}





(function(w) {

    function StatvooScript(_source, _async) {
        this.scriptObj = false;
        this.src = _source;
        this.async = _async;
        this.hook = false;
    }
    StatvooScript.prototype.clear=function(){
        this.scriptObj.parentNode.removeChild(this.scriptObj);
    };
    StatvooScript.prototype.load=function(cb){
        this.scriptObj = document.createElement('script');
        this.scriptObj.src = this.src;
        this.scriptObj.async = this.async;
        this.hook = document.getElementsByTagName('script')[0];
        this.hook.parentNode.insertBefore(this.scriptObj, this.hook);

        var _s = this;

        if(this.hook){
            if(typeof(this.scriptObj.onreadystatechange)!='undefined'){
                this.scriptObj.onreadystatechange = function() {
                    if (this.readyState == 'complete'|| this.readyState=='loaded') {
                        if (cb!=undefined) cb();
                        _s.clear();
                    }
                };
            } else {
                this.scriptObj.onload=function(){
                    setTimeout(function(){
                    }, 400);
                    if (cb!=undefined) cb();
                    _s.clear();
                }
            }
        }
    };

    function StatvooTracker() {
        this.start_time = new Date();
        this.last_activity = new Date();
        this.ltid = 0;
        this.sid = 0;
        this.record = new Array();

        this.cursorX = 0;
        this.cursorY = 0;
        this.scrollX = 0;
        this.scrollY = 0;
        this.hasTyped = false;
        this.hasClicked = false;
    }
    StatvooTracker.prototype.checkCursor=function() {
        var t=w["statvoo"].tracker;

        var doc = document.documentElement, body = document.body;
        t.scrollX = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
        t.scrollY = (doc && doc.scrollTop  || body && body.scrollTop  || 0);

        var typed = (t.hasTyped) ? 1 : 0;
        var clicked = (t.hasClicked) ? 1 : 0;
        t.hasTyped = false;
        t.hasClicked = false;

        /*t.record.push({mx:t.cursorX, my:t.cursorY, px:t.scrollX, py:t.scrollY, kt:typed, mc:clicked});*/
        t.record.push(t.cursorX+"|"+t.cursorY+"|"+t.scrollX+"|"+t.scrollY+"|"+typed+"|"+clicked+"|"+screen.width);
    };
    StatvooTracker.prototype.randomstring=function(){
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var s = '';
        for (var i = 0; i < 12; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            s += chars.substring(rnum, rnum + 1);
        }
        return s;
    };
    StatvooTracker.prototype.trackPath = function(section, datauris) {
        var h=w["statvoo"].helper;
        return 'https://api.statvoo.com/v3/wst/'+section+'/'+datauris;
    };
    StatvooTracker.prototype.pinger = function() {
        var t=w["statvoo"].tracker;

        if (w["statvoo"].debug) console.log('ping:'+t.ltid);

        var now = new Date();
        var now_ms = now.getTime();
        var last_ms = t.last_activity.getTime();

        var end_time = new Date();
        var time_spent = (end_time - t.start_time);
        t.start_time = new Date();

        var record = t.record;
        var uri = "?_="+this.randomstring()+"&s="+this.site+"&ltid="+t.ltid+"&g="+this.guid+"&t="+this.title+"&ts="+encodeURIComponent(time_spent)+"&record="+encodeURIComponent(record);
        t.record = new Array();

        if(now_ms-last_ms<300000) {
            t.source = t.trackPath("ping", uri);
        } else {
            this.source = t.trackPath("ping", uri+"&idle=1");
        }

        //if(now_ms-last_ms<300000) t.source = uri;
        //else t.source = uri+"&idle=1";

        //statvoo.helper.postRequest('https://t.statvoo.com/', t.source);

        w["statvoo"].script = new StatvooScript(this.source, "async");
        w["statvoo"].script.load();
    };

    StatvooTracker.prototype.postHTML = function() {
        return; //todo
        if (document.getElementsByTagName('html').length) {
            // Add the iframe with a unique name
            var iframe = document.createElement("iframe");
            var uniqueString = (0|Math.random()*9e6).toString(36);
            document.body.appendChild(iframe);
            iframe.style.display = "none";
            iframe.contentWindow.name = uniqueString;

            // construct a form with hidden inputs, targeting the iframe
            var form = document.createElement("form");
            form.target = uniqueString;
            form.action = "https://api.statvoo.com/v3/wst/html/";
            form.method = "POST";

            //elements
                var input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "s";
                    input.value = this.site;
                    form.appendChild(input);
                var input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "ltid";
                    input.value = this.ltid;
                    form.appendChild(input);
                var input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "g";
                    input.value = this.guid;
                    form.appendChild(input);
                var input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "html";
                    input.value = document.getElementsByTagName('html')[0].innerHTML;
                    form.appendChild(input);

            document.body.appendChild(form);
            form.submit();

            iframe.onload = function() {
                iframe.parentNode.removeChild(iframe);
            };

        }
    };

    StatvooTracker.prototype.moved = function(e) {
        var t=w["statvoo"].tracker;

        t.last_activity = new Date();

        e = e || window.event;

        t.cursorX = e.pageX || e.clientX;
        t.cursorY = e.pageY || e.clientY;
    };
    StatvooTracker.prototype.typed = function(e) {
        var t=statvoo.tracker;
        t.moved(e);
        t.hasTyped = true;
    };
    StatvooTracker.prototype.clicked = function(e) {
        if (w["statvoo"].debug) console.log('clicked');

        var t=w["statvoo"].tracker;
        t.moved(e);
        t.hasClicked = true;

        e = e || window.event;
        var target = e.target || e.srcElement;

        var href = target.href;

        if (href==undefined || href.startsWith("javascript")) return true;
        if (href.startsWith(location.protocol+"//"+location.hostname)) {
            // same domain
        } else {
            t.source = t.trackPath("click", "?_="+t.randomstring()+"&s="+t.site+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&g="+t.guid+"&t="+t.title+"&lk="+encodeURIComponent(href));
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();
            t.sleep(400);
            return true;
        }

    };
    StatvooTracker.prototype.sleep = function(ms) {
        ms += new Date().getTime();
        while (new Date() < ms){}
    };
    StatvooTracker.prototype.kill = function() {
        var t=w["statvoo"].tracker;

        clearInterval(t.intPing);
        clearInterval(t.intCursor);
        clearInterval(t.intHref);
    }
    StatvooTracker.prototype.initialize = function() {
        if (w["statvoo"].debug) console.log('initialized');

        var t=w["statvoo"].tracker;

        clearInterval(t.intPing);
        t.intPing = 0;

        clearInterval(t.intCursor);
        t.intCursor = 0;

        clearInterval(t.intHref);
        t.intHref = 0;

        t.location = location.href;

        t.site = encodeURIComponent(location.hostname);
        t.referrer = encodeURIComponent(document.referrer);
        t.language = encodeURIComponent((navigator.browserLanguage || navigator.language || ""));
        t.platform = encodeURIComponent(navigator.platform);
        t.screenres = encodeURIComponent(screen.width+"x"+screen.height);
        t.title = encodeURIComponent(document.title);

        if (document.cookie.indexOf("statvoo_tracker") >= 0) {
            t.guid = w["statvoo"].cookie.view();
        } else {
            t.today = new Date();
            t.expire = new Date();
            t.nDays=50000;
            t.expire.setTime(t.today.getTime() + 3600000*24*t.nDays);
            t.guid = w["statvoo"].cookie.save();

            document.cookie = "statvoo_tracker="+escape(t.guid)+";path=/;domain="+location.hostname+";expires=" + t.expire.toGMTString();
        }

        t.source = t.trackPath("track", "?_="+t.randomstring()+"&s="+t.site+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&g="+t.guid+"&t="+t.title);
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load();

        t.intPing = setInterval( function(){
            t.pinger();
        }, 15000);

        if(typeof(document.attachEvent)!='undefined') {
            document.attachEvent("onmousedown", t.clicked);
            document.attachEvent("onmousemove", t.moved);
            document.attachEvent("onkeydown", t.typed);
        } else {
            document.addEventListener("mousedown", t.clicked, false);
            document.addEventListener("mousemove", t.moved, false);
            document.addEventListener("keydown", t.typed, false);
        }
        t.intCursor = setInterval(function(){t.checkCursor();}, 1000);


        t.intHref = setInterval(function() {
            if (t.location!=location.href) {
                /*console.log('changed');*/
                t.initialize();
            }
        }, 100);

    };
    StatvooTracker.prototype.monitorXHR = function() {
        //TODO: future feature
        (function() {
            var proxied = window.XMLHttpRequest.prototype.send;
            window.XMLHttpRequest.prototype.send = function() {
                var xhrObj = {};
                //console.log( arguments );
                xhrObj.arguments = arguments;
                //Here is where you can add any code to process the request.
                //If you want to pass the Ajax request object, pass the 'pointer' below

                xhrObj.ms = 0;

                var pointer = this;
                var intervalId = window.setInterval(function(){
                    if(pointer.readyState != 4){
                        xhrObj.ms++;
                        return;
                    }
                    //console.log( pointer.responseText );

                    xhrObj.responseText = pointer.responseText;
                    xhrObj.responseURL = pointer.responseURL;
                    xhrObj.status = pointer.status;
                    xhrObj.pointer = pointer;

                    //Here is where you can add any code to process the response.
                    //If you want to pass the Ajax request object, pass the 'pointer' below
                    clearInterval(intervalId);

                    console.log(xhrObj);

                }, 1);//I found a delay of 1 to be sufficient, modify it as you need.
                return proxied.apply(this, [].slice.call(arguments));
            };


        })();
    };
    var StatvooEvent = function(_key, _value) {
        var t=w["statvoo"].tracker;

        t.source = t.trackPath("event", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&v_key="+encodeURIComponent(_key)+"&v_value="+encodeURIComponent(_value)+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&t="+t.title);
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load();
    };
    var StatvooTag = function(_key, _value) {
        var t=w["statvoo"].tracker;

        if (_key==undefined) _key='';
        if (_value==undefined) _value='';

        t.source = t.trackPath("tag", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&t_key="+encodeURIComponent(_key)+"&t_value="+encodeURIComponent(_value)+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&t="+t.title);
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load();
    };
    var StatvooGoal = function(_key, _value) {
        var t=w["statvoo"].tracker;

        if (_key==undefined) _key='';
        if (_value==undefined) _value='';

        t.source = t.trackPath("goal", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&g_key="+encodeURIComponent(_key)+"&g_value="+encodeURIComponent(_value)+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&t="+t.title);
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load();
    };
    var StatvooIdentify = function(obj, cb) {
        var t=w["statvoo"].tracker;
        var h=w["statvoo"].helper;

        t.source = t.trackPath("identify", "?_="+t.randomstring()+"&s="+t.site+"&g="+t.guid+"&i_obj="+encodeURIComponent(h.serialize(obj) ));
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load(cb);

        //t.sleep(400);
    };

    var StatvooErrors = function(obj) {
        var t=w["statvoo"].tracker;
        var h=w["statvoo"].helper;

        t.source = t.trackPath("error", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&e_obj="+encodeURIComponent(h.serialize(obj)));
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load();
    };


    function StatvooCookie() {}
    StatvooCookie.prototype.view = function() {
        var re = new RegExp("statvoo_tracker" + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    };
    StatvooCookie.prototype.save = function() {
        var Mf = function () {
            return Math.floor(
                    Math.random() * 0x10000 /* 65536 */
            ).toString(16);
        };
        return ( Mf() + Mf() + "-" + Mf() + "-" + Mf() + "-" + Mf() + "-" + Mf() + Mf() + Mf() );
    };

    function StatvooChat() {}
    StatvooChat.prototype.acline = function(ses_id, ad, uid, sid) {
        var t=w["statvoo"].tracker;
        //var cwnd="https://chat.statvoo.com/?c="+cid+"&u="+uid+"&g="+t.guid+"&s="+sid;
        if (ad==1) {
            //accept

            //phone home and say they accepted it
            t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&g="+t.guid+"&t="+t.title+"&cad="+ad+"&ses="+ses_id);
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();
            document.getElementById('statvoo_tracker_diag_chat_wnd').parentNode.removeChild(document.getElementById('statvoo_tracker_diag_chat_wnd'));

            if (document.getElementById('statvoo_chat_widget')) {
                var elem = document.getElementById("statvoo_chat_widget");
                elem.parentElement.removeChild(elem);
            }

            var el = document.getElementsByName('statvoo_styles')[0];
            if (typeof(el) != 'undefined' && el != null) {} else {
                el = document.createElement('link');
                el.setAttribute('rel', 'stylesheet');
                el.setAttribute('type', 'text/css');
                el.setAttribute('id', 'statvoo_styles');
                el.setAttribute('name', 'statvoo_styles');
                el.setAttribute('href', 'https://static.statvoo.com/css/chat.css');
                document.head.appendChild(el);
            }

            w["statvoo"].chatWidget.initialiseWidgetExistingSession(ses_id, uid, sid);

        } else {
            //decline
            t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&r="+t.referrer+"&l="+t.language+"&p="+t.platform+"&d="+t.screenres+"&g="+t.guid+"&t="+t.title+"&cad="+ad+"&ses="+ses_id);
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();
            document.getElementById('statvoo_tracker_diag_chat_wnd').parentNode.removeChild(document.getElementById('statvoo_tracker_diag_chat_wnd'));
        }


    };

    function StatvooChatWidget() {
        var iHeight = "";
        var widgetEl = "";
        var adminOnline = 0;
        var refresher = 0;
    }
    StatvooChatWidget.prototype.closeChat = function() {
        if (document.getElementById("statvoo_chat_widget")) document.getElementById("statvoo_chat_widget").parentNode.removeChild("statvoo_chat_widget");
    }
    StatvooChatWidget.prototype.initialiseWidget = function() {
        var that = this;
        var el = document.getElementsByName('statvoo_chat_widget')[0];
        if (typeof(element) != 'undefined' && el != null) {} else {
            if (that.adminOnline==1) {
                el = document.createElement('div');
                el.setAttribute('id', 'statvoo_chat_widget');
                el.setAttribute('name', 'statvoo_chat_widget');
                el.innerHTML  = "<div id='statvoo_chat_widget_header' name='statvoo_chat_widget_header' onclick='window.statvoo.chatWidget.minmax()'><span id='statvoo_chat_widget_titletext'>We're online, let's chat</span><span id='statvoo_chat_widget_minmax' name='statvoo_chat_widget_minmax'></span></div>";
                el.innerHTML += "<div id='statvoo_chat_widget_inner' name='statvoo_chat_widget_inner'>"+
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__yourname' style='display:block'>Your name:</label><input id='statvoo_chatwidget__yourname' name='statvoo_chatwidget__yourname' type='text' style='width:275px' /></div>" +
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__youremail' style='display:block'>Your email:</label><input id='statvoo_chatwidget__youremail' name='statvoo_chatwidget__youremail' type='text' style='width:275px' /></div>" +
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__subject' title='Required' style='display:block'>Subject: <span style='color:red'>*</span></label><input id='statvoo_chatwidget__subject' name='statvoo_chatwidget__subject' type='text' style='width:275px' /></div>" +
                    "<div><input type='submit' value='Start Chat!' onclick='window.statvoo.chatWidget.startChat();' /></div>" +
                    "<div style='position:absolute;bottom:5px;right:5px;'><a style='color:#017c34' href='https://statvoo.com' target='_blank'>statvoo.com</a></div>" +
                    "</div>";
                document.body.appendChild(el);
                this.iHeight = document.getElementById('statvoo_chat_widget').clientHeight+75; //+15 for the header
                this.widgetEl = document.getElementsByName('statvoo_chat_widget')[0];
                this.widgetEl.style.height = this.iHeight+"px";
                this.minimise();
            } else {
                el = document.createElement('div');
                el.setAttribute('id', 'statvoo_chat_widget');
                el.setAttribute('name', 'statvoo_chat_widget');
                el.innerHTML  = "<div id='statvoo_chat_widget_header' name='statvoo_chat_widget_header' onclick='window.statvoo.chatWidget.minmax()'><span id='statvoo_chat_widget_titletext'>Leave a message..</span><span id='statvoo_chat_widget_minmax' name='statvoo_chat_widget_minmax'></span></div>";
                el.innerHTML += "<div id='statvoo_chat_widget_inner' name='statvoo_chat_widget_inner'>"+
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__yourname' title='Required' style='display:block'>Your name: <span style='color:red'>*</span></label><input id='statvoo_chatwidget__yourname' name='statvoo_chatwidget__yourname' type='text' style='width:275px' /></div>" +
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__youremail' title='Required' style='display:block'>Your email: <span style='color:red'>*</span></label><input id='statvoo_chatwidget__youremail' name='statvoo_chatwidget__youremail' type='text' style='width:275px' /></div>" +
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__subject' title='Required' style='display:block'>Subject: <span style='color:red'>*</span></label><input id='statvoo_chatwidget__subject' name='statvoo_chatwidget__subject' type='text' style='width:275px' /></div>" +
                    "<div style='margin-bottom:5px'><label for='statvoo_chatwidget__message' title='Required' style='display:block'>Message: <span style='color:red'>*</span></label><textarea id='statvoo_chatwidget__message' name='statvoo_chatwidget__message' style='width:275px;min-height:50px;'></textarea></div>" +
                    "<div><input type='submit' value='Send Message!' onclick='window.statvoo.chatWidget.startChat();' /></div>" +
                    "<div style='position:absolute;bottom:5px;right:5px;'><a style='color:#017c34' href='https://statvoo.com' target='_blank'>statvoo.com</a></div>" +
                    "</div>";
                document.body.appendChild(el);
                this.iHeight = document.getElementById('statvoo_chat_widget').clientHeight+50; //+15 for the header
                this.widgetEl = document.getElementsByName('statvoo_chat_widget')[0];
                this.widgetEl.style.height = this.iHeight+"px";
                this.minimise();
            }
        }
    }
    StatvooChatWidget.prototype.initialiseWidgetExistingSession = function(session_id, userid, siteid) {
        var that = this;
        var el = document.getElementsByName('statvoo_chat_widget')[0];
        el = document.createElement('div');
        el.setAttribute('id', 'statvoo_chat_widget');
        el.setAttribute('name', 'statvoo_chat_widget');
        el.innerHTML  = "<div id='statvoo_chat_widget_header' name='statvoo_chat_widget_header' onclick='window.statvoo.chatWidget.minmax()'><span id='statvoo_chat_widget_titletext'>Connected to Live chat..</span><span id='statvoo_chat_widget_minmax' name='statvoo_chat_widget_minmax'></span></div>";
        el.innerHTML += "<div id='statvoo_chat_widget_inner' name='statvoo_chat_widget_inner'>"+
            "<div id='statvoo_chatwidget__actions'><a href='javascript:;' onclick='window.statvoo.chatWidget.terminate("+session_id+", "+userid+", "+siteid+")'>End chat</a></div>" +
            "<div id='statvoo_chatwidget__message'></div>" +
            "<div><input placeholder='Type message here..' type='text' value='' id='txtStatvooLiveChatNewMessage' onkeyup='window.statvoo.chatWidget.sendChatMessage(event, "+session_id+", "+userid+", "+siteid+");' /></div>" +
            "<div style='position:absolute;bottom:5px;right:5px;'><a style='color:#017c34' href='https://statvoo.com' target='_blank'>statvoo.com</a></div>" +
            "</div>";
        document.body.appendChild(el);
        this.iHeight = document.getElementById('statvoo_chat_widget').clientHeight+75; //+15 for the header
        this.widgetEl = document.getElementsByName('statvoo_chat_widget')[0];
        this.widgetEl.style.height = this.iHeight+"px";
        this.maximise();

        window.statvoo.chatWidget.getAllChats(session_id, userid, siteid);

        window.statvoo.chatWidget.refresher = setInterval(function() {
            window.statvoo.chatWidget.getAllChats(session_id, userid, siteid);
        }, 5000);
    };
    StatvooChatWidget.prototype.terminate = function(session_id, userid, siteid) {
        if (confirm("Are you sure?")) {
            var t=w["statvoo"].tracker;
            var h=w["statvoo"].helper;

            var _obj = {
                'session_id':session_id,
                'userid':userid,
                'siteid':siteid
            };

            t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&lc=end"+"&_obj="+encodeURIComponent(h.serialize(_obj)));
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();

            clearInterval(window.statvoo.chatWidget.refresher);
            window.statvoo.chatWidget.refresher = 0;

            document.getElementById('statvoo_chat_widget').parentNode.removeChild(document.getElementById('statvoo_chat_widget'));
        }
    };
    StatvooChatWidget.prototype.sendChatMessage = function(e, session_id, userid, siteid) {
        var t=w["statvoo"].tracker;
        var h=w["statvoo"].helper;

        e = e || window.event;
        if (e.keyCode==13) {
            var message = document.getElementById('txtStatvooLiveChatNewMessage').value;
            var _message = encodeURIComponent(message);
            var _obj = {
                'session_id':session_id,
                'userid':userid,
                'siteid':siteid,
                'message':_message
            };

            t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&lc=send"+"&_obj="+encodeURIComponent(h.serialize(_obj)));
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();

            document.getElementById('txtStatvooLiveChatNewMessage').value = '';
            var _el = document.getElementById('statvoo_chatwidget__message');
            _el.innerHTML += "<div class='_statvoo-lc-messageItem'><div><span class='_statvoo-lc-messageItemWHO'>user</span><span class='_statvoo-lc-messageItemTIMESTAMP'>now</span></div><span class='_statvoo-lc-messageItemMESSAGE'>"+message+"</span></div>";
        }
    };
    StatvooChatWidget.prototype.loadGetAllChats = function(json) {
        var _el = document.getElementById('statvoo_chatwidget__message');
        var _html = '';
        for(var i=0; i<json.length; i++) {
            _html += "<div class='_statvoo-lc-messageItem'><div><span class='_statvoo-lc-messageItemWHO'>"+json[i].who+"</span><span class='_statvoo-lc-messageItemTIMESTAMP'>"+json[i].timestamp+"</span></div><span class='_statvoo-lc-messageItemMESSAGE'>"+json[i].message+"</span></div>";
        }
        _el.innerHTML = _html;
    };
    StatvooChatWidget.prototype.getAllChats = function(session_id, userid, siteid) {
        var t=w["statvoo"].tracker;
        var h=w["statvoo"].helper;

        var _obj = {
            'session_id':session_id,
            'userid':userid,
            'siteid':siteid
        };

        t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&lc=get"+"&_obj="+encodeURIComponent(h.serialize(_obj)));
        w["statvoo"].script = new StatvooScript(t.source, "async");
        w["statvoo"].script.load();
    };

    StatvooChatWidget.prototype.minmax = function() {
        if (this.widgetEl.style.bottom=="0px") this.minimise();
        else this.maximise();
    };
    StatvooChatWidget.prototype.minimise = function() {
        this.widgetEl.style.bottom="-"+(this.iHeight-32)+"px";
        this.widgetEl.style.height=""+(this.iHeight)+"px";
        document.getElementsByName('statvoo_chat_widget_minmax')[0].innerHTML = "^";
    };
    StatvooChatWidget.prototype.maximise = function() {
        this.widgetEl.style.bottom="0px";
        this.widgetEl.style.height="auto";
        document.getElementsByName('statvoo_chat_widget_minmax')[0].innerHTML = "-";
    };
    StatvooChatWidget.prototype.startChat = function() {
        var that = this;

        var t=w["statvoo"].tracker;
        var h=w["statvoo"].helper;

        var el = document.getElementsByName('statvoo_styles')[0];
        if (typeof(el) != 'undefined' && el != null) {} else {
        el = document.createElement('link');
        el.setAttribute('rel', 'stylesheet');
        el.setAttribute('type', 'text/css');
        el.setAttribute('id', 'statvoo_styles');
        el.setAttribute('name', 'statvoo_styles');
        el.setAttribute('href', 'https://static.statvoo.com/css/chat.css');
        document.head.appendChild(el);}

        if (that.adminOnline) {
            var yourName = document.getElementsByName('statvoo_chatwidget__yourname')[0].value;
            var yourEmail = document.getElementsByName('statvoo_chatwidget__youremail')[0].value;
            var yourSubject = document.getElementsByName('statvoo_chatwidget__subject')[0].value;

            if (yourSubject=="") {
                document.getElementsByName('statvoo_chatwidget__subject')[0].style.border = "1px solid red";
                document.getElementsByName('statvoo_chatwidget__subject')[0].focus();
                return;
            }

            var guid = window.statvoo.tracker.guid;
            var sid = window.statvoo.tracker.sid;

            if (statvoo && statvoo.tracker) {
                statvoo.identify({name:yourName, email:yourEmail});
            }

            //create new chat session and accept and set to active, then open
            if (document.getElementById('statvoo_chat_widget')) {
                var elem = document.getElementById('statvoo_chat_widget');
                elem.parentElement.removeChild(elem);
            }

            var _obj = {
                name: yourName,
                email: yourEmail,
                subject: yourSubject,
                siteid: sid,
                userid: guid
            };
            t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&lc=userstart"+"&_obj="+encodeURIComponent(h.serialize(_obj)));
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();

            //window.statvoo.chatWidget.initialiseWidgetExistingSession(".$_result['id'].", $user_details_id, $site_id);

            // var cwnd="http://chat.statvoo.com/?nc=1&c=23&g="+guid+"&s="+sid+"&name="+encodeURIComponent(yourName)+"&email="+encodeURIComponent(yourEmail)+"&subject="+encodeURIComponent(yourSubject)+"&trailing=0";
            // window.open(cwnd,"","width=500,height=500");
            // document.getElementsByName('statvoo_chatwidget__yourname')[0].value = "";
            // document.getElementsByName('statvoo_chatwidget__youremail')[0].value = "";
            // document.getElementsByName('statvoo_chatwidget__subject')[0].value = "";
            // that.minimise();

        } else {
            var yourName = document.getElementsByName('statvoo_chatwidget__yourname')[0].value;
            var yourEmail = document.getElementsByName('statvoo_chatwidget__youremail')[0].value;
            var yourSubject = document.getElementsByName('statvoo_chatwidget__subject')[0].value;
            var yourMessage = document.getElementsByName('statvoo_chatwidget__message')[0].value;

            if (yourName=="" || yourEmail=="" || yourSubject=="" || yourMessage=="") {
                //document.getElementsByName('statvoo_chatwidget__subject')[0].style.border = "1px solid red";
                //document.getElementsByName('statvoo_chatwidget__subject')[0].focus();
                alert("Please fill in all the fields");
                return;
            }

            var guid = window.statvoo.tracker.guid;
            var sid = window.statvoo.tracker.sid;

            if (statvoo && statvoo.tracker) {
                statvoo.identify({name:yourName, email:yourEmail});
            }

            var _obj = {
                name: yourName,
                email: yourEmail,
                subject: yourSubject,
                message: yourMessage,
                siteid: sid,
                userid: guid
            };
            t.source = t.trackPath("chat", "?_="+t.randomstring()+"&s="+t.site+"&ltid="+t.ltid+"&g="+t.guid+"&lc=usermessage"+"&_obj="+encodeURIComponent(h.serialize(_obj)));
            w["statvoo"].script = new StatvooScript(t.source, "async");
            w["statvoo"].script.load();

            // var cwnd="http://chat.statvoo.com/?nc=1&c=24&g="+guid+"&s="+sid+"&name="+encodeURIComponent(yourName)+"&email="+encodeURIComponent(yourEmail)+"&subject="+encodeURIComponent(yourSubject)+"&message="+encodeURIComponent(yourMessage)+"&trailing=0";
            // window.open(cwnd,"","width=500,height=500");

            // document.getElementsByName('statvoo_chatwidget__yourname')[0].value = "";
            // document.getElementsByName('statvoo_chatwidget__youremail')[0].value = "";
            // document.getElementsByName('statvoo_chatwidget__subject')[0].value = "";
            // document.getElementsByName('statvoo_chatwidget__message')[0].value = "";
            // that.minimise();

        }
    };
    StatvooChatWidget.prototype.messageSent = function(msg) {
        //console.log(msg)
        alert(msg);
        if (document.getElementById('statvoo_chat_widget')) {
            var elem = document.getElementById('statvoo_chat_widget');
            elem.parentElement.removeChild(elem);
        }
    };


    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }


    function StatvooHelper() {}

    StatvooHelper.prototype.strUgly = function(tmp) {
        var str = '',
            i = 0,
            tmp_len = tmp.length,
            c;
        for (; i < tmp_len; i += 1) {
            c = tmp.charCodeAt(i);
            str += c.toString(16) + ' ';
        }
        str = str.replace(/ /g, "");
        return str.split("").reverse().join("");
    };
    StatvooHelper.prototype.strUnUgly = function(tmp) {
        tmp = tmp.split("").reverse().join("").replace(/(.{2})/g, "$1 ");
        var arr = tmp.split(' '),
            str = '',
            i = 0,
            arr_len = arr.length,
            c;
        for (; i < arr_len; i += 1) {
            c = String.fromCharCode( parseInt(arr[i], 16) );
            str += c;
        }
        return str;
    };

    StatvooHelper.prototype.postRequest = function(url,postData) {
        var that = this;
        /*
         var request = that.createCORSRequest("post", url);
         if (request) {
         request.onload = function(){
         //do something with request.responseText
         };
         request.send(postData);
         }
         return;
         */
        var req = that.createXMLHTTPObject();
        if (!req) return;
        req.open("POST",url,true);
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        req.onreadystatechange = function () {
            if (req.readyState != 4) return;
            if (req.status != 200 && req.status != 304) {
                return;
            }
        };
        if (req.readyState == 4) return;
        req.send(postData);
    };

    StatvooHelper.prototype.createCORSRequest = function(method, url){
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr){
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined"){
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null;
        }
        return xhr;
    };

    StatvooHelper.prototype.createXMLHTTPObject = function() {
        var XMLHttpFactories = [
            function () {return new XMLHttpRequest()},
            function () {return new ActiveXObject("Msxml2.XMLHTTP")},
            function () {return new ActiveXObject("Msxml3.XMLHTTP")},
            function () {return new ActiveXObject("Microsoft.XMLHTTP")}
        ];
        var xmlhttp = false;
        for (var i=0;i<XMLHttpFactories.length;i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            }
            catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    };
    StatvooHelper.prototype.serialize = function(mixed_value) {
        var val, key, okey,
            ktype = '', vals = '', count = 0,
            _utf8Size = function (str) {
                var size = 0,
                    i = 0,
                    l = str.length,
                    code = '';
                for (i = 0; i < l; i++) {
                    code = str.charCodeAt(i);
                    if (code < 0x0080) {
                        size += 1;
                    }
                    else if (code < 0x0800) {
                        size += 2;
                    }
                    else {
                        size += 3;
                    }
                }
                return size;
            },
            _getType = function (inp) {
                var match, key, cons, types, type = typeof inp;

                if (type === 'object' && !inp) {
                    return 'null';
                }
                if (type === 'object') {
                    if (!inp.constructor) {
                        return 'object';
                    }
                    cons = inp.constructor.toString();
                    match = cons.match(/(\w+)\(/);
                    if (match) {
                        cons = match[1].toLowerCase();
                    }
                    types = ['boolean', 'number', 'string', 'array'];
                    for (key in types) {
                        if (cons == types[key]) {
                            type = types[key];
                            break;
                        }
                    }
                }
                return type;
            },
            type = _getType(mixed_value)
            ;

        switch (type) {
            case 'function':
                val = '';
                break;
            case 'boolean':
                val = 'b:' + (mixed_value ? '1' : '0');
                break;
            case 'number':
                val = (Math.round(mixed_value) == mixed_value ? 'i' : 'd') + ':' + mixed_value;
                break;
            case 'string':
                val = 's:' + _utf8Size(mixed_value) + ':"' + mixed_value + '"';
                break;
            case 'array': case 'object':
            val = 'a';

            for (key in mixed_value) {
                if (mixed_value.hasOwnProperty(key)) {
                    ktype = _getType(mixed_value[key]);
                    if (ktype === 'function') {
                        continue;
                    }

                    okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
                    vals += this.serialize(okey) + this.serialize(mixed_value[key]);
                    count++;
                }
            }
            val += ':' + count + ':{' + vals + '}';
            break;
            case 'undefined':
            // Fall-through
            default:
                // if the JS object has a property which contains a null value, the string cannot be unserialized by PHP
                val = 'N';
                break;
        }
        if (type !== 'object' && type !== 'array') {
            val += ';';
        }
        return val;
    };


    var statvoo = {};
    statvoo.cookie = new StatvooCookie();
    statvoo.script = false;
    statvoo.tracker = new StatvooTracker();;
    statvoo.chat = new StatvooChat();
    statvoo.chatWidget = new StatvooChatWidget();
    statvoo.helper = new StatvooHelper();

    statvoo.event = StatvooEvent;
    statvoo.goal = StatvooGoal;
    statvoo.tag = StatvooTag;
    statvoo.identify = StatvooIdentify;
    statvoo.errors = StatvooErrors;

    statvoo.debug = false;

    w["statvoo"] = statvoo;

    w['onerror'] = function(message, file, line, col, error) {
        w['statvoo'].errors({
            m: message,
            f: file,
            l: line,
            c: col,
            s: (error && error.stack ? error.stack : ''),
            e: error
        });
    }

    w["statvoo"].tracker.initialize();

})(window);

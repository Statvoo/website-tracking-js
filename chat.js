(function(w) {
    function StatvooChatWidget() {
        var iHeight = "";
        var widgetEl = "";
        var adminOnline = 0;
    }
    StatvooChatWidget.prototype.closeChat = function() {
        document.getElementById("statvoo_chat_widget").parentNode.removeChild("statvoo_chat_widget");
    }
    StatvooChatWidget.prototype.initialiseWidget = function() {
        var that = this;
        var el = document.getElementsByName('statvoo_chat_widget')[0];
        if (typeof(element) != 'undefined' && el != null) {} else {
            if (that.adminOnline) {
                el = document.createElement('div');
                el.setAttribute('id', 'statvoo_chat_widget');
                el.setAttribute('name', 'statvoo_chat_widget');
                el.innerHTML  = "<div id='statvoo_chat_widget_header' name='statvoo_chat_widget_header' onclick='window.statvoo.chatWidget.minmax()'><span id='statvoo_chat_widget_titletext'>Chat with us..</span><span id='statvoo_chat_widget_minmax' name='statvoo_chat_widget_minmax'>+</span></div>";
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
                el.innerHTML  = "<div id='statvoo_chat_widget_header' name='statvoo_chat_widget_header' onclick='window.statvoo.chatWidget.minmax()'><span id='statvoo_chat_widget_titletext'>Leave us a message..</span><span id='statvoo_chat_widget_minmax' name='statvoo_chat_widget_minmax'>+</span></div>";
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
        el.innerHTML  = "<div id='statvoo_chat_widget_header' name='statvoo_chat_widget_header' onclick='window.statvoo.chatWidget.minmax()'><span id='statvoo_chat_widget_titletext'>Live chat..</span><span id='statvoo_chat_widget_minmax' name='statvoo_chat_widget_minmax'>+</span></div>";
        el.innerHTML += "<div id='statvoo_chat_widget_inner' name='statvoo_chat_widget_inner'>"+
            "<div style='margin-bottom:5px'><textarea id='statvoo_chatwidget__message' name='statvoo_chatwidget__message' style='width:275px;min-height:50px;'></textarea></div>" +
            "<div><input type='text' value='' id='txtStatvooLiveChatNewMessage' /></div>" +
            "<div><input type='submit' value='Send' onclick='window.statvoo.chatWidget.sendChatMessage("+session_id+", "+userid+", "+siteid+");' /></div>" +
            "<div style='position:absolute;bottom:5px;right:5px;'><a style='color:#017c34' href='https://statvoo.com' target='_blank'>statvoo.com</a></div>" +
            "</div>";
        document.body.appendChild(el);
        this.iHeight = document.getElementById('statvoo_chat_widget').clientHeight+75; //+15 for the header
        this.widgetEl = document.getElementsByName('statvoo_chat_widget')[0];
        this.widgetEl.style.height = this.iHeight+"px";
        this.maximise();
    };
    StatvooChatWidget.prototype.sendChatMessage = function(session_id, userid, siteid) {
        var message = encodeURIComponent(document.getElementById('txtStatvooLiveChatNewMessage').value);
        console.log(session_id, userid, siteid, message);
    };
    StatvooChatWidget.prototype.minmax = function() {
        if (this.widgetEl.style.bottom=="0px") this.minimise();
        else this.maximise();
    }
    StatvooChatWidget.prototype.minimise = function() {
        this.widgetEl.style.bottom="-"+(this.iHeight-32)+"px";
        this.widgetEl.style.height=""+(this.iHeight)+"px";
        document.getElementsByName('statvoo_chat_widget_minmax')[0].innerHTML = "+";
    }
    StatvooChatWidget.prototype.maximise = function() {
        this.widgetEl.style.bottom="0px";
        this.widgetEl.style.height="auto";
        document.getElementsByName('statvoo_chat_widget_minmax')[0].innerHTML = "-";
    }
    StatvooChatWidget.prototype.startChat = function() {
        var that = this;
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

            var cwnd="http://chat.statvoo.com/?nc=1&c=23&g="+guid+"&s="+sid+"&name="+encodeURIComponent(yourName)+"&email="+encodeURIComponent(yourEmail)+"&subject="+encodeURIComponent(yourSubject)+"&trailing=0";
            window.open(cwnd,"","width=500,height=500");

            document.getElementsByName('statvoo_chatwidget__yourname')[0].value = "";
            document.getElementsByName('statvoo_chatwidget__youremail')[0].value = "";
            document.getElementsByName('statvoo_chatwidget__subject')[0].value = "";
            that.minimise();

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

            var cwnd="http://chat.statvoo.com/?nc=1&c=24&g="+guid+"&s="+sid+"&name="+encodeURIComponent(yourName)+"&email="+encodeURIComponent(yourEmail)+"&subject="+encodeURIComponent(yourSubject)+"&message="+encodeURIComponent(yourMessage)+"&trailing=0";
            window.open(cwnd,"","width=500,height=500");

            document.getElementsByName('statvoo_chatwidget__yourname')[0].value = "";
            document.getElementsByName('statvoo_chatwidget__youremail')[0].value = "";
            document.getElementsByName('statvoo_chatwidget__subject')[0].value = "";
            document.getElementsByName('statvoo_chatwidget__message')[0].value = "";
            that.minimise();

        }
    }

    w['statvoo'].chatWidget = new StatvooChatWidget();
})(window);

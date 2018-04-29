
    document.addEventListener('dblclick', showMeaning);
    document.addEventListener('click', removeMeaning);

    var createdDiv;
    function showMeaning(event){
        var info = getSelectionInfo(event);
        if(!info){
            return;
        }

        sendRequest(info);
        createdDiv = createDiv(info);
    }


    function getSelectionInfo(event) {
        var word;
        var boundingRect;
        var ifZero = {};

        if (window.getSelection().toString().length > 1) {
            word = window.getSelection().toString();
            boundingRect = getSelectionCoords(window.getSelection());
        } else {
            return null;
        }

        var top = boundingRect.top + window.scrollY;
        var bottom = boundingRect.bottom + window.scrollY;
        var left = boundingRect.left + window.scrollX;

        if(boundingRect.height == 0){
            top = event.pageY;
            bottom = event.pageY;
            left = event.pageX;
        }

        var toReturn = {
            top: top,
            bottom: bottom,
            left: left,
            word: word,
            clientY: event.clientY,
            height: boundingRect.height
        };
      return toReturn;
    }

    function sendRequest(info){

        var url = "https://www.google.com/search?q=define+" + info.word;
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.responseType = 'document';
        xmlHTTP.onload = createCallback();
        xmlHTTP.open( "GET", url, true ); // true for asynchronous request
        xmlHTTP.send();
    }

    function createCallback(){
        var retrieveMeaning = function(){
            var document = this.responseXML;
            if(!document.querySelectorAll("[data-dobid='hdw']")[0]){
              return noMeaningFound(createdDiv);
            }
            var word = document.querySelectorAll("[data-dobid='hdw']")[0].textContent;
            var meaning = document.querySelectorAll(".PNlCoe [data-dobid='dfn'] span")[0].textContent;
            //console.log(word, meaning);
            appendToDiv(createdDiv, {word: word, meaning: meaning});
        };
        return retrieveMeaning;
    }


    function createDiv(info) {

        var hostDiv = document.createElement("div");
        hostDiv.className = "dictionaryDiv";
        hostDiv.style.left = info.left -10 + "px";
        hostDiv.style.position = "absolute";
        hostDiv.attachShadow({mode: 'open'});

        var shadow = hostDiv.shadowRoot;
        var style = document.createElement("style");
        style.textContent = ".mwe-popups{background:#fff;position:absolute;z-index:110;-webkit-box-shadow:0 30px 90px -20px rgba(0,0,0,0.3),0 0 1px #a2a9b1;box-shadow:0 30px 90px -20px rgba(0,0,0,0.3),0 0 1px #a2a9b1;padding:0;font-size:14px;line-height:20px;min-width:300px;border-radius:2px}.mwe-popups.mwe-popups-is-not-tall{width:320px}.mwe-popups .mwe-popups-container{color:#222;margin-top:-9px;padding-top:9px;text-decoration:none}.mwe-popups.mwe-popups-is-not-tall .mwe-popups-extract{min-height:40px;max-height:140px;overflow:hidden;margin-bottom:47px;padding-bottom:0}.mwe-popups .mwe-popups-extract{margin:16px;display:block;color:#222;text-decoration:none;position:relative} .mwe-popups.flipped_y:before{content:'';position:absolute;border:8px solid transparent;border-bottom:0;border-top:8px solid #a2a9b1;bottom:-8px;left:10px}.mwe-popups.flipped_y:after{content:'';position:absolute;border:11px solid transparent;border-bottom:0;border-top:11px solid #fff;bottom:-7px;left:7px} .mwe-popups.mwe-popups-no-image-tri:before{content:'';position:absolute;border:8px solid transparent;border-top:0;border-bottom:8px solid #a2a9b1;top:-8px;left:10px}.mwe-popups.mwe-popups-no-image-tri:after{content:'';position:absolute;border:11px solid transparent;border-top:0;border-bottom:11px solid #fff;top:-7px;left:7px}";
        shadow.appendChild(style);

        var popupDiv = document.createElement("div");

        popupDiv.style = "border-radius: 4px";
        shadow.appendChild(popupDiv);

        var contentContainer = document.createElement("div");
        contentContainer.className = "mwe-popups-container";
        popupDiv.appendChild(contentContainer);



        var content = document.createElement("div");
        content.className = "mwe-popups-extract";
        content.style = "margin-top: 0px; margin-bottom: 11px; max-height: none";
        contentContainer.appendChild(content);


        var heading = document.createElement("h3");
        heading.style = "-webkit-margin-after: 0px";
        heading.textContent = "Searching";

        var meaning = document.createElement("p");
        meaning.style = "margin-top: 10px";
        meaning.textContent = "Please Wait...";

        content.appendChild(heading);
        content.appendChild(meaning);
        document.body.appendChild(hostDiv);

        if(info.clientY < window.innerHeight/2){
            popupDiv.className = "mwe-popups mwe-popups-no-image-tri mwe-popups-is-not-tall";
            hostDiv.style.top = info.bottom + 10 + "px";
            if(info.height == 0){
                hostDiv.style.top = parseInt(hostDiv.style.top) + 8 + "px";
            }
        } else {
            popupDiv.className = "mwe-popups flipped_y mwe-popups-is-not-tall";
            hostDiv.style.top = info.top - 10 - popupDiv.clientHeight + "px";
            if(info.height == 0){
                hostDiv.style.top = parseInt(hostDiv.style.top) - 8 + "px";
            }
        }

        return {heading: heading, meaning: meaning};

    }

    function getSelectionCoords(selection) {
        var oRange = selection.getRangeAt(0); //get the text range
        var oRect = oRange.getBoundingClientRect();
        return oRect;
    }

    function appendToDiv(createdDiv, content){

        var hostDiv = createdDiv.heading.getRootNode().host;
        var popupDiv = createdDiv.heading.getRootNode().querySelectorAll("div")[0];

        var heightBefore = popupDiv.clientHeight;

        createdDiv.heading.textContent = content.word;
        createdDiv.meaning.textContent = content.meaning;

        var heightAfter = popupDiv.clientHeight;
        var difference = heightAfter - heightBefore;


        if(popupDiv.classList.contains("flipped_y")){
            hostDiv.style.top = parseInt(hostDiv.style.top) - difference + "px";
        }

    }

    function noMeaningFound(createdDiv){
      createdDiv.heading.textContent = "Sorry";
      createdDiv.meaning.textContent = "No definition found.";
    }

    function removeMeaning(event){
        var element = event.target;
        if(!element.classList.contains("dictionaryDiv")){
            document.querySelectorAll(".dictionaryDiv").forEach(function(Node){
                Node.remove();
            });
        }
    }

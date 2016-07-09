'use strict';
/**
 * Class for interfacing with DOM elements and keep track of attributes/classes to add
 */
class FlareDomElement {
    /**
     * 
     * @param {type} tagName type of element to create
     * @returns {nm$_flare-ui-basic-audio-player.FlareDomElement}
     */
    constructor(tagName, mainClassName) {

        this.state = "0"; //0 ready, 1 buffering, 2 playing, -1 error


        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElement(tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};

    }

    addClass() {

    }

    addChild(element) {
        this.element.appendChild(element.element);
    }

    setBaseClassName(className) {
        this.baseClassName = className;
    }

    render() {
        this.element.className = "";
        this.element.classList.add(this.baseClassName + "-" + this.mainClassName);
        for (var key in this.styles) {
            this.element.style.setProperty(key, this.styles[key]);
        }

        for (var key in this.attributes) {
            this.element.setAttribute(key, this.attributes[key]);
        }

    }

    setStyles(styles) {
        this.styles = styles;
    }

    setAttributes(attributes) {
        this.attributes = attributes;
    }

    setContent(content) {
        this.element.innerHTML = content;
    }

    renderStyles(styles) {
        for (var key in styles) {
            this.styles[key] = styles[key];
            this.element.style.setProperty(key, styles[key]);
        }
    }

}

class FlareDomSliderElement extends FlareDomElement {

    constructor(tagName, mainClassName) {

        super(tagName, mainClassName);
        this.valueChangedListeners = {};
        //These need to be declared first before binding the handler functions (they count as new functions)
        this.mouseMoveHandler;
        this.mouseUpHandler;

        this.clickX = null;
        this.clickY = null;


        this.element.onmousedown = this.handleMouseDown.bind(this);

        //
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseUpHandler = this.handleMouseUp.bind(this);

    }

    handleMouseDown(e) {


        this.clickX = e.x;
        this.clickY = e.y;
        this.elementHeight = this.element.offsetHeight;
        this.boundingRect = this.element.getBoundingClientRect();
        this.elementHeight = this.boundingRect.bottom - this.boundingRect.top;
        this.percentValue = 1 - Math.min(1, Math.max(0, (this.clickY - this.boundingRect.top) / this.elementHeight));//(this.clickY - this.boundingRect.top) / this.elementHeight, 1);
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });

        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        console.log("binding");
        e.stopPropagation();
        return false;

    }

    handleMouseMove(e) {

        var currentY = e.y;

        //Calculate delta y for a vertical slider
        this.percentValue = 1 - Math.min(1, Math.max(0, (currentY - this.boundingRect.top) / this.elementHeight));
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });


    }

    handleMouseUp(e) {

        console.log("mouseup");
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation;
        return false;

    }

    addValueChangedListener(listener) {

        this.valueChangedListeners[listener] = listener;


    }

    dispatchValueChangedEvent(valueData) {

        for (var listener in this.valueChangedListeners) {
            this.valueChangedListeners[listener].call(this, valueData);
        }

    }

}

class FlareHorizontalSlider extends FlareDomElement {
    
    constructor(tagName, mainClassName) {

        super(tagName, mainClassName);
        this.valueChangedListeners = {};
        //These need to be declared first before binding the handler functions (they count as new functions)
        this.mouseMoveHandler;
        this.mouseUpHandler;

        this.clickX = null;


        this.element.onmousedown = this.handleMouseDown.bind(this);

        //
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseUpHandler = this.handleMouseUp.bind(this);

    } 

    handleMouseDown(e) {


        this.clickX = e.x;
        this.clickY = e.y;
        this.elementWidth = this.element.offsetWidth;
        this.boundingRect = this.element.getBoundingClientRect();
        //this.elementHeight = this.boundingRect.bottom - this.boundingRect.top;
        this.percentValue = Math.min(1, Math.max(0, (this.clickX - this.boundingRect.left) / this.elementWidth));//(this.clickY - this.boundingRect.top) / this.elementHeight, 1);
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });

        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        console.log("binding");
        e.stopPropagation();
        return false;

    }

    handleMouseMove(e) {

        var currentX = e.x;

        //Calculate delta y for a vertical slider
        this.percentValue = Math.min(1, Math.max(0, (currentX - this.boundingRect.left) / this.elementWidth));
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });


    }

    handleMouseUp(e) {

        console.log("mouseup");
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation;
        return false;

    }

    addValueChangedListener(listener) {

        this.valueChangedListeners[listener] = listener;


    }

    dispatchValueChangedEvent(valueData) {

        for (var listener in this.valueChangedListeners) {
            this.valueChangedListeners[listener].call(this, valueData);
        }

    }
}

class FlareUI {

    constructor() {

        this.baseClass = "flare";

        this.playerElements = {};

    }

    setStyle(element, styles) {

        for (var style in styles) {
            element.style.setProperty(style, styles[style]);
        }

    }

    parseTarget() {

        if (this.target) {
            if (typeof this.target === 'string') {
                this.domLocation = document.getElementById(this.target);
            } else if (typeof this.target === 'object' && this.target.nodeType === 1) {
                this.domLocation = this.target;
            }
        } else {
            this.domLocation = document.body;
        }

    }

    appendToDom() {
        //Allways append the container 
        this.target.appendChild(this.playerElements.container.element);
    }

    renderElements() {
        //console.log(this.playerElements);
        for (var key in this.playerElements) {
            this.playerElements[key].render();
        }
    }

    updatePlayProgress(percent) {

        this.playerElements.playProgress.renderStyles({"transform": "scaleX(" + percent + ")"});
    }

    updateTimeDisplay(time) {
        var formattedTime = this.formatTime(time);
        this.playerElements.timeIndicator.setContent(formattedTime + " / " + this.formattedTimelineDuration);
    }

    handlePlayClick(e) {

        this.playButtonCallback.call();

    }

    handleDrag(e) {

        console.log(e);

    }

    setState(state) {

        this.state = state;
        switch (this.state) {
            case - 1:
                //display error
                this.playerElements.playButton.setContent("&#8709;");
            case 0 :
                //display ready state
                this.playerElements.playButton.setContent("&#9658;");
                break;
            case 1:
                //display loading state
                this.playerElements.playButton.setContent("&#9862;");
                break;
            case 2:
                //display play state
                this.playerElements.playButton.setContent("&#9612;&#9612;");
                break;
            default:
            //display error on all others
        }

    }

    registerPlayButtonCallback(callback) {
        this.playButtonCallback = callback;
    }

    /**
     * Set the total duration of the timeline in seconds
     * @returns {undefined}
     */
    setTimelineDuration(duration) {
        this.timelineDuration = duration;
    }

    /**
     * Utility function to format time in seconds into a string
     * @function formatTimeFromSeconds
     * @param {number} timeInSeconds video time in seconds
     * @return {string} formated time
     */
    formatTime(timeInSeconds) {
        var totalSeconds = Math.floor(timeInSeconds);
        var min = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        var formattedTime = this.formatDigits(min) + ":" + this.formatDigits(seconds);

        return formattedTime;
    }

    formatDigits(time) {
        if (time > 9)
            return time
        else
            return "0" + time;
    }

}

class BasicAudioPlayer extends FlareUI {

    constructor(target) {
        super();

        this.playButtonColor = "red";


        this.target = target; // The desired location to append the player to
        //this.parseTarget(); //parse the desired location to append to
        this.boot(); // Here we create our player
        this.renderElements(); //Applies all custom settings to the elements
        this.appendToDom(); //add our finished player to the DOM
        this.updatePlayProgress(0);
        console.log("ui loaded");


    }

    initializeTimeline(duration) {

        this.timelineDuration = duration;
        this.formattedTimelineDuration = this.formatTime(this.timelineDuration);
        this.playerElements.timeIndicator.setContent("0:00 / " + this.formattedTimelineDuration);
    }

    boot() {

        this.playerElements.container = new FlareDomElement("div", "container");
        this.playerElements.container.setStyles({
            'background-color': 'black',
            height: '40px',
            color: "white",
            display: "block"
        });

        this.playerElements.controls = new FlareDomElement("div", "controls");
        this.playerElements.controls.setStyles({
            display: "table",
            "white-space": "nowrap",
            height: "100%",

        });

        this.playerElements.playButton = new FlareDomElement("div", "play-button");
        this.playerElements.playButton.setStyles({
            height: '100%',
            width: '30px',
            display: "table-cell",
            "vertical-align": "middle",
            "background-color": this.playButtonColor,
            cursor: "pointer"

        });

        this.playerElements.playButtonInner = new FlareDomElement("div", "play-button-inner");
        this.playerElements.playButtonInner.setStyles({
            height: '100%',
            width: '40px'

        });

        this.playerElements.playIcon = new FlareDomElement("svg", "play-button-icon");
        this.playerElements.playIcon.setStyles({
            height: '40px',
            width: '40px',

        });

        //this.playerElements.playButton.setContent("&#9658;");

        this.playerElements.descriptionContainer = new FlareDomElement("div", "description-container");
        this.playerElements.descriptionContainer.setStyles({
            position: "absolute",
            "z-index": 1,
            width: "100%",
            height: "100%"

        });

        this.playerElements.volumeContainer = new FlareDomElement("div", "volume-container");
        this.playerElements.volumeContainer.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle",
            "background-color": "green",
            cursor: "pointer"

        });
        this.playerElements.volumeContainer.setAttributes({

        });



        this.playerElements.volumeSliderOuter = new FlareDomSliderElement("div", "volume-slider-outer");
        this.playerElements.volumeSliderOuter.setStyles({
            height: '100%',
            width: '50px',
            "background-color": "green",
            cursor: "pointer",
            position: "relative"

        });

        this.playerElements.volumeSliderOuter.setAttributes({
            //role : "slider",
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": 90,
            "touch-action": "none",
            "role": "slider"
        });

        this.playerElements.volumeSliderInner = new FlareDomSliderElement("div", "volume-slider-inner");
        this.playerElements.volumeSliderInner.setStyles({
            height: '100%',
            width: '100%',
            "background-color": "#4bf74b",
            "transform-origin": "0px bottom",
            transform: "scaleY(0)",
            position: "absolute"
        });

        this.playerElements.volumeSliderDisplayContainer = new FlareDomElement("div", "volume-slider-display-container");
        this.playerElements.volumeSliderDisplayContainer.setStyles({
            height: '100%',
            width: '100%',
            position: "absolute",
            display: "table"
        });

        this.playerElements.volumeSliderDisplay = new FlareDomElement("div", "volume-slider-display");
        this.playerElements.volumeSliderDisplay.setStyles({
            height: '100%',
            "text-align": "center",
            "vertical-align": "middle",
            display: "table-cell"
        });
        this.playerElements.volumeSliderDisplay.setContent("	&#128266;");


        this.playerElements.timeIndicatorContainer = new FlareDomElement("div", "time-indicator-container");
        //this.playerElements.timeIndicator.setContent("0:00 / 0:01");
        this.playerElements.timeIndicatorContainer.setStyles({
            height: '100%',
            display: "table",
            padding: "0 10px",
            float: "right"
        });

        this.playerElements.timeIndicator = new FlareDomElement("div", "time-indicator");
        this.playerElements.timeIndicator.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle"
        });

        this.playerElements.progressContainer = new FlareHorizontalSlider("div", "progress-container");
        this.playerElements.progressContainer.setStyles({
            height: '1px',
            width: "100%",
            display: "table-cell",
            position: "relative"

        });

        this.playerElements.playProgress = new FlareDomElement("div", "play-progress");
        this.playerElements.playProgress.setStyles({
            'transform-origin': '0 0 ',
            'background-color': 'rgba(0,0,255,0.4)',
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            right: "0"

        });

        this.playerElements.container.addChild(this.playerElements.controls);
        this.playerElements.controls.addChild(this.playerElements.playButton);
        this.playerElements.playButton.addChild(this.playerElements.playButtonInner);
        this.playerElements.playButtonInner.addChild(this.playerElements.playIcon);
        this.playerElements.controls.addChild(this.playerElements.progressContainer);
        this.playerElements.progressContainer.addChild(this.playerElements.descriptionContainer);
        this.playerElements.descriptionContainer.addChild(this.playerElements.timeIndicatorContainer);
        this.playerElements.timeIndicatorContainer.addChild(this.playerElements.timeIndicator);
        this.playerElements.progressContainer.addChild(this.playerElements.playProgress);
        this.playerElements.controls.addChild(this.playerElements.volumeContainer);
        this.playerElements.volumeContainer.addChild(this.playerElements.volumeSliderOuter);
        this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderInner);
        this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderDisplayContainer);
        this.playerElements.volumeSliderDisplayContainer.addChild(this.playerElements.volumeSliderDisplay);

        //Finally Bind the controllers
        this.playerElements.playButton.element.onclick = this.handlePlayClick.bind(this);
        //this.playerElements.volumeSliderOuter.element.ondrag = this.handleDrag.bind(this);
        var _this = this;
        this.playerElements.volumeSliderOuter.addValueChangedListener(function (valueData) {
            _this.handleVolumeChanged(valueData);
        });
        
        this.playerElements.progressContainer.addValueChangedListener(function (valueData) {
            _this.handleTimelineSeek(valueData);
        });
    }

    handleVolumeChanged(valueData) {

        this.playerElements.volumeSliderInner.renderStyles({
            transform: "scaleY(" + valueData.percent + ")"
        });
    }

    addVolumeChangedListener(listener) {
        this.playerElements.volumeSliderOuter.addValueChangedListener(listener);
    }
    
    handleTimelineSeek(valueData){
        console.log(valueData);
    }

}

module.exports = BasicAudioPlayer;

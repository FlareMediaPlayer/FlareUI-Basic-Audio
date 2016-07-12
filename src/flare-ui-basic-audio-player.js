'use strict';
/**
 * Class for interfacing with DOM elements and keep track of attributes/classes to add
 */
var FlareDomElements = require('flare-dom-elements');


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
        var invert = 1/percent;
        if (invert === 0)
            invert = 1;
        this.playerElements.playHandle.renderStyles({"transform": "scaleX(" + invert + ")"});
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
                //this.playerElements.playButton.setContent("&#8709;");
            case 0 :
                //display ready state
                this.playerElements.playButtonInner.removeChildren();
                this.playerElements.playButtonInner.addChild(this.playerElements.playIcon);
                break;
            case 1:
                //display loading state
                this.playerElements.playButtonInner.removeChildren();
                this.playerElements.playButtonInner.addChild(this.playerElements.loadingIcon);
                break;
            case 2:
                //display play state
                this.playerElements.playButtonInner.removeChildren();
                this.playerElements.playButtonInner.addChild(this.playerElements.pauseIcon);
                break;
            default:
            //display error on all others for now
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
        this.seekListeners = {};
        this.playButtonColor = "red";


        this.target = target; // The desired location to append the player to
        //this.parseTarget(); //parse the desired location to append to
        this.initUI(); // Here we create our player
        this.renderElements(); //Applies all custom settings to the elements
        this.appendToDom(); //add our finished player to the DOM
        this.updatePlayProgress(0);
        console.log("ui loaded");

    }

    loadMetaData(metaData) {

        this.timelineDuration = metaData.duration;
        this.formattedTimelineDuration = this.formatTime(this.timelineDuration);
        this.playerElements.timeIndicator.setContent("0:00 / " + this.formattedTimelineDuration);
        this.playerElements.progressContainer.setRange(0, Math.floor(metaData.duration));

    }

    
    initUI() {

        this.playerElements.container = new FlareDomElements.Basic("div", "container");
        this.playerElements.container.setStyles({
            'background-color': 'black',
            height: '40px',
            color: "white",
            display: "block",
            "font-family" : "arial"
        });

        this.playerElements.controls = new FlareDomElements.Basic("div", "controls");
        this.playerElements.controls.setStyles({
            display: "table",
            "white-space": "nowrap",
            height: "100%",

        });

        this.playerElements.playButton = new FlareDomElements.Basic("div", "play-button");
        this.playerElements.playButton.setStyles({
            height: '100%',
            width: '30px',
            display: "table-cell",
            "vertical-align": "middle",
            "background-color": this.playButtonColor,
            cursor: "pointer"
        });

        this.playerElements.playButtonInner = new FlareDomElements.Basic("div", "play-button-inner");
        this.playerElements.playButtonInner.setStyles({
            height: '40px',
            width: '40px'

        });

        this.playerElements.playIcon = new FlareDomElements.FlarePlayIcon();
        this.playerElements.playIcon.setStyles({
           // height: '40px',
           // width: '40px',
        });

        this.playerElements.pauseIcon = new FlareDomElements.FlarePauseIcon();
        this.playerElements.loadingIcon = new FlareDomElements.LoadingIcon();
 
        //this.playerElements.playButton.setContent("&#9658;");

        this.playerElements.descriptionContainer = new FlareDomElements.Basic("div", "description-container");
        this.playerElements.descriptionContainer.setStyles({
            position: "absolute",
            "z-index": 1,
            width: "100%",
            height: "100%"

        });

        this.playerElements.volumeContainer = new FlareDomElements.Basic("div", "volume-container");
        this.playerElements.volumeContainer.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle",
            "background-color": "green",
            cursor: "pointer"

        });
        this.playerElements.volumeContainer.setAttributes({

        });

        this.playerElements.volumeSliderOuter = new FlareDomElements.VerticalSlider("div", "volume-slider-outer");
        this.playerElements.volumeSliderOuter.setStyles({
            height: '100%',
            width: '40px',
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

        this.playerElements.volumeSliderInner = new FlareDomElements.Basic("div", "volume-slider-inner");
        this.playerElements.volumeSliderInner.setStyles({
            height: '100%',
            width: '100%',
            "background-color": "#4bf74b",
            "transform-origin": "0px bottom",
            transform: "scaleY(0)",
            position: "absolute"
        });

        this.playerElements.volumeSliderDisplayContainer = new FlareDomElements.Basic("div", "volume-slider-display-container");
        this.playerElements.volumeSliderDisplayContainer.setStyles({
            height: '100%',
            width: '100%',
            position: "absolute",
            display: "table"
        });

        this.playerElements.volumeSliderDisplay = new FlareDomElements.Basic("div", "volume-slider-display");
        this.playerElements.volumeSliderDisplay.setStyles({
            "position" : "absolute",
            "left" : "0",
            "right" : "0",
            "top" : "0",
            "bottom" : "0"
        });
        
        this.playerElements.volumeIcon = new FlareDomElements.VolumeIcon("white");
        //this.playerElements.volumeSliderDisplay.setContent("	&#128266;");


        this.playerElements.timeIndicatorContainer = new FlareDomElements.Basic("div", "time-indicator-container");
        //this.playerElements.timeIndicator.setContent("0:00 / 0:01");
        this.playerElements.timeIndicatorContainer.setStyles({
            height: '100%',
            display: "table",
            padding: "0 10px",
            float: "right"
        });

        this.playerElements.timeIndicator = new FlareDomElements.Basic("div", "time-indicator");
        this.playerElements.timeIndicator.setStyles({
            height: '100%',
            display: "table-cell",
            "vertical-align": "middle"
        });

        this.playerElements.progressContainer = new FlareDomElements.HorizontalSlider("div", "progress-container");
        this.playerElements.progressContainer.setStyles({
            height: '1px',
            width: "100%",
            display: "table-cell",
            position: "relative",
            cursor: "pointer"

        });

        this.playerElements.playProgress = new FlareDomElements.Basic("div", "play-progress");
        this.playerElements.playProgress.setStyles({
            'transform-origin': '0 0 ',
            'background-color': 'rgba(0,0,255,0.4)',
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            right: "0"

        });

        this.playerElements.playHandle = new FlareDomElements.Basic("div", "play-handle");
        this.playerElements.playHandle.setStyles({
            width : "2px",
            "background-color" : "white",
            height: "100%",
            "float" : "right"

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
        this.playerElements.playProgress.addChild(this.playerElements.playHandle);
        this.playerElements.controls.addChild(this.playerElements.volumeContainer);
        this.playerElements.volumeContainer.addChild(this.playerElements.volumeSliderOuter);
        this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderInner);
        //this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderDisplayContainer);
        this.playerElements.volumeSliderOuter.addChild(this.playerElements.volumeSliderDisplay);
        this.playerElements.volumeSliderDisplay.addChild(this.playerElements.volumeIcon);

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
    
    setVolume(volume){
        this.handleVolumeChanged({percent : volume});
    }

    handleVolumeChanged(valueData) {

        this.playerElements.volumeSliderInner.renderStyles({
            transform: "scaleY(" + valueData.percent + ")"
        });
        
        this.playerElements.volumeIcon.setVolume(valueData.percent);
    }

    addVolumeChangedListener(listener) {

        this.playerElements.volumeSliderOuter.addValueChangedListener(listener);

    }
    
    handleTimelineSeek(valueData){
        
        this.updateTimeDisplay(valueData.numerical);
        this.updatePlayProgress(valueData.percent);
        if (valueData.type === "mouseup") {
            this.dispatchSeekEvent(valueData);
        }
        
    
    }
    
    addSeekListener(listener) {

        this.seekListeners[listener] = listener;

    }

    dispatchSeekEvent(valueData) {

        for (var listener in this.seekListeners) {
            this.seekListeners[listener].call(this, valueData);
        }

    }
    
    updateLoadingAnimation(){
        this.playerElements.loadingIcon.rotate(1);
    }

}

module.exports = BasicAudioPlayer;

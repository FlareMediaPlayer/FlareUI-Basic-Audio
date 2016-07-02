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

    }

    setStyles(styles) {
        this.styles = styles
    }

    setContent(content) {
        this.element.innerHTML = content;
    }
    
    renderStyles(styles){
        for(var key in styles){
            this.styles[key] = styles[key];
            this.element.style.setProperty(key, styles[key]);
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
    
    updatePlayProgress(percent){

        this.playerElements.playProgress.renderStyles({"transform" : "scaleX(" + percent + ")"});
    }
    
    handlePlayClick(e){
        
        this.playButtonCallback.call();
        
    }
    
    setState(state){
        
        this.state = state;
        switch(this.state){
            case -1:
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
    
    registerPlayButtonCallback(callback){
        this.playButtonCallback = callback;
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

    boot() {
        console.log(this.target);
        this.playerElements.container = new FlareDomElement("div", "container");
        this.playerElements.container.setStyles({
            'background-color': 'black',
            height: '40px',
            color : "white",
            display : "block"
        });

        this.playerElements.controls = new FlareDomElement("div", "controls");
        this.playerElements.controls.setStyles({
            display: "table",
            "white-space" : "nowrap",
            height : "100%",
            
        });

        this.playerElements.playButton = new FlareDomElement("div", "play-button");
        this.playerElements.playButton.setStyles({
            height: '100%',
            width: '30px',
            display: "table-cell",
            "vertical-align" : "middle",
            padding : "0 10px",
            "background-color" : this.playButtonColor,
            cursor : "pointer"

        });
        this.playerElements.playButton.setContent("&#9658;");

        this.playerElements.timeIndicator = new FlareDomElement("div", "time-indicator");
        this.playerElements.timeIndicator.setContent("0:00 / 0:01");
        this.playerElements.timeIndicator.setStyles({
            height: '100%',
            display: "table-cell",
            padding : "0 10px",
            "vertical-align" : "middle"
            

        });

        this.playerElements.progressContainer = new FlareDomElement("div", "progress-container");
        this.playerElements.progressContainer.setStyles({
            height: '100%',
            width : "100%",
            display: "table-cell",
            position : "relative"

        });
        
        this.playerElements.playProgress = new FlareDomElement("div", "play-progress");
        this.playerElements.playProgress.setStyles({
            'transform-origin': '0 0 ',
            'background-color': 'rgba(0,0,255,0.4)',
            position : "absolute",
            top : "0",
            bottom : "0",
            left : "0",
            right : "0"

        });

        this.playerElements.container.addChild(this.playerElements.controls);
        this.playerElements.controls.addChild(this.playerElements.playButton);
        this.playerElements.controls.addChild(this.playerElements.progressContainer);
        this.playerElements.progressContainer.addChild(this.playerElements.playProgress);
        this.playerElements.controls.addChild(this.playerElements.timeIndicator);
        
        
        //Finally Bind the controllers
        this.playerElements.playButton.element.onclick = this.handlePlayClick.bind(this);

    }
    
 

}

module.exports = BasicAudioPlayer;
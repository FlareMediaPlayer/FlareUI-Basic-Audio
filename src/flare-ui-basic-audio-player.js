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

    applyStyles() {
        //Go through each element in the player
        for (var playerElement in this.playerElements) {
            for (var elementClass in playerElement.classes) {
                playerElement.element.style.setProperty(style);
            }
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
        this.domLocation.appendChild(this.playerElements.container.element);
    }

    renderElements() {
        //console.log(this.playerElements);
        for (var key in this.playerElements) {
            this.playerElements[key].render();
        }
    }
    
    update(){
        
    }
}

class BasicAudioPlayer extends FlareUI {

    constructor(target) {
        super();
        
        this.playButtonColor = "red";
        
        
        this.target = target; // The desired location to append the player to
        this.parseTarget(); //parse the desired location to append to
        this.boot(); // Here we create our player
        this.renderElements(); //Applies all custom settings to the elements
        this.appendToDom(); //add our finished player to the DOM
        console.log("ui loaded");
        
        
    }

    boot() {

        this.playerElements.container = new FlareDomElement("div", "container");
        this.playerElements.container.setStyles({
            'background-color': 'black',
            height: '40px',
            color : "white"
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
            "background-color" : this.playButtonColor

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
            display: "table-cell"

        });
        
        this.playerElements.playProgress = new FlareDomElement("div", "play-progress");
        this.playerElements.playProgress.setStyles({
            'transform-origin': '0 0 ',
            'background-color': 'rgba(0,0,255,0.4)'

        });

        this.playerElements.container.addChild(this.playerElements.controls);
        this.playerElements.controls.addChild(this.playerElements.playButton);
        this.playerElements.controls.addChild(this.playerElements.progressContainer);
        this.playerElements.progressContainer.addChild(this.playerElements.playProgress);
        this.playerElements.controls.addChild(this.playerElements.timeIndicator);

    }

}

module.exports = BasicAudioPlayer;
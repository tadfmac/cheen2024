import * as PIXI from './pixi.min.mjs';

console.dir(PIXI.settings);

PIXI.settings.RENDER_OPTIONS.autoResize = true;
PIXI.settings.RESOLUTION = 1;

class animation{
  constructor(){
    this.cheenStarted = false;  
    this.chickenStarted = false;  
    this.resizeTimer = null;
    this.timer = null;
    this.chickenTimer = null;
    this.cheenContainer = null;
    this.chickenContainer = null;
    this.textContainer = null;
  }
  init(wrapper){
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      transparent:true});
    this.wrapper = wrapper;
    this.wrapper.appendChild(this.app.view);

    let tick = 0;
    this.app.ticker.maxFPS = 30;
    this.app.ticker.add((delta) => {
      tick ++;
      tick = tick % 30;
      if((tick % 2) == 1){
        this.updateCheen();
      }
      if((tick % 2) == 0){
        this.updateChicken();
        this.updateText();
      }
    });
    this.initCheen();
    this.initChicken();
    this.initText();
    window.addEventListener('resize', this.resize.bind(this));
  }
  /////////////////////////////////////
  // cheen
  /////////////////////////////////////
  initCheen(){
    this.cheenContainer = new PIXI.Container();
    this.app.stage.addChild(this.cheenContainer);
    let cheenTex = PIXI.Texture.from("./img/title-icon.png");
    this.cheenSpr = PIXI.Sprite.from(cheenTex);
    this.cheenSpr.anchor.x = 0.5;
    this.cheenSpr.anchor.y = 0.5;
    this.cheenSpr.scale.x = 0.2;
    this.cheenSpr.scale.y = 0.2;
    this.resetCheen();
    this.cheenContainer.addChild(this.cheenSpr);
    this.fillcolors = ["cyan","lavender","gold","palegreen","blueviolet","crimson"];
  }
  startCheen(){
    this.cheenStarted = true;
    if(this.timer != null){
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(()=>{
      console.log("startCheen() timeout");
      console.dir(this);
      this.stopCheen();
    },3000);
  }
  stopCheen(){
    this.cheenStarted = false;  	
    this.cheenSpr.scale.x = 0.2;
    this.cheenSpr.scale.y = 0.2;
    this.cheenSpr.rotation = 0;
  }
  updateCheen(){
  	if(this.cheenStarted){
  	  this.cheenSpr.rotation += 0.4;
  	  this.cheenSpr.scale.x += 0.2;
      this.cheenSpr.scale.y += 0.2;
  	}
  }
  resetCheen(){
    this.cheenSpr.position.set(window.innerWidth/2,(window.innerHeight/2)-6);
  }
  /////////////////////////////////////
  // chicken
  /////////////////////////////////////
  initChicken(){
    this.chickenContainer = new PIXI.Container();
    this.app.stage.addChild(this.chickenContainer);
    let chickenTex = PIXI.Texture.from("./img/chicken.png");
    this.chickenSpr = PIXI.Sprite.from(chickenTex);
    this.chickenSpr.anchor.x = 0.5;
    this.chickenSpr.anchor.y = 0.1;
    this.chickenSpr.scale.x = 0.1;
    this.chickenSpr.scale.y = 0.1;
    this.chickenSpr.visible = false;
    this.resetChicken();
    this.chickenContainer.addChild(this.chickenSpr);
    this.textSprArr = [];
  }
  startChicken(){
    this.chickenStarted = true;
    this.chickenSpr.visible = true;
    if(this.chickenTimer != null){
      clearTimeout(this.chickenTimer);
      this.chickenTimer = null;
    }
    this.chickenTimer = setTimeout(()=>{
      console.log("startChicken() timeout");
      this.stopChicken();
    },3000);
  }
  stopChicken(){
    this.chickenStarted = false;    
    this.chickenSpr.scale.x = 0.1;
    this.chickenSpr.scale.y = 0.1;
    this.chickenSpr.rotation = 0;
    this.chickenSpr.visible = false;
  }
  updateChicken(){
    if(this.chickenStarted){
      this.chickenSpr.rotation += 0.8;
      this.chickenSpr.scale.x += 0.2;
      this.chickenSpr.scale.y += 0.2;
    }
  }
  resetChicken(){
    this.chickenSpr.position.set(window.innerWidth/2,(window.innerHeight/2)-6);
  }
  /////////////////////////////////////
  // text
  /////////////////////////////////////
  initText(){
    this.textContainer = new PIXI.Container();
    this.app.stage.addChild(this.textContainer);
  }
  addText(_text){
    let coloridx = Math.floor(Math.random()*this.fillcolors.length);
    let color = this.fillcolors[coloridx];
    let size = 200; /*Math.floor(Math.random()*180)+80;*/
    let posH = Math.floor(Math.random()*(window.innerHeight*0.7))+window.innerHeight*0.1;
    const textSpr = new PIXI.Text(_text, {
      fontFamily: 'tegaki',
      fontSize: size,
      fill: color,
      align: 'left',
    });
    console.log("text w="+textSpr.width+" h="+textSpr.height);
    textSpr.position.set(window.innerWidth, posH);
    textSpr.anchor.x = 0;
    textSpr.anchor.y = 0.5;
    textSpr._speed = Math.floor(Math.random()*40) + 10;
    this.textContainer.addChild(textSpr);
    this.textSprArr.push(textSpr);
  }
  updateText(){
    for(let cnt=this.textSprArr.length-1;cnt>=0;cnt --){
      this.textSprArr[cnt].position.x -= this.textSprArr[cnt]._speed;
      if((this.textSprArr[cnt].position.x + this.textSprArr[cnt].width) < 0){
        this.textContainer.removeChild(this.textSprArr[cnt]);
        this.textSprArr.splice(cnt,1);
      }
    }
//    console.log("texts="+this.textSprArr.length);
  }

  /////////////////////////////////////
  // resize
  /////////////////////////////////////
  resize(){
    if(this.resizeTimer){
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    this.resizeTimer = setTimeout(function(){
      console.log("resize() timeout");
      console.dir(this);
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.resetCheen();
      this.resetChicken();
    }.bind(this),50);
  }
}

export default new animation();

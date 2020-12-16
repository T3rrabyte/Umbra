class Vector2{constructor(t=0,e=0){this.x=t,this.y=e,this.translate=t=>{this.x+=t.x,this.y+=t.y},Object.defineProperties(this,{range:{get:()=>Math.abs(this.x-this.y)}})}}class Bounds{constructor(t=new Vector2,e=new Vector2){this.min=t,this.max=e,this.contains=t=>t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y,this.intersects=t=>t.min.x<=this.max.x&&t.max.x>=this.min.x&&t.min.y<=this.max.y&&t.max.y>=this.min.y,this.translate=t=>{this.min.translate(t),this.max.translate(t)},Object.defineProperties(this,{width:{get:()=>this.max.x-this.min.x,set:t=>{this.max.x=this.min.x+t}},height:{get:()=>this.max.y-this.min.y,set:t=>{this.max.y=this.min.y+t}}})}}class Umbra{constructor(t,e,s=`Umbra v${Umbra.version}`,i="#000",n=[],a=60,h={x:innerWidth,y:innerHeight}){Umbra.instance=this,this.state,this.isPaused=!1;let o=Date.now(),r=a/1e3,c=0;this.updates=[];const d=()=>{requestAnimationFrame(d,this.canvas);const t=Date.now();let e=t-o;for(e>1e3&&(e=r),o=t,c+=e;c>r;)this.updates.forEach((t=>t())),!this.paused&&this.state&&this.state(),c-=r;this.camera.render()};if(document.title=s,document.body.style="margin:0;",this.canvas=document.createElement("canvas"),this.canvas.style=`background-color:${i};touch-action:none;`,this.canvas.width=h.x,this.canvas.height=h.y,document.body.appendChild(this.canvas),this.context=this.canvas.getContext("2d"),this.scene=new UObject,this.camera,this.actx=new AudioContext,"suspended"==this.actx.state){const t=document.createElement("button");t.style="position:fixed;top:0;left:0;width:10%;height:10%;",t.innerHTML="Click to enable audio.",t.onclick=()=>this.actx.resume().then((()=>document.body.removeChild(t))),document.body.appendChild(t)}this.pointer,this.interactableObjects=[],this.assets={},this.start=()=>{const s=()=>{this.state=e;let s=0;const i=()=>{s++,s>=n.length&&(this.state=void 0,t&&t())},a=["json"],h=["ttf","otf","ttc","woff"],o=["png","jpg","gif","webp"],r=["mp3","ogg","wav","webm"];for(let t=0;t<n.length;t++){const e=n[t],s=e.split(".").pop();if(a.indexOf(s)>-1){const t=new XMLHttpRequest;t.open("GET",e),t.addEventListener("readystatechange",(()=>{200==t.status&&4==t.readyState&&(this.assets[e]=JSON.parse(t.responseText),i())})),t.send()}else if(h.indexOf(s)>-1){const t=e.split("/").pop().split(".")[0],s=document.createElement("style");s.innerHTML=`@font-face{font-family:${t};src:url(${e});}`,document.head.appendChild(s),i()}else if(o.indexOf(s)>-1){const t=new Image;t.addEventListener("load",(()=>{this.assets[e]=t,i()})),t.src=e}else if(r.indexOf(s)>-1){const t=new USound(e,i);this.assets[e]=t}}};n.length>0?s():t&&t(),d()},this.camera=new UCamera,this.pointer=new UPointer}}Umbra.prototype.version="2.3.1";class UCamera{constructor(t=new Bounds(new Vector2,new Vector2(Umbra.instance.canvas.width,Umbra.instance.canvas.height))){this.bounds=t,this.sPToG=t=>new Vector2(t.x/this.scale.x+this.bounds.min.x,t.y/this.scale.y+this.bounds.min.y),this.gPToS=t=>new Vector2((t.x-this.bounds.min.x)*this.scale.x,(t.y-this.bounds.min.y)*this.scale.y),this.sBToG=t=>new Bounds(this.sPToG(t.min),this.sPToG(t.max)),this.gBToS=t=>new Bounds(this.gPToS(t.min),this.gPToS(t.max)),this.render=()=>{const t=Umbra.instance.canvas;Umbra.instance.context.clearRect(0,0,t.width,t.height),Umbra.instance.scene.display()},Object.defineProperties(this,{scale:{get:()=>new Vector2(Umbra.instance.canvas.width/this.bounds.width,Umbra.instance.canvas.height/this.bounds.height)}})}}class UShadow{constructor(t="rgba(100, 100, 100, 0.5)",e=new Vector2(3,3),s=3){this.color=t,this.offset=e,this.blur=s}}class UObject{constructor(t=new Bounds,e=Umbra.instance.scene){this.isActive=!0;let s,i,n=0;this.doClip=!1,this.fillColor="white",this.lineColor="white",this.lineWidth=1,this.translate=t=>{this.bounds.translate(t),this.childBox=this.bounds,this.children.forEach((e=>{e.translate(t),this.childBox.min.x=Math.min(this.childBox.min.x,e.childBox.min.x),this.childBox.min.y=Math.min(this.childBox.min.y,e.childBox.min.y),this.childBox.max.x=Math.max(this.childBox.max.x,e.childBox.max.x),this.childBox.max.y=Math.max(this.childBox.max.y,e.childBox.max.y)}))},this.children=[],this.childBox=t,e&&e.children.push(this),this.display=()=>{Umbra.instance.camera;const t=Umbra.instance.context;Umbra.instance.camera.gBToS(this.bounds);this.isActive&&new Bounds(new Vector2,new Vector2(t.canvas.width,t.canvas.height)).intersects(this.childBox)&&(t.save(),t.strokeStyle=this.lineColor,t.lineWidth=this.lineWidth,t.fillStyle=this.fillColor,t.beginPath(),this.render&&this.render(t),this.doClip?t.clip():("none"!=this.lineColor&&t.stroke(),"none"!=this.fillColor&&t.fill()),t.stroke(),this.children.forEach((t=>t.display())),t.restore())},this.render,this.isDown=!1;const a=()=>{this.onClick||this.onRelease?Umbra.instance.interactableObjects.push(this):Umbra.instance.interactableObjects.splice(Umbra.instance.interactableObjects.indexOf(this),1)};Object.defineProperties(this,{bounds:{get:()=>t,set:t=>{const e=new Vector2(t.min.x-this.bounds.min.x,t.min.y-this.bounds.min.y);this.translate(e)}},layer:{get:()=>n,set:t=>{n=t,this.parent.children.sort(((t,e)=>t.layer<e.layer?-1:1))}},parent:{get:()=>e,set:t=>{this.parent&&this.parent.children.splice(this.parent.children.indexOf(this),1),e=t,this.parent&&this.parent.children.push(this)}},onClick:{get:()=>s,set:t=>{s=t,a()}},onRelease:{get:()=>i,set:t=>{i=t,a()}}})}}class URect extends UObject{constructor(t=new Bounds,e=Umbra.instance.scene){super(t,e),this.render=t=>{const e=Umbra.instance.camera.gBToS(this.bounds);t.rect(e.min.x,e.min.y,e.width,e.height)}}}class ULine extends UObject{constructor(t=new Bounds,e=Umbra.instance.scene){super(t,e),this.render=t=>{const e=Umbra.instance.camera.gBToS(this.bounds);t.moveTo(e.min.x,e.min.y),t.lineTo(e.max.x,e.max.y)}}}class UText extends UObject{constructor(t,e=new Bounds,s=Umbra.instance.scene){super(e,s),this.text=t,this.font="20px courier",this.baseline="top",this.render=t=>{const e=Umbra.instance.camera.gBToS(this.bounds);e.width=t.measureText(this.text).width,e.height=t.measureText("M").width,t.font=this.font,t.textBaseline=this.baseline,t.fillText(this.text,e.min.x,e.min.y)}}}class USpritesheet{constructor(t,e=new Vector2){this.source=t,this.frameSize=e,this.positions=[],this.size=new Vector2(this.source.width/this.frameSize.x,this.source.height/this.frameSize.y);for(var s=0;s<this.size.x;s++)for(var i=0;i<this.size.y;i++)this.positions.push(new Vector2(s*this.frameSize.x,i*this.frameSize.y))}}class USprite extends UObject{constructor(t,e=new Bounds,s=Umbra.instance.scene){super(e,s),this.sheet=t;let i=!1;this.loopRange=new Vector2(0,this.sheet.positions.length),this.fps=1;let n,a=0,h=this.sheet.positions[a];Object.defineProperties(this,{doLoop:{get:()=>i,set:t=>{i=t,this.doLoop?n=setInterval((()=>{let t=this.frame+1;t>=this.sheet.positions.length&&(t=0),this.frame=t}),1e3/this.fps):clearInterval(n)}},frame:{get:()=>a,set:t=>{a=t,h=this.sheet.positions[this.frame]}}}),this.render=t=>{const e=Umbra.instance.camera.gBToS(this.bounds);t.drawImage(this.sheet.source,h.x,h.y,this.sheet.frameSize.x,this.sheet.frameSize.y,e.min.x,e.min.y,e.width,e.height)}}}class UPointer{constructor(){this.pos=new Vector2,this.isDown=!1,this.isTapped=!1;const t=Umbra.instance.canvas;this.onPress,this.onRelease;const e=e=>e.targetTouches?new Vector2(e.targetTouches[0].pageX-t.offsetLeft,e.targetTouches[0].pageY-t.offsetTop):new Vector2(e.pageX-e.target.offsetLeft,e.pageY-e.target.offsetTop),s=t=>{this.pos=e(t),t.preventDefault()},i=t=>{this.pos=e(t),this.isDown=!0,this.onPress&&this.onPress(),Umbra.instance.interactableObjects.forEach((t=>{this.isTouching(t)&&!t.isDown&&(t.isDown=!0,t.onClick&&t.onClick())})),t.preventDefault()},n=t=>{this.isDown=!1,this.onRelease&&this.onRelease(),Umbra.instance.interactableObjects.forEach((t=>{this.isTouching(t)&&t.isDown&&(t.isDown=!1,t.onRelease&&t.onRelease())})),t.preventDefault()};t.addEventListener("mousemove",s),t.addEventListener("touchmove",s),t.addEventListener("mousedown",i),t.addEventListener("touchstart",i),window.addEventListener("mouseup",n),window.addEventListener("touchend",n),this.isTouching=t=>Umbra.instance.camera.gBToS(t.bounds).contains(this.pos)}}class USound{constructor(t,e){const s=Umbra.instance.actx;let i;this.volume=s.createGain(),this.sound;let n=!1;Object.defineProperties(this,{isPlaying:{get:()=>n,set:t=>{n=t,this.isPlaying?(this.sound=s.createBufferSource(),this.sound.buffer=i,this.sound.connect(this.volume),this.volume.connect(s.destination),this.sound.start()):this.sound.stop()}}});const a=new XMLHttpRequest;a.open("GET",t),a.responseType="arraybuffer",a.addEventListener("load",(()=>{s.decodeAudioData(a.response,(t=>{i=t,e&&e()}))})),a.send()}}
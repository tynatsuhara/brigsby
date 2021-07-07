(()=>{"use strict";var t,e=function(){function t(){this.enabled=!0}return Object.defineProperty(t.prototype,"isStarted",{get:function(){return this.start===o},enumerable:!1,configurable:!0}),t.prototype.awake=function(t){},t.prototype.start=function(t){},t.prototype.update=function(t){},t.prototype.lateUpdate=function(t){},t.prototype.getRenderMethods=function(){return[]},t.prototype.delete=function(){var t;null===(t=this.entity)||void 0===t||t.removeComponent(this)},t}(),o=function(){throw new Error("start() has already been called on this component")},n=Object.assign({},{showColliders:!1,showProfiler:!1},(t=localStorage.getItem("debug_state"))?(console.log("loaded debug state from local storage"),JSON.parse(t)):{}),i=new Proxy(n,{set:function(t,e,o,i){var r=Reflect.set(t,e,o,i);return r&&localStorage.setItem("debug_state",JSON.stringify(n)),r}});window.debug=i,window.localStorageUsage=function(){var t,e,o=0;for(e in localStorage)localStorage.hasOwnProperty(e)&&(o+=t=2*(localStorage[e].length+e.length),console.log(e.substr(0,50)+" = "+(t/1024).toFixed(2)+" KB"));console.log("Total = "+(o/1024).toFixed(2)+" KB")};var r,s,u=function(){function t(t,e){this.x=t,this.y=e}return t.prototype.times=function(e){return new t(this.x*e,this.y*e)},t.prototype.div=function(e){return new t(this.x/e,this.y/e)},t.prototype.floorDiv=function(e){return new t(Math.floor(this.x/e),Math.floor(this.y/e))},t.prototype.plus=function(e){return new t(this.x+e.x,this.y+e.y)},t.prototype.plusX=function(e){return new t(this.x+e,this.y)},t.prototype.plusY=function(e){return new t(this.x,this.y+e)},t.prototype.minus=function(e){return new t(this.x-e.x,this.y-e.y)},t.prototype.lerp=function(t,e){var o=Math.max(Math.min(t,1),0);return this.plus(e.minus(this).times(o))},t.prototype.distanceTo=function(t){var e=t.x-this.x,o=t.y-this.y;return Math.sqrt(e*e+o*o)},t.prototype.manhattanDistanceTo=function(t){return Math.abs(t.x-this.x)+Math.abs(t.y-this.y)},t.prototype.magnitude=function(){return this.distanceTo(new t(0,0))},t.prototype.normalized=function(){var t=this.magnitude();if(0===t)throw new Error("cannot normalize a vector with magnitude 0");return this.div(t)},t.prototype.toString=function(){return"("+this.x+","+this.y+")"},t.fromString=function(e){var o=e.replace("(","").replace(")","").split(",").map((function(t){return Number.parseInt(t)}));return new t(o[0],o[1])},t.prototype.equals=function(t){return t&&t.x==this.x&&t.y==this.y},t.prototype.apply=function(e){return new t(e(this.x),e(this.y))},t.prototype.randomlyShifted=function(e,o){return void 0===o&&(o=e),this.plus(new t(e-Math.random()*e*2,o-Math.random()*o*2))},t.prototype.randomCircularShift=function(e){var o=2*Math.random()*Math.PI,n=e*Math.sqrt(Math.random());return this.plus(new t(n*Math.cos(o),n*Math.sin(o)))},t.ZERO=new t(0,0),t}(),c=function(t){this.depth=t},a=(r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function o(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}),p=function(t){function e(e,o,n,i){void 0===n&&(n="#ff0000"),void 0===i&&(i=1);var r=t.call(this,Number.MAX_SAFE_INTEGER)||this;return r.start=e,r.end=o,r.color=n,r.width=i,r}return a(e,t),e.prototype.render=function(t){t.lineWidth=this.width,t.strokeStyle=this.color,t.beginPath(),t.moveTo(this.start),t.lineTo(this.end),t.stroke()},e}(c),h=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),l=function(t){function e(e,o,n){void 0===o&&(o=f.DEFAULT_LAYER),void 0===n&&(n=[]);var i=t.call(this)||this;return i._position=e,i.layer=o,i.ignoredColliders=n,i}return h(e,t),Object.defineProperty(e.prototype,"position",{get:function(){return this._position},enumerable:!1,configurable:!0}),e.prototype.moveTo=function(t){if(!this.enabled)return this._position=t,this.position;var e=t.x-this.position.x,o=t.y-this.position.y;return y._canTranslate(this,new u(e,o))?this._position=t:y._canTranslate(this,new u(e,0))?this._position=this._position.plus(new u(e,0)):y._canTranslate(this,new u(0,o))&&(this._position=this._position.plus(new u(0,o))),this.position},e.prototype.forceSetPosition=function(t){return this._position=t,this.position},e.prototype.getRenderMethods=function(){if(!i.showColliders)return[];for(var t=this.getPoints(),e=[],o=t[t.length-1],n=0,r=t;n<r.length;n++){var s=r[n];e.push(new p(s,o,"#ff0000")),o=s}return e},e.prototype.lineCast=function(t,e){for(var o=null,n=0,i=this.getPoints(),r=i[i.length-1],s=0,u=i;s<u.length;s++){var c=u[s],a=this.lineIntersect(c,r,t,e);if(a){var p=a.distanceTo(t);(null==o||p<n)&&(o=a,n=p)}r=c}return o},e.prototype.checkWithinBoundsAfterTranslation=function(t,e){var o=this;this._position=this._position.plus(t);var n=e.getPoints().some((function(t){return o.isWithinBounds(t)}));return this._position=this._position.minus(t),n},e.prototype.lineIntersect=function(t,e,o,n){var i=t.x,r=t.y,s=e.x,c=e.y,a=o.x,p=o.y,h=n.x,l=n.y;if((i-s)*(p-l)-(r-c)*(a-h)==0)return null;var f=(i-a)*(p-l)-(r-p)*(a-h),y=-((i-s)*(r-p)-(r-c)*(i-a)),d=(i-s)*(p-l)-(r-c)*(a-h);if(f>=0&&f<=d&&y>=0&&y<=d){var w=f/d;return new u(i+w*(s-i),r+w*(c-r))}return null},e}(e),f=function(){function t(){this.colliderMap=new Map,this.setCollisionMatrix(new Map)}return t.prototype.setCollisionMatrix=function(e){var o=new Map;o.set(t.DEFAULT_LAYER,new Set([t.DEFAULT_LAYER]));for(var n=0,i=Array.from(e.keys());n<i.length;n++)for(var r=i[n],s=0,u=e.get(r);s<u.length;s++){var c=u[s];o.has(r)||o.set(r,new Set),o.get(r).add(c),o.has(c)||o.set(c,new Set),o.get(c).add(r)}this.matrix=o},t.prototype._setViewContext=function(t){var e=this;this.colliderMap.clear(),t.forEach((function(t){var o=t.entities.filter((function(t){return!!t})).flatMap((function(t){return t.getComponents(l)}));o.forEach((function(t){return e.colliderMap.set(t,o)}))}))},t.prototype._canTranslate=function(t,e){var o=t,n=o.position.plus(e);return!this.getCollidable(t).some((function(t){var e=t;return!(n.x>e.position.x+e.dimensions.x||n.y>e.position.y+e.dimensions.y||n.x+o.dimensions.x<e.position.x||n.y+o.dimensions.y<e.position.y)&&(o.position.x>e.position.x+e.dimensions.x||o.position.y>e.position.y+e.dimensions.y||o.position.x+o.dimensions.x<e.position.x||o.position.y+o.dimensions.y<e.position.y)}))},t.prototype.getCollidable=function(t){var e=this.matrix.get(t.layer);if(!e||0===e.size)return[];var o=this.colliderMap.get(t);return o?o.filter((function(o){return o!==t&&o.enabled&&e.has(o.layer)&&-1===t.ignoredColliders.indexOf(o)&&-1===o.ignoredColliders.indexOf(t)})):[]},t.DEFAULT_LAYER="default",t}(),y=new f;!function(t){t.ZERO="Digit0",t.ONE="Digit1",t.TWO="Digit2",t.THREE="Digit3",t.FOUR="Digit4",t.FIVE="Digit5",t.SIX="Digit6",t.SEVEN="Digit7",t.EIGHT="Digit8",t.NINE="Digit9",t.Q="KeyQ",t.W="KeyW",t.E="KeyE",t.R="KeyR",t.T="KeyT",t.Y="KeyT",t.U="KeyU",t.I="KeyI",t.O="KeyO",t.P="KeyP",t.A="KeyA",t.S="KeyS",t.D="KeyD",t.F="KeyF",t.G="KeyG",t.H="KeyH",t.J="KeyJ",t.K="KeyK",t.L="KeyL",t.Z="KeyZ",t.X="KeyX",t.C="KeyC",t.V="KeyV",t.B="KeyB",t.N="KeyN",t.M="KeyM",t.COMMA="Comma",t.PERIOD="Period",t.TAB="Tab",t.SHIFT="ShiftLeft",t.CONTROL="ControlLeft",t.SPACE="Space",t.ESC="Escape",t.SEMICOLON="Semicolon",t.QUOTE="Quote",t.UP="ArrowUp",t.DOWN="ArrowDown",t.LEFT="ArrowLeft",t.RIGHT="ArrowRight"}(s||(s={}));var d=function(){function t(t){var e=this;this.keys=new Set,this.lastCapture=new w,this.mousePos=new u(0,0),this.isMouseDown=!1,this.isMouseHeld=!1,this.isMouseUp=!1,this.isRightMouseDown=!1,this.isRightMouseHeld=!1,this.isRightMouseUp=!1,this.mouseWheelDeltaY=0,t.oncontextmenu=function(){return!1},t.onmousedown=function(t){0===t.button?(e.isMouseDown=!0,e.isMouseHeld=!0,e.isMouseUp=!1):2==t.button&&(e.isRightMouseDown=!0,e.isRightMouseHeld=!0,e.isRightMouseUp=!1)},t.onmouseup=function(t){0===t.button?(e.isMouseDown=!1,e.isMouseHeld=!1,e.isMouseUp=!0):2===t.button&&(e.isRightMouseDown=!1,e.isRightMouseHeld=!1,e.isRightMouseUp=!0)},t.onmousemove=function(o){return e.mousePos=new u(o.x-t.offsetLeft,o.y-t.offsetTop)},t.onwheel=function(t){return e.mouseWheelDeltaY=t.deltaY},window.onkeydown=function(t){return e.keys.add(e.captureKey(t).code)},window.onkeyup=function(t){return e.keys.delete(e.captureKey(t).code)}}return t.prototype.captureInput=function(){var t=this;console.log();var e=Array.from(this.keys);return this.lastCapture=new w(new Set(e.filter((function(e){return!t.lastCapture.isKeyHeld(e)}))),new Set(e.slice()),new Set(this.lastCapture.getKeysHeld().filter((function(e){return!t.keys.has(e)}))),this.mousePos,this.isMouseDown,this.isMouseHeld,this.isMouseUp,this.isRightMouseDown,this.isRightMouseHeld,this.isRightMouseUp,this.mouseWheelDeltaY),this.isMouseDown=!1,this.isMouseUp=!1,this.isRightMouseDown=!1,this.isRightMouseUp=!1,this.mouseWheelDeltaY=0,this.lastCapture},t.prototype.captureKey=function(t){return t.code===s.TAB&&t.preventDefault(),t},t}(),w=function(){function t(t,e,o,n,i,r,s,c,a,p,h){void 0===t&&(t=new Set),void 0===e&&(e=new Set),void 0===o&&(o=new Set),void 0===n&&(n=new u(0,0)),void 0===i&&(i=!1),void 0===r&&(r=!1),void 0===s&&(s=!1),void 0===c&&(c=!1),void 0===a&&(a=!1),void 0===p&&(p=!1),void 0===h&&(h=0),this.mousePos=new u(0,0),this.keysDown=t,this.keysHeld=e,this.keysUp=o,this.mousePos=n,this.isMouseDown=i,this.isMouseHeld=r,this.isMouseUp=s,this.isRightMouseDown=c,this.isRightMouseHeld=a,this.isRightMouseUp=p,this.mouseWheelDeltaY=h}return t.prototype.scaledForView=function(e){return new t(this.keysDown,this.keysHeld,this.keysUp,this.mousePos.div(e.zoom).minus(e.offset),this.isMouseDown,this.isMouseHeld,this.isMouseUp,this.isRightMouseDown,this.isRightMouseHeld,this.isRightMouseUp,this.mouseWheelDeltaY)},t.prototype.getKeysHeld=function(){return Array.from(this.keysUp)},t.prototype.isKeyDown=function(t){return this.keysDown.has(t)},t.prototype.isKeyHeld=function(t){return this.keysHeld.has(t)},t.prototype.isKeyUp=function(t){return this.keysUp.has(t)},t}(),v=function(){function t(t){var e=this;void 0===t&&(t=[]),this.components=[],this.componentCache=new Map,t.forEach((function(t){return e.addComponent(t)}))}return t.prototype.addComponent=function(t){if(t)return this.componentCache.clear(),t.entity=this,this.components.push(t),t.awake({}),t},t.prototype.addComponents=function(t){var e=this;return t.forEach((function(t){return e.addComponent(t)})),t},t.prototype.getComponent=function(t){var e=this.componentCache.get(t);return e&&e!==m||(e=this.getComponents(t)[0],this.componentCache.set(t,null!=e?e:m)),e},t.prototype.getComponents=function(t){return this.components.filter((function(e){return e instanceof t})).map((function(t){return t}))},t.prototype.removeComponent=function(t){this.componentCache.clear(),this.components=this.components.filter((function(e){return e!==t})),t.entity=null},t.prototype.selfDestruct=function(){this.components.forEach((function(t){return t.delete()}))},t}(),m={},g=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),x=function(t){function e(e,o,n,i,r,s,u){void 0===n&&(n=20),void 0===i&&(i="Comic Sans MS Regular"),void 0===r&&(r="red"),void 0===s&&(s=0),void 0===u&&(u="start");var c=t.call(this,s)||this;return c.text=e,c.position=o,c.size=n,c.font=i,c.color=r,c.alignment=u,c}return g(e,t),e.prototype.render=function(t){t.fillText(this.size,this.font,this.color,this.text,this.position,this.alignment)},e}(c),_=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),M=function(t){function e(){for(var e=[],o=0;o<arguments.length;o++)e[o]=arguments[o];var n=t.call(this)||this;return n.renders=e,n}return _(e,t),e.prototype.getRenderMethods=function(){return this.renders},e}(e),O=function(){function t(){this.fpsTracker=new S,this.updateTracker=new S,this.renderTracker=new S,this.lateUpdateTracker=new S,this.tracked=new Map}return t.prototype.updateEngineTickStats=function(t,e,o,n,i){this.fpsTracker.record(t),this.updateTracker.record(e),this.renderTracker.record(o),this.lateUpdateTracker.record(n),this.componentsUpdated=i},t.prototype.customTrackMovingAverage=function(t,e,o){var n=this.tracked.get(t);n||(n=[new S,o],this.tracked.set(t,n)),n[0].record(e)},t.prototype.getView=function(){var t=function(t,e){for(var o=0,n=e.length,i=t.length;o<n;o++,i++)t[i]=e[o];return t}(["FPS: "+E(1e3/this.fpsTracker.get())+" ("+E(this.fpsTracker.get())+" ms per frame)","update() duration ms: "+E(this.updateTracker.get(),2),"render() duration ms: "+E(this.renderTracker.get(),2),"lateUpdate() duration ms: "+E(this.lateUpdateTracker.get(),2),"components updated: "+this.componentsUpdated],Array.from(this.tracked.values()).map((function(t){return t[1](t[0].get())})));return{entities:[new v(t.map((function(t,e){return new M(new x(t,new u(60,70+25*e)))})))],zoom:1,offset:u.ZERO}},t}(),E=function(t,e){void 0===e&&(e=0);var o=Math.pow(10,e);return Math.round(t*o)/o},S=function(){function t(){this.pts=[],this.sum=0,this.lifetime=1}return t.prototype.record=function(t){for(var e=(new Date).getTime(),o=e-1e3*this.lifetime;this.pts.length>0&&this.pts[0][0]<o;){var n=this.pts.shift();this.sum-=n[1]}this.pts.push([e,t]),this.sum+=t},t.prototype.get=function(){return this.sum/this.pts.length},t}(),D=new O;function T(t){var e=(new Date).getTime(),o=t();return[(new Date).getTime()-e,o]}var b=function(){function t(t,e,o){this.canvas=t,this.context=e,this.view=o,this.width=t.width,this.height=t.height}return Object.defineProperty(t.prototype,"lineWidth",{set:function(t){this.context.lineWidth=t},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"strokeStyle",{set:function(t){this.context.strokeStyle=t},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"font",{set:function(t){this.context.font=t},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"fillStyle",{set:function(t){this.context.fillStyle=t},enumerable:!1,configurable:!0}),t.prototype.measureText=function(t){return this.context.measureText(t)},t.prototype.fillText=function(t,e,o,n,i,r){var s=this.view.offset.times(this.view.zoom).apply(Math.floor);this.context.font=t*this.view.zoom+"px '"+e+"'",this.context.fillStyle=o,i=i.times(this.view.zoom).apply(Math.floor).plus(s),this.context.textAlign=r,this.context.fillText(n,i.x,i.y+t*this.view.zoom)},t.prototype.fillEllipse=function(t,e){t=t.plus(this.view.offset).times(this.view.zoom);var o=e.times(this.view.zoom).div(2);this.context.beginPath(),this.context.ellipse(t.x+o.x,t.y+o.y,o.x,o.y,0,0,2*Math.PI),this.context.fill()},t.prototype.fillRect=function(t,e){t=t.plus(this.view.offset).times(this.view.zoom),e=e.times(this.view.zoom),this.context.fillRect(t.x,t.y,e.x,e.y)},t.prototype.drawImage=function(t,e,o,n,i,r,s,u,c){i=null!=i?i:o;var a=this.view.offset.times(this.view.zoom).apply(Math.floor),p=n.times(this.view.zoom).plus(a);s&&(p=this.pixelize(p));var h=i.times(this.view.zoom),l=Math.max(h.x,h.y);if(!(p.x>this.canvas.width+l||p.x+h.x<-l||p.y>this.canvas.height+l||p.y+h.y<-l)){this.context.save(),this.context.translate(Math.floor(p.x),Math.floor(p.y));var f=i.div(2).times(this.view.zoom);this.context.translate(f.x,f.y),this.context.rotate(r*Math.PI/180),this.context.scale(u?-1:1,c?-1:1),this.context.drawImage(t,e.x,e.y,o.x,o.y,-f.x,-f.y,h.x,h.y),this.context.restore()}},t.prototype.rotate=function(t){this.context.rotate(t)},t.prototype.scale=function(t,e){this.context.scale(t,e)},t.prototype.beginPath=function(){this.context.beginPath()},t.prototype.moveTo=function(t){t=t.plus(this.view.offset).times(this.view.zoom),this.context.moveTo(t.x,t.y)},t.prototype.lineTo=function(t){t=t.plus(this.view.offset).times(this.view.zoom),this.context.lineTo(t.x,t.y)},t.prototype.stroke=function(){this.context.stroke()},t.prototype.pixelize=function(t){return new u(t.x-t.x%this.view.zoom,t.y-t.y%this.view.zoom)},t}(),P=new(function(){function t(){}return t.prototype.getDimensions=function(){return new u(this.canvas.width,this.canvas.height)},t.prototype._setCanvas=function(t){this.canvas=t,this.context=t.getContext("2d",{alpha:!0}),this.resizeCanvas()},t.prototype._render=function(t){var e=this;this.resizeCanvas(),this.context.imageSmoothingEnabled=!1,this.context.clearRect(0,0,this.canvas.width,this.canvas.height),t.forEach((function(t){return e.renderView(t)}))},t.prototype.resizeCanvas=function(){this.canvas.width=this.canvas.clientWidth,this.canvas.height=this.canvas.clientHeight},t.prototype.renderView=function(t){var e=new b(this.canvas,this.context,t);t.entities.flatMap((function(t){return null==t?void 0:t.components})).filter((function(t){return!!t&&t.enabled&&t.isStarted})).flatMap((function(t){return t.getRenderMethods()})).filter((function(t){return!!t})).sort((function(t,e){return t.depth-e.depth})).forEach((function(t){return t.render(e)}))},t}()),C=function(t,e,o){return Math.min(Math.max(t,e),o)},R=function(){function t(t,e){var o=this;this.lastUpdateMillis=(new Date).getTime(),this.game=t,this.input=new d(e),P._setCanvas(e),this.game.initialize(),requestAnimationFrame((function(){return o.tick()}))}return t.start=function(e,o){if(!e)throw new Error("game cannot be null");if(!o)throw new Error("canvas cannot be null");new t(e,o)},t.prototype.tick=function(){var t=this,e=(new Date).getTime(),n=C(e-this.lastUpdateMillis,1,66.66666666666667),r=this.input.captureInput(),s={elapsedTimeMillis:n},u=this.getViews(s);y._setViewContext(u);var c=0,a=T((function(){u.forEach((function(t){t.entities=t.entities.filter((function(t){return!!t}));var e=P.getDimensions().div(t.zoom),i={dimensions:e},s={view:t,elapsedTimeMillis:n,input:r.scaledForView(t),dimensions:e};t.entities.forEach((function(t){return t.components.forEach((function(t){t.enabled&&(t.isStarted||(t.start(i),t.start=o),t.update(s),c++)}))}))}))}))[0],p=T((function(){P._render(u)}))[0],h=T((function(){u.forEach((function(t){var e={view:t,elapsedTimeMillis:s.elapsedTimeMillis,input:r.scaledForView(t),dimensions:P.getDimensions().div(t.zoom)};t.entities.forEach((function(t){return t.components.forEach((function(t){t.lateUpdate(e)}))}))}))}))[0];i.showProfiler&&D.updateEngineTickStats(n,a,p,h,c),this.lastUpdateMillis=e,requestAnimationFrame((function(){return t.tick()}))},t.prototype.getViews=function(t){return this.game.getViews(t).concat(i.showProfiler?[D.getView()]:[])},t}(),k=function(){function t(){}return t.prototype.initialize=function(){},t}(),I=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),A=function(t){function e(e){var o=void 0===e?{}:e,n=o.depth,i=void 0===n?0:n,r=o.position,s=void 0===r?u.ZERO:r,c=o.dimensions,a=void 0===c?u.ZERO:c,p=o.color,h=void 0===p?"#ff0000":p,l=t.call(this,i)||this;return l.position=s,l.dimensions=a,l.color=h,l}return I(e,t),e.prototype.render=function(t){t.fillStyle=this.color,t.fillEllipse(this.position,this.dimensions)},e}(c),U=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),K=function(t){function e(e,o,n,i){var r=t.call(this)||this;return r.waitingForInput=!0,r.spawnPos=e,r.player1=o,r.player2=n,r.textDisplay=i,r.spawn(Math.random()>.5?1:-1),r}return U(e,t),e.prototype.update=function(t){if(this.waitingForInput){if(!t.input.isKeyDown(s.SPACE))return;this.waitingForInput=!1}if(this.position=this.position.plus(this.velocity.times(t.elapsedTimeMillis*e.SPEED)),(this.position.y<e.RADIUS&&this.velocity.y<0||this.position.y>t.dimensions.y-e.RADIUS&&this.velocity.y>0)&&(this.velocity=new u(this.velocity.x,-this.velocity.y)),this.velocity.x<0&&this.player1.isColliding(this.position)){var o=this.velocity.y+1.1*this.player1.velocity;this.velocity=new u(-this.velocity.x,o)}else this.velocity.x>0&&this.player2.isColliding(this.position)&&(o=this.velocity.y+1.1*this.player2.velocity,this.velocity=new u(-this.velocity.x,o));this.velocity.magnitude()<1&&(this.velocity=this.velocity.normalized()),this.position.x>t.dimensions.x?(this.textDisplay.playerOneScore++,this.spawn(-1)):this.position.x<0&&(this.textDisplay.playerTwoScore++,this.spawn(1))},e.prototype.getRenderMethods=function(){return[new A({position:this.position.minus(e.SIZE.div(2)),dimensions:e.SIZE,color:"#fff6d3"})]},e.prototype.spawn=function(t){this.position=this.spawnPos,this.velocity=new u(t,3*(Math.random()-1)).normalized(),this.waitingForInput=!0},e.RADIUS=8,e.SIZE=new u(1,1).times(2*e.RADIUS),e.SPEED=.3,e}(e),j=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),z=function(t){function e(e){var o=void 0===e?{}:e,n=o.depth,i=void 0===n?0:n,r=o.position,s=void 0===r?u.ZERO:r,c=o.dimensions,a=void 0===c?u.ZERO:c,p=o.color,h=void 0===p?"#ff0000":p,l=t.call(this,i)||this;return l.position=s,l.dimensions=a,l.color=h,l}return j(e,t),e.prototype.render=function(t){t.fillStyle=this.color,t.fillRect(this.position,this.dimensions)},e}(c),N=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),H=function(t){function e(e,o,n){var i=t.call(this)||this;return i.pos=e,i.upKey=o,i.downKey=n,i}return N(e,t),e.prototype.update=function(t){this.velocity=0,t.input.isKeyHeld(this.upKey)&&(this.velocity=-1),t.input.isKeyHeld(this.downKey)&&(this.velocity=1);var o=C(this.pos.y+this.velocity*(e.MOVE_SPEED*t.elapsedTimeMillis),0,t.dimensions.y-e.DIMENSIONS.y);this.pos=new u(this.pos.x,o)},e.prototype.isColliding=function(t){return o=this.pos,n=e.DIMENSIONS,(i=t).x>=o.x&&i.x<o.x+n.x&&i.y>=o.y&&i.y<o.y+n.y;var o,n,i},e.prototype.getRenderMethods=function(){return[new z({position:this.pos,dimensions:e.DIMENSIONS,color:"#fff6d3"})]},e.PADDING_FROM_EDGE=20,e.DIMENSIONS=new u(16,80),e.MOVE_SPEED=.6,e}(e),F=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),W="Lexend Deca",L="#fff6d3",V=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.playerOneScore=0,e.playerTwoScore=0,e}return F(e,t),e.prototype.update=function(t){var e=this;this.getRenderMethods=function(){return[new x(e.playerOneScore+" : "+e.playerTwoScore,new u(t.dimensions.x/2,15),30,W,L,0,"center"),new x("P1: W/S, P2: UP/DOWN, SPACE TO LAUNCH",new u(t.dimensions.x/2,t.dimensions.y-40),20,W,L,0,"center")]}},e}(e),Y=function(){var t=function(e,o){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(e,o)};return function(e,o){if("function"!=typeof o&&null!==o)throw new TypeError("Class extends value "+String(o)+" is not a constructor or null");function n(){this.constructor=e}t(e,o),e.prototype=null===o?Object.create(o):(n.prototype=o.prototype,new n)}}(),Z=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.getViews=function(){return[e.view]},e}return Y(e,t),e.prototype.initialize=function(){var t=P.getDimensions(),e=new V,o=(t.y-H.DIMENSIONS.y)/2,n=new H(new u(H.PADDING_FROM_EDGE,o),s.W,s.S),i=new H(new u(t.x-H.PADDING_FROM_EDGE-H.DIMENSIONS.x,o),s.UP,s.DOWN),r=new K(t.div(2),n,i,e);this.view={entities:[new v([e]),new v([n]),new v([i]),new v([r])],zoom:1,offset:u.ZERO}},e}(k);R.start(new Z,document.getElementById("pong-canvas"))})();
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* 比例尺约定: 建筑模型1单位≈实际1丈(约3.2m) 或 1单位≈1m (桥梁)*/

//材质库
const mWood    = () => new THREE.MeshStandardMaterial({ color:0x9b6a3a, roughness:0.5 });
const mWoodD   = () => new THREE.MeshStandardMaterial({ color:0x5c3820, roughness:0.45 });
const mWoodL   = () => new THREE.MeshStandardMaterial({ color:0xc49a6c, roughness:0.55 });
const mRoof    = () => new THREE.MeshStandardMaterial({ color:0xd4af37, roughness:0.22, metalness:0.35 });
const mRoofD   = () => new THREE.MeshStandardMaterial({ color:0xb8942a, roughness:0.25, metalness:0.3 });
const mWhite   = () => new THREE.MeshStandardMaterial({ color:0xf5f0e0, roughness:0.3 });
const mStone   = () => new THREE.MeshStandardMaterial({ color:0xc8b898, roughness:0.45 });
const mStoneD  = () => new THREE.MeshStandardMaterial({ color:0xa89880, roughness:0.5 });
const mRed     = () => new THREE.MeshStandardMaterial({ color:0x8b2020, roughness:0.5 });
const mDark    = () => new THREE.MeshStandardMaterial({ color:0x333333, roughness:0.4 });
const mBrick   = () => new THREE.MeshStandardMaterial({ color:0xa09080, roughness:0.6 });
const mGround  = () => new THREE.MeshStandardMaterial({ color:0xd5cdb8, roughness:0.65 });
const mMetal   = () => new THREE.MeshStandardMaterial({ color:0x8a8a8a, roughness:0.2, metalness:0.8 });
//清代官式配色
const mRedPillar  = () => new THREE.MeshStandardMaterial({ color:0xb53a2a, roughness:0.35, metalness:0.05 }); // 朱漆柱
const mRedPillarD = () => new THREE.MeshStandardMaterial({ color:0x8b2a1a, roughness:0.4, metalness:0.05 }); // 深红(金柱)
const mDougongBG  = () => new THREE.MeshStandardMaterial({ color:0x3d8b7e, roughness:0.3, metalness:0.15 }); // 蓝绿彩画斗拱
const mDougongBL  = () => new THREE.MeshStandardMaterial({ color:0x2c6e8a, roughness:0.3, metalness:0.15 }); // 深蓝绿
const mDougongLG  = () => new THREE.MeshStandardMaterial({ color:0x5ba89d, roughness:0.3, metalness:0.1 }); // 浅蓝绿
const mGoldRoof   = () => new THREE.MeshStandardMaterial({ color:0xe8c547, roughness:0.2, metalness:0.4 }); // 琉璃金顶
const mGoldRoofD  = () => new THREE.MeshStandardMaterial({ color:0xd4af37, roughness:0.22, metalness:0.35 });
const mMarble     = () => new THREE.MeshStandardMaterial({ color:0xf7f3e8, roughness:0.25, metalness:0.02 }); // 汉白玉
const mMarbleD    = () => new THREE.MeshStandardMaterial({ color:0xede4d0, roughness:0.3, metalness:0.02 });
const mRailing    = () => new THREE.MeshStandardMaterial({ color:0xf0e8d5, roughness:0.28, metalness:0.02 }); // 栏杆望柱
const mCapPlane   = () => new THREE.MeshStandardMaterial({ color:0xe8d8c0, roughness:0.5, side:THREE.DoubleSide, transparent:true, opacity:0.6 }); // 剖面盖
function mColor(c, r=0.4) { return new THREE.MeshStandardMaterial({ color:new THREE.Color(c), roughness:r }); }

//几何工具
function box(w,h,d,m)  { const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); mesh.castShadow=true; mesh.receiveShadow=true; return mesh; }
function cyl(rt,rb,h,s,m) { const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s||12),m); mesh.castShadow=true; mesh.receiveShadow=true; return mesh; }
function pillar(h) {
  const g=new THREE.Group();
  const body=cyl(0.14,0.18,h-0.25,10,mWood()); body.position.y=h/2; g.add(body);
  const base=box(0.34,0.18,0.34,mStone()); base.position.y=0.09; g.add(base);
  const cap=box(0.32,0.12,0.32,mWoodL()); cap.position.y=h-0.06; g.add(cap);
  return g;
}
function ridge(w,d,h,m) {
  const g=new THREE.Group();
  const cone=new THREE.Mesh(new THREE.ConeGeometry(1,1,4,1),m);
  cone.scale.set(w*0.55,h*0.7,d*0.55); cone.position.y=h*0.4; cone.rotation.y=Math.PI/4; g.add(cone);
  const eave=box(w+0.15,0.08,d+0.15,m); g.add(eave);
  return g;
}

//清代官式红色柱子
function qingPillar(h, isGold=false) {
  const g=new THREE.Group();
  const matFn = isGold ? ()=>mColor('#c41e3a',0.3) : mRedPillar;
  const body=cyl(0.16,0.2,h-0.22,12,matFn()); body.position.y=h/2; g.add(body);
  //柱础
  const baseGeo=new THREE.CylinderGeometry(0.22,0.3,0.18,16);
  const base=new THREE.Mesh(baseGeo,mMarbleD()); base.position.y=0.09; g.add(base);
  //柱头
  const cap=box(0.34,0.14,0.34,mMarbleD()); cap.position.y=h-0.06; g.add(cap);
  return g;
}

THREE.Object3D.prototype.setPos=function(x,y,z){this.position.set(x,y,z);return this;};
THREE.Object3D.prototype.translateY=function(y){this.position.y=y;return this;};
THREE.Object3D.prototype.rotateY=function(a){this.rotation.y=a;return this;};

//太和殿
//四坡庑殿顶
function hipRoof(w, d, ridgeH, mRoofMat) {
  const g=new THREE.Group();
  const hw=w/2, hd=d/2, rh=0.16; 
  g.add(box(w*0.48,rh*1.2,0.22,mRoofMat).translateY(ridgeH));
  const fbW=w*0.49, fbD=d*0.38;
  const fb=box(fbW,0.08,fbD,mRoofMat); fb.rotation.x=-0.48; fb.position.set(0,ridgeH-0.55,hd*0.3); g.add(fb);
  const bb=box(fbW,0.08,fbD,mRoofMat); bb.rotation.x=0.48; bb.position.set(0,ridgeH-0.55,-hd*0.3); g.add(bb);
  const lrW=w*0.24, lrD=d*0.42;
  const lr=box(lrW,0.08,lrD,mRoofMat); lr.rotation.z=-0.38; lr.position.set(-hw*0.18,ridgeH-0.42,0); g.add(lr);
  const rr=box(lrW,0.08,lrD,mRoofMat); rr.rotation.z=0.38; rr.position.set(hw*0.18,ridgeH-0.42,0); g.add(rr);
  g.add(box(w+0.6,0.1,d+0.85,mRoofMat));
  return g;
}

//放射状椽子
function rafters(w, d, y, count, mMat) {
  const g=new THREE.Group();
  for(let a=0;a<Math.PI*2;a+=Math.PI*2/count){
    const rx=Math.cos(a)*w/2, rz=Math.sin(a)*d/2;
    const r=box(1.2,0.04,0.04,mMat).setPos(rx,y,rz);
    r.rotation.set(0.22,Math.atan2(-rz,-rx)+Math.PI/2,0.05); g.add(r);
  }
  return g;
}

function buildTaihedian() {
  const L=[], pTop=2.06;
  const ex=[-2.8,-1.7,-0.6,0.6,1.7,2.8]; //6列檐柱=面阔11间
  const ez=[-1.5,-0.5,0.5,1.5];          //4排檐柱
  const ix=[-2.0,-1.0,0,1.0,2.0];        //5列金柱
  const iz=[-0.8,0,0.8];                  //3排金柱

  //三层汉白玉须弥座台基
  const b0=new THREE.Group();
  [
    {w:14.2,d:8.2,h:0.62,y:0.31,c:'#f8f4ec'},
    {w:13.2,d:7.4,h:0.58,y:0.92,c:'#f2ece0'},
    {w:12.2,d:6.6,h:0.56,y:1.50,c:'#ebe4d4'}
  ].forEach(t=>{ b0.add(box(t.w,t.h,t.d,mColor(t.c,0.22)).translateY(t.y)); });
  const tt={w:12.2,d:6.6,y:1.50,h:0.56}, ry2=tt.y+tt.h+0.18;
  for(let sx=-1;sx<=1;sx+=2){
    for(let z=-tt.d/2+0.5;z<=tt.d/2-0.5;z+=0.5) b0.add(cyl(0.03,0.04,0.45,6,mRailing()).setPos(sx*(tt.w/2+0.05),ry2,z));
    for(let x=-tt.w/2+0.5;x<=tt.w/2-0.5;x+=0.5) b0.add(cyl(0.03,0.04,0.45,6,mRailing()).setPos(x,ry2,sx*(tt.d/2+0.05)));
  }
  for(let i=0;i<6;i++) b0.add(box(2.0,0.06,0.7,mMarble()).setPos(0,0.1+i*0.2,3.8));
  b0.userData={name:'三层汉白玉须弥座台基·高8.13m',desc:'最高形制，三层须弥座逐层收分。1488根云龙望柱环绕，雨季螭首齐吐水——"千龙吐水"。中央御路镌刻蟠龙海浪云纹。台基占全高23%。'};
  L.push(b0);

  //柱网
  const b1=new THREE.Group();
  ex.forEach(x=>ez.forEach(z=>{ b1.add(qingPillar(2.7,false).setPos(x,pTop,z)); }));
  ix.forEach(x=>iz.forEach(z=>{
    b1.add(qingPillar(3.2,true).setPos(x,pTop,z));
    if(Math.abs(x)<=1.0&&Math.abs(z)<0.3) for(let ry=1.2;ry<2.8;ry+=0.5) b1.add(cyl(0.24,0.24,0.05,10,mGoldRoof()).setPos(x,pTop+ry,z));
  }));
  //额枋+平板枋
  for(let z of[ez[0],ez[3]]){
    for(let i=0;i<ex.length-1;i++) b1.add(box(ex[i+1]-ex[i]-0.1,0.15,0.13,mRedPillarD()).setPos((ex[i]+ex[i+1])/2,pTop+2.4,z));
    b1.add(box(6.2,0.1,0.22,mRedPillarD()).setPos(0,pTop+2.55,z));
  }
  b1.userData={name:'柱网：檐柱24(朱红)+金柱15(深红)',desc:'面阔11间进深5间。24根朱漆檐柱支撑下檐斗拱，15根深红金柱更高直通上檐。宝座两侧6根沥粉贴金缠龙柱。全榫卯连接。'};
  L.push(b1);

  //抬梁式梁架
  const b2=new THREE.Group();
  const bB=pTop+2.7; 
  //横梁
  for(let z=-1.0;z<=1.0;z+=0.5){
    b2.add(box(6.8,0.3,0.2,mRedPillarD()).setPos(0,bB,z));       // 七架梁
    b2.add(box(4.5,0.24,0.18,mRedPillarD()).setPos(0,bB+0.8,z));  // 五架梁
    b2.add(box(2.5,0.18,0.15,mRedPillarD()).setPos(0,bB+1.5,z));  // 三架梁
  }
  //纵梁
  for(let x=-2.5;x<=2.5;x+=0.8){
    b2.add(box(0.18,0.2,2.5,mRedPillarD()).setPos(x,bB-0.05,0));
    b2.add(box(0.16,0.15,2.5,mRedPillarD()).setPos(x,bB+0.8,0));
    b2.add(box(0.14,0.12,2.5,mRedPillarD()).setPos(x,bB+1.5,0));
  }
  //瓜柱
  for(let x=-2.0;x<=2.0;x+=2.0) for(let z=-0.8;z<=0.8;z+=0.8) b2.add(box(0.22,0.65,0.22,mRedPillar()).setPos(x,bB+0.45,z));
  for(let x=-1.0;x<=1.0;x+=2.0) for(let z=-0.5;z<=0.5;z+=0.5) b2.add(box(0.2,0.5,0.2,mRedPillar()).setPos(x,bB+1.2,z));
  //檩条密排
  for(let y=bB-0.1;y<=bB+1.75;y+=0.2) b2.add(box(7.2,0.06,0.1,mWoodD()).setPos(0,y,0));
  b2.userData={name:'抬梁式梁架·七→五→三架梁(铺满全宽)',desc:'柱顶架七架梁→瓜柱→五架梁→瓜柱→三架梁→脊瓜柱。横梁铺满6.8宽/纵梁每隔0.8串联/檩条密排。榫卯弹性节点——"墙倒屋不塌"的核心。'};
  L.push(b2);

  //下檐斗拱层
  const b3=new THREE.Group(), dgY=pTop+2.75;
  ex.forEach(x=>{ ez.forEach(z=>{
    b3.add(box(0.5,0.18,0.5,mDougongBG()).setPos(x,dgY,z));
    b3.add(box(0.7,0.12,0.18,mDougongBL()).setPos(x,dgY+0.16,z));
    for(let dx=-1;dx<=1;dx+=2) for(let dz=-1;dz<=1;dz+=2)
      b3.add(box(0.12,0.05,0.12,(dx+dz+2)%4===0?mDougongLG():mDougongBG()).setPos(x+dx*0.32,dgY+0.11,z+dz*0.32));
  })});
  for(let x=-2.2;x<=2.2;x+=1.1) b3.add(box(0.4,0.14,0.4,mDougongLG()).setPos(x,dgY,0));
  b3.userData={name:'下檐斗拱·柱头科+平身科·蓝绿和玺彩画',desc:'每个檐柱顶置一组柱头科斗拱(坐斗→正心瓜拱→层层出挑)，额枋间补充平身科。蓝绿彩画属清代和玺彩画最高等级，体现榫卯层层传力关系。'};
  L.push(b3);

  //下檐
  const b4=new THREE.Group(), lowY=dgY+0.45;
  b4.add(hipRoof(14.5,7.6,1.2,mGoldRoof()).translateY(lowY));
  b4.add(rafters(14.8,8.0,lowY-0.12,60,mWoodD()));
  b4.userData={name:'下檐·庑殿顶(五脊四坡)',desc:'下层庑殿顶覆金黄琉璃瓦。四坡从正脊向檐口倾斜，无山花(区别于歇山顶)。檐椽密排呈放射状承托望板瓦面，重量经椽→檩→梁→柱→台基传入地基。'};
  L.push(b4);

  //上檐斗拱层
  const b5u=new THREE.Group(), upDgY=lowY+0.55;
  ix.forEach(x=>{ iz.forEach(z=>{
    b5u.add(box(0.45,0.16,0.45,mDougongBG()).setPos(x,upDgY,z));
    for(let dx=-1;dx<=1;dx+=2) for(let dz=-1;dz<=1;dz+=2)
      b5u.add(box(0.1,0.04,0.1,mDougongLG()).setPos(x+dx*0.28,upDgY+0.1,z+dz*0.28));
  })});
  b5u.userData={name:'上檐斗拱层',desc:'金柱顶端斗拱支撑上层屋檐。上檐斗拱略小于下檐，但同样是蓝绿彩画层叠结构，体现上下檐的等级递进关系。'};
  L.push(b5u);

  //庑殿顶上层+正脊鸱吻
  const b6=new THREE.Group(), upY=upDgY+0.5;
  b6.add(hipRoof(8.5,4.5,1.1,mGoldRoof()).translateY(upY));
  b6.add(rafters(8.8,4.8,upY-0.1,40,mWoodD()));
  for(let sx=-1;sx<=1;sx+=2) b6.add(box(0.3,0.8,0.2,mGoldRoofD()).setPos(sx*3.3,upY+0.7,0));
  b6.userData={name:'上檐·庑殿顶+正脊鸱吻',desc:'上层庑殿顶覆金黄琉璃瓦，正脊两端鸱吻各高3.4m重4.3t(现存最大)。上下檐间距≈1.5单位。重檐结构是"太和殿是最高等级建筑"的直观视觉标志。'};
  L.push(b6);

  return {layers:L, centerY:4.2};
}

//乾清宫
//斗拱
function makeDou(s, colorMat) {
  const g=new THREE.Group();
  const w=s*0.48, h=s*0.33;
  //斗身
  const topW=w, botW=w*0.82;
  const geo=new THREE.CylinderGeometry(botW/1.4,topW/1.4,h,4,1);
  const body=new THREE.Mesh(geo.translate(0,h/2,0),colorMat); body.rotation.y=Math.PI/4; g.add(body);
  //斗耳
  g.add(box(w+0.04,0.04,w+0.04,colorMat).translateY(h));
  return g;
}
//拱
function makeGong(len, colorMat, depth) {
  const shape=new THREE.Shape();
  const hw=len/2, h=0.32;
  shape.moveTo(-hw,0); shape.lineTo(hw,0);
  shape.quadraticCurveTo(hw-0.06,h*0.5,hw-0.12,h*0.85);
  shape.lineTo(hw*0.1,h); shape.lineTo(-hw*0.1,h);
  shape.lineTo(-hw+0.12,h*0.85); shape.quadraticCurveTo(-hw+0.06,h*0.5,-hw,0);
  return new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:depth||0.22,bevelEnabled:false}),colorMat);
}
//昂
function makeAng(len, colorMat) {
  const g=new THREE.Group();
  g.add(box(len,0.08,0.2,colorMat));
  g.rotation.x=-0.28;
  return g;
}
//斗拱组
function makeDougongSet(cai, colorD, colorB) {
  const g=new THREE.Group(), s=0.5;
  g.add(makeDou(s,colorD).translateY(0));
  g.add(makeGong(s*1.8,colorB,0.2).translateY(s*0.35));
  g.add(box(0.15,0.07,s*1.0,colorB).translateY(s*0.42));
  if(cai>=5){
    const ang=makeAng(s*1.3,colorB); ang.position.set(0,s*0.5,0.3); g.add(ang);
    ang.clone().position.z=-0.3; g.add(ang.clone());
  }
  if(cai>=7){
    const ang2=makeAng(s*1.6,colorB); ang2.position.set(0,s*0.62,0.55); ang2.rotation.x=-0.32; g.add(ang2);
    ang2.clone().position.z=-0.55; g.add(ang2.clone());
  }
  return g;
}

function buildQianqinggong() {
  const L=[], pTop=0.85; //单层台基
  const ex=[-2.35,-1.2,0,1.2,2.35]; //5列檐柱=面阔9间
  const ez=[-1.0,-0.35,0.35,1.0];    //4排檐柱(进深5间)
  const ix=[-1.6,-0.7,0,0.7,1.6];    //5列金柱
  const iz=[-0.5,0,0.5];             //3排金柱

  //单层汉白玉须弥座台基+月台+铜器
  const b0=new THREE.Group();
  b0.add(box(11.5,0.48,5.5,mColor('#f5f0e0',0.22)).translateY(0.24));
  b0.add(box(5.5,0.32,3.2,mColor('#f3efe0',0.25)).setPos(0,0.38,3.5));
  const ramp=box(1.8,0.08,1.5,mColor('#e8dcc5',0.3)); ramp.rotation.x=-0.3; ramp.position.set(0,0.5,3.2); b0.add(ramp);
  for(let sx=-1;sx<=1;sx+=2){
    for(let z=-1.2;z<=1.2;z+=0.45) b0.add(cyl(0.03,0.03,0.4,6,mRailing()).setPos(sx*2.8,0.65,3.5+z));
  }
  [{x:1.5,z:4.2},{x:-1.5,z:4.2},{x:2.2,z:3.8},{x:-2.2,z:3.8}].forEach(p=>{
    b0.add(box(0.2,0.35,0.2,mGoldRoof()).setPos(p.x,0.6,p.z));
  });
  b0.userData={name:'单层汉白玉须弥座台基+月台',desc:'单层台基高约2m，前出月台设御路丹陛(龙纹斜坡)。月台陈列日晷、嘉量、铜龟、铜鹤。台基层数是区分宫殿等级的首要标志——乾清宫单层 vs 太和殿三层。'};
  L.push(b0);

  //柱网+汉白玉柱础
  const b1=new THREE.Group();
  ex.forEach(x=>ez.forEach(z=>{
    if(x===0&&(Math.abs(z)<0.3)) return;
    b1.add(qingPillar(2.5,false).setPos(x,pTop,z));
  }));
  ix.forEach(x=>iz.forEach(z=>{
    if(x===0&&z===0) return; 
    b1.add(qingPillar(2.9,true).setPos(x,pTop,z));
  }));
  for(let z of[ez[0],ez[3]]){
    for(let i=0;i<ex.length-1;i++) b1.add(box(ex[i+1]-ex[i]-0.1,0.14,0.12,mRedPillarD()).setPos((ex[i]+ex[i+1])/2,pTop+2.2,z));
  }
  for(let x=-2.0;x<=2.0;x+=1.3) b1.add(box(0.12,0.14,1.8,mRedPillarD()).setPos(x,pTop+2.0,0));
  b1.userData={name:'柱网·面阔9间进深5间·减柱造',desc:'20根朱漆檐柱+15根深红金柱。明间前檐减去金柱(减柱造)——三间通连扩大室内空间。紫禁城内仅保和殿/乾清宫/坤宁宫保留此制。每柱配汉白玉覆盆柱础。'};
  L.push(b1);

  //额枋+梁架+穿插枋+井口天花
  const b2=new THREE.Group(), bB2=pTop+2.35;
  for(let z=-0.6;z<=0.6;z+=0.4){
    b2.add(box(5.2,0.26,0.18,mRedPillarD()).setPos(0,bB2,z));
    b2.add(box(3.2,0.2,0.15,mRedPillarD()).setPos(0,bB2+0.7,z));
    b2.add(box(1.8,0.15,0.13,mRedPillarD()).setPos(0,bB2+1.25,z));
  }
  for(let x=-2.0;x<=2.0;x+=0.8) b2.add(box(0.15,0.16,1.8,mRedPillarD()).setPos(x,bB2-0.03,0));
  for(let x=-1.5;x<=1.5;x+=1.5) for(let z=-0.5;z<=0.5;z+=0.5) b2.add(box(0.2,0.5,0.2,mRedPillar()).setPos(x,bB2+0.35,z));
  for(let y=bB2-0.1;y<=bB2+1.4;y+=0.2) b2.add(box(5.8,0.05,0.09,mWoodD()).setPos(0,y,0));
  for(let x=-1.8;x<=1.8;x+=0.6) for(let z=-0.5;z<=0.5;z+=0.4){
    b2.add(box(0.55,0.03,0.35,mColor('#e8e0d0',0.5)).setPos(x,bB2+0.55,z));
  }
  b2.userData={name:'梁架+井口天花',desc:'抬梁式梁架(五→三架梁)，横纵梁铺满、瓜柱檩条密排。室内设井口天花(方格平顶天花)，明间上方为蟠龙藻井。梁架暗红，天花浅米色。'};
  L.push(b2);

  //下檐斗拱
  const b3=new THREE.Group(), dgYL=pTop+2.5;
  ex.forEach(x=>{ ez.forEach(z=>{
    const isCorner=(Math.abs(x)>2.0&&Math.abs(z)>0.8);
    const isBetween=Math.abs(z)<0.3&&Math.abs(x)>0.2;
    if(isBetween) return;
    const set=makeDougongSet(5,mDougongBG(),mDougongBL()); set.position.set(x,dgYL,z);
    if(isCorner) set.rotation.y=Math.PI/4;
    b3.add(set);
  })});
  for(let i=0;i<ex.length-1;i++){
    const mx=(ex[i]+ex[i+1])/2;
    for(let z of[ez[0],ez[3]]){ b3.add(makeDougongSet(5,mDougongLG(),mDougongBG()).setPos(mx,dgYL,z)); }
  }
  b3.userData={name:'下檐斗拱·单翘单昂五踩(柱头科+平身科+角科)',desc:'五踩=出两跳(翘+昂)。每个檐柱顶一组柱头科，额枋间2组平身科，四角为角科(转45°)。斗→升→拱→翘→昂层次分明，施蓝绿和玺彩画。'};
  L.push(b3);

  //下檐庑殿顶+椽子望板
  const b4=new THREE.Group(), lowY2=dgYL+0.45;
  b4.add(hipRoof(12.0,6.0,1.1,mGoldRoof()).translateY(lowY2));
  b4.add(rafters(12.4,6.4,lowY2-0.1,50,mWoodD()));
  for(let a=0;a<Math.PI*2;a+=0.25){
    b4.add(box(0.3,0.025,1.0,mWoodD()).setPos(Math.cos(a)*6.5,lowY2-0.03,Math.sin(a)*3.5).rotateY(Math.atan2(Math.sin(a),Math.cos(a))));
  }
  b4.userData={name:'下檐·庑殿顶(五脊四坡)',desc:'下层庑殿顶覆金黄琉璃瓦，五脊四坡。椽子密排承托望板，瓦当滴水位于檐口。庑殿顶无山花——区别于歇山顶。'};
  L.push(b4);

  //上檐斗拱
  const b5u2=new THREE.Group(), upDgY2=lowY2+0.55;
  ix.forEach(x=>{ iz.forEach(z=>{
    const set2=makeDougongSet(7,mDougongBG(),mDougongBL()); set2.position.set(x,upDgY2,z); b5u2.add(set2);
  })});
  for(let i=0;i<ix.length-1;i++){
    const mx2=(ix[i]+ix[i+1])/2;
    b5u2.add(makeDougongSet(7,mDougongLG(),mDougongBG()).setPos(mx2,upDgY2,0));
  }
  b5u2.userData={name:'上檐斗拱·单翘双昂七踩',desc:'七踩=出三跳(翘+昂+昂)。等级高于下檐五踩，出挑更远支撑更宽的上层屋檐。斗拱尺度略大、昂更延伸，体现上下檐等级递进。'};
  L.push(b5u2);

  //上檐庑殿顶+正脊鸱吻+脊兽
  const b6=new THREE.Group(), upY2=upDgY2+0.5;
  b6.add(hipRoof(7.0,3.5,1.0,mGoldRoof()).translateY(upY2));
  b6.add(rafters(7.4,3.9,upY2-0.08,35,mWoodD()));
  b6.add(box(5.5,0.2,0.22,mGoldRoofD()).setPos(0,upY2+0.65,0));
  for(let sx=-1;sx<=1;sx+=2) b6.add(box(0.28,0.75,0.18,mGoldRoof()).setPos(sx*2.6,upY2+0.6,0));
  for(let sx=-1;sx<=1;sx+=2) for(let sz=-1;sz<=1;sz+=2){
    for(let i=0;i<5;i++) b6.add(box(0.05,0.08,0.05,mGoldRoof()).setPos(sx*(3.0-i*0.18),upY2+0.25+i*0.04,sz*(1.3-i*0.08)));
    for(let i=0;i<5;i++) b4.add(box(0.05,0.08,0.05,mGoldRoof()).setPos(sx*(5.5-i*0.22),lowY2+0.25+i*0.04,sz*(2.4-i*0.1)));
  }
  //室内宝座+正大光明匾
  const throne=box(0.8,0.3,0.4,mGoldRoof()); throne.position.set(0,pTop+0.5,-1.5); b6.add(throne);
  const plaque=box(0.7,0.2,0.03,mColor('#d4af37',0.3)); plaque.position.set(0,pTop+2.1,-1.3); b6.add(plaque);
  b6.userData={name:'上檐庑殿顶+脊兽+室内宝座·正大光明匾',desc:'上层庑殿顶，正脊两端鸱吻。室内后檐金柱间设屏风宝座，上方悬"正大光明"匾——清代秘密立储诏书藏于匾后。东西梢间暖阁，尽间穿堂通交泰殿。'};
  L.push(b6);

  return {layers:L, centerY:3.0};
}

//赵州桥
function buildZhaozhouqiao() {
  const L=[], gY=0.0;
  const ST=()=>mColor('#b8a898',0.38);  //青白石·主体
  const SD=()=>mColor('#a09080',0.42);  //深色石·拱圈
  const SL=()=>mColor('#c8b8a8',0.35);  //浅色石·栏板
  const MT=()=>new THREE.MeshStandardMaterial({color:0x7a7a7a,roughness:0.25,metalness:0.7}); // 腰铁
  const archR=9.0, archRin=8.3, archCY=-6.6, archDepth=3.0; //矢高2.4m·矢跨比1:5圆弧坦拱
  const sAngle=0.75, eAngle=Math.PI-0.75; //拱弧起止角(rad)

  //桥台
  const b0=new THREE.Group();
  for(let sx=-1;sx<=1;sx+=2){
    //实体条石桥台
    for(let ly=0;ly<5;ly++) for(let lz=-1.5;lz<=1.5;lz+=0.7){
      b0.add(box(0.7,0.22,0.65,ST()).setPos(sx*(archR*Math.cos(sAngle)+0.2),ly*0.24+gY,lz));
    }
  }
  // 河床地面
  for(let x=-archR-1;x<=archR+1;x+=1.2) b0.add(box(1.1,0.05,3.5,mColor('#c4bcb0',0.5)).setPos(x,gY-0.04,0));
  b0.userData={name:'桥台·两端实体条石垒砌',desc:'两端桥台为青白石分层垒砌(各5层)。桥台总厚仅1.57m——坐天然地基1400年下沉仅5cm。主拱下方完全空敞·无任何桥墩/立柱——单孔净跨37m。'};
  L.push(b0);

  //主拱券
  const b1=new THREE.Group();
  const archShape=new THREE.Shape();
  archShape.absarc(0,archCY,archR,sAngle,eAngle,false);
  archShape.absarc(0,archCY,archRin,eAngle,sAngle,true);
  const archGeo=new THREE.ExtrudeGeometry(archShape,{steps:1,depth:archDepth,bevelEnabled:false});
  b1.add(new THREE.Mesh(archGeo,SD()).setPos(0,0,-archDepth/2));
  //28道拱券纵向分割线
  for(let i=1;i<28;i++) b1.add(box(0.016,0.8,archDepth,SD()).setPos(0,0.8,-archDepth/2+i*archDepth/28));
  //拱石径向缝
  const step=(eAngle-sAngle)/43;
  for(let a=sAngle+step;a<eAngle-step;a+=step){
    const rx=Math.cos(a)*archR, ry=archCY+Math.sin(a)*archR;
    b1.add(box(0.035,0.05,archDepth,SD()).setPos(rx*0.95,ry*0.95,0));
  }
  b1.userData={name:'主拱券·28道并列独立拱圈',desc:'净跨37.02m/矢高7.23m(矢跨比≈1:5·圆弧坦拱)。28道拱券纵向并列砌筑——每道独立成型·楔形石榫卯咬合。一道损坏其余照常承重——"容许局部损坏"的先进工程哲学。全青白石材质。'};
  L.push(b1);

  //敞肩小拱
  const b2=new THREE.Group();
  [{dx:5.8,r:1.0},{dx:3.8,r:0.7},{dx:-5.8,r:1.0},{dx:-3.8,r:0.7}].forEach(s=>{
    
    const archY=archCY+Math.sqrt(Math.max(archR*archR-s.dx*s.dx,0));
    const sShape=new THREE.Shape();
    sShape.absarc(0,0,s.r,0,Math.PI,false);
    sShape.absarc(0,0,s.r-0.22,Math.PI,0,true);
    const sGeo=new THREE.ExtrudeGeometry(sShape,{steps:1,depth:archDepth-0.4,bevelEnabled:false});
    b2.add(new THREE.Mesh(sGeo,SD()).setPos(s.dx,archY-0.3,-archDepth/2+0.2));
    //拱脚石
    for(let dz2=-1;dz2<=1;dz2+=2) b2.add(box(0.35,0.18,0.45,ST()).setPos(s.dx+dz2*s.r*0.65,archY-0.6,0));
  });
  b2.userData={name:'敞肩小拱×4·嵌入拱肩·与主拱一体',desc:'左右拱肩各2座小拱(外大R1.0/内小R0.7)——直接嵌入主拱上方的拱肩墙体中，与主拱连成整体结构。空腹拱一举三得：减轻自重700吨、洪水时分流16%、桥面更平缓利于通行。'};
  L.push(b2);

  //桥面
  const b3=new THREE.Group();
  const deckLen=16.0, deckW=3.0, deckCY=2.6;
  //微弧形桥面
  for(let x=-deckLen/2;x<=deckLen/2;x+=0.7){
    const curve=1-(x/(deckLen/2))*(x/(deckLen/2));
    const dy=deckCY+curve*0.3;
    const slab=box(0.65,0.32,deckW,ST());
    slab.position.set(x+0.35,dy,0); slab.rotation.z=(x>0?-1:1)*(1-curve)*0.08; b3.add(slab);
    //横缝
    b3.add(box(0.02,0.33,deckW,SD()).setPos(x+0.35,dy,0));
  }
  //地栿石
  for(let dz3=-1;dz3<=1;dz3+=2){
    b3.add(box(deckLen,0.12,0.25,SL()).setPos(0,deckCY+0.2,dz3*(deckW/2+0.1)));
  }
  b3.userData={name:'桥面·石板铺面·微弧形',desc:'桥面宽9m青白石条错缝铺设。桥面呈微弧形——中间略高两端略低·与主拱弧度呼应。两侧地栿石承接整套石栏杆。石板缝嵌燕尾形铸铁腰铁锁固。'};
  L.push(b3);

  //石栏杆
  const b4=new THREE.Group();
  const railBot=deckCY+0.35;
  for(let x=-deckLen/2+0.3;x<=deckLen/2-0.3;x+=0.55){
    for(let dz4=-1;dz4<=1;dz4+=2){
      const zr=dz4*(deckW/2+0.18);
      b4.add(box(0.09,1.0,0.09,SL()).setPos(x,railBot+0.5,zr));
      b4.add(box(0.11,0.14,0.11,SL()).setPos(x,railBot+1.05,zr));
      const panel=box(0.46,0.6,0.06,SL()); panel.position.set(x+0.27,railBot+0.32,zr); b4.add(panel);
      for(let py=-0.2;py<=0.2;py+=0.06){
        b4.add(box(0.4,0.01,0.07,SD()).setPos(x+0.27,railBot+0.32+py,zr));
      }
      b4.add(box(0.56,0.08,0.12,SL()).setPos(x+0.27,railBot+0.68,zr));
    }
  }
  b4.userData={name:'石栏杆·望柱·蟠龙栏板·全石砌',desc:'全套石栏杆：方形望柱(带柱头)→整块蟠龙浮雕石栏板(竖向弧线纹理)→顶部厚实条石扶手。全青白石榫卯插接——厚重古朴·唐风本色。无镂空无木质。'};
  L.push(b4);

  //龙门石+拱肩填充
  const b5=new THREE.Group();
  b5.add(box(0.45,0.22,archDepth+0.1,ST()).setPos(0,archCY+archR-0.12,0));
  for(let sx=-1;sx<=1;sx+=2){
    b5.add(box(1.2,1.0,archDepth,ST()).setPos(sx*4.8,archCY+archR*0.4,0));
  }
  for(let i=0;i<15;i++){
    b5.add(box(0.3+Math.random()*0.4,0.015,0.3+Math.random()*0.3,mColor('#988878',0.28)).setPos((Math.random()-0.5)*14,Math.random()*2.5,(Math.random()-0.5)*archDepth));
  }
  b5.userData={name:'龙门石·拱肩填充·风化纹理',desc:'拱顶龙门石锁固拱券。拱肩小拱间为实体石砌填充——并非空腔。桥身1400年风雨侵蚀——表面斑驳风化纹理·苍古朴拙·"千年不倒"。'};
  L.push(b5);

  return {layers:L, centerY:1.8};
}

//卢沟桥
function buildLugouqiao() {
  const L=[], gY=0.02;
  const ST=()=>mColor('#a89888',0.38);
  const SD=()=>mColor('#887868',0.45);
  const SL=()=>mColor('#b8a898',0.33);
  const IR=()=>new THREE.MeshStandardMaterial({color:0x706860,roughness:0.25,metalness:0.65});
  const pw=0.9, ps=2.0, archSpan=ps-pw*0.4, archRise=archSpan*0.55;
  const deckW=1.8, deckY=2.0, nArch=11, nPier=nArch-1;
  const bridgeHalf=(nArch-1)*ps/2, dLen=bridgeHalf*2+2;
  //船型桥墩
  const b0=new THREE.Group();
  for(let i=0;i<nPier;i++){
    const cx=(i-(nPier-1)/2)*ps;
    for(let ly=0;ly<5;ly++) b0.add(box(pw-0.1,0.25,1.6,ST()).setPos(cx,ly*0.25+gY,0));
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.35,1.2,4),SD()); tip.rotation.y=Math.PI/4;
    tip.position.set(cx+pw/2+0.4,0.7,0); b0.add(tip);
    b0.add(box(0.3,1.4,1.6,ST()).setPos(cx-pw/2-0.15,0.7,0));
    b0.add(box(0.08,0.6,0.08,IR()).setPos(cx+pw/2+0.65,0.55,0));
  }
  for(let sx=-1;sx<=1;sx+=2) for(let ly=0;ly<6;ly++) b0.add(box(0.8,0.22,1.6,ST()).setPos(sx*(bridgeHalf+0.6),ly*0.22+gY,0));
  for(let x=-bridgeHalf-2;x<=bridgeHalf+2;x+=1.0) b0.add(box(0.9,0.05,2.0,mColor('#c0b8b0',0.5)).setPos(x,gY-0.04,0));
  b0.userData={name:'船型桥墩×10·分层条石·三角分水尖·斩龙剑',desc:'10座船型墩——前端三角分水尖(劈流减冲)+铁制斩龙剑(破冰)+后端方形墩尾。墩身条石分层垒砌5层。'};
  L.push(b0);

  //11孔联拱
  const b1=new THREE.Group();
  for(let i=0;i<nArch;i++){
    const cx=(i-(nArch-1)/2)*ps;
    const aShape=new THREE.Shape();
    aShape.absarc(0,0,archSpan/2,0,Math.PI,false);
    aShape.absarc(0,0,archSpan/2-0.18,Math.PI,0,true);
    const aGeo=new THREE.ExtrudeGeometry(aShape,{steps:1,depth:1.5,bevelEnabled:false});
    b1.add(new THREE.Mesh(aGeo,SD()).setPos(cx,gY+0.05,-0.75));
    for(let a=0.15;a<Math.PI-0.15;a+=Math.PI/25) b1.add(box(0.03,0.04,1.5,SD()).setPos(cx+Math.cos(a)*archSpan/2*0.9,Math.sin(a)*archSpan/2*0.9+gY,0));
  }
  b1.userData={name:'11孔联拱·独立料石横向砌筑',desc:'11个拱洞连续排列。每孔拱券独立料石横向砌筑·石缝清晰。联拱设计使水流分布合理·全桥整体受力。'};
  L.push(b1);

  //桥面体系
  const b2=new THREE.Group();
  b2.add(box(dLen,0.35,deckW,ST()).setPos(0,deckY,0));
  for(let x=-dLen/2+0.3;x<=dLen/2-0.3;x+=0.6){
    b2.add(box(0.02,0.36,deckW,SD()).setPos(x,deckY,0));
    b2.add(box(0.6,0.37,0.02,SD()).setPos(x,deckY,0));
  }
  for(let dz=-1;dz<=1;dz+=2) b2.add(box(dLen,0.1,0.22,SL()).setPos(0,deckY+0.18,dz*(deckW/2+0.08)));
  for(let sx=-1;sx<=1;sx+=2) b2.add(box(0.6,0.35,deckW+0.8,ST()).setPos(sx*(dLen/2+0.4),deckY,0));
  b2.userData={name:'桥面石板·地栿石·雁翅',desc:'桥面宽7.5m青石板有序铺设(横缝0.6m+纵缝)。两侧地栿石贯通全桥作栏杆基座。两端雁翅呈喇叭口。'};
  L.push(b2);

  //石栏杆
  const b3=new THREE.Group();
  const railBot=deckY+0.3;
  for(let x=-dLen/2+0.3;x<=dLen/2-0.3;x+=0.55){
    for(let dz=-1;dz<=1;dz+=2){
      const zr=dz*(deckW/2+0.15);
      b3.add(box(0.08,0.85,0.08,SL()).setPos(x,railBot+0.42,zr));
      const lionG=new THREE.Group();
      const bs=0.06+Math.random()*0.04;
      lionG.add(new THREE.Mesh(new THREE.SphereGeometry(bs,5,4),SL()).translateY(bs));
      lionG.add(new THREE.Mesh(new THREE.SphereGeometry(bs*0.7,4,3),SD()).setPos(0,bs*1.3,bs*0.5));
      if(Math.random()>0.4) lionG.add(new THREE.Mesh(new THREE.SphereGeometry(bs*0.35,3,2),ST()).setPos((Math.random()-0.5)*bs,bs*0.6,(Math.random()-0.5)*bs));
      if(Math.random()>0.6) lionG.add(new THREE.Mesh(new THREE.SphereGeometry(bs*0.25,3,2),SD()).setPos((Math.random()-0.5)*bs*1.2,bs*0.3,(Math.random()-0.5)*bs*1.2));
      lionG.position.set(x,railBot+0.9,zr); b3.add(lionG);
      const panel=box(0.46,0.52,0.05,SL()); panel.position.set(x+0.27,railBot+0.28,zr); b3.add(panel);
      for(let py=-0.16;py<=0.16;py+=0.05) b3.add(box(0.4,0.01,0.06,SD()).setPos(x+0.27,railBot+0.28+py,zr));
      b3.add(box(0.54,0.06,0.08,SL()).setPos(x+0.27,railBot+0.62,zr));
    }
  }
  b3.userData={name:'望柱281根·石狮501尊·蟠龙栏板',desc:'279根望柱雕501尊石狮——大狮/小狮/母子狮/戏狮·神态各异无一相同。大狮身藏小狮——"数不清"。栏板浅浮雕纹饰。寻杖扶手贯通。'};
  L.push(b3);

  //桥头附属建筑
  const b4=new THREE.Group();
  for(let sx=-1;sx<=1;sx+=2){
    const bx=sx*(dLen/2+1.0);
    for(let dz=-1;dz<=1;dz+=2){
      const hb=new THREE.Group();
      hb.add(cyl(0.1,0.12,2.5,8,SL()).translateY(1.25));
      hb.add(box(0.35,0.18,0.35,SL()).translateY(2.55));
      hb.add(new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),SL()).translateY(2.8));
      hb.position.set(bx+sx*0.6,gY+0.15,dz*(deckW/2+0.3)); b4.add(hb);
    }
    const pl=new THREE.Group();
    for(let dx=-0.6;dx<=0.6;dx+=0.6) pl.add(box(0.08,2.8,0.08,SL()).setPos(dx,1.4,0));
    pl.add(box(1.4,0.12,0.25,SL()).translateY(2.8));
    pl.add(box(1.6,0.08,0.3,SD()).translateY(2.95));
    pl.position.set(bx-sx*0.3,gY+0.12,-deckW/2-0.4); b4.add(pl);
    const gl=new THREE.Group();
    gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.25,6,5),SD()).translateY(0.25));
    gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.18,5,4),SL()).setPos(0.05,0.35,0.15));
    gl.position.set(bx-sx*0.4,gY+0.13,deckW/2+0.5); b4.add(gl);
    gl.clone().position.z=-deckW/2-0.5; b4.add(gl.clone());
    const bt=new THREE.Group();
    for(let dx=-0.25;dx<=0.25;dx+=0.5) bt.add(box(0.06,1.3,0.06,SL()).setPos(dx,0.65,0));
    bt.add(box(0.6,0.06,0.6,SD()).translateY(1.3));
    bt.add(box(0.15,0.8,0.06,SL()).setPos(0,0.5,0.2));
    bt.position.set(bx-sx*0.6,gY+0.1,-deckW/2-0.7); b4.add(bt);
  }
  b4.userData={name:'桥头建筑·华表·牌楼·碑亭·守门石狮',desc:'两端各设汉白玉华表(云纹蟠龙柱·高3m)·三间式石牌楼(带瓦顶)·御碑亭(乾隆"卢沟晓月"碑)·巨型守门石狮(身长1.7m重3t)。燕京八景之一。'};
  L.push(b4);

  return {layers:L, centerY:1.8};
}

//四合院：标准一进院
function buildSiheyuan() {
  const L=[], gY=0.02;
  const WD=()=>mColor('#6b655e',0.3);
  const RF=()=>mColor('#5a6874',0.26);
  const GR=()=>mColor('#c8c4bc',0.48);
  const WD2=()=>mColor('#4a3e34',0.3);
  const FW=()=>mColor('#756e66',0.28);
  const SC=()=>mColor('#ccc4b8',0.42);
  const P=4.0, wT=0.12, fH=1.85;
  const M={x:0,z:-2.8,w:4.5,d:2.0,wh:1.9,rh:0.6};   //正房
  const E={x:+2.8,z:+0.2,w:1.5,d:3.5,wh:1.6,rh:0.5}; //东厢
  const WE={x:-2.8,z:+0.2,w:1.5,d:3.5,wh:1.6,rh:0.5};//西厢
  const S={x:-0.5,z:+2.8,w:3.8,d:1.5,wh:1.4,rh:0.45};//倒座
  const pH={main:0.17,wing:0.12,south:0.1};           //台基高
  const gateX2=3.25, gateW2=1.5;

  //台明+条石勒脚+内院铺地
  const b0=new THREE.Group();
  b0.add(box(P*2,0.06,P*2,GR()).translateY(gY+0.03));
  b0.add(box(3.0,0.022,3.3,mColor('#b4b0a8',0.45)).translateY(gY+0.07));
  b0.add(box(0.75,0.018,3.3,mColor('#a8a49c',0.45)).translateY(gY+0.08));
  b0.add(box(3.0,0.018,0.75,mColor('#a8a49c',0.45)).translateY(gY+0.08));
  [{b:M,h:pH.main},{b:E,h:pH.wing},{b:WE,h:pH.wing},{b:S,h:pH.south}].forEach(({b,h})=>{
    b0.add(box(b.w+0.35,0.06,b.d+0.35,SC()).setPos(b.x,gY+h-0.03,b.z));
    [{x:0,z:-b.d/2,l:b.w},{x:0,z:+b.d/2,l:b.w},{x:-b.w/2,z:0,l:b.d},{x:+b.w/2,z:0,l:b.d}].forEach(e=>{
      b0.add(box(e.z===0?0.06:e.l,0.08,e.z===0?e.l:0.06,SC()).setPos(b.x+e.x,gY+h+0.04,b.z+e.z));
    });
  });
  b0.userData={name:'台明+条石勒脚+内院铺地',desc:'四房下设青石台明(正房0.17>厢房0.12>倒座0.10)体现尊卑。条石勒脚四边围合防潮。内院青砖铺地+十字甬道。'};
  L.push(b0);

  //院墙+蛮子门+影壁+垂花门
  const b1=new THREE.Group();
  [{x:0,z:-P,l:P*2},{x:+P,z:0,l:P*2},{x:-P,z:0,l:P*2},{x:-1.5,z:+P,l:P*2-3.5},{x:+2.0,z:+P,l:P-gateX2+0.5}].forEach(w=>{
    const iZ=w.x===0;
    b1.add(box(iZ?w.l:wT,fH,iZ?wT:w.l,FW()).setPos(w.x,fH/2+gY+0.02,w.z));
    b1.add(box(iZ?w.l+0.02:wT+0.04,0.05,iZ?wT+0.04:w.l+0.02,RF()).setPos(w.x,fH+gY+0.04,w.z));
  });
  //蛮子门
  const gate2=new THREE.Group();
  gate2.add(box(gateW2-0.1,2.1,0.05,WD2()).translateY(1.05));
  gate2.add(box(gateW2,0.16,0.28,WD2()).translateY(2.1));
  for(let dx=-1;dx<=1;dx+=2){
    gate2.add(box(0.08,2.1,0.08,WD2()).setPos(dx*(gateW2/2-0.05),1.05,0));
    gate2.add(box(0.14,0.18,0.14,SC()).setPos(dx*(gateW2/2-0.05),0.1,0.05));
  }
  for(let dx=-1;dx<=1;dx+=2) for(let dz=-1;dz<=1;dz+=2) gate2.add(box(0.05,0.05,0.05,WD2()).setPos(dx*0.22,2.25,dz*0.08));
  gate2.position.set(gateX2,gY+0.01,P); b1.add(gate2);
  //影壁
  const scr2=new THREE.Group();
  scr2.add(box(2.4,1.7,0.08,mColor('#c8c0b0',0.36)).translateY(0.9));
  scr2.add(box(2.6,0.11,0.16,RF()).translateY(1.75));
  scr2.add(box(2.5,0.09,0.14,SC()).translateY(0.06));
  scr2.position.set(1.7,gY+0.08,1.8); b1.add(scr2);
  //垂花门
  const chm=new THREE.Group();
  for(let dx=-1;dx<=1;dx+=2){ chm.add(box(0.12,2.0,0.12,WD2()).setPos(dx*0.7,1.1,0)); chm.add(box(0.12,0.5,0.12,WD2()).setPos(dx*0.7,0.65,0)); }
  chm.add(box(1.6,0.1,0.2,RF()).translateY(2.1));
  chm.position.set(0,gY+0.12,1.2); b1.add(chm);
  b1.userData={name:'院墙(筒瓦压顶)+蛮子门+影壁+垂花门',desc:'青砖院墙带筒瓦压顶。东南蛮子门(门簪4枚+门墩石)。进门一字影壁→前院→垂花门→天井主院——"层层递进"。'};
  L.push(b1);

  //砖墙+前檐廊+抄手游廊
  const b2=new THREE.Group();
  [M,E,WE,S].forEach(b=>{
    const by=gY+(b===M?pH.main:b===S?pH.south:pH.wing)+0.02;
    b2.add(box(b.w,b.wh,b.d,WD()).setPos(b.x,b.wh/2+by,b.z));
  });
  for(let x=-M.w/2+0.3;x<=M.w/2-0.3;x+=M.w/2.5) b2.add(cyl(0.06,0.07,M.wh,6,WD2()).setPos(x,M.wh/2+gY+pH.main,M.z-M.d/2-0.05));
  [{x:E.x-0.05,d:E.d},{x:WE.x+0.05,d:WE.d}].forEach(w=>{
    for(let z=-w.d/2+0.3;z<=w.d/2-0.3;z+=w.d/3) b2.add(cyl(0.05,0.06,1.5,6,WD2()).setPos(w.x,0.85+gY+pH.wing,z));
  });
  [{sx:1,x1:1.5,x2:2.5,z1:-1.3,z2:-0.3},{sx:-1,x1:-1.5,x2:-2.5,z1:-1.3,z2:-0.3}].forEach(c=>{
    for(let i=0;i<=3;i++){ const t=i/3; b2.add(cyl(0.04,0.05,1.8,6,WD2()).setPos(c.x1+(c.x2-c.x1)*t,1.0+gY,c.z1+(c.z2-c.z1)*t)); }
    b2.add(box(0.7,0.05,1.2,RF()).setPos(c.sx*2.0,1.9+gY,-0.8));
  });
  b2.userData={name:'砖墙+前檐廊+抄手游廊',desc:'正房南侧前檐廊(一排檐柱遮阳避雨)。厢房朝内院面前檐廊。抄手游廊连接厢房与正房——"雨天不湿鞋"。'};
  L.push(b2);

  //硬山顶
  const b3=new THREE.Group();
  [M,E,WE,S].forEach(b=>{
    const rw=b.w+0.4,rd=b.d+0.5,by2=gY+(b===M?pH.main:b===S?pH.south:pH.wing)+0.02,ry=b.wh+by2;
    const rf=new THREE.Group();
    rf.add(box(rw*0.5,0.11,0.13,RF()).translateY(b.rh));
    for(let sx=-1;sx<=1;sx+=2) rf.add(box(0.1,0.12,0.1,RF()).setPos(sx*rw*0.24,b.rh+0.1,0));
    for(let s=-1;s<=1;s+=2){
      const sl=box(rw*0.52,0.05,rd*0.38,RF()); sl.rotation.x=s*0.42; sl.position.set(0,b.rh-0.27,rd*0.09*s); rf.add(sl);
      rf.add(box(rw*0.48,b.rh,0.06,mColor('#686460',0.36)).setPos(0,b.rh/2,s*rd*0.27));
      for(let x=-rw*0.24;x<=rw*0.24;x+=0.25) rf.add(box(0.04,0.028,0.07,RF()).setPos(x,b.rh+0.04,s*rd*0.06));
    }
    for(let s=-1;s<=1;s+=2) for(let d=-1;d<=1;d+=2) rf.add(box(rw*0.05,0.06,rd*0.28,RF()).setPos(d*rw*0.24,b.rh-0.32+d*0.08,s*rd*0.1));
    rf.position.set(b.x,ry,b.z); b3.add(rf);
  });
  b3.userData={name:'硬山顶·筒瓦屋面·正脊垂脊·小兽',desc:'四座硬山顶覆青灰筒瓦。正脊两端脊兽、四垂脊收边。筒瓦屋面规整紧密——等级高于板瓦。硬山山墙封檩头防火防寒。'};
  L.push(b3);

  //隔扇门+支摘窗+方格棂窗
  const b4=new THREE.Group();
  const mDoor=new THREE.Group();
  for(let dx=-1;dx<=1;dx+=2) mDoor.add(box(0.55,2.05,0.035,WD2()).setPos(dx*0.28,1.1,0));
  mDoor.add(box(1.2,0.12,0.08,WD2()).translateY(2.15));
  mDoor.position.set(M.x,1.05+gY+pH.main,M.z-M.d/2); b4.add(mDoor);
  for(let sx=-1;sx<=1;sx+=2){
    const wG=new THREE.Group(); wG.add(box(0.65,0.8,0.03,WD2())); wG.add(box(0.65,0.03,0.04,WD2()).translateY(0.3));
    for(let wx=-0.25;wx<=0.25;wx+=0.25) wG.add(box(0.03,0.8,0.04,WD2()).translateX(wx));
    wG.position.set(M.x+sx*1.35,1.2+gY+pH.main,M.z-M.d/2); b4.add(wG);
  }
  [{x:E.x,f:E.x-E.w/2,z:0.5},{x:WE.x,f:WE.x+WE.w/2,z:0.5}].forEach(w=>{
    b4.add(box(0.7,1.7,0.03,WD2()).setPos(w.f,1.0+gY+pH.wing,w.z));
    const gw=new THREE.Group(); gw.add(box(0.55,0.65,0.03,WD2()));
    for(let gx=-0.2;gx<=0.2;gx+=0.2){ gw.add(box(0.025,0.65,0.04,WD2()).translateX(gx)); for(let gy=-0.22;gy<=0.22;gy+=0.22) gw.add(box(0.025,0.1,0.04,WD2()).setPos(gx,gy,0)); }
    gw.position.set(w.f,1.15+gY+pH.wing,-0.7); b4.add(gw);
  });
  for(let sx=-1;sx<=1;sx+=2){
    const gw2=new THREE.Group(); gw2.add(box(0.5,0.6,0.03,WD2()));
    for(let gx=-0.18;gx<=0.18;gx+=0.18) gw2.add(box(0.022,0.6,0.04,WD2()).translateX(gx));
    gw2.position.set(S.x+sx*1.1,1.15+gY+pH.south,S.z+S.d/2); b4.add(gw2);
  }
  b4.userData={name:'隔扇门·支摘窗·方格棂窗',desc:'正房双扇隔扇门+次间支摘窗(上可支起通风)。厢房方格棂窗(十字格木棂)。倒座小方格窗。全朝内院——外墙不开窗·私密安全。'};
  L.push(b4);

  return {layers:L, centerY:1.4};
}

//徽派三叠式马头墙
function buildHuipai() {
  const L=[], gY=0.02;
  const W=()=>mColor('#e8e4dc',0.26);//白粉墙
  const T=()=>mColor('#363430',0.22);//黛瓦
  const S=()=>mColor('#a09888',0.4); //石勒脚
  const G=()=>mColor('#c8c4bc',0.5); //地面
  const J=()=>mColor('#d4d0c8',0.45);//砖缝灰浆
  const B=()=>mColor('#4a3a2a',0.32);//木构
  const WT=0.12;                     //墙厚

  const BW=5.2, BD=4.4, WH=2.8, RH=0.7;       //宽/深/墙高/脊高
  const rTop=WH+gY+0.06;                        //墙顶面Y
  const ridgeY=rTop+RH;                         //正脊Y
  const tiers=[
    [-0.3,0.3,0.9],   //中心·最高(高出屋面0.9m)
    [-1.35,-0.3,0.55],[0.3,1.35,0.55], //中段(高出0.55m)
    [-2.2,-1.35,0.3],[1.35,2.2,0.3],   //外侧(高出0.3m)
  ];

  //青石勒脚+石板地基
  const b0=new THREE.Group();
  b0.add(box(BW+0.5,0.08,BD+0.5,S()).translateY(gY+0.04));
  [{x:0,z:-BD/2-0.05,l:BW+0.1},{x:0,z:+BD/2+0.05,l:BW+0.1},{x:-BW/2-0.05,z:0,l:BD+0.1},{x:+BW/2+0.05,z:0,l:BD+0.1}].forEach(p=>{
    const isSide=p.z===0;
    b0.add(box(isSide?0.1:p.l,0.42,isSide?p.l:0.1,S()).setPos(p.x,gY+0.22,p.z));
  });
  b0.userData={name:'青石勒脚·石板地基',desc:'徽州山区潮湿多雨。整块青石板抬高地基+外墙设青石勒脚(高约0.42m)防潮隔水。石基坚固耐久——百年不沉。'};
  L.push(b0);

  //白粉墙+砖缝肌理+天井
  const b1=new THREE.Group();
  //四围墙体
  [{x:0,z:-BD/2,w:BW},{x:0,z:+BD/2,w:BW},{x:-BW/2,z:0,w:BD},{x:+BW/2,z:0,w:BD}].forEach(p=>{
    const isSide=p.z===0;
    b1.add(box(isSide?WT:p.w,WH,isSide?p.w:WT,W()).setPos(p.x,WH/2+gY+0.01,p.z));
    //砖缝
    for(let y=0.5;y<WH;y+=0.2){
      b1.add(box(isSide?WT+0.02:p.w-0.05,0.012,isSide?p.w+0.02:WT+0.02,J()).setPos(p.x,gY+y,p.z));
    }
  });
  //天井
  const tjW=1.4, tjD=1.0;
  b1.add(box(tjW,0.04,tjD,mColor('#484038',0.55)).translateY(gY+0.32));
  //天井石壁
  [{x:0,z:tjD/2,l:tjW},{x:0,z:-tjD/2,l:tjW},{x:tjW/2,z:0,l:tjD},{x:-tjW/2,z:0,l:tjD}].forEach(p=>{
    b1.add(box(p.z===0?0.04:p.l,0.5,p.z===0?p.l:0.04,mColor('#585048',0.4)).setPos(p.x,gY+0.5,p.z));
  });
  b1.userData={name:'白粉墙·砖缝肌理·天井',desc:'青砖砌筑外覆白灰——标志性"粉墙黛瓦"。水平砖缝隐约透出灰浆肌理。中心天井——采光/通风/排水，"四水归堂"聚财纳福。'};
  L.push(b1);

  //硬山顶中心坡屋顶+完整瓦作体系
  const b2=new THREE.Group();
  //正脊
  b2.add(box(BW*0.52,0.14,0.18,T()).translateY(ridgeY));
  for(let sx=-1;sx<=1;sx+=2){ b2.add(box(0.12,0.14,0.12,T()).setPos(sx*BW*0.24,ridgeY+0.1,0)); }// 脊兽
  //垂脊
  for(let s=-1;s<=1;s+=2) for(let d=-1;d<=1;d+=2){
    b2.add(box(BW*0.06,0.08,BD*0.3,T()).setPos(d*BW*0.25,ridgeY-0.35+d*0.1,s*BD*0.1));// 垂脊
  }
  //前后坡屋面
  for(let s=-1;s<=1;s+=2){
    const sl=box(BW*0.52,0.06,BD*0.3,T()); sl.rotation.x=s*0.42; sl.position.set(0,ridgeY-0.3,BD*0.08*s); b2.add(sl);
    //筒瓦+板瓦
    for(let x=-BW/2+0.3;x<=BW/2-0.3;x+=0.35){
      b2.add(box(0.07,0.025,0.45,T()).setPos(x,rTop-0.03,BD*0.34*s));   // 板瓦(宽薄)
      b2.add(box(0.04,0.035,0.45,T()).setPos(x,rTop,BD*0.32*s));        // 筒瓦(窄圆)
      b2.add(box(0.055,0.05,0.015,T()).setPos(x,rTop-0.01,BD*0.37*s));  // 瓦当(圆片端头)
      const dip=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.05,4),T()); dip.position.set(x,rTop-0.06,BD*0.39*s); b2.add(dip);// 滴水三角
    }
    //椽子
    for(let x=-BW/2+0.2;x<=BW/2-0.2;x+=0.4){
      b2.add(box(0.035,0.025,0.8,T()).setPos(x,rTop-0.12,BD*0.36*s));
    }
  }
  b2.userData={name:'硬山顶·正脊垂脊·筒瓦板瓦瓦当滴水·椽子',desc:'传统硬山顶覆小青瓦(板瓦铺底+筒瓦扣缝)。正脊两端脊兽、四垂脊完整。檐口瓦当(圆)滴水(三角)相间。檐椽密排承托望板。"粉墙黛瓦"——水墨徽州。'};
  L.push(b2);

  //三叠式马头墙
  const b3=new THREE.Group();
  for(let sx=-1;sx<=1;sx+=2){
    const mx=sx*(BW/2+WT/2);
    tiers.forEach((t,i)=>{
      const tw=Math.abs(t[1]-t[0]), tz=(t[1]+t[0])/2, th=t[2], ty=rTop;
      //垛阶墙身
      b3.add(box(WT,th,tw,W()).setPos(mx,ty+th/2,tz));
      //博风板
      b3.add(box(0.025,th+0.04,tw+0.02,T()).setPos(mx+sx*(WT/2+0.015),ty+th/2,tz));
      //墙檐
      b3.add(box(WT+0.08,0.04,tw+0.06,T()).setPos(mx,ty+th+0.02,tz));
      //压顶
      b3.add(box(WT+0.04,0.06,tw+0.03,T()).setPos(mx,ty+th+0.05,tz));
      //筒瓦排布
      for(let zz=tz-tw/2+0.08;zz<=tz+tw/2-0.08;zz+=0.1){
        b3.add(box(0.035,0.025,0.07,T()).setPos(mx,ty+th+0.1,zz));
      }
      
      b3.add(box(WT+0.06,0.015,tw+0.04,T()).setPos(mx,ty+th-0.01,tz));
      //瓦当+滴水
      for(let dz=-1;dz<=1;dz+=2){
        const ez=tz+dz*(tw/2);
        b3.add(box(0.05,0.045,0.015,T()).setPos(mx,ty+th+0.07,ez));
        b3.add(box(0.035,0.04,0.015,T()).setPos(mx,ty+th+0.02,ez+dz*0.015));
      }
    });

    //垂脊+吻兽+鹊尾翘角
    const t0=tiers[0]; const topH=rTop+t0[2];
    b3.add(box(WT+0.03,0.09,t0[1]-t0[0]-0.02,T()).setPos(mx,topH+0.12,(t0[1]+t0[0])/2));
    for(let dz=-1;dz<=1;dz+=2){
      const beast=new THREE.Group();
      beast.add(box(0.07,0.16,0.07,T()));                                            // 兽身
      beast.add(new THREE.Mesh(new THREE.ConeGeometry(0.045,0.13,4),T()).translateY(0.14));// 兽首
      beast.position.set(mx,topH+0.17,t0[dz>0?1:0]+dz*0.02); b3.add(beast);
    }
    for(let dz=-1;dz<=1;dz+=2){
      const ez=t0[dz>0?1:0]; const bt=new THREE.Group();
      bt.add(box(0.14,0.1,0.12,T()).translateY(0.05));
      const tail=box(0.07,0.35,0.05,T()); tail.rotation.x=dz*0.5; tail.position.set(0,0.25,dz*0.12); bt.add(tail);
      const tp=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.14,4),T()); tp.position.set(0,0.42,dz*0.15); tp.rotation.x=dz*0.35; bt.add(tp);
      bt.position.set(mx,topH+0.17,ez); b3.add(bt);
    }
  }
  b3.userData={name:'三叠式马头墙·双侧对称·完整构件',desc:'两侧山墙各3级垛阶沿屋面坡度对称跌落(高0.9→0.55→0.3m)。每阶：墙身+博风板+墙檐+压顶+筒瓦+滴水线+瓦当滴水。T0顶设垂脊+吻兽+鹊尾翘角。封火墙高出屋面0.5-0.9m——防火屏障。'};
  L.push(b3);

  //砖雕细部+木构门窗+剥落旧化质感
  const b4=new THREE.Group();
  for(let sx=-1;sx<=1;sx+=2){
    const mx=sx*(BW/2+WT/2);
    b4.add(box(0.025,0.3,0.18,T()).setPos(mx+sx*(WT/2+0.015),rTop+tiers[0][2]-0.25,tiers[0][0]+0.05));
    for(let i=0;i<3;i++){
      const patch=box(0.2+Math.random()*0.3,0.15+Math.random()*0.2,0.005,mColor('#b0a898',0.35));
      patch.position.set(mx+sx*WT,WH*0.3+Math.random()*WH*0.5,(Math.random()-0.5)*BD); b4.add(patch);
    }
  }
  //前墙正门
  const doorH=2.4, doorW=1.2, doorBot=gY+0.42; 
  const doorG=new THREE.Group();
  doorG.add(box(doorW,doorH,0.04,B()).translateY(doorBot+doorH/2));          // 双扇木门
  doorG.add(box(doorW+0.2,0.14,0.1,B()).translateY(doorBot+doorH+0.07));     // 门楣
  for(let dx=-1;dx<=1;dx+=2){
    doorG.add(box(0.06,doorH,0.06,B()).setPos(dx*doorW/2,doorBot+doorH/2,0));// 左右门框
  }
  
  for(let dx=-1;dx<=1;dx+=2){ doorG.add(box(0.06,0.06,0.06,B()).setPos(dx*0.3,doorBot+doorH+0.2,0.04)); }
  doorG.position.set(0,0,BD/2); b4.add(doorG);

  //木棂窗
  function makeWindow(w,h,d) {
    const g=new THREE.Group();
    g.add(box(w,h,d,B())); //窗框外框
    g.add(box(w-0.06,0.04,d+0.01,B()).translateY(h/2-0.15)); //上横棂
    g.add(box(w-0.06,0.04,d+0.01,B()).translateY(-h/2+0.15));//下横棂
    g.add(box(0.04,h-0.06,d+0.01,B()));                       //中竖棂
    for(let sx=-1;sx<=1;sx+=2){ g.add(box(0.04,h-0.06,d+0.01,B()).translateX(sx*w*0.22)); }// 侧竖棂
    return g;
  }
  const winW=0.5, winH=0.65, winY=1.7+gY; //窗高1.7m(徽派高小窗)
  //前立面(+Z):门两侧各一窗
  for(let sx=-1;sx<=1;sx+=2){
    const w1=makeWindow(winW,winH,0.03); w1.position.set(sx*1.6,winY,BD/2); b4.add(w1);
  }
  //后立面(-Z):三窗均匀分布
  for(let x=-1.5;x<=1.5;x+=1.5){
    const w2=makeWindow(winW,winH,0.03); w2.position.set(x,winY,-BD/2); b4.add(w2);
  }
  //左右立面(±X):各两窗
  for(let sx=-1;sx<=1;sx+=2){
    for(let z=-1.2;z<=1.2;z+=1.2){
      const w3=makeWindow(winW,winH,0.03); w3.rotation.y=Math.PI/2; w3.position.set(sx*BW/2,winY,z); b4.add(w3);
    }
  }
  b4.userData={name:'木棂门窗·四面均匀对称',desc:'前立面居中木门(双扇·带框楣·门簪)。四面高小窗带十字木棂格——徽派外墙开窗小而高，防盗引导气流。后立面3窗、东西各2窗，均匀对称分布。'};
  L.push(b4);

  return {layers:L, centerY:2.0};
}

//场景控制器
const builders={taihedian:buildTaihedian,qianqinggong:buildQianqinggong,siheyuan:buildSiheyuan,huipai:buildHuipai,zhaozhouqiao:buildZhaozhouqiao,lugouqiao:buildLugouqiao};
let state=null;

function cleanup3D(){
  if(!state)return; cancelAnimationFrame(state.animId); state.ro?.disconnect();
  state.controls?.dispose();
  if(state.scene){ state.scene.traverse(o=>{ if(o.geometry&&o!==o.parent?.geometry)o.geometry.dispose(); if(o.material){ if(Array.isArray(o.material))o.material.forEach(m=>m.dispose()); else o.material.dispose(); }}); }
  state.renderer?.dispose(); state.renderer?.domElement?.parentNode?.removeChild(state.renderer.domElement); state=null;
}

function init3DDeconstruct(buildingId){
  const modal=document.getElementById('modal'),content=document.getElementById('modal-content'); if(!modal||!content)return;
  const builder=builders[buildingId]; if(!builder)return;
  const bdata=window.buildingData?.[buildingId],name=bdata?.name||buildingId;
  cleanup3D();

  content.innerHTML=`
    <h2 style="margin-bottom:6px;color:#1f1b17;border-bottom:3px solid #d4af37;padding-bottom:8px;font-size:1.55rem;">${name} · 3D结构拆解</h2>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:0.78rem;color:#999;">
      <span><i class="fas fa-mouse"></i>拖拽旋转</span><span><i class="fas fa-search-plus"></i>滚轮缩放</span><span><i class="fas fa-arrows-alt"></i>右键平移</span><span><i class="fas fa-hand-pointer"></i>点击构件</span>
    </div>
    <div id="three-toolbar" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
      <button class="three-tool-btn active" data-action="autoRotate"><i class="fas fa-sync-alt"></i>自动旋转</button>
      <button class="three-tool-btn" data-action="wireframe"><i class="fas fa-border-all"></i>线框透视</button>
      <button class="three-tool-btn" data-action="section"><i class="fas fa-cut"></i>剖面模式</button>
      <button class="three-tool-btn" data-action="resetView"><i class="fas fa-home"></i>重置视角</button>
      <button class="three-tool-btn" data-action="topView"><i class="fas fa-arrow-down"></i>俯视</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <div id="three-container" style="flex:2.5;min-width:320px;height:480px;background:radial-gradient(ellipse at center,#f8f5ec,#e8e0d0);border-radius:12px;position:relative;overflow:hidden;border:1px solid #d8d0c0;cursor:grab;"></div>
      <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:8px;">
        <div id="three-layer-list" style="background:#f5f2ec;border-radius:10px;padding:12px;flex:1;overflow-y:auto;max-height:370px;font-size:0.8rem;"></div>
        <div id="three-info-panel" style="background:#fff;border-left:4px solid #d4af37;padding:10px 12px;border-radius:0 8px 8px 0;min-height:65px;font-size:0.8rem;line-height:1.6;color:#555;transition:opacity 0.2s;"></div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;">
      <span style="color:#666;font-size:0.8rem;"><i class="fas fa-expand-alt"></i>分离</span>
      <input type="range" id="three-explode" min="0" max="100" value="10" style="flex:1;min-width:120px;accent-color:#d4af37;">
      <span id="three-explode-val" style="color:#d4af37;font-weight:600;font-size:0.85rem;">10%</span>
      <button class="modal-btn" onclick="window._explodeAll?.()" style="padding:6px 12px;font-size:0.72rem;margin:0;">全部分离</button>
      <button class="modal-btn" onclick="window._assembleAll?.()" style="padding:6px 12px;font-size:0.72rem;margin:0;">全部合拢</button>
    </div>
    <div class="modal-interactive" style="margin-top:12px;">
      <button class="modal-btn gold-btn" onclick="openVideo('${buildingId}')"><i class="fas fa-video"></i>讲解视频</button>
      <button class="modal-btn" onclick="openDetail('${buildingId}')" style="background:linear-gradient(135deg,#555,#333)"><i class="fas fa-arrow-left"></i>返回详情</button>
      <button class="modal-btn" onclick="closeDetail()" style="background:linear-gradient(135deg,#c0392b,#e74c3c)"><i class="fas fa-times"></i>关闭</button>
    </div>`;
  modal.style.display='flex'; document.body.style.overflow='hidden';
  setTimeout(()=>setupScene(buildingId,builder),60);
}

function setupScene(buildingId,builder){
  const container=document.getElementById('three-container'); if(!container)return;
  const {layers,centerY}=builder(),W=container.clientWidth,H=container.clientHeight;
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#e8e0d0'); scene.fog=new THREE.Fog('#e8e0d0',14,42);
  const camera=new THREE.PerspectiveCamera(40,W/H,0.5,80);
  const cp=[8,centerY+3,10]; if(buildingId.includes('siheyuan')){cp[0]=10;cp[1]=7;cp[2]=10;} if(buildingId.includes('qiao')){cp[0]=10;cp[1]=5;cp[2]=10;}
  camera.position.set(...cp); camera.lookAt(0,centerY,0);
  const defTarget=new THREE.Vector3(0,centerY,0),defCam=camera.position.clone();

  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight('#fff8f0',1.3));
  const sun=new THREE.DirectionalLight('#fffef8',3.2); sun.position.set(8,14,6); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.near=0.3; sun.shadow.camera.far=50; sun.shadow.camera.left=-12; sun.shadow.camera.right=12; sun.shadow.camera.top=12; sun.shadow.camera.bottom=-12; sun.shadow.bias=-0.0002; scene.add(sun);
  scene.add((()=>{const l=new THREE.DirectionalLight('#ffe8d0',0.7); l.position.set(-4,5,-3); return l;})());

  const layerWrappers=[],layerMeta=[],allClickable=[];
  const controls=new OrbitControls(camera,renderer.domElement); controls.target.copy(defTarget); controls.enableDamping=true; controls.dampingFactor=0.08;
  controls.minDistance=3; controls.maxDistance=24; controls.maxPolarAngle=Math.PI*0.78; controls.autoRotate=true; controls.autoRotateSpeed=0.5; controls.update();

  layers.forEach((lg,i)=>{
    const wrap=new THREE.Group(); wrap.add(lg); scene.add(wrap); layerWrappers.push(wrap);
    layerMeta.push({name:lg.userData?.name||`层${i}`,desc:lg.userData?.desc||''});
    lg.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;c.userData.layerIdx=i;allClickable.push(c);}});
  });

  //工具栏
  let wireframeMode=false, sectionMode=false;
  const clipPlane=new THREE.Plane(new THREE.Vector3(-1,0,0),0.05);
  const capPlaneMesh=(()=>{
    const geo=new THREE.PlaneGeometry(20,15);
    const mesh=new THREE.Mesh(geo,mCapPlane()); mesh.rotation.y=Math.PI/2; mesh.position.x=0.05;
    mesh.visible=false; scene.add(mesh); return mesh;
  })();
  renderer.localClippingEnabled=true;

  function applySection(on){
    sectionMode=on; capPlaneMesh.visible=on;
    allClickable.forEach(m=>{
      const mat=m.material; mat.clippingPlanes=on?[clipPlane]:null; mat.needsUpdate=true;
    });
  }
  function toggleWF(on){
    wireframeMode=on; allClickable.forEach(m=>{
      if(on){ if(!m.userData._oMat)m.userData._oMat=m.material; const w=m.material.clone(); w.wireframe=true; w.opacity=0.5; w.transparent=true; w.clippingPlanes=sectionMode?[clipPlane]:null; m.material=w; }
      else{ if(m.userData._oMat){m.material.dispose();m.material=m.userData._oMat;m.userData._oMat=null;m.material.clippingPlanes=sectionMode?[clipPlane]:null;m.material.needsUpdate=true;} }
    });
  }
  document.getElementById('three-toolbar')?.addEventListener('click',e=>{
    const btn=e.target.closest('.three-tool-btn'); if(!btn)return; const a=btn.dataset.action;
    if(a==='autoRotate'){controls.autoRotate=!controls.autoRotate;btn.classList.toggle('active',controls.autoRotate);}
    else if(a==='wireframe'){toggleWF(!wireframeMode);btn.classList.toggle('active',wireframeMode);}
    else if(a==='section'){applySection(!sectionMode);btn.classList.toggle('active',sectionMode);}
    else if(a==='resetView'){camera.position.copy(defCam);controls.target.copy(defTarget);controls.update();}
    else if(a==='topView'){camera.position.set(defTarget.x,defTarget.y+10,defTarget.z+0.5);controls.target.copy(defTarget);controls.update();}
  });

  
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(); let selIdx=-1;
  function onDown(e){
    const r=renderer.domElement.getBoundingClientRect(); mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    raycaster.setFromCamera(mouse,camera); const hits=raycaster.intersectObjects(allClickable,false);
    if(hits.length>0){const idx=hits[0].object.userData.layerIdx; if(idx!==undefined)selectLayer(idx);}
  }
  renderer.domElement.addEventListener('pointerdown',onDown);

  function selectLayer(idx){ selIdx=idx;
    allClickable.forEach(m=>{
      if(m.userData._selOrig){ m.material=m.userData._selOrig; m.userData._selOrig=null; }
      m.userData._hlW=null;
    });
    allClickable.forEach(m=>{
      if(m.userData.layerIdx===idx){
        m.userData._selOrig=m.material;
        const hl=m.material.clone(); hl.emissive=new THREE.Color('#d4af37'); hl.emissiveIntensity=0.6;
        m.material=hl; m.userData._hlW=hl;
      }
    });
    updateLayerList(idx); updateInfo(layerMeta[idx]);
  }
  function updateLayerList(ai){ const el=document.getElementById('three-layer-list'); if(!el)return;
    el.innerHTML=layerMeta.map((m,i)=>`<div class="three-layer-item${i===ai?' active':''}" data-idx="${i}" style="padding:7px 10px;margin-bottom:2px;border-radius:6px;cursor:pointer;transition:all 0.2s;${i===ai?'background:linear-gradient(135deg,#d4af37,#e4c16f);color:#111;font-weight:600;':'background:#fff;color:#555;border:1px solid #e8e0d0;'}">${m.name}</div>`).join('');
    el.querySelectorAll('.three-layer-item').forEach(it=>it.addEventListener('click',()=>selectLayer(parseInt(it.dataset.idx))));
  }
  function updateInfo(m){ const p=document.getElementById('three-info-panel'); if(!p)return; p.style.opacity='0'; setTimeout(()=>{p.innerHTML=`<div style="font-weight:700;color:#8b5a2b;margin-bottom:3px;">${m.name}</div><div>${m.desc}</div>`;p.style.opacity='1';},120); }

  let explodeVal=10; const slider=document.getElementById('three-explode'),valEl=document.getElementById('three-explode-val');
  function applyExplode(v){ explodeVal=v; const mo=buildingId.includes('qiao')?3:5; layerWrappers.forEach((w,i)=>{w.position.y=(i/Math.max(layerWrappers.length-1,1))*(v/100)*mo;}); if(valEl)valEl.textContent=v+'%'; if(slider&&parseInt(slider.value)!==v)slider.value=v; }
  slider?.addEventListener('input',()=>applyExplode(parseInt(slider.value)));
  window._explodeAll=()=>applyExplode(100); window._assembleAll=()=>applyExplode(0);
  applyExplode(10); updateLayerList(0); if(layerMeta[0])updateInfo(layerMeta[0]);

  function animate(){ state.animId=requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); }
  const ro=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight; if(w>0&&h>0){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}}); ro.observe(container);
  state={scene,camera,renderer,controls,animId:0,ro,onPointerDown:onDown,layerWrappers,layerMeta,allClickable,cleanup(){
    cancelAnimationFrame(state.animId); ro.disconnect(); controls.dispose(); renderer.domElement.removeEventListener('pointerdown',onDown);
    allClickable.forEach(m=>{if(m.userData._oMat)m.userData._oMat.dispose();if(m.userData._hlW)m.userData._hlW.dispose();if(m.userData._selOrig&&m.userData._selOrig!==m.material)m.userData._selOrig.dispose();m.material?.dispose?.();m.geometry?.dispose?.();});
    scene.traverse(o=>{if(o!==scene&&o.geometry&&o!==o.parent?.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(x=>x.dispose());else o.material.dispose();}});
    renderer.dispose(); renderer.domElement?.parentNode?.removeChild(renderer.domElement);
  }};
  state.animId=requestAnimationFrame(animate);
}

//3D榫卯拼装·直榫
function init3DSunmao(){
  const modal=document.getElementById('modal'),content=document.getElementById('modal-content'); if(!modal||!content)return; cleanup3D();
  content.innerHTML=`
    <h2 style="margin-bottom:2px;color:#1f1b17;border-bottom:3px solid #d4af37;padding-bottom:5px;font-size:1.35rem;"><i class="fas fa-puzzle-piece"></i> 榫卯拼装·直榫（平榫）·1:1硬木工艺</h2>
    <p style="color:#888;margin-bottom:3px;font-size:0.76rem;">🖱旋转观察 | 拖拽<b style="color:#8b4513;">榫头件</b>沿X轴滑入<b style="color:#5a3020;">榫眼件</b> | 榫肩与端面紧密贴合·无钉咬合</p>
    <div id="three-game-container" style="width:100%;height:440px;background:radial-gradient(ellipse at center,#f5f0e8,#d8d0c0);border-radius:12px;position:relative;overflow:hidden;border:1px solid #d0c8b8;cursor:grab;"></div>
    <div id="game-msg" style="text-align:center;height:24px;margin-top:4px;font-size:0.9rem;color:#8b5a2b;font-weight:bold;"></div>
    <div style="text-align:center;margin-top:4px;display:flex;gap:6px;justify-content:center;">
      <button class="modal-btn gold-btn" onclick="window._resetSunmao?.()"><i class="fas fa-redo"></i>重新拼装</button>
      <button class="modal-btn" onclick="closeDetail()" style="background:linear-gradient(135deg,#555,#333)"><i class="fas fa-times"></i>关闭</button>
    </div>`;
  modal.style.display='flex'; document.body.style.overflow='hidden'; setTimeout(setupSunmao,60);
}
function setupSunmao(){
  const container=document.getElementById('three-game-container'); if(!container)return;
  const W=container.clientWidth,H=container.clientHeight,gY=0.32;
  const mHW=()=>new THREE.MeshStandardMaterial({color:0x8b5a3a,roughness:0.4,metalness:0.02});
  const mHWL=()=>new THREE.MeshStandardMaterial({color:0xa87858,roughness:0.35,metalness:0.02});
  const mEnd=()=>new THREE.MeshStandardMaterial({color:0x6b4030,roughness:0.55,metalness:0.02});
  const mGrain=()=>new THREE.MeshStandardMaterial({color:0x5a3020,roughness:0.55,metalness:0.02});
  const mGlow=()=>new THREE.MeshStandardMaterial({color:0xd4af37,roughness:0.2,metalness:0.3});
  const mTable2=()=>new THREE.MeshStandardMaterial({color:0xc8b898,roughness:0.5});

  const scene=new THREE.Scene(); scene.background=new THREE.Color('#e0d8c8');
  const camera=new THREE.PerspectiveCamera(42,W/H,0.3,30); camera.position.set(5,3.0,8); camera.lookAt(0,0.7,0);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight('#fff5ee',1.3));
  const key3=new THREE.DirectionalLight('#fffef8',3.0); key3.position.set(5,9,6); key3.castShadow=true; key3.shadow.mapSize.set(1024,1024); key3.shadow.bias=-0.0002; scene.add(key3);
  scene.add((()=>{const l=new THREE.DirectionalLight('#ffe8d8',0.5);l.position.set(-3,3,-3);return l;})());

  //木工作台
  const table3=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.5,0.4,32),mTable2()); table3.position.y=-0.22; table3.receiveShadow=true; scene.add(table3);

  const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(0,0.7,0); controls.enableDamping=true;
  controls.minDistance=3; controls.maxDistance=12; controls.maxPolarAngle=Math.PI*0.7; controls.autoRotate=true; controls.autoRotateSpeed=0.3; controls.update();

  const beamL=3.0,beamH=0.6,beamW=0.72;
  const tongL=0.48,tongH=0.42,tongW=0.5;
  const bodyL=2.0,bodyH=0.54,bodyW=0.68;
  const beamCY=beamH/2+gY;
  const joinX=0; //拼接面X

  //右侧·榫眼件
  const mCX=joinX+beamL/2;
  const mortiseG=new THREE.Group();
  mortiseG.add(box(beamL,beamH,beamW,mHW()).setPos(mCX,beamCY,0));
  for(let z=-beamW/2+0.07;z<=beamW/2-0.07;z+=0.09) mortiseG.add(box(beamL-0.1,0.008,0.015,mGrain()).setPos(mCX,beamCY*0.55,z));
  for(let z=-beamW/2+0.07;z<=beamW/2-0.07;z+=0.11) mortiseG.add(box(beamL-0.1,0.008,0.015,mGrain()).setPos(mCX,beamCY*1.45,z));
  for(let sx=-1;sx<=1;sx+=2) mortiseG.add(box(0.035,beamH,beamW,mEnd()).setPos(mCX+sx*beamL/2,beamCY,0));
  //卯眼
  mortiseG.add(box(tongL,tongH,tongW,mColor('#1a0800',0.9)).setPos(joinX+tongL/2,beamCY,0));
  for(let sy=-1;sy<=1;sy+=2) mortiseG.add(box(tongL,0.012,tongW,mEnd()).setPos(joinX+tongL/2,beamCY+sy*tongH/2,0));
  for(let sz=-1;sz<=1;sz+=2) mortiseG.add(box(tongL,tongH,0.012,mEnd()).setPos(joinX+tongL/2,beamCY,sz*tongW/2));
  
  const rimG2=new THREE.Group();
  rimG2.add(box(0.015,tongH+0.04,tongW+0.04,mHWL()).setPos(joinX,beamCY,0));
  rimG2.add(box(0.02,tongH,tongW,mColor('#1a0800',0.9)).setPos(joinX,beamCY,0));
  mortiseG.add(rimG2);
  scene.add(mortiseG);

  //左侧·榫头件
  const tenonRoot=new THREE.Group();
  tenonRoot.add(box(bodyL,bodyH,bodyW,mHWL()).setPos(0,beamCY,0));
  for(let z=-bodyW/2+0.06;z<=bodyW/2-0.06;z+=0.08) tenonRoot.add(box(bodyL-0.1,0.008,0.015,mGrain()).setPos(0,beamCY*0.55,z));
  //榫头
  tenonRoot.add(box(tongL,tongH,tongW,mHW()).setPos(bodyL/2+tongL/2,beamCY,0));
  //榫肩
  for(let sy=-1;sy<=1;sy+=2) tenonRoot.add(box(0.03,(bodyH-tongH)/2,bodyW,mEnd()).setPos(bodyL/2,beamCY+sy*(bodyH+tongH)/4,0));
  for(let sz=-1;sz<=1;sz+=2) tenonRoot.add(box(0.03,tongH,(bodyW-tongW)/2,mEnd()).setPos(bodyL/2,beamCY,sz*(bodyW+tongW)/4));
  //端面
  for(let sx=-1;sx<=1;sx+=2) tenonRoot.add(box(0.03,bodyH,bodyW,mEnd()).setPos(sx*bodyL/2,beamCY,0));
  //初始位置: 榫头右端面(bodyL/2+tongL)在joinX左侧
  tenonRoot.position.set(-bodyL-tongL-2.5,0,0);
  scene.add(tenonRoot);
  const targetRootX=joinX-bodyL/2;


  const ghosts=[];
  for(let z=-0.08;z<=0.08;z+=0.08) for(let y=-0.05;y<=0.05;y+=0.05){
    ghosts.push(new THREE.Mesh(new THREE.SphereGeometry(0.018,5,4),mGlow()));ghosts[ghosts.length-1].position.set(joinX,beamCY+y,z);scene.add(ghosts[ghosts.length-1]);
  }

  //拖拽:整体移动tenonRoot
  let dragging=false,gameWon=false;
  const dragPlane2=new THREE.Plane(new THREE.Vector3(0,1,0),-beamCY);
  const rc=new THREE.Raycaster(),ht2=new THREE.Vector3();
  function ndc(e){const r=renderer.domElement.getBoundingClientRect();return{x:((e.clientX-r.left)/r.width)*2-1,y:-((e.clientY-r.top)/r.height)*2+1};}
  renderer.domElement.addEventListener('pointerdown',e=>{
    if(gameWon)return;const {x,y}=ndc(e);rc.setFromCamera(new THREE.Vector2(x,y),camera);
    if(rc.intersectObjects(tenonRoot.children,true).length>0){dragging=true;controls.enabled=false;controls.autoRotate=false;renderer.domElement.style.cursor='grabbing';}
  });
  renderer.domElement.addEventListener('pointermove',e=>{
    if(!dragging)return;const {x,y}=ndc(e);rc.setFromCamera(new THREE.Vector2(x,y),camera);rc.ray.intersectPlane(dragPlane2,ht2);
    if(ht2){tenonRoot.position.x=THREE.MathUtils.clamp(ht2.x-bodyL/2,targetRootX-4,targetRootX+1);if(Math.abs(tenonRoot.position.x-targetRootX)<0.05&&!gameWon)win2();}
  });
  const onUp2=()=>{dragging=false;controls.enabled=true;if(!gameWon)controls.autoRotate=true;renderer.domElement.style.cursor='grab';};
  renderer.domElement.addEventListener('pointerup',onUp2);

  function win2(){
    gameWon=true;dragging=false;controls.enabled=true;renderer.domElement.style.cursor='default';
    const sx2=tenonRoot.position.x,t2=performance.now();
    function anim(t){const p=Math.min((t-t2)/220,1),e=1-Math.pow(1-p,3);tenonRoot.position.x=sx2+(targetRootX-sx2)*e;if(p<1)requestAnimationFrame(anim);else{
      tenonRoot.position.x=targetRootX;tenonRoot.children.forEach(c=>{if(c.isMesh){c.material=c.material.clone();c.material.emissive=new THREE.Color('#332200');c.material.emissiveIntensity=0.3;}});
    }}requestAnimationFrame(anim);
    for(let i=0;i<50;i++){const pp2=new THREE.Mesh(new THREE.SphereGeometry(0.025,4,3),mGlow());pp2.position.set(joinX,beamCY+(Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5);pp2.userData={_p:true,vel:new THREE.Vector3((Math.random()-0.5)*4,Math.random()*4+1,(Math.random()-0.5)*4),life:1.5};scene.add(pp2);}
    document.getElementById('game-msg')&&(document.getElementById('game-msg').innerHTML='严丝合缝·榫肩贴合·榫头嵌入卯眼——无钉咬合！');
    window.showToast?.('🏆 直榫完成·配合公差≤0.5mm');ghosts.forEach(d=>d.material.opacity=0);
  }
  window._resetSunmao=()=>{gameWon=false;tenonRoot.position.set(-bodyL-tongL-2.5,0,0);tenonRoot.children.forEach(c=>{if(c.isMesh&&c.material.emissive){c.material.emissive?.set(0x000000);c.material.emissiveIntensity=0;}});ghosts.forEach(d=>d.material.opacity=0.25);const m3=document.getElementById('game-msg');if(m3)m3.innerHTML='';controls.autoRotate=true;};

  function animate(){requestAnimationFrame(animate);controls.update();
    scene.children.forEach(c=>{if(c.userData?._p){c.position.add(c.userData.vel.clone().multiplyScalar(0.025));c.userData.vel.y-=0.03;c.userData.life-=0.016;c.material.opacity=Math.max(0,c.userData.life/2);if(c.userData.life<=0){scene.remove(c);c.geometry.dispose();c.material.dispose();}}});
    renderer.render(scene,camera);}
  state={scene,camera,renderer,controls,animId:0,ro:new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;if(w>0&&h>0){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}}),cleanup(){cancelAnimationFrame(state.animId);state.ro.disconnect();controls.dispose();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});renderer.dispose();renderer.domElement?.parentNode?.removeChild(renderer.domElement);}};
  state.ro.observe(container);state.animId=requestAnimationFrame(animate);
}

//3D斗拱拆解·宋式柱头铺作·营造法式
// 斗件(斗耳:斗腰:斗底=2:1:2, 斗耳高=总高2/5, 斗底内收)
function makeSongDou(s,matFn){
  const g=new THREE.Group();
  const H=s*0.45, earH=H*0.4, waistH=H*0.2, baseH=H*0.4;
  const topW=s*0.52, midW=s*0.43, botW=s*0.55;
  //斗底
  const baseShape=new THREE.Shape(); baseShape.moveTo(-botW/2,0);baseShape.lineTo(botW/2,0);baseShape.lineTo(midW/2,baseH);baseShape.lineTo(-midW/2,baseH);baseShape.closePath();
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(baseShape,{depth:s*0.5,bevelEnabled:false}),matFn()).setPos(0,0,-s*0.25));
  //斗腰
  g.add(box(midW,waistH,s*0.5,matFn()).setPos(0,baseH+waistH/2,0));
  //斗耳
  const earG=new THREE.Group();
  earG.add(box(topW,earH,s*0.5,matFn()).setPos(0,earH/2,0));
  //十字槽口
  earG.add(box(s*0.3,earH*0.45,0.05,mColor('#3a2810',0.8)).setPos(0,earH*0.25,0)); // 横向槽
  earG.add(box(0.05,earH*0.45,s*0.3,mColor('#3a2810',0.8)).setPos(0,earH*0.25,0)); // 纵向槽
  earG.position.y=baseH+waistH; g.add(earG);
  return g;
}
//拱件
function makeSongGong(len,matFn,depth){
  const shape=new THREE.Shape();
  const hw=len/2, h=0.28;
  shape.moveTo(-hw,0); shape.lineTo(hw,0);
  shape.bezierCurveTo(hw-0.08,h*0.3,hw-0.12,h*0.65,hw-0.2,h*0.9);
  shape.lineTo(hw*0.08,h); shape.lineTo(-hw*0.08,h);
  shape.bezierCurveTo(-hw+0.2,h*0.9,-hw+0.12,h*0.65,-hw+0.08,h*0.3);
  return new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:depth||0.18,bevelEnabled:false}),matFn());
}
//昂
function makeSongAng(len,matFn){
  const g=new THREE.Group();
  g.add(box(len,0.08,0.18,matFn())); //昂身
  //昂嘴
  const mouth=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.15,4),matFn()); mouth.rotation.z=-0.3; mouth.position.set(-len/2+0.05,0,0); g.add(mouth);
  return g;
}

function init3DDougong(){
  const modal=document.getElementById('modal'),content=document.getElementById('modal-content'); if(!modal||!content)return; cleanup3D();
  content.innerHTML=`
    <h2 style="margin-bottom:2px;color:#1f1b17;border-bottom:3px solid #d4af37;padding-bottom:5px;font-size:1.35rem;"><i class="fas fa-cubes"></i> 斗拱拆解·宋式柱头铺作·《营造法式》</h2>
    <p style="color:#888;margin-bottom:3px;font-size:0.76rem;">🖱旋转观察 | <b>从上往下</b>点击构件逐层拆除 | 右侧面板显示构件详情与力学逻辑</p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      <div id="three-game-container" style="flex:2.5;min-width:300px;height:440px;background:radial-gradient(ellipse at center,#f5f0e8,#d8d0c0);border-radius:12px;position:relative;overflow:hidden;border:1px solid #d0c8b8;cursor:pointer;"></div>
      <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:5px;">
        <div id="dg-pieces-panel" style="background:#f5f2ec;border-radius:10px;padding:10px;flex:1;overflow-y:auto;max-height:330px;font-size:0.76rem;"></div>
        <div id="dg-info-box" style="background:#fff;border-left:4px solid #d4af37;padding:8px 10px;border-radius:0 8px 8px 0;min-height:55px;font-size:0.76rem;line-height:1.5;color:#555;transition:all 0.2s;"></div>
      </div>
    </div>
    <div id="dg-msg" style="text-align:center;height:22px;margin-top:4px;font-size:0.85rem;color:#666;"></div>
    <div style="text-align:center;margin-top:3px;">
      <button class="modal-btn gold-btn" onclick="window._resetDougong?.()"><i class="fas fa-hammer"></i>修复复原</button>
      <button class="modal-btn" onclick="closeDetail()" style="background:linear-gradient(135deg,#555,#333)"><i class="fas fa-times"></i>关闭</button>
    </div>`;
  modal.style.display='flex'; document.body.style.overflow='hidden'; setTimeout(setupDougong,60);
}
function setupDougong(){
  const container=document.getElementById('three-game-container'); if(!container)return;
  const W=container.clientWidth,H=container.clientHeight, gY=0.1;
  const mWood2=()=>new THREE.MeshStandardMaterial({color:0x9b6a3a,roughness:0.45});
  const mWoodL2=()=>new THREE.MeshStandardMaterial({color:0xb08050,roughness:0.4});
  const mWoodD2=()=>new THREE.MeshStandardMaterial({color:0x6b3a20,roughness:0.5});

  const scene=new THREE.Scene(); scene.background=new THREE.Color('#e0d8c8'); scene.fog=new THREE.Fog('#e0d8c8',5,18);
  const camera=new THREE.PerspectiveCamera(38,W/H,0.3,25); camera.position.set(3.5,3.2,7); camera.lookAt(0,2.0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight('#fff5ee',1.3));
  const key2=new THREE.DirectionalLight('#fffef8',3.0); key2.position.set(5,9,6); key2.castShadow=true; key2.shadow.mapSize.set(1024,1024); key2.shadow.bias=-0.0003; scene.add(key2);
  scene.add((()=>{const l=new THREE.DirectionalLight('#ffe8d8',0.5);l.position.set(-3,3,-2);return l;})());
  const floor3=new THREE.Mesh(new THREE.CylinderGeometry(3.0,3.2,0.25,32),mColor('#d0c4b0',0.5)); floor3.position.y=-0.15; floor3.receiveShadow=true; scene.add(floor3);

  const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(0,2.0,0); controls.enableDamping=true; controls.dampingFactor=0.1; controls.minDistance=2.5; controls.maxDistance=9; controls.maxPolarAngle=Math.PI*0.7; controls.autoRotate=true; controls.autoRotateSpeed=0.4; controls.update();

  // 立柱+柱础
  const col2=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,1.5,16),mWoodD2()); col2.position.y=0.75+gY; col2.castShadow=true; scene.add(col2);
  const colB2=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.38,0.16,16),mStone()); colB2.position.y=0.06+gY; colB2.castShadow=true; scene.add(colB2);

  const pieces=[];
  function addP(mesh,name,desc){
    mesh.castShadow=true; mesh.receiveShadow=true;
    mesh.userData={name,desc,removed:false,origY:mesh.position.y,origPos:mesh.position.clone(),origRot:mesh.rotation.clone()};
    scene.add(mesh); pieces.push(mesh); return mesh;
  }

  //宋式柱头铺作构件
  const colTop=1.55+gY; //柱顶Y

  //L0:栌斗
  const luDou=makeSongDou(1.2,()=>mColor('#8b6a3a',0.35));
  luDou.position.set(0,colTop+0.22,0); addP(luDou,'栌斗(坐斗)·十字槽口','栌斗是整组斗拱的基础承座。斗耳:斗腰:斗底=2:1:2(《营造法式》标准比例)。斗耳开十字槽口——同时嵌华拱(纵)与泥道拱(横)。承接上层全部荷载·集中传递至柱身。');
  const ludouTop=colTop+0.45;

  //L1:泥道拱
  const niDao=makeSongGong(2.0,()=>mColor('#9b6a3a',0.33),0.2);
  niDao.position.set(0,ludouTop-0.02,0); addP(niDao,'泥道拱(横拱·面阔方向)','嵌入栌斗十字槽的横向拱件。拱身带宋式卷杀(三段曲线过渡)——拱端与散斗槽口完全匹配。将荷载沿横向均布传递至两侧散斗。');

  //L2:华拱
  const huaGong=makeSongGong(2.0,()=>mColor('#8b5a3a',0.33),0.19);
  huaGong.rotation.y=Math.PI/2; huaGong.position.set(0,ludouTop-0.04,0); addP(huaGong,'华拱(纵拱·出挑方向)','嵌入栌斗十字槽的纵向拱件。拱身带宋式卷杀——向外逐层出挑。每多一层华拱·屋檐多伸一段。华拱是斗拱"出踩"的核心构件。');

  //L3:散斗
  for(let dz=-1;dz<=1;dz+=2){
    const san=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.16,0.2),mWoodL2()); san.position.set(0,ludouTop+0.02,dz*0.9); addP(san,'散斗·小型轴承','安置在泥道拱两端。散斗接收上层横拱(瓜子拱)的荷载·传递给下层泥道拱。斗耳/斗腰/斗底比例精准·与拱件槽口完全对应。');
  }

  //L4:交互斗
  for(let dx=-1;dx<=1;dx+=2){
    const jiaoHu=makeSongDou(0.5,()=>mColor('#7a5528',0.33));
    jiaoHu.position.set(dx*0.95,ludouTop-0.01,0); addP(jiaoHu,'交互斗·十字承座','安置在华拱拱端。同时承托上方横拱(瓜子拱)与纵向耍头——十字槽使纵横两向构件紧密咬合互为锁定。');
  }

  //L5:瓜子拱+慢拱
  const guaZi=makeSongGong(1.5,()=>mColor('#a07050',0.32),0.18);
  guaZi.position.set(0,ludouTop+0.22,0); addP(guaZi,'瓜子拱(横拱·中层)','叠加在散斗之上的中层横拱。拱身略短于泥道拱——拱端搭在散斗槽口之上。宋式卷杀弧度流畅。');
  const manGong=makeSongGong(1.8,()=>mColor('#9b6040',0.32),0.17);
  manGong.position.set(0,ludouTop+0.4,0); addP(manGong,'慢拱(横拱·上层)','叠加在瓜子拱之上的更上层横拱。拱身略长——搭在瓜子拱的散斗之上。层层叠加的横拱将荷载均匀扩散至更宽的支撑范围。');

  //L6:耍头
  const shuaTou=makeSongGong(1.8,()=>mColor('#b08050',0.3),0.18);
  shuaTou.rotation.y=Math.PI/2; shuaTou.position.set(0,ludouTop+0.45,0); addP(shuaTou,'耍头·横向延伸','斗拱顶端横向构件——沿出挑方向延伸(与华拱同向)。耍头穿过交互斗十字槽·锁定纵横拱件——"耍头出头·压住斗口"·防止上层构件滑动松脱。');

  //L7:昂
  const ang2=makeSongAng(2.2,()=>mColor('#9b7040',0.32));
  ang2.position.set(0,ludouTop+0.55,0); ang2.rotation.z=-0.85; addP(ang2,'昂·斜撑构件(45°-60°)','斗拱最外层斜向悬挑构件。昂身从斗拱核心向外斜下方伸出(倾角约50°)——将垂直屋檐荷载沿昂身向内分解为水平分力传递至柱心。昂嘴(前端斜面)为宋式特征造型。"飞檐翘角"的结构基础。');

  pieces.reverse();
  updateDGPanel(pieces,-1);

  const raycaster=new THREE.Raycaster(),mouseV2=new THREE.Vector2(); let removedCount=0;

  //修复
  renderer.domElement.addEventListener('click',e=>{
    const rect=renderer.domElement.getBoundingClientRect();
    mouseV2.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouseV2, camera);

    const allClickable = [];
    pieces.forEach(p => {
      if (!p.userData.removed) {
        p.traverse(child => {
          if (child.isMesh) allClickable.push(child);
        });
      }
    });

    const hits = raycaster.intersectObjects(allClickable, false);
    if (!hits.length) return;

    let hitObject = hits[0].object;
    let targetPiece = null;
    while (hitObject) {
      const idx = pieces.indexOf(hitObject);
      if (idx !== -1 && !hitObject.userData.removed) {
        targetPiece = hitObject;
        break;
      }
      hitObject = hitObject.parent;
    }
    if (!targetPiece) return;

    //检查：必须从上往下拆
    const pieceIndex = pieces.indexOf(targetPiece);
    for (let i = 0; i < pieceIndex; i++) {
      if (!pieces[i].userData.removed) {
        const m = document.getElementById('dg-msg');
        if (m) {
          m.textContent = '⚠️请先拆除上层构件！从上往下逐层拆解。';
          m.style.color = '#e74c3c';
        }
        return;
      }
    }

    //执行拆除
    targetPiece.userData.removed = true;
    removedCount++;
    targetPiece.userData._fly = {
      tY: targetPiece.position.y + 4 + Math.random() * 2,
      tX: (Math.random() - 0.5) * 5,
      tZ: (Math.random() - 0.5) * 4,
      rX: (Math.random() - 0.5) * 0.05,
      rZ: (Math.random() - 0.5) * 0.05
    };

    //更新信息面板
    const ib = document.getElementById('dg-info-box');
    if (ib) {
      ib.innerHTML = `<div style="font-weight:700;color:#8b5a2b;margin-bottom:2px;"><i class="fas fa-cube"></i>${targetPiece.userData.name}</div><div>${targetPiece.userData.desc}</div>`;
    }
    updateDGPanel(pieces, pieceIndex);

    //提示文本
    const msgs = [
      '昂·斜撑拆除：屋檐悬挑支撑减弱⚠️',
      '耍头拆除：横向锁定失效⚠️',
      '慢拱拆除：上层横拱均力中断⚠️',
      '瓜子拱拆除：中层横拱传力路径断裂🔴',
      '交互斗拆除：十字咬合结构被破坏🔴',
      '散斗拆除：小型轴承支撑缺失🔴',
      '华拱拆除：纵向出挑结构受损💀',
      '泥道拱拆除：横向均力框架崩溃💀',
      '栌斗拆除：只剩立柱——这就是斗拱"层层传力·以柔克刚"的价值！💀'
    ];
    const m2 = document.getElementById('dg-msg');
    if (m2) {
      m2.style.color = removedCount >= pieces.length ? '#e74c3c' : '#d4af37';
      m2.textContent = msgs[Math.min(removedCount - 1, msgs.length - 1)] || '';
    }

    if (removedCount === pieces.length) {
      window.showToast?.('💡 核心原理：斗拱通过层层出挑将屋顶重量分散传递至立柱·每层都在减震缓冲——"墙倒屋不塌"！');
    }
  });

  function updateDGPanel(allP,ai){
    const el=document.getElementById('dg-pieces-panel'); if(!el)return;
    const rev=[...allP].reverse();
    el.innerHTML=rev.map(p=>{const oi=allP.indexOf(p),rm=p.userData.removed;return`<div style="padding:5px 8px;margin-bottom:1px;border-radius:4px;font-size:0.73rem;transition:all 0.2s;${rm?'background:#f0e0e0;color:#999;text-decoration:line-through;':(oi===ai?'background:linear-gradient(135deg,#d4af37,#e4c16f);color:#111;font-weight:600;':'background:#fff;color:#555;border:1px solid #e8e0d0;')}">${rm?'🗑':'◆'}${p.userData.name.split('(')[0]}</div>`;}).join('');
  }

  window._resetDougong=()=>{
    removedCount=0;
    pieces.forEach(p=>{
      p.userData.removed=false;
      p.userData._fly=null;
      p.position.copy(p.userData.origPos);
      p.rotation.copy(p.userData.origRot);
      if(!scene.children.includes(p)) scene.add(p);
    });
    const m2=document.getElementById('dg-msg');
    if(m2){m2.textContent='';m2.style.color='#666';}
    updateDGPanel(pieces,-1);
    const ib=document.getElementById('dg-info-box');
    if(ib) ib.innerHTML='<div style="color:#999;">点击构件开始拆解…</div>';
  };

  function animate(){
    requestAnimationFrame(animate);
    controls.update();
    pieces.forEach(p=>{
      const f=p.userData._fly;
      if(!f) return;
      p.position.x += (f.tX - p.position.x) * 0.07;
      p.position.y += (f.tY - p.position.y) * 0.07;
      p.position.z += (f.tZ - p.position.z) * 0.07;
      p.rotation.x += f.rX;
      p.rotation.z += f.rZ;
    });
    renderer.render(scene,camera);
  }

  state={
    scene,camera,renderer,controls,animId:0,
    ro:new ResizeObserver(()=>{
      const w=container.clientWidth,h=container.clientHeight;
      if(w>0&&h>0){
        camera.aspect=w/h;
        camera.updateProjectionMatrix();
        renderer.setSize(w,h);
      }
    }),
    cleanup(){
      cancelAnimationFrame(state.animId);
      state.ro.disconnect();
      controls.dispose();
      scene.traverse(o=>{
        if(o.geometry) o.geometry.dispose();
        if(o.material) o.material.dispose();
      });
      renderer.dispose();
      renderer.domElement?.parentNode?.removeChild(renderer.domElement);
    }
  };
  state.ro.observe(container);
  state.animId=requestAnimationFrame(animate);
}
window.init3DDeconstruct=init3DDeconstruct; window.cleanupThree=cleanup3D; window.init3DSunmao=init3DSunmao; window.init3DDougong=init3DDougong; window.buildingData=window.buildingData||{};
['closeDetail','openDetail','openVideo','openPanorama','openGame'].forEach(n=>{const o=window[n];if(o&&typeof o==='function')window[n]=function(...a){cleanup3D();return o.apply(this,a);};});

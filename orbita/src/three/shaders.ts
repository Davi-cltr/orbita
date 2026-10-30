// Ruído simplex 3D (Ashima Arts / Stefan Gustavson, licença MIT)
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){ v+=a*snoise(p); p*=2.03; a*=0.5; }
  return v;
}
// distância à célula mais próxima (crateras)
vec3 hash3(vec3 p){
  p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));
  return fract(sin(p)*43758.5453123);
}
float cells(vec3 p){
  vec3 i=floor(p); vec3 f=fract(p); float d=1.0;
  for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) for(int z=-1;z<=1;z++){
    vec3 g=vec3(float(x),float(y),float(z));
    vec3 o=hash3(i+g);
    d=min(d,length(g+o-f));
  }
  return d;
}
`

export const planetVertex = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormalView;
varying vec3 vViewDir;
void main(){
  vObj = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

export const planetFragment = /* glsl */ `
precision highp float;
uniform int uType;
uniform float uTime;
uniform vec3 uLight;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uReveal;
uniform float uDpr;
varying vec3 vObj;
varying vec3 vNormalView;
varying vec3 vViewDir;
${noise}

const vec3 VACUO = vec3(0.063,0.063,0.29);
const vec3 SOMBRA = vec3(0.13,0.12,0.45);
const vec3 POEIRA = vec3(0.945,0.925,1.0);
const vec3 NETUNO = vec3(0.286,0.827,0.902);
const vec3 SATURNO = vec3(1.0,0.788,0.29);
const vec3 FOGUETE = vec3(1.0,0.353,0.122);

vec3 terra(vec3 p){
  float n = fbm(p*1.35 + vec3(3.1,0.0,1.7));
  vec3 col = vec3(0.17,0.33,0.86);
  if(n > -0.08) col = vec3(0.13,0.27,0.76);
  if(n > 0.06) col = vec3(0.25,0.70,0.50);
  if(n > 0.06 && abs(p.y) < 0.38 && fbm(p*2.2) > 0.05) col = vec3(0.91,0.72,0.42);
  if(n > 0.30) col = vec3(0.17,0.55,0.42);
  if(abs(p.y) > 0.86 + 0.05*snoise(p*4.0)) col = POEIRA;
  float c = fbm(p*2.4 + vec3(uTime*0.025,0.0,uTime*0.015));
  if(c > 0.28) col = mix(col, POEIRA, 0.92);
  return col;
}
vec3 lua(vec3 p){
  float m = fbm(p*1.2 + 7.0);
  vec3 col = m > 0.08 ? vec3(0.56,0.54,0.72) : vec3(0.80,0.78,0.90);
  float c = cells(p*5.0);
  if(c < 0.20) col = mix(col, vec3(0.46,0.44,0.62), 0.9);
  if(c > 0.20 && c < 0.25) col = vec3(0.92,0.90,0.98);
  float c2 = cells(p*11.0 + 3.0);
  if(c2 < 0.16) col *= 0.82;
  return col;
}
vec3 marte(vec3 p){
  float n = fbm(p*1.6 + 11.0);
  vec3 col = vec3(0.82,0.27,0.16);
  if(n > -0.05) col = vec3(0.91,0.45,0.23);
  if(n > 0.22) col = vec3(0.98,0.62,0.33);
  if(n < -0.28) col = vec3(0.55,0.16,0.11);
  if(p.y > 0.90 + 0.04*snoise(p*5.0)) col = POEIRA;
  return col;
}
vec3 jupiter(vec3 p){
  float lat = p.y;
  float w = fbm(vec3(p.x*2.0, p.y*9.0, p.z*2.0) + vec3(uTime*0.02,0.0,0.0));
  float b = sin(lat*17.0 + w*1.8);
  vec3 col;
  if(b > 0.55) col = vec3(0.98,0.90,0.74);
  else if(b > 0.0) col = vec3(0.90,0.70,0.48);
  else if(b > -0.55) col = vec3(0.79,0.50,0.33);
  else col = vec3(0.62,0.33,0.24);
  // Grande Mancha Vermelha
  vec3 spotDir = normalize(vec3(0.85,-0.36,0.38));
  vec3 t1 = normalize(cross(vec3(0.0,1.0,0.0), spotDir));
  vec3 t2 = cross(spotDir, t1);
  vec3 d = p - spotDir;
  vec2 e = vec2(dot(d,t1)/0.28, dot(d,t2)/0.15);
  float r = length(e);
  if(r < 1.0) col = mix(vec3(0.80,0.27,0.16), vec3(0.93,0.45,0.27), step(0.55, fract(r*3.0 + atan(e.y,e.x)*0.25)));
  if(r > 1.0 && r < 1.18) col = vec3(0.98,0.90,0.74);
  return col;
}
vec3 saturno(vec3 p){
  float b = sin(p.y*14.0 + 0.6*fbm(vec3(p.x*1.5,p.y*6.0,p.z*1.5)));
  vec3 col;
  if(b > 0.5) col = vec3(0.99,0.87,0.58);
  else if(b > -0.1) col = vec3(0.95,0.76,0.42);
  else col = vec3(0.86,0.64,0.34);
  if(p.y > 0.88) col = vec3(0.80,0.70,0.45);
  return col;
}

vec3 thermal(float t){
  t = clamp(t,0.0,1.0);
  vec3 a = mix(vec3(0.10,0.08,0.55), NETUNO, smoothstep(0.0,0.4,t));
  a = mix(a, SATURNO, smoothstep(0.4,0.7,t));
  return mix(a, FOGUETE, smoothstep(0.7,1.0,t));
}

void main(){
  vec3 p = vObj;
  vec3 base;
  if(uType==0) base = terra(p);
  else if(uType==1) base = lua(p);
  else if(uType==2) base = marte(p);
  else if(uType==3) base = jupiter(p);
  else base = saturno(p);

  vec3 N = normalize(vNormalView);
  float lam = dot(N, normalize(uLight));

  // luz em degraus, como serigrafia
  vec3 col = base;
  if(lam < 0.32) col = mix(base, SOMBRA, 0.42);
  if(lam < -0.02) col = mix(base, SOMBRA, 0.78);
  // meio-tom na região de sombra
  float cell = 6.0 * uDpr;
  vec2 g = fract(gl_FragCoord.xy / cell) - 0.5;
  float dotR = clamp((0.36 - lam) * 0.9, 0.0, 0.48);
  if(lam < 0.36 && lam > -0.25 && length(g) < dotR) col = mix(col, SOMBRA, 0.55);

  // contorno de atmosfera
  float fres = pow(1.0 - max(dot(N, normalize(vViewDir)), 0.0), 3.0);
  vec3 atm = uType==2 ? FOGUETE : NETUNO;
  float atmK = (uType==1) ? 0.15 : 0.75;
  col = mix(col, atm, fres * atmK * smoothstep(-0.4, 0.4, lam + 0.3));

  // raio-x térmico em volta do cursor
  if(uReveal > 0.001){
    float d = distance(gl_FragCoord.xy, uMouse);
    float R = uRadius * uDpr;
    float inside = (1.0 - smoothstep(R - 1.5*uDpr, R, d)) * uReveal;
    float heat = fbm(p*2.2 + vec3(0.0, uTime*0.05, 0.0)) * 0.5 + 0.5;
    heat = floor(heat*7.0)/7.0;
    vec3 sc = thermal(heat);
    float lat = asin(clamp(p.y,-1.0,1.0));
    float lon = atan(p.z, p.x);
    float grid = step(0.94, fract(lat*6.0/3.14159*2.0)) + step(0.96, fract(lon*12.0/6.28318));
    sc = mix(sc, POEIRA, clamp(grid,0.0,1.0)*0.8);
    col = mix(col, sc, inside);
    float ring = (1.0 - smoothstep(0.0, 1.6*uDpr, abs(d - R))) * uReveal;
    col = mix(col, POEIRA, ring);
  }

  gl_FragColor = vec4(col, 1.0);
}
`

export const ringVertex = /* glsl */ `
varying vec2 vPos;
void main(){
  vPos = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`

export const ringFragment = /* glsl */ `
precision highp float;
uniform float uInner;
uniform float uOuter;
uniform float uOpacity;
varying vec2 vPos;
void main(){
  float r = (length(vPos) - uInner) / (uOuter - uInner);
  vec3 col = vec3(0.99,0.87,0.58);
  float a = 0.9;
  if(r < 0.18) { col = vec3(0.75,0.62,0.45); a = 0.45; }
  else if(r < 0.52) { col = vec3(0.99,0.88,0.62); a = 0.95; }
  else if(r < 0.58) { a = 0.08; }               // Divisão de Cassini
  else if(r < 0.86) { col = vec3(0.92,0.72,0.44); a = 0.85; }
  else { col = vec3(0.85,0.70,0.50); a = 0.4; }
  float fine = step(0.5, fract(r*38.0));
  col *= 0.9 + 0.1*fine;
  gl_FragColor = vec4(col, a * uOpacity);
}
`

export const starVertex = /* glsl */ `
attribute float aTail;
attribute float aSeed;
uniform float uTravel;
uniform float uWarp;
uniform float uTime;
uniform float uDpr;
varying float vAlpha;
void main(){
  vec3 p = position;
  p.z = mod(p.z + uTravel + 60.0, 64.0) - 60.0;
  p.z -= aTail * uWarp * 9.0;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.6 + 0.4*sin(uTime*1.7 + aSeed*40.0);
  vAlpha = smoothstep(-60.0, -40.0, p.z) * tw * (1.0 - aTail*0.85);
  gl_PointSize = (1.2 + aSeed*1.8) * uDpr * (8.0 / -mv.z + 0.35);
}
`

export const starFragment = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main(){
  gl_FragColor = vec4(uColor, vAlpha * uOpacity);
}
`

/**
 * Fundo do hero em WebGL2, adaptado do shader "ATC" (pacote de animações do projeto).
 * Mantém o cálculo original, mas renderiza em baixa resolução (blocos de 5 px, ampliados
 * com image-rendering: pixelated) e converte para monocromático verde com pontilhado
 * ordenado, para casar com a estética de terminal. A rolagem avança o tempo da cena.
 * Pausa fora da tela; com prefers-reduced-motion desenha um único quadro.
 * Retorna false se não houver WebGL2, para o chamador usar o fundo de caracteres.
 */

const VERTICES = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENTOS = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_res;
uniform float u_time;

float tanh1(float x){ float e = exp(2.0 * x); return (e - 1.0) / (e + 1.0); }

float bayer(vec2 p){
  vec2 q = mod(floor(p), 2.0);
  return (q.x * 2.0 + q.y * 3.0 - 4.0 * q.x * q.y) / 4.0;
}

void main(){
  vec3 FC = vec3(gl_FragCoord.xy, 0.0);
  vec3 r = vec3(u_res, max(u_res.x, u_res.y));
  float t = u_time;
  vec4 o = vec4(0.0);
  vec3 p = vec3(0.0);
  vec3 v = vec3(1.0, 2.0, 6.0);
  float i = 0.0, z = 1.0, d = 1.0, f = 1.0;

  for ( ; i++ < 5e1; o.rgb += (cos((p.x + z + v) * 0.1) + 1.0) / d / f / z ) {
    p = z * normalize(FC * 2.0 - r.xyy);
    vec4 m = cos((p + sin(p)).y * 0.4 + vec4(0.0, 33.0, 11.0, 0.0));
    p.xz = mat2(m) * p.xz;
    p.x += t / 0.2;
    z += (d = length(cos(p / v) * v + v.zxx / 7.0) / (f = 2.0 + d / exp(p.y * 0.2)));
  }

  float lum = tanh1(0.2 * dot(o.rgb, vec3(0.3, 0.59, 0.11)));
  // Quatro níveis com pontilhado: fundo, verde escuro, verde médio, acento atenuado.
  float nivel = floor(clamp(lum * 3.2 + bayer(gl_FragCoord.xy) - 0.5, 0.0, 3.0));
  vec3 fundo = vec3(0.039);
  vec3 acento = vec3(0.667, 1.0, 0.0);
  vec3 cor = mix(fundo, acento, nivel / 3.0 * 0.42);
  fragColor = vec4(cor, 1.0);
}`;

const BLOCO = 5;

export function iniciarShader(canvas: HTMLCanvasElement, area: HTMLElement): boolean {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, antialias: false });
  if (!gl) return false;

  const compilar = (tipo: number, fonte: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };

  let programa: WebGLProgram;
  try {
    programa = gl.createProgram()!;
    gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICES));
    gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTOS));
    gl.linkProgram(programa);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error('link');
  } catch {
    return false;
  }

  gl.useProgram(programa);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(programa, 'u_res');
  const uTime = gl.getUniformLocation(programa, 'u_time');

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visivel = true;
  let raf = 0;
  const inicio = performance.now();

  const ajustar = () => {
    const caixa = area.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(caixa.width / BLOCO));
    canvas.height = Math.max(1, Math.round(caixa.height / BLOCO));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };

  const desenhar = () => {
    const tempo = reduzir ? 4 : (performance.now() - inicio) / 1000 * 0.35 + scrollY * 0.004;
    gl.uniform1f(uTime, tempo);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const quadro = () => {
    desenhar();
    raf = requestAnimationFrame(quadro);
  };

  const controlar = () => {
    cancelAnimationFrame(raf);
    if (reduzir) desenhar();
    else if (visivel && !document.hidden) raf = requestAnimationFrame(quadro);
  };

  addEventListener('resize', () => {
    ajustar();
    desenhar();
  });
  document.addEventListener('visibilitychange', controlar);
  new IntersectionObserver((itens) => {
    visivel = itens.some((i) => i.isIntersecting);
    controlar();
  }).observe(area);

  ajustar();
  controlar();
  canvas.dataset.modo = 'shader';
  return true;
}

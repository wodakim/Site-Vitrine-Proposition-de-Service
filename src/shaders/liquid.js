
export const liquidVS = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;

    void main() {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        vVertexPosition = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

export const liquidFS = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;
    uniform sampler2D planeTexture;
    uniform float uAlpha;
    uniform float uTime;
    uniform float uSpeed; // Distortion strength

    void main() {
        vec2 uv = vTextureCoord;

        // Liquid Effect
        float wave = sin(uv.y * 10.0 + uTime * 0.05) * uSpeed * 0.02;
        uv.x += wave;

        vec4 color = texture2D(planeTexture, uv);
        gl_FragColor = vec4(color.rgb, color.a * uAlpha);
    }
`;

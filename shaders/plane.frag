#ifdef GL_ES
precision mediump float;
#endif

// standard curtains.js varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform sampler2D planeTexture; // The main image texture

// Custom uniform for opacity
uniform float uAlpha;

void main() {
    // get our texture coords
    vec2 textureCoord = vTextureCoord;

    // simple texture lookup
    vec4 color = texture2D(planeTexture, textureCoord);

    // Apply alpha to the final color
    gl_FragColor = vec4(color.rgb, color.a * uAlpha);
}

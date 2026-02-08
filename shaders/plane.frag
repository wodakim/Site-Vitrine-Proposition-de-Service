#ifdef GL_ES
precision mediump float;
#endif

// standard curtains.js varyings
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform sampler2D planeTexture; // The main image texture

void main() {
    // get our texture coords
    vec2 textureCoord = vTextureCoord;

    // simple texture lookup
    gl_FragColor = texture2D(planeTexture, textureCoord);
}

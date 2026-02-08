#ifdef GL_ES
precision mediump float;
#endif

// standard curtains.js attributes and uniforms
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform mat4 planeTextureMatrix;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

// custom uniforms
uniform float uTime;
uniform vec2 uMousePosition; // Normalized mouse position (-1 to 1)
uniform float uMouseStrength;

void main() {
    vec3 vertexPosition = aVertexPosition;

    // simple ripple effect based on mouse position

    // Clamp mouse position to avoid edge glitches (0 to 1 in texture space, but here we deal with vertex pos)
    // Actually uMousePosition from Curtains is in plane local coordinates (usually -1 to 1 or pixel values)
    // Curtains mouseToPlaneCoords returns values relative to the plane size.
    // Let's rely on JS to smooth it, but here we can clamp the distance influence

    // distance from vertex to mouse
    float distanceFromMouse = distance(uMousePosition, vec2(vertexPosition.x, vertexPosition.y));

    // wave effect
    float wave = sin(distanceFromMouse * 10.0 - uTime * 2.0) * uMouseStrength;

    // apply wave only close to mouse
    float influence = smoothstep(0.5, 0.0, distanceFromMouse);
    vertexPosition.z += wave * influence;

    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

    // varyings
    vVertexPosition = vertexPosition;
    vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
}

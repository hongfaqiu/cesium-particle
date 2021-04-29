varying float heightNormalization;

void main() {
    const vec4 white = vec4(0.0, 0.0, heightNormalization, 1.0);
    gl_FragColor = white;
}
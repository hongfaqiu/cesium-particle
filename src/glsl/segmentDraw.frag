varying float heightNormalization;
uniform sampler2D colorTable;

varying float speedNormalization;

void main() {
    gl_FragColor = texture2D(colorTable, vec2(heightNormalization, 0.0));
}
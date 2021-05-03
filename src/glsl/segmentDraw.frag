varying float heightNormalization;
uniform sampler2D colorTable;
uniform bool colour;

varying float speedNormalization;

void main() {
    if(colour){
      gl_FragColor = texture2D(colorTable, vec2(heightNormalization, 0.0));
    } else {
      gl_FragColor = texture2D(colorTable, vec2(speedNormalization, 0.0));
    }
}
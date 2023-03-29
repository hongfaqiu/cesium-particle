#version 300 es

in float heightNormalization;
uniform sampler2D colorTable;
uniform bool colour;

in float speedNormalization;

out vec4 fragColor;

void main() {
  const float zero = 0.0;
  if(speedNormalization > zero){
    if(colour){
      fragColor = texture(colorTable, vec2(heightNormalization, zero));
    } else {
      fragColor = texture(colorTable, vec2(speedNormalization, zero));
    }
  } else {
    fragColor = vec4(zero);
  }
}

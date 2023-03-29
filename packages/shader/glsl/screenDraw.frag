#version 300 es

uniform sampler2D trailsColorTexture;
uniform sampler2D trailsDepthTexture;

in vec2 textureCoordinate;
out vec4 fragColor;

void main() {
    vec4 trailsColor = texture(trailsColorTexture, textureCoordinate);
    float trailsDepth = texture(trailsDepthTexture, textureCoordinate).r;
    float globeDepth = czm_unpackDepth(texture(czm_globeDepthTexture, textureCoordinate));

    if (trailsDepth < globeDepth) {
        fragColor = trailsColor;
    } else {
        fragColor = vec4(0.0);
    }
}
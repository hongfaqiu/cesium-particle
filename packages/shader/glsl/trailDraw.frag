#version 300 es

precision highp float;

in vec2 textureCoordinate;

uniform sampler2D segmentsColorTexture;
uniform sampler2D segmentsDepthTexture;

uniform sampler2D currentTrailsColor;
uniform sampler2D trailsDepthTexture;

uniform float fadeOpacity;

out vec4 fragColor;
void main() {
    vec4 pointsColor = texture(segmentsColorTexture, textureCoordinate);
    vec4 trailsColor = texture(currentTrailsColor, textureCoordinate);
    trailsColor = floor(fadeOpacity * 255.0 * trailsColor) / 255.0; // make sure the trailsColor will be strictly decreased

    float pointsDepth = texture(segmentsDepthTexture, textureCoordinate).r;
    float trailsDepth = texture(trailsDepthTexture, textureCoordinate).r;
    float globeDepth = czm_unpackDepth(texture(czm_globeDepthTexture, textureCoordinate));
    fragColor = vec4(0.0);
    if (pointsDepth < globeDepth) {
        fragColor = fragColor + pointsColor;
    }
    if (trailsDepth < globeDepth) {
        fragColor = fragColor + trailsColor;
    }
    gl_FragDepth = min(pointsDepth, trailsDepth);
}

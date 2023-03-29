#version 300 es
precision highp float;

uniform sampler2D nextParticlesPosition;
uniform sampler2D particlesSpeed; // (u, v, w, norm)

uniform sampler2D H; // particles height textures

uniform vec3 dimension; // (lon, lat, lev)
uniform vec3 minimum; // minimum of each dimension
uniform vec3 maximum; // maximum of each dimension
uniform vec3 interval; // interval of each dimension

// range (min, max)
uniform vec2 lonRange;
uniform vec2 latRange;
uniform vec2 viewerLonRange;
uniform vec2 viewerLatRange;

const float randomCoefficient = 0.1; // use to improve the pseudo-random generator
const float dropRate = 0.1; // drop rate is a chance a particle will restart at random position to avoid degeneration
const float dropRateBump = 0.1;

in vec2 v_textureCoordinates;

vec2 mapPositionToNormalizedIndex2D(vec3 lonLatLev) {
    // ensure the range of longitude and latitude
    lonLatLev.x = clamp(lonLatLev.x, minimum.x, maximum.x);
    lonLatLev.y = clamp(lonLatLev.y,  minimum.y, maximum.y);
    lonLatLev.z = clamp(lonLatLev.z,  minimum.z, maximum.z);

    vec3 index3D = vec3(0.0);
    index3D.x = (lonLatLev.x - minimum.x) / interval.x;
    index3D.y = (lonLatLev.y - minimum.y) / interval.y;
    index3D.z = ceil((lonLatLev.z - minimum.z) / interval.z); 

    vec2 index2D = vec2(index3D.x, index3D.z * dimension.y + index3D.y);
    vec2 normalizedIndex2D = vec2(index2D.x / dimension.x, index2D.y / (dimension.y * dimension.z));
    return normalizedIndex2D;
}

vec4 getTextureValue(sampler2D componentTexture, vec3 lonLatLev) {
    vec2 normalizedIndex2D = mapPositionToNormalizedIndex2D(lonLatLev);
    vec4 result = texture(componentTexture, normalizedIndex2D);
    return result;
}

// pseudo-random generator
const vec3 randomConstants = vec3(12.9898, 78.233, 4375.85453);
const vec2 normalRange = vec2(0.0, 1.0);
float rand(vec2 seed, vec2 range) {
    vec2 randomSeed = randomCoefficient * seed;
    float temp = dot(randomConstants.xy, randomSeed);
    temp = fract(sin(temp) * (randomConstants.z + temp));
    return temp * (range.y - range.x) + range.x;
}

bool particleNoSpeed(vec3 particle) {
    vec4 speed = getTextureValue(particlesSpeed, particle);
    return speed.r == 0.0 && speed.g == 0.0;
}

vec3 generateRandomParticle(vec2 seed, float lev) {
    // ensure the longitude is in [0, 360]
    float randomLon = mod(rand(seed, lonRange), 360.0);
    float randomLat = rand(-seed, latRange);
    
    float height = getTextureValue(H, vec3(randomLon, randomLat, lev)).r;

    return vec3(randomLon, randomLat, height);
}

bool particleOutbound(vec3 particle) {
    return particle.y < viewerLatRange.x || particle.y > viewerLatRange.y || particle.x < viewerLonRange.x || particle.x > viewerLonRange.y;
}

out vec4 fragColor;

void main() {
    vec3 nextParticle = texture(nextParticlesPosition, v_textureCoordinates).rgb;
    vec4 nextSpeed = texture(particlesSpeed, v_textureCoordinates);
    float speedNorm = nextSpeed.a;
    float particleDropRate = dropRate + dropRateBump * speedNorm;

    vec2 seed1 = nextParticle.xy + v_textureCoordinates;
    vec2 seed2 = nextSpeed.xy + v_textureCoordinates;
    vec3 randomParticle = generateRandomParticle(seed1, nextParticle.z);
    float randomNumber = rand(seed2, normalRange);

    if (randomNumber < particleDropRate || particleOutbound(nextParticle)) {
        fragColor = vec4(randomParticle, 1.0); // 1.0 means this is a random particle
    } else {
        fragColor = vec4(nextParticle, 0.0);
    }
}

const CalculateSpeedShader = require('./glsl/calculateSpeed.frag');
const UpdatePositionShader = require('./glsl/updatePosition.frag');
const PostProcessingPositionShader = require('./glsl/postProcessingPosition.frag');
const segmentDrawVert = require('./glsl/segmentDraw.vert');
const fullscreenVert = require('./glsl/fullscreen.vert');
const screenDrawFrag = require('./glsl/screenDraw.frag');
const segmentDrawFrag = require('./glsl/segmentDraw.frag');
const trailDrawFrag = require('./glsl/trailDraw.frag');

export {
  CalculateSpeedShader,
  UpdatePositionShader,
  PostProcessingPositionShader,
  segmentDrawVert,
  fullscreenVert,
  screenDrawFrag,
  segmentDrawFrag,
  trailDrawFrag
};
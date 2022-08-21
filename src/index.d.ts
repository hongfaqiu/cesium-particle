import netcdfjs from 'netcdfjs';
import { BoundingSphere, Camera, Cartesian2, Scene, Viewer } from 'cesium';
import CustomPrimitive from './modules/customPrimitive';

/** 棋盘格值枚举 (lev, lat, lon) */
type DimensionValue = {
  array: Float32Array;
  max: number;
  min: number;
}

/** 纬度值枚举 */
type DimensionData = {
  array: Float32Array;
  min: number;
  max: number;
}

type JsonData = {
  /** 三种维度的值的间隔数量 */
  dimensions: {
      lon: number;
      lat: number;
      lev?: number;
  };
  /** 所有经度值 */
  lon: DimensionData;
  /** 所有纬度值 */
  lat: DimensionData;
  /** 所有高度分层 */
  lev?: DimensionData;
  /** 横向速度 */
  U: DimensionValue;
  /** 纵向速度 */
  V: DimensionValue;
  /** 垂直方向速度 */
  W?: DimensionValue;
  /** 高度值 */
  H?: DimensionValue;
}

/**
 * Particle system operating parameters
 * @param [maxParticles = 64 * 64] - Maximum number of particles.
 * @param [particleHeight = 1000.0] - Particle height.
 * @param [fadeOpacity = 0.996] - Particle trailing transparency.
 * @param [dropRate = 0.003] - Particle reset ratet.
 * @param [dropRateBump = 0.01] - The percentage of particle reset rate that increases with speed. The faster the speed, the denser it is,

  Final particle reset rate particledroprate = droprate + dropratebump * speednorm;.
 * @param [speedFactor = 1.0] - Particle relative velocity.
 * @param [lineWidth = 4.0] - Particle line width.
 * @param [dynamic = true] - Whether to run dynamically.
 */
type UserInput = {
  maxParticles?: number;
  particleHeight?: number;
  fadeOpacity?: number;
  dropRate?: number;
  dropRateBump?: number;
  speedFactor?: number;
  lineWidth?: number;
  dynamic?: boolean;
}

type OperatingParams = {
  particlesTextureSize: number;
  maxParticles: number;
  particleHeight: number;
  fadeOpacity: number;
  dropRate: number;
  dropRateBump: number;
  speedFactor: number;
  lineWidth: number;
  dynamic: boolean;
}

type NCFields = {
  U?: string;
  V?: string;
  W?: string;
  H?: string;
  lon?: string;
  lat?: string;
  lev?: string;
}

type ParticleSystemParams = {
  input: JsonData | Blob;
  type?: 'json' | 'file';
  fields?: NCFields;
  valueRange?: {
    min?: number;
    max?: number;
  }
  offset?: {
    lon?: number;
    lat?: number;
    lev?: number;
  }
  userInput?: UserInput;
  colorTable?: number[][];
  colour?: 'speed' | 'height';
}

export declare class Particle3D {
  /**
   * Create a Particle3D Object
   * @example
   * // load a JSON data 
   * new Particle3D(viewer, {
      input: jsonData,
      type: 'json', // 必填
      userInput: {
        maxParticles: 64 * 64,
        particleHeight: 1000.0,
        fadeOpacity: 0.996,
        dropRate: 0.003,
        dropRateBump: 0.01,
        speedFactor: 1.0,
        lineWidth: 4.0,
        dynamic: true
      },
      colorTable: [
        [0.015686,
        0.054902,
        0.847059],
        [0.125490,
        0.313725,
        1.000000]
      ],
      colour: 'height'
    });
   * @example
   * // load a NC file 
   * new Particle3D(viewer, {
      input: BolbFile("uv3z.nc"),
      fields: {
        U: 'water_u',
        V: 'water_v'
      }
    });
   * @param [viewer] - The cesium Viewer Object.
   * @param [options] - An object with the following properties:
   * @param [options.input] - Allow a NC file or organized particle system data.
   * @param [options.type = 'json'] - The input file's type, 'json' or 'file'.
   * @param [options.fields = defaultFields] - NC file field specification.
   * @param [options.valueRange = {min: -100, max: 100}] - UVWH dimension values range, out of range will be set to 0.
   * @param [options.offset = {lon: 0, lat: 0, lev: 0}] - lon/lat/lev dimension values offset.
   * @param [options.userInput = defaultParticleSystemOptions] - Particle system configuration item.
   * @param [options.colorTable = defaultColorTable] - Particle color ribbon.
   * @param [options.colour = 'speed'] - Particle coloring attribute.
   */
  constructor(viewer: Viewer, options: ParticleSystemParams);

  readonly viewer: Viewer;
  readonly scene: Scene;
  readonly camera: Camera;
  readonly input: JsonData | Blob;
  readonly type: 'json' | 'file';
  readonly fields: NCFields;
  readonly valueRange: {
    min?: number;
    max?: number;
  }
  readonly offset: {
    lon?: number;
    lat?: number;
    lev?: number;
  };;
  readonly userInput: UserInput;
  readonly colorTable: number[][][];
  readonly colour: 'speed' | 'height';
  readonly primitives: CustomPrimitive[];
  readonly viewerParameters: {
    lonRange: Cartesian2;
    latRange: Cartesian2;
    pixelSize: number;
    lonDisplayRange: Cartesian2;
    latDisplayRange: Cartesian2;
  };
  // use a smaller earth radius to make sure distance to camera > 0
  readonly globeBoundingSphere: BoundingSphere;

  /**
   * Initialize and convert the NC file to JSON format supported by the particle system
   * @returns A Promise which resolve the processed json data. 
   */
  init(): Promise<JsonData>;

  private addPrimitives(): void;

  private updateViewerParameters(): void;

  private setupEventListeners(): void;

  private removeEventListeners(): void;

  private processUserInput(userInput: UserInput): OperatingParams;

  /**
   * Start running the particle system
   */
  show(): void;
  
  /**
   * Pause particle system
   */
  hide(): void;
  
  /**
   * Change particle system operating parameters
   * @param maxParticles - Maximum number of particles.
   * @param particleHeight - Particle height.
   * @param fadeOpacity - Particle trailing transparency.
   * @param dropRate - Particle reset ratet.
   * @param dropRateBump - The percentage of particle reset rate that increases with speed. The faster the speed, the denser it is,

    Final particle reset rate particledroprate = droprate + dropratebump * speednorm;.
  * @param speedFactor - Particle relative velocity.
  * @param lineWidth - Particle line width.
  * @param dynamic - Whether to run dynamically.
  */
  optionsChange(options: UserInput): void;
  
  /**
   * Remove particle systems from CesiumViewer
   */
  remove(): void;
  
}

export declare class Vortex {
  /**
   * Create a Vortex Object
   * @example
   * // Create a single-layer vortex model with a length of about 500km, width and height of 2000m. 
   * //There are 50 sampling points in the X and Y directions.
   * new Vortex([120, 30, 100], 5, 5, 2000, 0.1, 0.1, 2000);
   * @param pos The center [lon, lat] of vortex.
   * @param radiusX Length in east-west direction, degree. 
   * @param radiusY Length in sourth-north direction, degree.
   * @param height Vortex's height, metre.
   * @param dx East West sampling interval, in degrees.
   * @param dy North South sampling interval in degrees
   * @param dz Vertical sampling interval, unit: metre.
   */
  constructor(pos: number[], radiusX: number, radiusY: number, height: number, dx: number, dy: number, dz: number);

  /**
   * Get JSON data conforming to particle system standards. 
   */
  readonly data: JsonData;

  /**
   * Generate JSON data supported by the particle system by passing in parameters
   * @example
   * // Create a single-layer vortex model with a length of about 500km, width and height of 2000m. 
   * //There are 50 sampling points in the X and Y directions.
   * Vortex.generateData([120, 30, 100], 5, 5, 2000, 0.1, 0.1, 2000);
   * @param pos The center [lon, lat] of vortex.
   * @param radiusX Length in east-west direction, degree. 
   * @param radiusY Length in sourth-north direction, degree.
   * @param height Vortex's height, metre.
   * @param dx East West sampling interval, in degrees.
   * @param dy North South sampling interval in degrees
   * @param dz Vertical sampling interval, unit: metre.
   */
  static generateData(pos: number[], radiusX: number, radiusY: number, height: number, dx: number, dy: number, dz: number): JsonData;

  private generateDimensionData(num: number, start: number, step: number): DimensionData;

  /**
   * Get JSON data conforming to particle system standards. 
   */
  getData(): JsonData;

  private computeSpeed(x0: number, y0: number, a: number, b: number, speed: number, clockwise?: boolean): {
    x: number;
    y: number;
    z?: undefined;
  }

  private computeHeight(x0: number, y0: number, a: number, b: number, startz: number, dz: number): number;

  private ifInEllipse(x: number, y: number, a: number, b: number): boolean;
}

/**
 * Read the NetCDF file field, which is used to load different vector field files
 * @param file The file must contain at least the following attributes:
 * - Transverse velocity matrix U (LEV, lat, lon)
 * - Longitudinal velocity matrix V (LEV, lat, lon)
 * - Longitude dimension lon
 * - Latitude dimension lat
 * 
 * [For details](https://github.com/hongfaqiu/cesium-particle#%E6%80%8E%E6%A0%B7%E5%8A%A0%E8%BD%BD%E8%87%AA%E5%B7%B1%E7%9A%84nc%E6%96%87%E4%BB%B6)
 */
export declare function getFileFields(file: Blob): Promise<{
  variables: string[],
  dimensions: string[],
  raw: netcdfjs
}>

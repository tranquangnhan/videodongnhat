
export interface VoiceProfile {
  voice_id: string;
  gender: string;
  language: string;
  style: string;
  tone: string;
  emotion: string;
  age_range: string;
  stability: number;
  clarity: number;
  pitch: number;
  speed: number;
  pause_between_sentences_ms: number;
  breathing: string;
  sample_rate: number;
  consistency_lock: boolean;
}

export interface VeoMetadata {
  project_name: string;
  scene_number: string;
  shot_type: string;
  purpose: string;
  timing: {
    start_time: string;
    end_time: string;
    duration_seconds: number;
  };
}

export interface CameraSpecs {
  shot_size: string;
  movement: string;
  lens_type: string;
  angle: string;
}

export interface ColorGrading {
  scheme: string;
  palette: string;
}

export interface LightingSpecs {
  type: string;
  quality: string;
  color_grading: ColorGrading;
}

export interface CinematicElements {
  camera: CameraSpecs;
  lighting: LightingSpecs;
}

export interface CoreDescription {
  subject: string;
  action: string;
  scene: string;
  cinematic_elements: CinematicElements;
}

export interface MotionSpecifications {
  temporal_flow: string;
  speed: string;
  physics: string;
}

export interface DialogueSpecs {
  mode: string;
  speaker: string;
  text: string;
  voice_profile: VoiceProfile;
  delivery: string;
}

export interface SoundscapeSpecs {
  ambient: string;
  foley: string;
  dialogue: DialogueSpecs;
}

export interface MusicSpecs {
  genre: string;
  mood: string;
}

export interface AudioDesign {
  soundscape: SoundscapeSpecs;
  music: MusicSpecs;
}

export interface TechnicalParameters {
  resolution: string;
  frame_rate: string;
  aspect_ratio: string;
  render_style: string;
}

export interface QualityControl {
  negative_prompt: string;
}

export interface VeoSceneJson {
  scene_id: number;
  veo_prompt_standard: string;
  metadata: VeoMetadata;
  core_description: CoreDescription;
  motion_specifications: MotionSpecifications;
  audio_design: AudioDesign;
  technical_parameters: TechnicalParameters;
  quality_control: QualityControl;
}

export interface VeoProject {
  story: {
    title: string;
    total_duration_seconds: number;
    voice_mode: string;
    scenes: VeoSceneJson[];
  };
}

export type VideoStyle = 'single' | 'animation' | 'cinematic' | 'tiktok';
export type AspectRatio = '16:9' | '9:16' | '21:9' | '4:3';
export type SceneCount = 1 | 5 | 10 | 15;

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: number;
  createdAt: number;
}

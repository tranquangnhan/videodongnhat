
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VeoProject, VideoStyle, AspectRatio, SceneCount } from "../types";

const VOICE_PROFILE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    voice_id: { type: Type.STRING },
    gender: { type: Type.STRING },
    language: { type: Type.STRING },
    style: { type: Type.STRING },
    tone: { type: Type.STRING },
    emotion: { type: Type.STRING },
    age_range: { type: Type.STRING },
    stability: { type: Type.NUMBER },
    clarity: { type: Type.NUMBER },
    pitch: { type: Type.NUMBER },
    speed: { type: Type.NUMBER },
    pause_between_sentences_ms: { type: Type.NUMBER },
    breathing: { type: Type.STRING },
    sample_rate: { type: Type.NUMBER },
    consistency_lock: { type: Type.BOOLEAN },
  },
  required: [
    "voice_id", "gender", "language", "style", "tone", "emotion", 
    "age_range", "stability", "clarity", "pitch", "speed", 
    "pause_between_sentences_ms", "breathing", "sample_rate", "consistency_lock"
  ],
};

const SCENE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scene_id: { type: Type.INTEGER },
    veo_prompt_standard: { type: Type.STRING },
    metadata: {
      type: Type.OBJECT,
      properties: {
        project_name: { type: Type.STRING },
        scene_number: { type: Type.STRING },
        shot_type: { type: Type.STRING },
        purpose: { type: Type.STRING },
        timing: {
          type: Type.OBJECT,
          properties: {
            start_time: { type: Type.STRING },
            end_time: { type: Type.STRING },
            duration_seconds: { type: Type.NUMBER }
          },
          required: ["start_time", "end_time", "duration_seconds"]
        }
      },
      required: ["project_name", "scene_number", "shot_type", "purpose", "timing"],
    },
    core_description: {
      type: Type.OBJECT,
      properties: {
        subject: { 
          type: Type.STRING,
          description: "Detailed character design including: Gender, Age, Race, Skin, Hair (color/style), Eyes, Expression, and Distinguishing features."
        },
        action: { type: Type.STRING },
        scene: { type: Type.STRING },
        cinematic_elements: {
          type: Type.OBJECT,
          properties: {
            camera: {
              type: Type.OBJECT,
              properties: {
                shot_size: { type: Type.STRING },
                movement: { type: Type.STRING },
                lens_type: { type: Type.STRING },
                angle: { type: Type.STRING },
              },
              required: ["shot_size", "movement", "lens_type", "angle"],
            },
            lighting: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                quality: { type: Type.STRING },
                color_grading: {
                  type: Type.OBJECT,
                  properties: {
                    scheme: { type: Type.STRING },
                    palette: { type: Type.STRING },
                  },
                  required: ["scheme", "palette"],
                },
              },
              required: ["type", "quality", "color_grading"],
            },
          },
          required: ["camera", "lighting"],
        },
      },
      required: ["subject", "action", "scene", "cinematic_elements"],
    },
    motion_specifications: {
      type: Type.OBJECT,
      properties: {
        temporal_flow: { type: Type.STRING },
        speed: { type: Type.STRING },
        physics: { type: Type.STRING },
      },
      required: ["temporal_flow", "speed", "physics"],
    },
    audio_design: {
      type: Type.OBJECT,
      properties: {
        soundscape: {
          type: Type.OBJECT,
          properties: {
            ambient: { type: Type.STRING },
            foley: { type: Type.STRING },
            dialogue: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING },
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                voice_profile: VOICE_PROFILE_SCHEMA,
                delivery: { type: Type.STRING },
              },
              required: ["mode", "speaker", "text", "voice_profile", "delivery"],
            },
          },
          required: ["ambient", "foley", "dialogue"],
        },
        music: {
          type: Type.OBJECT,
          properties: {
            genre: { type: Type.STRING },
            mood: { type: Type.STRING },
          },
          required: ["genre", "mood"],
        },
      },
      required: ["soundscape", "music"],
    },
    technical_parameters: {
      type: Type.OBJECT,
      properties: {
        resolution: { type: Type.STRING },
        frame_rate: { type: Type.STRING },
        aspect_ratio: { type: Type.STRING },
        render_style: { type: Type.STRING },
      },
      required: ["resolution", "frame_rate", "aspect_ratio", "render_style"],
    },
    quality_control: {
      type: Type.OBJECT,
      properties: {
        negative_prompt: { type: Type.STRING },
      },
      required: ["negative_prompt"],
    },
  },
  required: [
    "scene_id", "veo_prompt_standard", "metadata", "core_description", 
    "motion_specifications", "audio_design", "technical_parameters", "quality_control"
  ],
};

const PROJECT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        total_duration_seconds: { type: Type.NUMBER },
        voice_mode: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: SCENE_SCHEMA,
        },
      },
      required: ["title", "total_duration_seconds", "voice_mode", "scenes"],
    },
  },
  required: ["story"],
};

const wait = (ms: number) => {
  const jitter = Math.random() * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
};

export const generateSceneJson = async (
  scriptText: string,
  style: VideoStyle,
  aspectRatio: AspectRatio,
  sceneCount: SceneCount
): Promise<VeoProject> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Bạn là chuyên gia phân tích kịch bản video cho Veo AI.
    
    YÊU CẦU CẤU TRÚC JSON:
    - Root object: { "story": { "title": "...", "total_duration_seconds": ..., "voice_mode": "single_voice_over", "scenes": [...] } }

    THIẾT KẾ NHÂN VẬT & SUBJECT (QUAN TRỌNG):
    Khi điền trường "core_description.subject", bạn PHẢI TỰ ĐỘNG phân tích và viết mô tả chi tiết nhân vật bằng TIẾNG ANH, bao gồm các thông số sau:
    1. Gender (Giới tính)
    2. Estimated Age (Tuổi)
    3. Race / Face style (Chủng tộc/Khuôn mặt)
    4. Skin color (Màu da)
    5. Hair: color, length, style (Tóc)
    6. Eyes: color, shape (Mắt)
    7. Default expression (Biểu cảm)
    8. Distinguishing features (Đặc điểm nhận dạng: sẹo, kính, nốt ruồi...)
    
    Ví dụ cho subject: "A 25-year-old Vietnamese man, sharp jawline, tanned skin, short messy black hair, narrow brown eyes, determined expression, wearing a white t-shirt..."

    QUY TẮC NỘI DUNG:
    1. Hình ảnh: Dịch mô tả sang tiếng Anh. Phải tả trang phục (clothing) chi tiết và GIỮ ĐỒNG NHẤT (Consistency) giữa tất cả các cảnh.
    2. Thoại: GIỮ NGUYÊN TIẾNG VIỆT 100%. Không dịch phần text thoại.
    3. Voice Consistency Lock: Nếu là câu chuyện liên mạch, set "consistency_lock": true và dùng cùng "voice_id".
    
    Style: ${style}, Ratio: ${aspectRatio}, Count: ${sceneCount} scenes.
  `;

  const MAX_RETRIES = 6;
  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: scriptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: PROJECT_SCHEMA,
          temperature: 0.2,
        },
      });

      if (!response.text) throw new Error("Empty response");
      return JSON.parse(response.text.trim()) as VeoProject;

    } catch (error: any) {
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      const errorMsg = (error.message || "").toLowerCase();
      const isRateLimited = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exhausted') || error.status === 429;

      if (isRateLimited && attempt < MAX_RETRIES - 1) {
        const backoffMs = 3000 * Math.pow(2, attempt);
        await wait(backoffMs);
        continue;
      }
      break;
    }
  }

  if (lastError) {
    throw new Error(`Lỗi hệ thống: ${lastError.message}`);
  }

  throw new Error("Không thể tạo dữ liệu.");
};

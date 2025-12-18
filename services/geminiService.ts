import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VeoProject, VideoStyle, AspectRatio, SceneCount } from "../types";

const SCENE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    veo_prompt_standard: { type: Type.STRING, description: "Version standard, e.g., 3.1" },
    metadata: {
      type: Type.OBJECT,
      properties: {
        project_name: { type: Type.STRING },
        scene_number: { type: Type.STRING, description: "SCENE_01, SCENE_02, etc." },
        shot_type: { type: Type.STRING },
        purpose: { type: Type.STRING },
        timing: {
          type: Type.OBJECT,
          properties: {
            start_time: { type: Type.STRING, description: "Format 00:00:00" },
            end_time: { type: Type.STRING, description: "Format 00:00:00" },
            duration_seconds: { type: Type.NUMBER, description: "Duration in seconds" }
          },
          required: ["start_time", "end_time", "duration_seconds"]
        }
      },
      required: ["project_name", "scene_number", "shot_type", "purpose", "timing"],
    },
    core_description: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, description: "English description of subject. MUST INCLUDE SPECIFIC CLOTHING DETAILS that remain consistent." },
        action: { type: Type.STRING, description: "English description of action" },
        scene: { type: Type.STRING, description: "English description of scene" },
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
                speaker: { type: Type.STRING, description: "Original Vietnamese name" },
                text: { type: Type.STRING, description: "MUST BE IN VIETNAMESE. Do not translate dialogue." },
                voice_profile: { type: Type.STRING },
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
    "veo_prompt_standard",
    "metadata",
    "core_description",
    "motion_specifications",
    "audio_design",
    "technical_parameters",
    "quality_control",
  ],
};

const PROJECT_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: SCENE_SCHEMA,
};

// Helper function for delay with jitter
const wait = (ms: number) => {
  const jitter = Math.random() * 1000; // Add up to 1s of randomness
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

  const stylePrompts = {
    single: "Create a single, highly detailed scene.",
    animation: "Style: 3D Animation/Anime. Vibrant colors.",
    cinematic: "Style: Photorealistic Cinematic. Film lighting.",
    tiktok: "Style: Fast-paced vertical viral video."
  };

  const systemInstruction = `
    Bạn là chuyên gia phân tích kịch bản video cho Veo AI.
    
    Yêu cầu:
    - Style: ${style} (${stylePrompts[style]})
    - Ratio: ${aspectRatio}
    - Count: ${sceneCount} cảnh.

    Lưu ý quan trọng:
    1. Hình ảnh: Dịch mô tả sang tiếng Anh. Phải tả trang phục (clothing) chi tiết và GIỮ ĐỒNG NHẤT (Consistency) giữa tất cả các cảnh.
    2. Thoại: GIỮ NGUYÊN TIẾNG VIỆT 100%. Không dịch phần text thoại.
    3. Speaker: Giữ tên gốc tiếng Việt.
  `;

  // Increased retries for better stability
  const MAX_RETRIES = 6;
  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Upgraded model
        contents: scriptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: PROJECT_SCHEMA,
          temperature: 0.2, // Lower temperature for more stable JSON
        },
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      return JSON.parse(response.text.trim()) as VeoProject;

    } catch (error: any) {
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;

      // Robust rate limit detection
      const errorMsg = (error.message || "").toLowerCase();
      const isRateLimited = 
        errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('exhausted') || 
        errorMsg.includes('limit') ||
        errorMsg.includes('overload') ||
        error.status === 429 ||
        error.status === 503;

      if (isRateLimited && attempt < MAX_RETRIES - 1) {
        // Progressive backoff: 3s, 6s, 12s, 24s, 48s...
        const backoffMs = 3000 * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${backoffMs}ms before retry...`);
        await wait(backoffMs);
        continue;
      }

      // If it's a structural error (not rate limit), don't bother retrying as much
      if (!isRateLimited && attempt < 1) {
        await wait(1000);
        continue;
      }

      break;
    }
  }

  // Final error handling with clear message
  if (lastError) {
    const errorMsg = (lastError.message || "").toLowerCase();
    if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('limit')) {
      throw new Error("Hệ thống AI đang nhận quá nhiều yêu cầu cùng lúc. Vui lòng đợi 30-60 giây và thử lại.");
    }
    throw new Error(`Lỗi AI: ${lastError.message || "Không xác định"}`);
  }

  throw new Error("Không thể tạo JSON sau nhiều lần thử.");
};

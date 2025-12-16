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
    animation: "Render Style must be '3D Animation' or 'Anime'. Colors should be vibrant.",
    cinematic: "Render Style must be 'Photorealistic Cinematic'. Focus on filmic lighting and anamorphic lenses.",
    tiktok: "Optimized for vertical viewing. Fast paced, engaging visuals."
  };

  const systemInstruction = `
    Bạn là chuyên gia chuyển đổi kịch bản video sang JSON cho Veo AI.
    
    **CẤU HÌNH YÊU CẦU:**
    - Phong cách (Style): ${style} (${stylePrompts[style]})
    - Tỉ lệ khung hình (Aspect Ratio): ${aspectRatio} (Bắt buộc áp dụng cho TẤT CẢ các cảnh).
    - Số lượng cảnh yêu cầu: ${sceneCount} cảnh.
    - Tổng thời lượng ước tính: ${sceneCount === 1 ? '10-20s' : `${sceneCount * 8}s`}.

    **NHIỆM VỤ QUAN TRỌNG VỀ NGÔN NGỮ & NHẤT QUÁN (CONSISTENCY):**
    
    1. **PHẦN HÌNH ẢNH (Core Description - Subject):**
       - Dịch sang TIẾNG ANH.
       - **BẮT BUỘC: MÔ TẢ TRANG PHỤC (CLOTHING/OUTFIT) ĐỒNG NHẤT.**
       - Nếu kịch bản không tả quần áo, bạn PHẢI TỰ SÁNG TẠO ra một bộ trang phục chi tiết (Ví dụ: "wearing a white linen shirt and navy blue trousers") ở cảnh đầu tiên.
       - **CÁC CẢNH SAU PHẢI GIỮ NGUYÊN MÔ TẢ TRANG PHỤC NÀY** (Copy & Paste mô tả trang phục từ cảnh 1 sang các cảnh sau, trừ khi kịch bản có cảnh thay đồ). Không được để nhân vật mỗi cảnh mặc một bộ đồ khác nhau.

    2. **PHẦN ÂM THANH/THOẠI (Audio Design - Dialogue):**
       - **Text (Lời thoại):** BẮT BUỘC GIỮ NGUYÊN TIẾNG VIỆT như kịch bản gốc. TUYỆT ĐỐI KHÔNG DỊCH lời thoại sang tiếng Anh.
       - **Speaker (Tên nhân vật):** Giữ nguyên tên Tiếng Việt (Ví dụ: Tùng, Lan...).
       - **Voice Profile (Mô tả giọng):** Có thể dùng tiếng Anh nhưng phải ghi chú "Vietnamese language" hoặc "Vietnamese accent".

    **QUY TRÌNH XỬ LÝ:**
    1. Phân tích kịch bản và chia thành đúng ${sceneCount} cảnh.
    2. Xác định ngoại hình và trang phục nhân vật chính (Subject) thật chi tiết.
    3. Tạo dữ liệu cho cảnh 1.
    4. Tạo dữ liệu cho các cảnh tiếp theo, đảm bảo mô tả Subject (bao gồm trang phục) khớp với cảnh 1.
    5. Tính toán thời gian (start_time, end_time) liên tục.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scriptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: PROJECT_SCHEMA,
        temperature: 0.3, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as VeoProject;
  } catch (error) {
    console.error("Error generating JSON:", error);
    throw error;
  }
};

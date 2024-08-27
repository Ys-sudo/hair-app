// utils/imageSegmenterSingleton.ts
import { FilesetResolver, ImageSegmenter } from "../vision_bundle";

let imageSegmenterInstance: InstanceType<typeof ImageSegmenter> | null = null;
let isInitializing = false;

export const getImageSegmenter = async (runningMode: "IMAGE" | "VIDEO") => {
  if (imageSegmenterInstance) {
    await imageSegmenterInstance.setOptions({ runningMode });
    return imageSegmenterInstance;
  }

  if (isInitializing) {
    // Wait if another call is currently initializing the ImageSegmenter
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Poll every 50ms
    }
    return imageSegmenterInstance; // Return the instance once initialization is complete
  }

  try {
    isInitializing = true;
    const vision = await FilesetResolver.forVisionTasks("./wasm");
    imageSegmenterInstance = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "./hair_segmenter.tflite",
        delegate: "GPU",
      },
      runningMode,
      outputCategoryMask: true,
      //outputConfidenceMasks: true,
    });
    isInitializing = false;
    return imageSegmenterInstance;
  } catch (error) {
    isInitializing = false;
    console.error("Error initializing ImageSegmenter:", error);
    return null;
  }
};

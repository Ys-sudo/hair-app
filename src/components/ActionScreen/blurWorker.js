// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const { imageData, radius } = e.data;

  const applyGaussianBlur = (imageData, radius) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const blurredData = new Uint8ClampedArray(data.length);

    const kernelSize = radius * 2 + 1;
    const kernel = new Float32Array(kernelSize);
    const sigma = radius / 2;
    const twoSigmaSquared = 2 * sigma * sigma;
    const PI = Math.PI;
    let kernelSum = 0;

    // Generate Gaussian kernel
    for (let i = 0; i < kernelSize; i++) {
      const x = i - radius;
      kernel[i] =
        Math.exp(-(x * x) / twoSigmaSquared) / (sigma * Math.sqrt(2 * PI));
      kernelSum += kernel[i];
    }

    // Normalize the kernel
    for (let i = 0; i < kernelSize; i++) {
      kernel[i] /= kernelSum;
    }

    // Temporary buffer for horizontal pass
    const tempData = new Uint8ClampedArray(data.length);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        let weightSum = 0;

        for (let k = -radius; k <= radius; k++) {
          const ix = Math.min(width - 1, Math.max(0, x + k));
          const index = (y * width + ix) * 4;
          const weight = kernel[k + radius];

          r += data[index] * weight;
          g += data[index + 1] * weight;
          b += data[index + 2] * weight;
          a += data[index + 3] * weight * 0.75;
          weightSum += weight;
        }

        const index = (y * width + x) * 4;
        tempData[index] = r / weightSum;
        tempData[index + 1] = g / weightSum;
        tempData[index + 2] = b / weightSum;
        tempData[index + 3] = a / weightSum;
      }
    }

    // Vertical pass
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        let weightSum = 0;

        for (let k = -radius; k <= radius; k++) {
          const iy = Math.min(height - 1, Math.max(0, y + k));
          const index = (iy * width + x) * 4;
          const weight = kernel[k + radius];

          r += tempData[index] * weight;
          g += tempData[index + 1] * weight;
          b += tempData[index + 2] * weight;
          a += tempData[index + 3] * weight * 0.75;
          weightSum += weight;
        }

        const index = (y * width + x) * 4;
        blurredData[index] = r / weightSum;
        blurredData[index + 1] = g / weightSum;
        blurredData[index + 2] = b / weightSum;
        blurredData[index + 3] = a / weightSum;
      }
    }

    return new ImageData(blurredData, width, height);
  };

  const blurredImageData = applyGaussianBlur(imageData, radius);
  // eslint-disable-next-line no-restricted-globals
  self.postMessage(blurredImageData);
};

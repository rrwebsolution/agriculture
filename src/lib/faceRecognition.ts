import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
const MATCH_THRESHOLD = 0.5;

let modelPromise: Promise<void> | null = null;

const loadModels = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
};

export const ensureFaceRecognitionReady = async () => {
  if (!modelPromise) {
    modelPromise = loadModels();
  }
  await modelPromise;
};

const createImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const getDescriptorFromImage = async (src: string) => {
  await ensureFaceRecognitionReady();
  const image = await createImage(src);
  const result = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return result?.descriptor || null;
};

export const verifyFaceMatch = async (referenceImage: string, probeImage: string) => {
  const [referenceDescriptor, probeDescriptor] = await Promise.all([
    getDescriptorFromImage(referenceImage),
    getDescriptorFromImage(probeImage),
  ]);

  if (!referenceDescriptor || !probeDescriptor) {
    return {
      isMatch: false,
      score: 0,
      distance: null as number | null,
      reason: 'No recognizable face found in one of the images.',
    };
  }

  const distance = faceapi.euclideanDistance(referenceDescriptor, probeDescriptor);
  const score = Math.max(0, Math.min(100, (1 - distance / MATCH_THRESHOLD) * 100));

  return {
    isMatch: distance <= MATCH_THRESHOLD,
    score: Number(score.toFixed(2)),
    distance: Number(distance.toFixed(4)),
    reason: distance <= MATCH_THRESHOLD ? null : 'Face did not match the registered technician profile.',
  };
};

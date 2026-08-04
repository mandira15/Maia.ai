import { pipeline } from "@huggingface/transformers";

let extractorPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    console.log("🤖 Loading MiniLM model...");

    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  return extractorPromise;
}

export async function generateEmbedding(text) {
  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
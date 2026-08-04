import { generateEmbedding } from "./embeddingService";

(async () => {
  const embedding = await generateEmbedding(
    "I have severe back pain"
  );

  console.log(embedding.length);
})();
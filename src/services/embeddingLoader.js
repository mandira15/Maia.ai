import {
  embeddingsExist,
  saveEmbeddings,
} from "./cacheService";

export async function initializeEmbeddings() {
  try {
    const exists = await embeddingsExist();

    if (exists) {
      console.log("✅ Embeddings already exist in IndexedDB.");
      return;
    }

    console.log("📥 Loading embeddings...");

    const response = await fetch("http://localhost:5000/api/embeddings");
    if (!response.ok) {
      throw new Error(
        `Failed to load embeddings.json (${response.status})`
      );
    }
    const embeddings = await response.json();

    await saveEmbeddings(embeddings);

    console.log(`Loaded ${embeddings.length} embeddings.`);

    console.log(`✅ Stored ${embeddings.length} embeddings in IndexedDB.`);
  } catch (error) {
    console.error("❌ Failed to initialize embeddings:", error);
  }
}
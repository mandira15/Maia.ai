import { localSemanticSearch } from "./localSemanticSearch";

(async () => {
  const results = await localSemanticSearch(
    "My back hurts"
  );

  console.log(results);
})();
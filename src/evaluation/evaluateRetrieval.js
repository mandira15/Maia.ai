import testQueries from "./testQueries.json";
import { localSemanticSearch } from "../services/localSemanticSearch";

async function evaluateRetrieval() {

    let recall1 = 0;
    let recall3 = 0;
    let recall5 = 0;

    const failures = [];

    console.log("Starting Retrieval Evaluation...\n");

    for (const test of testQueries) {

        const top5 = await localSemanticSearch(test.query, 5);

        const ids = top5.map(result => result.id);

        if (ids.slice(0, 1).includes(test.expectedId))
            recall1++;

        if (ids.slice(0, 3).includes(test.expectedId))
            recall3++;

        if (ids.slice(0, 5).includes(test.expectedId))
            recall5++;

        if (!ids.slice(0, 3).includes(test.expectedId)) {

            failures.push({
                query: test.query,
                expected: test.expectedId,
                predicted: ids[0] || "None"
            });

        }
    }

    const total = testQueries.length;

    console.log("========== REPORT ==========");
    console.log(`Queries   : ${total}`);
    console.log(`Recall@1  : ${(recall1 / total * 100).toFixed(2)}%`);
    console.log(`Recall@3  : ${(recall3 / total * 100).toFixed(2)}%`);
    console.log(`Recall@5  : ${(recall5 / total * 100).toFixed(2)}%`);

    console.log("\nWorst Queries");

    console.table(failures.slice(0,10));

}

export default evaluateRetrieval;
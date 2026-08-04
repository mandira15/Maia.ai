import { useEffect } from "react";
import evaluateRetrieval from "../evaluation/evaluateRetrieval";

function Evaluation() {

    useEffect(() => {
        evaluateRetrieval();
    }, []);

    return (
        <h2>Running Retrieval Evaluation...</h2>
    );
}

export default Evaluation;
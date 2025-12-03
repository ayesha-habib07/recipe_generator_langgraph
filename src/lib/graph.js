import { StateGraph, START, END } from "@langchain/langgraph";
import { recipeState } from "./state";
import { checkConflictNode, generateRecipeNode, postValidationOfRecipeNode, validate_favoritesNode } from "./nodes";


export function buildGraph() {
    const graph = new StateGraph(recipeState)
        .addNode("validate_favoritesNode", validate_favoritesNode)
        .addNode("generateRecipeNode", generateRecipeNode)
        .addNode("checkConflictNode", checkConflictNode)
        .addNode("postValidationOfRecipeNode", postValidationOfRecipeNode)

        .addEdge(START, "validate_favoritesNode")
        .addEdge("validate_favoritesNode", "checkConflictNode")

        .addConditionalEdges("checkConflictNode", (state) =>
            state.conflict ? END : "generateRecipeNode")


        .addEdge("generateRecipeNode", "postValidationOfRecipeNode")
        .addEdge("postValidationOfRecipeNode", END);
    return graph.compile();
}   
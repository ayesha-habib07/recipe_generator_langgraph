import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { recipeState } from "./state";
import {
    validate_favoritesNode,
    checkConflictNode,
    validateAllergiesInRecipeNode,
    generateRecipeNode,
    postValidationOfRecipeNode,
    allergyInfoNode
} from './nodes'

export function buildGraph() {
    const graph = new StateGraph(recipeState)

        .addNode("validate_favoritesNode", validate_favoritesNode)
        .addNode("checkConflictNode", checkConflictNode)
        .addNode("allergyInfoNode", allergyInfoNode)
        .addNode("validateAllergiesInRecipeNode", validateAllergiesInRecipeNode)
        .addNode("generateRecipeNode", generateRecipeNode)
        .addNode("postValidationOfRecipeNode", postValidationOfRecipeNode)

        .addEdge(START, "validate_favoritesNode")
        .addConditionalEdges(
            "validate_favoritesNode",
            (state) => {
                if (state.conflictDetails?.key === 'non_veg_favorites_conflict') {
                    console.log("🛑 Non-veg favorites detected in veg recipe");
                    return END;
                }
                return "checkConflictNode";
            }
        )

        .addConditionalEdges(
            "checkConflictNode",
            (state) => {
                if (state.conflictDetails?.key === "favorite_vs_allergy_conflict") {
                    console.log("🛑 Graph stopping at checkConflictNode due to conflict");
                    return END;
                }
                return "allergyInfoNode";
            }
        )

        // After showing allergy info, check for conflicts in favorites
        .addConditionalEdges(
            "allergyInfoNode",
            (state) => {
                console.log("checking allergyInfoNode state:", {
                    hasConflictDetails: !!state.conflictDetails,
                    conflictKey: state.conflictDetails?.key,
                    acknowledged: state.allergyInfoAcknowledged
                });

                if (state.conflictDetails?.key === "allergy_info" && !state.allergyInfoAcknowledged) {
                    console.log("ℹ️ Showing allergy information");
                    return END;
                }
                console.log("✅ Continuing to validateAllergiesInRecipeNode");
                return "validateAllergiesInRecipeNode";
            }
        )

        .addConditionalEdges(
            "validateAllergiesInRecipeNode",
            (state) => {
                if (state.conflictDetails?.key === "allergy_conflict") {
                    console.log("🛑 Graph stopping at validateAllergiesInRecipeNode due to allergy");
                    return END;
                }
                return "generateRecipeNode";
            }
        )
        .addEdge("generateRecipeNode", "postValidationOfRecipeNode")

        .addConditionalEdges(
            "postValidationOfRecipeNode",
            (state) => {
                if (state.conflictDetails?.key === "post_recipe_allergy") {
                    console.log("🛑 Interrupt: Final recipe contains allergy");
                    return END;
                }
                return END;           // normal completion
            }
        )

    // .addEdge("postValidationOfRecipeNode", END);

    const checkpointer = new MemorySaver();

    return graph.compile({ checkpointer });
}
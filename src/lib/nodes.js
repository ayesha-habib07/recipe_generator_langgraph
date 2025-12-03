import { toolsByName } from "./tools";
import { model } from "./model";

//used tool:validate_favorites
export async function validate_favoritesNode(state) {
    console.log("NOde1 validating favorites");
    const tool = toolsByName["validate_favorites"];
    const result = await tool.invoke({ favorites: state.favorites });

    console.log("Validated favorites:", result.favoriteIngredients);

    return { favorites: result.favoriteIngredients }
}


export async function generateRecipeNode(state) {
    console.log("..................Generating recipe with OpenAI................");

    const jsonTemplate = {
        name: "",
        ingredients: [],
        steps: []
    };

    const prompt = `
Return ONLY valid JSON. No markdown.

You are a professional chef. Create a recipe for "${state.recipeName}".

Requirements:
- Must include: ${state.favorites?.join(", ") || "None"}
- Avoid these allergens: ${state.allergies?.join(", ") || "None"}
- Recipe type: ${state.recipetype || "veg"}  // ✅ FIXED: was state.type

JSON FORMAT TO FOLLOW:
${JSON.stringify(jsonTemplate, null, 2)}
`;

    // Call LLM
    const llmResponse = await model.invoke(prompt);
    console.log("🟦 RAW MODEL OUTPUT:", llmResponse);

    let llmText = "";

    // ✅ IMPROVED: Handle all cases with null checks
    if (!llmResponse) {
        throw new Error("Model returned null/undefined response");
    }

    // Case 1: raw string
    if (typeof llmResponse === "string") {
        llmText = llmResponse;
    }
    // Case 2: { content: "text" }
    else if (typeof llmResponse?.content === "string") {
        llmText = llmResponse.content;
    }
    // Case 3: { content: [{ text: "..."}] }
    else if (Array.isArray(llmResponse?.content)) {
        const item = llmResponse.content[0];
        if (typeof item === "string") {
            llmText = item;
        } else if (typeof item?.text === "string") {
            llmText = item.text;
        } else {
            llmText = JSON.stringify(item);
        }
    }
    // Case 4: LangChain: { kwargs: { content: "..." } }
    else if (typeof llmResponse?.kwargs?.content === "string") {
        llmText = llmResponse.kwargs.content;
    }
    // Case 5: fallback
    else {
        console.log("⚠️ UNKNOWN LLM OUTPUT TYPE — fallback JSON.stringify()");
        llmText = JSON.stringify(llmResponse);
    }

    // ✅ CRITICAL FIX: Ensure llmText is always a string
    if (!llmText || typeof llmText !== "string") {
        console.error("❌ llmText is not a valid string:", llmText);
        throw new Error("Model response could not be converted to string");
    }

    // Now safe to use .replace()
    const cleaned = llmText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    console.log("--------------- CLEANED LLM RESPONSE ----------------");
    console.log(cleaned);

    // Parse JSON
    let recipeJSON;
    try {
        recipeJSON = JSON.parse(cleaned);
    } catch (err) {
        console.error("❌ JSON parse failed. Raw text:", cleaned);
        throw new Error("Model did not return valid JSON in generateRecipeNode");
    }

    console.log("✅ Recipe generated:", recipeJSON.name);
    return { recipe: recipeJSON };
}


// this checkConflictNode node runs before generating recipe, checking user input (favorites and allergies), if conflict give error 
export async function checkConflictNode(state) {
    console.log("............checking conflict between user; input favorites and allergies....");
    const tool = toolsByName["validate_favorite_vs_allergy"];
    const result = await tool.invoke({
        favorites: state.favorites,
        allergies: state.allergies,
    });

    if (!result.valid) {
        console.log("⚠️  Conflicts found:", result.conflicts);
        return {
            conflict: true,
            conflictDetails: {
                message: "Some favorite ingredients conflict with your allergies",
                conflicts: result.conflicts,
            },
        }
    }
    console.log("✅ No conflicts found ");
    return {
        conflict: false
    };

}

// after generating recipe check allergies if found 
export async function postValidationOfRecipeNode(state) {
    console.log("📍 NODE 4: Validating recipe...");

    const recipe = state.recipe;

    // Normalize ingredients  
    const normalizedIngredients = recipe.ingredients.map((ing) =>
        typeof ing === "string"
            ? ing.toLowerCase()
            : ing.item?.toLowerCase() || ""
    );

    // 1. Allergy validation (NO interrupt — only return error)
    const allergyResult = await toolsByName["validate_allergies"].invoke({
        recipe: { ...recipe, ingredients: normalizedIngredients },
        allergies: state.allergies,
    });

    if (!allergyResult.valid) {
        console.log("❌ Allergy validation failed:", allergyResult.found);

        return {
            recipe: { ...recipe, ingredients: normalizedIngredients },
            validationErrors: [
                {
                    type: "allergy",
                    found: allergyResult.found,
                    message: "Recipe contains allergic ingredients: " + allergyResult.found.join(", "),
                },
            ],
        };
    }

    console.log("✅ Recipe validation passed");

    return {
        recipe: { ...recipe, ingredients: normalizedIngredients },
        validationErrors: [],
    };
}


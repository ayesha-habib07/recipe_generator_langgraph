import { toolsByName } from "./tools";
import { model } from "./model";
import { interrupt } from "@langchain/langgraph";
import { Command } from "@langchain/langgraph";



export async function validate_favoritesNode(state) {
    console.log("-------------------Validating favorites Node------------------");

    const tool = toolsByName["validate_favorites"];
    const result = await tool.invoke({ favorites: state.favorites });

    const normalizedIngredients = result.favoriteIngredients.map(i =>
        i.toLowerCase().trim()
    );

    if (state.recipeType === "veg") {

        const prompt = `
        You are an advanced food categorization model.

        Given a list of ingredient names, identify which ingredients are NON-VEGETARIAN.

        NON-VEG includes:
        - Meat (chicken, beef, mutton, lamb, pork, duck, turkey, rabbit, camel, etc.)
        - Seafood (fish, tuna, salmon, squid, octopus, prawns, shrimp, crab, lobster, oysters, clams)
        - Eggs (egg, eggs, yolk, white)
        - Animal-derived products (gelatin, lard, rennet, meat broth, fish sauce)

        Return STRICT JSON ONLY:
        {
        "NON_VEG_ITEMS": [...]
        }

        Ingredients: ${JSON.stringify(normalizedIngredients)}
        `.trim();

        const aiRes = await model.invoke(prompt);

        let NON_VEG_ITEMS = [];

        try {
            const json = JSON.parse(aiRes.content);
            NON_VEG_ITEMS = json.NON_VEG_ITEMS || [];
        } catch (err) {
            console.log("❌  Failed to parse JSON from model:", aiRes);
            NON_VEG_ITEMS = [];
        }


        const invalidFavorites = normalizedIngredients.filter(fav =>
            NON_VEG_ITEMS.includes(fav)
        );

        if (invalidFavorites.length > 0) {
            console.log("🛑 Non-veg favorites detected:", invalidFavorites);

            const replacements = [];
            for (const item of invalidFavorites) {
                const suggestions = await getVegReplacements(item);
                replacements.push({ item, suggestions });
            }

            // return {
            //     conflictDetails: {
            //         key: "non_veg_favorites_conflict",
            //         message: "You selected 'Vegetarian' but some favorites contain non-veg items.",
            //         conflicts: invalidFavorites,
            //         replacements
            //     }
            // };
            return interrupt({
                conflictDetails: {
                    key: "non_veg_favorites_conflict",
                    message: "You selected 'Vegetarian' but some favorites contain non-veg items.",
                    conflicts: invalidFavorites,
                    replacements
                }
            })
        }
    }

    console.log("Validated favorites:", normalizedIngredients);
    return { favorites: normalizedIngredients };
}

async function getVegReplacements(nonVegItem) {
    const prompt = `
        Suggest 3 vegetarian alternatives for "${nonVegItem}" that can be used in cooking.

        Return ONLY valid JSON in this exact format:
        {
        "replacements": ["alternative1", "alternative2", "alternative3"]
        }

        No markdown, no explanations, just the JSON.
    `.trim();
    try {
        const response = await model.invoke(prompt);
        let text = "";

        if (typeof response === 'string') {
            text = response;
        }
        else if (typeof response?.content === 'string') {
            text = response.content;
        }
        else if (Array.isArray(Response?.content)) {
            text = response?.content[0].text || JSON.stringify(response.content[0]);
        }
        else {
            text = JSON.stringify(response);
        }

        const cleaned = text.replace(/```json| ```/g, "").trim();
        const json = JSON.parse(cleaned);
        return json.replacements || ["tofu", "paneer", "mushrooms"];



    } catch (err) {
        console.log("*****************Failed to get veg repplacements******************", err);
        const defaults = {
            chicken: ["tofu", "paneer", "soya chunks"],
            beef: ["jackfruit", "portobello mushrooms", "seitan"],
            mutton: ["paneer", "soya chunks", "chickpeas"],
            fish: ["tofu", "banana blossom", "hearts of palm"],
            prawns: ["tofu cubes", "cauliflower florets", "mushrooms"],
            egg: ["flax eggs", "chia seeds", "applesauce"],
            pork: ["jackfruit", "tempeh", "seitan"],
            lamb: ["paneer", "chickpeas", "lentils"],
            meat: ["tofu", "soya chunks", "seitan"]
        };
        return defaults[nonVegItem] || ["tofu", "paneer", "mushrooms"];
    }
}

// check conflicts between favorites and allergies with interrupt   Node 2
export async function checkConflictNode(state) {
    console.log("----------------checking conflicts between user input favorites and allergies------------------------------");
    const tool = toolsByName["validate_favorite_vs_allergy"];
    const result = await tool.invoke({
        favorites: state.favorites,
        allergies: state.allergies,
    });
    if (!result.valid) {
        console.log("-----------------------⚠️ Conflicts found------------------", result.conflicts);
        console.log("---------------------------throwing interrupt for conflict-------------------");
        // return new Command({
        //     update: {
        //         conflictDetails: {
        //             message: "Some favorite ingredients conflict with allergies",
        //             conflicts: result.conflicts,
        //             key: "favorite_vs_allergy_conflict",
        //         }
        //     },
        //     goto: Command.END   // same as interrupt(Command)
        // });
        return interrupt({
            conflictDetails: {
                key: "favorite_vs_allergy_conflict",
                message: "Some favorite ingredients conflict with allergies",
                conflicts: result.conflicts,
            }
        })
    };
    console.log("------------------------✅ No conflicts found------------------------");
    return {};
}




// Vaidate allergies and if user select alternative then add in favorites(with LLM suggestion) Node 3
export async function validateAllergiesInRecipeNode(state, config) {
    console.log("-----------------------------validating allergies and give suggestion, using LLM----------------------------------- ");
    // check if we are resuming from an interrupt
    // const resumeValue = config?.store?.get("resume_selection");

    // Resume logic
    // if (resumeValue) {
    //     console.log("-----------🔁Resuming with selection------------- ", resumeValue);


    //     // add selected replacements to favorites
    //     const updatedFavorites = [...state.favorites.filter(f => f.toLowerCase() !== state.currentAllergy?.toLowerCase()), resumeValue];
    //     // remove the processed allergy
    //     const updatedAllergies = state.allergies.filter(
    //         a => a.toLowerCase() !== state.currentAllergy?.toLowerCase()
    //     );
    //     // clear resume flag
    //     config?.store?.delete("resume_selection");
    //     return {
    //         favorites: updatedFavorites,
    //         allergies: updatedAllergies,
    //         currentAllergy: null,
    //     };
    // }

    // If user already acknowledged in allergyInfoNode, skip validation
    if (state.allergyInfoAcknowledged === true) {
        console.log("✅ User already acknowledged allergies, skipping validation");
        return {}
    }
    // check if we are resuming from an interrupt with selection
    if (state.selection) {
        console.log("-----------🔁Resuming with selection------------- ", state.selection);
        // add selected replacements to favorites
        const updatedFavorites = [
            ...state.favorites.filter(f => f.toLowerCase() !== state.currentAllergy?.toLowerCase()), state.selection
        ];
        // remove current allergy
        const updatedAllergies = state.allergies.filter(a => a.toLowerCase() !== state.currentAllergy?.toLowerCase())

        return {
            favorites: updatedFavorites,
            allergies: updatedAllergies,
            selection: null,
            currentAllergy: null,
        }
    }

    // check each favorite againt allergy
    // for (const fav of state.favorites) {
    //     const favLower = fav.toLowerCase().trim();

    //     for (const allergy of state.allergies) {
    //         const allergyLower = allergy.toLowerCase().trim();

    //         if (favLower.includes(allergyLower) || allergyLower.includes(favLower)) {
    //             console.log(`---------------------⚠️ Found allergy conflict : ${fav} contains ${allergy}-------------------`);
    //             // Get LLM suggestion
    //             const suggestions = await getSuggestions(allergy);
    //             console.log("✅ LLM suggestions", suggestions);
    //             console.log("🚨 THROWING INTERRUPT FOR ALLERGY");

    //             // use command to interrupt
    //             return new Command({
    //                 update: {
    //                     currentAllergy: allergy,
    //                     conflictDetails: {
    //                         key: "allergy_conflict",
    //                         allergy: allergy,
    //                         conflictingFavorite: fav,
    //                         suggestions: suggestions,
    //                     }
    //                 },
    //                 goto: Command.END
    //             });
    //         }
    //     }
    // }

    const containsAllergen = (ingredient, allergen) => {
        const ing = ingredient.toLowerCase().trim();
        const all = allergen.toLowerCase().trim();

        if (ing === all) return true
        const words = ing.split(/[\s,-]+/);
        return words.some(word => word === all || word.startsWith(all) || all.startsWith(word));

    }
    for (const fav of state.favorites) {
        for (const allergy of state.allergies) {
            if (containsAllergen(fav, allergy)) {
                console.log(`---------------------⚠️ Found allergy conflict : ${fav} contains ${allergy}-------------------`);


                //  get suggestion
                const suggestions = await getSuggestions(allergy);
                console.log("✅ LLM suggestions", suggestions);
                console.log("🚨 THROWING INTERRUPT FOR ALLERGY");
                // return {
                //     currentAllergy: allergy,
                //     conflictDetails: {
                //         key: "allergy_conflict",
                //         allergy: allergy,
                //         conflictingFavorite: fav,
                //         suggestions: suggestions,
                //     }
                // }
                return interrupt({
                    currentAllergy: allergy,
                    conflictDetails: {
                        key: "allergy_conflict",
                        allergy,
                        conflictingFavorite: fav,
                        suggestions,
                    }

                })
            }

        }
    }
    // check each favorites againt allergy  

    console.log("------------------✅  No allergy conflicts in favorites.------------------------------");
    return {};
}

// helper getSuggestions
async function getSuggestions(allergy) {
    const prompt = `
        User is allergic to: ${allergy}

        Provide exactly 3 safe alternative ingredients that do NOT contain ${allergy} and can be used in cooking.

        Return ONLY valid JSON in this exact format:
        {
        "replacements": ["alternative1", "alternative2", "alternative3"]
        }

        No markdown, no explanations, just the JSON.
    `.trim();
    try {
        const response = await model.invoke(prompt);
        // extract text from response 

        let text = "";
        if (typeof response === 'string') {
            text = response;
        }
        else if (typeof response?.content === 'string') {
            text = response.content;
        }
        else if (Array.isArray(response?.content)) {
            text = response.content[0]?.text || JSON.stringify(response.content[0]);
        } else {
            text = JSON.stringify(response);
        }
        let cleaned = text.replace(/```json| ```/g, "").trim();
        const json = JSON.parse(cleaned);
        console.log("✅ LLM suggestions", json.replacements);
        return json.replacements || ["safe alternative 1", "safe alternative 2", "safe alternative 3"];


    } catch (err) {
        console.error("❌ Failed to get LLM suggestions");
        return ["safe alternative 1", "safe alternative 2", "safe alternative 3"];
    }
}

// show allergy alternatives
export async function allergyInfoNode(state, config) {
    console.log("-----------------providing allergy alternatives-------------------------");
    console.log("State allergyInfoAcknowledged:", state.allergyInfoAcknowledged);

    if (state.allergyInfoAcknowledged === true) {
        console.log("✅ User acknowledged allergy info, continuing to recipe generation...");
        return {
            allergyInfoAcknowledged: false,
            conflictDetails: undefined,
        }
    }
    // If user has allergies, show alternatives
    if (state.allergies && state.allergies.length > 0) {
        const allergyAlternatives = [];

        for (const allergy of state.allergies) {
            const suggestions = await getSuggestions(allergy);
            allergyAlternatives.push({
                allergy: allergy,
                alternatives: suggestions,
            });
        }
        console.log("-----------------✅ Generated alternatives for all allergies:---------------------", allergyAlternatives);

        // return {
        //     conflictDetails: {
        //         key: "allergy_info",
        //         message: "Here are safe alternatives for your allergies:",
        //         allergyAlternatives: allergyAlternatives,
        //     },
        //     allergyInfoAcknowledged: false,
        // };

        return interrupt({
            conflictDetails: {
                key: "allergy_info",
                message: "Here are safe alternatives for your allergies:",
                allergyAlternatives: allergyAlternatives
            },
            allergyInfoAcknowledged: false,
        })
    }
    console.log("✅ No allergies to show alternatives for");
    return {};
}

// genarate recipe with LLM    Node 4
export async function generateRecipeNode(state) {
    console.log("-------------------------Generating recipe with OpenAI-----------------");

    const jsonTemplate = {
        name: "",
        ingredients: [],
        steps: [],
    };

    const prompt = `
        You are a professional chef. Create a recipe for "${state.recipeName}".

        Requirements:
        - Must include these ingredients: ${state.favorites?.join(", ") || "None"}
        - AVOID these allergens: ${state.allergies?.join(", ") || "None"}
        - Recipe type: ${state.recipeType || "veg"}

        Return ONLY valid JSON in this exact format (no markdown, no backticks):
        ${JSON.stringify(jsonTemplate, null, 2)}
    `.trim();

    // Call LLM
    const llmResponse = await model.invoke(prompt);

    // Extract text
    let llmText = "";
    if (typeof llmResponse === "string") {
        llmText = llmResponse;
    } else if (typeof llmResponse?.content === "string") {
        llmText = llmResponse.content;
    } else if (Array.isArray(llmResponse?.content)) {
        const item = llmResponse.content[0];
        llmText = typeof item === "string" ? item : (item?.text || JSON.stringify(item));
    } else {
        llmText = JSON.stringify(llmResponse);
    }

    if (!llmText || typeof llmText !== "string") {
        throw new Error("Model response could not be converted to string");
    }

    // Now safe to use .replace()
    const cleaned = llmText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    console.log("----------------------- CLEANED LLM RESPONSE--------------------------");
    console.log(cleaned);

    // Parse JSON
    let recipeJSON;
    try {
        recipeJSON = JSON.parse(cleaned);
    } catch (err) {
        console.error("------------------❌ JSON parse failed. Raw text:-----------------------", cleaned);
        throw new Error("----------------Model did not return valid JSON in generateRecipeNode----------------------");
    }

    console.log("✅ Recipe generated:", recipeJSON.name);
    return { recipe: recipeJSON };
}

// after generating recipe check allergies if found   Node 5
export async function postValidationOfRecipeNode(state) {
    console.log("--------------------------------Validating post recipe----------------------------------------");

    const recipe = state.recipe;

    // Normalize ingredients  
    const normalizedIngredients = recipe.ingredients.map((ing) =>
        typeof ing === "string"
            ? ing.toLowerCase()
            : ing.item?.toLowerCase() || ""
    );

    //    validate allergies in final recipe
    const allergyResult = await toolsByName["validate_allergies"].invoke({
        recipe: { ...recipe, ingredients: normalizedIngredients },
        allergies: state.allergies,
    });

    if (!allergyResult.valid) {
        console.log("--------------❌ Allergy validation failed:---------------", allergyResult.found);

        // return {
        //     recipe: { ...recipe, ingredients: normalizedIngredients },
        //     validationErrors: [
        //         {
        //             type: "allergy",
        //             found: allergyResult.found,
        //             message: "Recipe contains allergic ingredients: " + allergyResult.found.join(", "),
        //         },
        //     ],
        // };
        return interrupt({
            recipe: { ...recipe, ingredients: normalizedIngredients },
            conflictDetails: {
                key: "post_recipe_allergy",
                message: "The generated recipe contains allergic ingredients: " + allergyResult.found.join(", "),
                found: allergyResult.found
            },
            validationErrors: [
                {
                    type: "allergy",
                    found: allergyResult.found,
                    message: "Recipe contains allergic ingredients: " + allergyResult.found.join(", "),
                }
            ]

        })
    }

    console.log("--------------------✅ Recipe validation passed---------------------");
    return {
        recipe: { ...recipe, ingredients: normalizedIngredients },
        validationErrors: [],
    };
}





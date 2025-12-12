import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const validate_favorites = tool(
    async (input) => {
        const parsed = z.object({
            favorites: z.array(z.string()).optional()
        }).parse(input || {});

        const favoriteIngredients = (parsed.favorites || [])
            .map((fav) => fav.trim())
            .filter(Boolean)

        return {
            favoriteIngredients,
            message: `Validated ${favoriteIngredients} favorite ingredients.`
        };
    },
    {
        name: "validate_favorites",
        description: "Normalize and prepare must-have ingredients list",
        schema: z.object({
            favorites: z.array(z.string()).optional()
        })
    }
);
// validate allergies after genrating recipe because we do not have recipe at the beginning and we call model and generate recipe, then we check our generated recipe with allergies. If found then push to found[] array.
export const validate_allergies = tool(
    async (input) => {
        const schema = z.object({
            recipe: z.object({
                name: z.string(),
                ingredients: z.array(z.string()).default([]),
            }).default({ ingredients: [] }),
            allergies: z.array(z.string()).default()
        });
        const parsed = schema.parse(input || []);


        const normalizedAllergies = parsed.allergies.map((a) => a.trim().toLowerCase());
        const ingredients = parsed.recipe.ingredients.map((i) => i.trim().toLowerCase());


        const found = [];
        for (const allergy of normalizedAllergies) {
            for (const i of ingredients) {
                if (i.includes(allergy) || allergy.includes(i)) {
                    if (!found.includes(i)) {
                        found.push(i)
                    }
                }
            }
        }
        return {
            valid: found.length === 0,
            found,
            message: found.length > 0 ? `Found allergens: ${found.join(", ")}` : `No allergens detected`
        };
    },
    {
        name: "validate_allergies",
        description: "Verify that generated recipe ingredients do not contain any user allergens",
        schema: z.object({
            recipe: z.object({
                name: z.string().optional(),
                ingredients: z.array(z.string()).optional(),
            }).optional(),
            allergies: z.array(z.string()).optional(),
        })
    }
);
export const validate_favorite_vs_allergy = tool(
    async (input) => {
        const parsed = z.object({
            favorites: z.array(z.string()).optional(),
            allergies: z.array(z.string()).optional(),
        }).parse(input || []);

        const favoritesIn = (parsed.favorites || []).map((fav) => fav.trim().toLowerCase()).filter(Boolean);
        const allergiesIn = (parsed.allergies || []).map((all) => all.trim().toLowerCase()).filter(Boolean);

        const conflicts = [];
        for (const fav of favoritesIn) {
            for (const a of allergiesIn) {
                if (fav === a || a === fav) {
                    conflicts.push({ favorite: fav, allergy: a });
                }
            }
        }
        return {
            valid: conflicts.length === 0,
            conflicts,
            message: conflicts.length > 0 ? `Found conflict ${conflicts.length} conflicts ` : `NO conflict found`
        };
    },
    {
        name: "validate_favorite_vs_allergy",
        description: "Check if any favorite ingredients conflict with user allergy",
        schema: z.object({
            favorites: z.array(z.string()).optional(),
            allergies: z.array(z.string()).optional(),
        })
    }
);
export const validate_type = tool(
    async (input) => {
        const schema = z.object({
            recipe: z.object({
                name: z.string(),
                ingredients: z.array(z.string()).optional(),
            }).default({ ingredients: [] }),
            recipetype: z.enum(["veg", "nonveg"]).optional()
        });
        const parsed = schema.parse(input || []);
        const selectedType = parsed.recipetype || 'veg';
        const nonVegItems = ["chicken", "egg", "beef", "mutton", "fish", "pork", "shrimp", "meat"];
        if (selectedType === 'veg') {
            const found = (parsed.recipe.ingredients || []).filter((i) => nonVegItems.some((nv) => i.toLowerCase().includes(nv)));
            return {
                valid: found.length === 0,
                found,
                message: found.length > 0 ? `Non-veg items found in veg recipe: ${found.join(', ')}` : "Recipe matches veg preference"
            };
        }
        return {
            valid: true,
            found: [],
            message: "Recipe matches non-veg preference"
        };
    },
    {
        name: "validate_type",
        description: "Ensure recipe matches vegetarian or non-vegetarian preference",
        schema: z.object({
            recipe: z.object({
                name: z.string(),
                ingredients: z.array(z.string()).optional()
            }),
            recipetype: z.enum(['veg', 'nonveg']).optional()
        })
    }
);
export const toolsByName = {
    validate_favorites,
    validate_allergies,
    validate_favorite_vs_allergy,
    validate_type,
}
export const tools = Object.values(toolsByName);
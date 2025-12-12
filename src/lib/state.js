import * as z from "zod";

export const recipeState = z.object({
    // INput fields
    recipeName: z.string().min(1),
    favorites: z.array(z.string()).default([]),
    allergies:z.array(z.string()).default([]),
    recipeType:z.string().optional(),

    // outputfields
    recipe:z.object({
        name:z.string().optional(),
        ingredients:z.array(z.string()).optional(),
        steps:z.array(z.string()).optional(),
    }).optional(),

    // conflicts results
    conflict: z.boolean().optional(),

    conflictDetails:z.object({
        message:z.string().optional(),
        // conflicts:z.array(z.object({
        //     favorite:z.string(),
        //     allergy:z.string()
        // })).optional(),
        conflicts : z.array(z.any()).optional(),
        key:z.string().optional(),
        allergyAlternatives:z.array(z.any()).optional(),
        replacements: z.array(z.any()).optional(),
    }).optional(),

    // validation after generation
    validationErrors:z.array(
        z.object({
            type:z.string(),
            found:z.array(z.string()).optional(),
            message:z.string(),
        })
    ).optional(),

    // HITL selection
    selection: z.string().optional(),
    // track current allergy being processed
    currentAllergy: z.string().optional(),
    // thread Id to resume
    threadId:z.string().optional(),
    // Flag to track if allergy info was acknowledged
    allergyInfoAcknowledged:z.boolean().optional(),
});
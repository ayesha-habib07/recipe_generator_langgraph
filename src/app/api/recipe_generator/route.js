import { NextResponse } from "next/server";
import { buildGraph } from "../../../lib/graph";
import { z } from "zod";

const InputSchema = z.object({
    recipeName: z.string(),
    favorites: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
    recipeType: z.enum(["veg", "nonVeg"]),
    threadId: z.string().nullable().optional(),
});

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("----------------📥 Recipe Generator Input----------------", body);

        const parsed = InputSchema.parse(body);
        const threadId = parsed.threadId || crypto.randomUUID();

        const graph = buildGraph();

        const result = await graph.invoke(
            {
                recipeName: parsed.recipeName,
                favorites: parsed.favorites,
                allergies: parsed.allergies,
                recipeType: parsed.recipeType,
                threadId,
            },
            {
                configurable: { thread_id: threadId },
            }
        );

        console.log("================================");
        console.log("FULL RESULT STRUCTURE:");
        console.log(JSON.stringify(result, null, 2));
        console.log("================================");

        // CRITICAL: Check for interrupt in result
        if (result.conflictDetails) {
            console.log("🚨 INTERRUPT DETECTED IN RESULT:", result.conflictDetails);
            return NextResponse.json({
                status: "interrupt",
                interruptData: result.conflictDetails,
                threadId,
            });
        }

        // Handle validation errors
        if (result.validationErrors && result.validationErrors.length > 0) {
            return NextResponse.json({
                status: "validation_error",
                message: "Recipe validation failed",
                errors: result.validationErrors,
                recipe: result.recipe,
                threadId,
            });
        }

        // Success - but only if recipe exists
        if (result.recipe) {
            return NextResponse.json({
                status: "success",
                recipe: result.recipe,
                threadId,
            });
        }

        // Unexpected state
        return NextResponse.json({
            status: "error",
            error: "Recipe generation incomplete",
            threadId,
        });

    } catch (err) {
        console.error("❌ Error in recipe-generator route:", err);

        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { status: "error", error: "Invalid input", details: err.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { status: "error", error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
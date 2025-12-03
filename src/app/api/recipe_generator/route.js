import { NextResponse } from "next/server";
import { buildGraph } from "../../../lib/graph";
import { z } from "zod";


const InputSchema = z.object({
    recipeName: z.string(),
    favorites: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
    recipeType: z.enum(["veg", "nonVeg"]),
});

// export async function POST(req) {

//     try {
//         const body = await req.json();
//         console.log("Inputttt:", body);

//         const parsed = InputSchema.parse(body);

//         // build and invoke graph
//         const graph = buildGraph();
//         console.log("------------invoking graph--------------");
//         const result = await graph.invoke({
//             recipeName: parsed.recipeName,
//             favorites: parsed.favorites,
//             allergies: parsed.allergies,
//             recipeType: parsed.recipeType,
//             conflict: false,
//             validationErrors: [],
//         });
//         console.log("Graph result", result);

//         // Handle validation errors (allergens in recipe or wrong type)
//         if (result.validationErrors && result.validationErrors.length > 0) {
//             return NextResponse.json({
//                 status: "validation_error",
//                 message: "Recipe validation failed",
//                 errors: result.validationErrors,
//                 recipe: result.recipeName, // Include recipe so user can see what went wrong
//             })
//         }
//         return NextResponse.json({
//             status: "success",
//             recipe: result.recipe,
//         });
//     } catch (err) {
//         console.error("🔴 ERROR:", err);

//         // Handle Zod validation errors
//         if (err instanceof z.ZodError) {
//             return NextResponse.json(
//                 {
//                     status: "error",
//                     error: "Invalid input",
//                     details: err.errors
//                 },
//                 { status: 400 }
//             );
//         }
//         // Handle other errors
//         return NextResponse.json(
//             {
//                 status: "error",
//                 error: err.message || "Internal server error"
//             },
//             { status: 500 }
//         );
//     }
// } 








export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Input:", body);

        const parsed = InputSchema.parse(body);

        // Build and invoke graph
        const graph = buildGraph();
        console.log("------------invoking graph--------------");
        
        const result = await graph.invoke({
            recipeName: parsed.recipeName,
            favorites: parsed.favorites,
            allergies: parsed.allergies,
            recipeType: parsed.recipeType, 
            conflict: false,
            validationErrors: [],
        });
        
        console.log("Graph result:", result);

        // Handle conflicts (stops at checkConflictNode)
        if (result.conflict) {
            return NextResponse.json({
                status: "conflict",
                message: result.conflictDetails?.message || "Conflict detected",
                details: {
                    favorites: result.favorites,
                    allergies: result.allergies,
                    conflicts: result.conflictDetails?.conflicts || []
                }
            });
        }

        // Handle validation errors
        if (result.validationErrors && result.validationErrors.length > 0) {
            return NextResponse.json({
                status: "validation_error",
                message: "Recipe validation failed",
                errors: result.validationErrors.map(e => e.message),
                recipe: result.recipe,
            });
        }

        return NextResponse.json({
            status: "success",
            recipe: result.recipe,
        });
        
    } catch (err) {
        console.error("🔴 ERROR:", err);

        if (err instanceof z.ZodError) {
            return NextResponse.json(
                {
                    status: "error",
                    error: "Invalid input",
                    details: err.errors
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                status: "error",
                error: err.message || "Internal server error"
            },
            { status: 500 }
        );
    }
}
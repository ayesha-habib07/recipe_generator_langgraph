import { NextResponse } from "next/server";
import { buildGraph } from "../../../lib/graph";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("-------------Resume route body---------------", body);

        const threadId = body.threadId;
        const selection = body.selection;
        const favorites = body.favorites;
        const recipeName = body.recipeName;
        const allergies = body.allergies;
        const recipeType = body.recipeType;
        const allergyInfoAcknowledged = body.allergyInfoAcknowledged;

        if (!threadId) {
            return NextResponse.json(
                { status: "error", error: "Missing threadId for resume" },
                { status: 400 }
            )
        }

        // validate and parse favorite
        let parsedFavorites = [];
        if (favorites) {
            parsedFavorites = Array.isArray(favorites)
                ? favorites
                : favorites.split(", ").map(f => f.trim()).filter(Boolean);
        }
        // validate and parse allergies
        let parsedAlleries = [];
        if (allergies) {
            parsedAlleries = Array.isArray(allergies)
                ? allergies
                : allergies.split(", ").map(a => a.trim()).filter(Boolean);
        }
        console.log("📊 Resume State Being Sent:", {
            recipeName,
            favorites: parsedFavorites,
            allergies: parsedAlleries,
            recipeType,
            threadId,
            allergyInfoAcknowledged,
            selection,
        });

        const graph = buildGraph();
        // resume with command
        let result;
        try {
            // resume with updated state
            result = await graph.invoke(
                {
                    recipeName,
                    favorites: parsedFavorites,
                    allergies: parsedAlleries,
                    recipeType,
                    threadId,
                    allergyInfoAcknowledged: allergyInfoAcknowledged || true,
                    selection: selection,
                },
                {
                    configurable: { thread_id: threadId },
                });
        }
        catch (err) {
            // handle anotherinterrupt
            if (err && typeof err === 'object' && err.value) {
                console.log("----------------Another interrupt-------------------", err);
                return NextResponse.json(
                    {
                        status: "interrupt",
                        interruptData: err.value,
                        threadId,
                    }
                );
            }
            // rethrow error
            throw err;
        }
        console.log("----------------------------📤 Resume Result:----------------------------------------------------", result);

        // check for interrupt result 
        if (result.conflictDetails && result.conflictDetails.key) {
            console.log("Interrupt detected in result:", result.conflictDetails);

            return NextResponse.json({
                status: "interrupt",
                interruptData: result.conflictDetails,
                threadId,
            });
        }

        //  handle validation error
        if (result.validationErrors && result.validationErrors.length > 0) {
            return NextResponse.json(
                {
                    status: "validation_error",
                    message: "Recipe Validation Failed",
                    errors: result.validationErrors,
                    recipe: result.recipe,
                    threadId,
                }
            )
        }
        if (result.recipe) {
            return NextResponse.json({
                status: 'success',
                recipe: result.recipe,
                threadId,
            })
        }
        // return success
        return NextResponse.json(
            {
                status: "Error",
                error: "Recipe generation Incomplete",
                threadId,
            }
        )
    } catch (err) {
        console.log("----------------------------❌Error in resume route.---------------------- ", err);
        return NextResponse.json(
            { status: "error", error: err.message },
            { status: 500 }
        );
    }
}
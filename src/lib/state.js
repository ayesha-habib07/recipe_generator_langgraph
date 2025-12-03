// import { Annotation } from "@langchain/langgraph";


// export const recipeState = Annotation.Root({
//     // input fields
//     recipeName: Annotation,
//     favorites: Annotation,
//     allergies: Annotation,
//     recipetype: Annotation,


//     // output fields
//     generatedRecipe: Annotation,
//     conflict: Annotation,
//     conflictDetails: Annotation,
//     validationErrors: Annotation,
// })







import { Annotation } from "@langchain/langgraph";

export const recipeState = Annotation.Root({
    // input fields
    recipeName: Annotation,
    favorites: Annotation,
    allergies: Annotation,
    recipetype: Annotation,

    // output fields
    recipe: Annotation, 
    // generatedRecipe: Annotation,
    conflict: Annotation,
    conflictDetails: Annotation,
    validationErrors: Annotation,
})